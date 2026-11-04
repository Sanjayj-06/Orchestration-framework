import json
import os
import re
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple

from rdkit import Chem
from rdkit.Chem import AllChem, Crippen, Descriptors, Lipinski, QED, rdDepictor, rdMolDescriptors

try:
    from app.db.database import list_chemistry_molecules, save_chemistry_run
    from app.models.chemistry_models import ChemistryRequirements
    from app.services.providers import AnthropicProvider, GeminiProvider, OpenAIProvider
except ImportError:
    from ..db.database import list_chemistry_molecules, save_chemistry_run
    from ..models.chemistry_models import ChemistryRequirements
    from .providers import AnthropicProvider, GeminiProvider, OpenAIProvider


CHEMISTRY_TEMPLATES = [
    {"id": "chemistry-requirement-analyst", "name": "Chemistry Requirement Analyst", "role": "Convert natural language into structured molecular constraints.", "inputs": ["user_request"], "outputs": ["requirements"]},
    {"id": "molecular-research-memory", "name": "Molecular Research & Memory Agent", "role": "Retrieve prior molecules and provide generation guidance.", "inputs": ["requirements"], "outputs": ["reference_molecules", "generation_guidance"]},
    {"id": "molecule-generation", "name": "Molecule Generation Agent", "role": "Generate candidate SMILES through the configured language model.", "inputs": ["requirements", "research"], "outputs": ["candidates"]},
    {"id": "structure-validation", "name": "Chemical Structure Validation Agent", "role": "Sanitise, canonicalise, and de-duplicate candidate SMILES with RDKit.", "inputs": ["candidates"], "outputs": ["valid_candidates", "invalid_candidates"]},
    {"id": "property-analysis", "name": "Molecular Property Analysis Agent", "role": "Calculate RDKit molecular descriptors.", "inputs": ["valid_candidates"], "outputs": ["molecules"]},
    {"id": "evaluation-ranking", "name": "Molecular Evaluation & Ranking Agent", "role": "Apply constraints and rank candidates with an explainable score.", "inputs": ["requirements", "molecules"], "outputs": ["ranked_candidates", "rejected_candidates"]},
    {"id": "discovery-report", "name": "Molecular Discovery Report Agent", "role": "Assemble the structured result for the discovery dashboard.", "inputs": ["ranked_candidates"], "outputs": ["final_molecules", "summary"]},
]


def parse_requirements(request: str) -> ChemistryRequirements:
    text = request.lower()
    count_match = re.search(r"\b(?:generate|find|make|produce)\s+(\d+)", text)
    weight_match = re.search(r"(?:below|under|less than|maximum|max(?:imum)? of?)\s*(\d+(?:\.\d+)?)\s*(?:da|dalton)", text)
    solubility = "good" if "good solubility" in text or "soluble" in text else "unspecified"
    violations_match = re.search(r"(\d+)\s*(?:lipinski|rule of five)\s*(?:violations?)?", text)
    return ChemistryRequirements(
        number_of_molecules=int(count_match.group(1)) if count_match else 5,
        max_molecular_weight=float(weight_match.group(1)) if weight_match else 400,
        solubility_requirement=solubility,
        constraints={"lipinski_violations": int(violations_match.group(1)) if violations_match else 1},
    )


def _provider(provider_name: str | None, model_name: str | None, api_keys: Dict[str, str] | None, models: Dict[str, str] | None):
    provider = (provider_name or "").lower()
    request_keys = api_keys or {}
    keys = {
        "openai": request_keys.get("openai", "").strip() or os.getenv("OPENAI_API_KEY", "").strip(),
        "gemini": request_keys.get("gemini", "").strip() or os.getenv("GEMINI_API_KEY", "").strip(),
        "anthropic": request_keys.get("anthropic", "").strip() or os.getenv("ANTHROPIC_API_KEY", "").strip(),
    }
    if provider in ("", "recommended"):
        provider = next((name for name in ("openai", "gemini", "anthropic") if keys[name]), "")
    if provider not in keys or not keys[provider]:
        raise RuntimeError("No molecular generation provider is configured. Set OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY.")
    clients = {"openai": OpenAIProvider(), "gemini": GeminiProvider(), "anthropic": AnthropicProvider()}
    return provider, model_name or (models or {}).get(provider) or "auto", keys[provider], clients[provider]


def _extract_json(text: str) -> Dict[str, Any]:
    cleaned = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).replace("```", "").strip()
    start = cleaned.find("{")
    if start < 0:
        raise ValueError("Molecular generation provider returned no JSON object.")
    try:
        value, _ = json.JSONDecoder().raw_decode(cleaned[start:])
    except json.JSONDecodeError as exc:
        raise ValueError("Molecular generation provider returned malformed JSON.") from exc
    if not isinstance(value, dict):
        raise ValueError("Molecular generation provider returned an invalid JSON object.")
    return value


