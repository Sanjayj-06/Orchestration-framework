from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChemistryDiscoveryRequest(BaseModel):
    request: str = Field(min_length=1)
    provider: Optional[str] = None
    model: Optional[str] = None
    generation_attempts: int = Field(default=3, ge=1, le=10)
    api_keys: Optional[Dict[str, str]] = None
    models: Optional[Dict[str, str]] = None


class ChemistryRequirements(BaseModel):
    task: str = "drug_like_molecule_generation"
    number_of_molecules: int = Field(default=5, ge=1, le=50)
    max_molecular_weight: Optional[float] = 400
    solubility_requirement: str = "good"
    drug_likeness: bool = True
    constraints: Dict[str, Any] = Field(default_factory=lambda: {"lipinski_violations": 1})


class ChemistryTemplate(BaseModel):
    id: str
    name: str
    role: str
    inputs: List[str]
    outputs: List[str]
    configurable: bool = True


class MoleculeProperties(BaseModel):
    molecular_weight: float
    logp: float
    tpsa: float
    hbd: int
    hba: int
    qed: float
    solubility_logS: Optional[float] = None
    solubility_source: str = "not_predicted"


class ChemistryMolecule(BaseModel):
    id: str
    rank: Optional[int] = None
    canonical_smiles: str
    validation: str
    properties: MoleculeProperties
    passed_constraints: bool
    selection_reason: str
    validation_error: Optional[str] = None


class ChemistryRunResult(BaseModel):
    run_id: str
    status: str
    request: str
    requirements: ChemistryRequirements
    summary: Dict[str, Any]
    agent_trace: List[Dict[str, Any]]
    final_molecules: List[ChemistryMolecule]
