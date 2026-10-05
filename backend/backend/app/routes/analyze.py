from fastapi import APIRouter, HTTPException
try:
    from app.models.agent_models import RequirementAnalysisRequest, RequirementAnalysisResponse
    from app.services.requirement_analyzer import analyze_user_requirement
except ImportError:
    from backend.app.models.agent_models import RequirementAnalysisRequest, RequirementAnalysisResponse
    from backend.app.services.requirement_analyzer import analyze_user_requirement

router = APIRouter(tags=["Requirement Analysis"])

@router.post("/analyze-requirement", response_model=RequirementAnalysisResponse)
async def analyze_requirement(req: RequirementAnalysisRequest):
    if not req.requirement or not req.requirement.strip():
        raise HTTPException(status_code=400, detail="Requirement description cannot be empty.")
    try:
        return analyze_user_requirement(req.requirement.strip(), req.name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze requirement: {str(e)}")
