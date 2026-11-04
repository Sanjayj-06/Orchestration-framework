from fastapi import APIRouter, HTTPException, Response
from typing import List

try:
    from app.db.database import get_chemistry_run, get_latest_chemistry_run
    from app.models.chemistry_models import ChemistryDiscoveryRequest, ChemistryRunResult, ChemistryTemplate
    from app.services.chemistry import CHEMISTRY_TEMPLATES, molecule_sdf, molecule_svg, run_discovery
except ImportError:
    from ..db.database import get_chemistry_run, get_latest_chemistry_run
    from ..models.chemistry_models import ChemistryDiscoveryRequest, ChemistryRunResult, ChemistryTemplate
    from ..services.chemistry import CHEMISTRY_TEMPLATES, molecule_sdf, molecule_svg, run_discovery

router = APIRouter(prefix="/chemistry", tags=["Chemistry"])

@router.get("/templates", response_model=List[ChemistryTemplate])
async def get_chemistry_templates():
    return CHEMISTRY_TEMPLATES

@router.post("/discover", response_model=ChemistryRunResult)
def discover_molecules(req: ChemistryDiscoveryRequest):
    try:
        return run_discovery(req.request.strip(), req.provider, req.model, req.api_keys, req.models, req.generation_attempts)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Chemistry workflow failed: {exc}") from exc

@router.get("/demo", response_model=ChemistryRunResult)
def get_demo_run():
    run = get_latest_chemistry_run()
    if not run:
        raise HTTPException(status_code=404, detail="No completed chemistry run is available for preview.")
    return run["result"]

@router.get("/runs/{run_id}", response_model=ChemistryRunResult)
async def get_discovery_run(run_id: str):
    run = get_chemistry_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Chemistry run not found.")
    return run["result"]

@router.get("/molecules/sdf")
async def get_molecule_sdf(smiles: str):
    try:
        return Response(content=molecule_sdf(smiles), media_type="chemical/x-mdl-sdfile")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not generate 3D structure: {exc}") from exc

@router.get("/molecules/svg")
async def get_molecule_svg(smiles: str):
    try:
        return Response(content=molecule_svg(smiles), media_type="image/svg+xml")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not generate 2D structure: {exc}") from exc
