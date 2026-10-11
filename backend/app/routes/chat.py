from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import uuid

try:
    from app.models.agent_models import ChatRequest, ChatResponse, ChatMessage
    from app.db.database import get_agent, get_chat_history, clear_chat_history
    from app.services.agent_runtime import AgentRuntime
except ImportError:
    from ..models.agent_models import ChatRequest, ChatResponse, ChatMessage
    from ..db.database import get_agent, get_chat_history, clear_chat_history
    from ..services.agent_runtime import AgentRuntime

router = APIRouter(prefix="/agents", tags=["Chat & Execution"])
runtime = AgentRuntime()

@router.post("/{agent_id}/chat", response_model=ChatResponse)
async def chat_with_agent(agent_id: str, req: ChatRequest):
    agent = get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    session_id = req.session_id or f"session-{uuid.uuid4().hex[:8]}"
    try:
        return runtime.run(agent, req.message, session_id=session_id, api_keys=req.api_keys, models=req.models)
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

class ProviderTestRequest(BaseModel):
    provider: str
    api_key: str

@router.post("/providers/test")
async def test_provider(req: ProviderTestRequest):
    try:
        from app.services.providers import OpenAIProvider, GeminiProvider, AnthropicProvider
    except ImportError:
        from ..services.providers import OpenAIProvider, GeminiProvider, AnthropicProvider
        
    provider_map = {
        'openai': OpenAIProvider,
        'gemini': GeminiProvider,
        'anthropic': AnthropicProvider
    }
    
    provider_class = provider_map.get(req.provider.lower())
    if not provider_class:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {req.provider}")
        
    provider_instance = provider_class()
    success = provider_instance.test_connection(req.api_key)
    if success:
        return {"status": "success"}
    else:
        raise HTTPException(status_code=400, detail="Connection failed. Please check your API key.")