def _generate_candidates(request: str, requirements: ChemistryRequirements, prior: List[Dict[str, Any]], provider_name: str | None, model_name: str | None, api_keys: Dict[str, str] | None, models: Dict[str, str] | None, attempts: int) -> List[Dict[str, str]]:
    _, model, api_key, client = _provider(provider_name, model_name, api_keys, models)
    prompt = f"""Generate {requirements.number_of_molecules} novel drug-like molecules for this request: {request}
Requirements: {requirements.model_dump_json()}
Previously generated canonical SMILES to avoid: {[m.get('canonical_smiles') for m in prior]}
Return only JSON in this exact shape: {{"candidates":[{{"id":"MOL_001","name":"descriptive chemical name","smiles":"..."}}]}}.
The name must describe the proposed molecule, not just repeat its ID. If an authoritative name cannot be determined, use null.
Use valid SMILES. Do not explain or fabricate database results."""
    last_error: Exception | None = None
    for _ in range(attempts):
        try:
            response = client.generate_response(
                model, "You are a molecular generation agent. Return only valid JSON with candidate SMILES.", [],
                prompt, 0.7, max(2048, requirements.number_of_molecules * 160), api_key
            )
            payload = _extract_json(response)
            candidates = payload.get("candidates")
            if not isinstance(candidates, list):
                raise ValueError("Molecular generation response did not contain candidates.")
            result: List[Dict[str, str]] = []
            for index, candidate in enumerate(candidates[:requirements.number_of_molecules], 1):
                if isinstance(candidate, dict) and isinstance(candidate.get("smiles"), str) and candidate["smiles"].strip():
                    result.append({
                        "id": str(candidate.get("id") or f"MOL_{index:03d}"),
                        "name": str(candidate["name"]).strip() if candidate.get("name") else None,
                        "smiles": candidate["smiles"].strip(),
                    })
            if not result:
                raise ValueError("Molecular generation returned no candidate SMILES.")
            return result
        except ValueError as exc:
            last_error = exc
    raise last_error or ValueError("Molecular generation failed.")


