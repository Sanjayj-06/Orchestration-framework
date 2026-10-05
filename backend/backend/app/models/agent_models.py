from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import datetime
import uuid

def gen_agent_id():
    return 'agent-' + uuid.uuid4().hex[:10]

def gen_msg_id():
    return 'msg-' + uuid.uuid4().hex[:8]

def gen_wf_id():
    return 'wf-' + uuid.uuid4().hex[:8]

def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

class AgentBehavior(BaseModel):
    style: str = Field(default='detailed', description='Working style: simple, detailed, professional, creative, technical')
    autonomy: str = Field(default='guided', description='Independence: ask_me, guided, automatic')

class AgentCapabilities(BaseModel):
    web_search: bool = True
    files: bool = False
    data_analysis: bool = False
    code_execution: bool = False
    database: bool = False
    apis: bool = False
    other_agents: bool = False

class AgentMemory(BaseModel):
    enabled: bool = True
    scope: str = Field(default='across_conversations', description='none, this_conversation, across_conversations')
    optimization: str = Field(default='balanced', description='basic, balanced, advanced')

class AgentModel(BaseModel):
    provider: str = Field(default='recommended', description='recommended or custom')
    name: str = Field(default='auto', description='auto, gpt-4o, gpt-4o-mini, claude-3-5-sonnet, gemini-1.5-pro')
    temperature: float = 0.7
    max_tokens: int = 2048

class AgentOutput(BaseModel):
    format: str = Field(default='normal', description='normal, structured, table, report, json, code, custom')
    custom_instruction: str = ''

class AgentAdvanced(BaseModel):
    system_prompt: str = ''
    context_window: int = 8000
    retry_attempts: int = 3
    tool_timeout_seconds: int = 30
    error_handling: str = 'graceful'

class AgentSpecification(BaseModel):
    name: str
    purpose: str
    description: str
    tasks: List[str] = Field(default_factory=list)
    behavior: AgentBehavior = Field(default_factory=AgentBehavior)
    capabilities: AgentCapabilities = Field(default_factory=AgentCapabilities)
    tools: List[str] = Field(default_factory=list)
    memory: AgentMemory = Field(default_factory=AgentMemory)
    model: AgentModel = Field(default_factory=AgentModel)
    output: AgentOutput = Field(default_factory=AgentOutput)
    advanced: AgentAdvanced = Field(default_factory=AgentAdvanced)
    dependencies: List[str] = Field(default_factory=list)
    inputs: List[str] = Field(default_factory=list)
    outputs: List[str] = Field(default_factory=list)

class Agent(BaseModel):
    id: str = Field(default_factory=gen_agent_id)
    name: str
    description: str
    purpose: str
    status: str = 'active'
    specification: AgentSpecification
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)

class AgentCreateRequest(BaseModel):
    name: Optional[str] = None
    specification: AgentSpecification

class AgentUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    purpose: Optional[str] = None
    status: Optional[str] = None
    specification: Optional[AgentSpecification] = None

class HumanReadableSummary(BaseModel):
    name: str
    purpose: str
    what_it_will_do: List[str]
    suggested_sample_questions: List[str] = Field(default_factory=list)

class RequirementAnalysisRequest(BaseModel):
    requirement: str
    name: Optional[str] = None

class RequirementAnalysisResponse(BaseModel):
    specification: AgentSpecification
    summary: HumanReadableSummary

class ToolStep(BaseModel):
    tool: str
    title: str
    status: str = 'completed'
    detail: Optional[str] = None
    output: Optional[str] = None

class ChatMessage(BaseModel):
    id: str = Field(default_factory=gen_msg_id)
    role: str
    content: str
    timestamp: str = Field(default_factory=now_iso)
    tool_steps: Optional[List[ToolStep]] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    tool_steps: List[ToolStep] = Field(default_factory=list)
    session_id: str
    agent_id: str
    timestamp: str = Field(default_factory=now_iso)

class Workflow(BaseModel):
    id: str = Field(default_factory=gen_wf_id)
    name: str
    description: str = ''
    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)
