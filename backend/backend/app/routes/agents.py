from fastapi import APIRouter, HTTPException, Response
from typing import List, Optional
import datetime
import uuid

try:
    from app.models.agent_models import Agent, AgentCreateRequest, AgentUpdateRequest, AgentSpecification
    from app.db.database import list_agents, get_agent, save_agent, delete_agent
    from app.services.code_generator import generate_agent_project_zip, slugify
except ImportError:
    from backend.app.models.agent_models import Agent, AgentCreateRequest, AgentUpdateRequest, AgentSpecification
    from backend.app.db.database import list_agents, get_agent, save_agent, delete_agent
    from backend.app.services.code_generator import generate_agent_project_zip, slugify

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("", response_model=List[Agent])
async def get_all_agents():
    return list_agents()

@router.post("", response_model=Agent)
async def create_agent(req: AgentCreateRequest):
    spec = req.specification
    agent_id = f"agent-{uuid.uuid4().hex[:10]}"
    name = req.name or spec.name
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    agent = Agent(
        id=agent_id,
        name=name,
        description=spec.description,
        purpose=spec.purpose,
        status="active",
        specification=spec,
        created_at=now,
        updated_at=now
    )
    return save_agent(agent)

@router.get("/{agent_id}", response_model=Agent)
async def get_agent_by_id(agent_id: str):
    agent = get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.put("/{agent_id}", response_model=Agent)
async def update_agent(agent_id: str, req: AgentUpdateRequest):
    existing = get_agent(agent_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if req.name is not None:
        existing.name = req.name
    if req.description is not None:
        existing.description = req.description
    if req.purpose is not None:
        existing.purpose = req.purpose
    if req.status is not None:
        existing.status = req.status
    if req.specification is not None:
        existing.specification = req.specification
        if not req.name:
            existing.name = req.specification.name
        if not req.purpose:
            existing.purpose = req.specification.purpose
        if not req.description:
            existing.description = req.specification.description
            
    existing.updated_at = now
    return save_agent(existing)

@router.delete("/{agent_id}")
async def delete_agent_by_id(agent_id: str):
    success = delete_agent(agent_id)
    if not success:
        raise HTTPException(status_code=404, detail="Agent not found or already deleted")
    return {"status": "success", "message": "Agent deleted successfully"}

@router.post("/{agent_id}/duplicate", response_model=Agent)
async def duplicate_agent(agent_id: str):
    existing = get_agent(agent_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    new_id = f"agent-{uuid.uuid4().hex[:10]}"
    new_name = f"{existing.name} - Copy"
    
    # Clone spec
    new_spec_dict = existing.specification.model_dump()
    new_spec_dict["name"] = new_name
    new_spec = AgentSpecification(**new_spec_dict)
    
    new_agent = Agent(
        id=new_id,
        name=new_name,
        description=existing.description,
        purpose=existing.purpose,
        status="active",
        specification=new_spec,
        created_at=now,
        updated_at=now
    )
    return save_agent(new_agent)

@router.get("/{agent_id}/download")
async def download_agent_code(agent_id: str):
    agent = get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    try:
        zip_bytes = generate_agent_project_zip(agent)
        filename = f"{slugify(agent.name)}.zip"
        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate project zip: {str(e)}")