def _validate(candidates: List[Dict[str, str]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    valid, invalid, seen = [], [], set()
    for candidate in candidates:
        try:
            molecule = Chem.MolFromSmiles(candidate["smiles"], sanitize=True)
            if molecule is None:
                raise ValueError("RDKit could not parse the SMILES.")
            canonical = Chem.MolToSmiles(molecule, canonical=True)
            if canonical in seen:
                invalid.append({"id": candidate["id"], "smiles": candidate["smiles"], "error": "Duplicate canonical SMILES."})
                continue
            seen.add(canonical)
            valid.append({"id": candidate["id"], "name": candidate.get("name"), "canonical_smiles": canonical, "mol": molecule})
        except Exception as exc:
            invalid.append({"id": candidate["id"], "smiles": candidate["smiles"], "error": str(exc)})
    return valid, invalid


def _properties(molecule: Chem.Mol) -> Dict[str, Any]:
    return {
        "molecular_weight": round(Descriptors.MolWt(molecule), 3),
        "logp": round(Crippen.MolLogP(molecule), 3),
        "tpsa": round(rdMolDescriptors.CalcTPSA(molecule), 3),
        "hbd": Lipinski.NumHDonors(molecule),
        "hba": Lipinski.NumHAcceptors(molecule),
        "qed": round(QED.qed(molecule), 4),
        "solubility_logS": None,
        "solubility_source": "not_predicted; RDKit descriptors only",
    }


def _sdf_for_smiles(smiles: str) -> str:
    molecule = Chem.AddHs(Chem.MolFromSmiles(smiles))
    if AllChem.EmbedMolecule(molecule, AllChem.ETKDGv3()) != 0:
        raise ValueError("RDKit could not generate 3D coordinates for this molecule.")
    try:
        AllChem.MMFFOptimizeMolecule(molecule)
    except Exception:
        pass
    return Chem.MolToMolBlock(molecule)


def run_discovery(request: str, provider: str | None, model: str | None, api_keys: Dict[str, str] | None, models: Dict[str, str] | None, generation_attempts: int) -> Dict[str, Any]:
    started = time.perf_counter()
    requirements = parse_requirements(request)
    prior = list_chemistry_molecules()
    trace = [{"agent": "Chemistry Requirement Analyst", "status": "completed", "duration_ms": 0}]
    trace.append({"agent": "Molecular Research & Memory Agent", "status": "completed", "duration_ms": 0, "previously_generated": len(prior)})
    candidates = _generate_candidates(request, requirements, prior, provider, model, api_keys, models, generation_attempts)
    trace.append({"agent": "Molecule Generation Agent", "status": "completed", "duration_ms": round((time.perf_counter() - started) * 1000), "generated": len(candidates)})
    valid, invalid = _validate(candidates)
    trace.append({"agent": "Chemical Structure Validation Agent", "status": "completed", "duration_ms": round((time.perf_counter() - started) * 1000), "valid": len(valid), "invalid": len(invalid)})
    evaluated, rejected = [], []
    for item in valid:
        props = _properties(item["mol"])
        violations = sum([props["molecular_weight"] > requirements.max_molecular_weight, props["hbd"] > 5, props["hba"] > 10])
        passed = violations <= requirements.constraints.get("lipinski_violations", 1)
        reason = "Meets configured molecular weight and Lipinski constraints." if passed else "Rejected for exceeding configured molecular constraints."
        result = {"id": item["id"], "name": item.get("name"), "canonical_smiles": item["canonical_smiles"], "validation": "passed", "properties": props, "passed_constraints": passed, "selection_reason": reason, "_score": props["qed"] - (violations * 0.2)}
        (evaluated if passed else rejected).append(result)
    trace.append({"agent": "Molecular Property Analysis Agent", "status": "completed", "duration_ms": round((time.perf_counter() - started) * 1000), "calculated": len(valid)})
    evaluated.sort(key=lambda item: item["_score"], reverse=True)
    selected = evaluated[:requirements.number_of_molecules]
    for rank, item in enumerate(selected, 1):
        item["rank"] = rank
        item.pop("_score", None)
    rejected.extend(evaluated[requirements.number_of_molecules:])
    trace.append({"agent": "Molecular Evaluation & Ranking Agent", "status": "completed", "duration_ms": round((time.perf_counter() - started) * 1000), "selected": len(selected), "rejected": len(rejected) + len(invalid)})
    run_id = f"chem-{uuid.uuid4().hex[:10]}"
    result = {
        "run_id": run_id, "status": "completed", "request": request, "requirements": requirements.model_dump(),
        "summary": {"generated": len(candidates), "valid": len(valid), "selected": len(selected), "rejected": len(rejected) + len(invalid), "agents_executed": 7, "duration_ms": round((time.perf_counter() - started) * 1000)},
        "agent_trace": trace, "final_molecules": selected,
    }
    trace.append({"agent": "Molecular Discovery Report Agent", "status": "completed", "duration_ms": result["summary"]["duration_ms"]})
    save_chemistry_run(run_id, request, requirements.model_dump(), result, datetime.now(timezone.utc).isoformat())
    return result


def molecule_sdf(smiles: str) -> str:
    return _sdf_for_smiles(smiles)


def molecule_svg(smiles: str) -> str:
    molecule = Chem.MolFromSmiles(smiles, sanitize=True)
    if molecule is None:
        raise ValueError("RDKit could not parse the canonical SMILES.")
    rdDepictor.Compute2DCoords(molecule)
    conformer = molecule.GetConformer()
    width, height, padding = 420, 300, 45
    points = [conformer.GetAtomPosition(index) for index in range(molecule.GetNumAtoms())]
    min_x, max_x = min(point.x for point in points), max(point.x for point in points)
    min_y, max_y = min(point.y for point in points), max(point.y for point in points)
    scale = min((width - 2 * padding) / max(max_x - min_x, 1), (height - 2 * padding) / max(max_y - min_y, 1))

    def point(index: int) -> tuple[float, float]:
        atom = conformer.GetAtomPosition(index)
        return (padding + (atom.x - min_x) * scale, height - padding - (atom.y - min_y) * scale)

    lines = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="2D molecular structure">', '<rect width="100%" height="100%" fill="white"/>', '<g stroke="#334155" stroke-width="2" stroke-linecap="round">']
    for bond in molecule.GetBonds():
        start, end = point(bond.GetBeginAtomIdx()), point(bond.GetEndAtomIdx())
        lines.append(f'<line x1="{start[0]:.1f}" y1="{start[1]:.1f}" x2="{end[0]:.1f}" y2="{end[1]:.1f}"/>')
    lines.append('</g><g font-family="Arial, sans-serif" font-size="14" text-anchor="middle">')
    for index, atom in enumerate(molecule.GetAtoms()):
        x, y = point(index)
        symbol = atom.GetSymbol()
        color = {"O": "#dc2626", "N": "#2563eb", "S": "#ca8a04"}.get(symbol, "#0f172a")
        lines.append(f'<text x="{x:.1f}" y="{y + 5:.1f}" fill="{color}" font-weight="600">{symbol}</text>')
    lines.append('</g></svg>')
    return ''.join(lines)
