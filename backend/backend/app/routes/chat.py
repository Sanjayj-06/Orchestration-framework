from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid

try:
    from app.models.agent_models import ChatRequest, ChatResponse, ChatMessage
    from app.db.database import get_agent, get_chat_history, clear_chat_history
    from app.services.agent_runtime import AgentRuntime
except ImportError:
    from backend.app.models.agent_models import ChatRequest, ChatResponse, ChatMessage
    from backend.app.db.database import get_agent, get_chat_history, clear_chat_history
    from backend.app.services.agent_runtime import AgentRuntime

router = APIRouter(prefix="/agents", tags=["Chat & Execution"])
runtime = AgentRuntime()

@router.post("/{agent_id}/chat", response_model=ChatResponse)
async def chat_with_agent(agent_id: str, req: ChatRequest):
    agent = get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    session_id = req.session_id or f"session-{uuid.uuid4().hex[:8]}"
    try:
        return runtime.run(agent, req.message, session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution encountered an error: {str(e)}")

@router.get("/{agent_id}/history", response_model=List[ChatMessage])
async def get_agent_history(agent_id: str, session_id: Optional[str] = None):
    agent = get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return get_chat_history(agent_id, session_id=session_id)

@router.delete("/{agent_id}/history")
async def reset_agent_history(agent_id: str, session_id: Optional[str] = None):
    agent = get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    clear_chat_history(agent_id, session_id=session_id)
    return {"status": "success", "message": "Conversation history cleared successfully"}
