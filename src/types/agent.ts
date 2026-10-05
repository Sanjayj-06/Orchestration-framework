export type NodeTypeCategory = 'trigger' | 'llm' | 'memory' | 'tool' | 'logic' | 'agent';

export interface NodeConfig {
  provider?: 'openai' | 'anthropic' | 'google' | 'meta';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  responseFormat?: 'text' | 'json_object';
  memoryType?: 'short_term_buffer' | 'summarizer' | 'vector_rag' | 'kv_state';
  vectorCollection?: string;
  topK?: number;
  similarityThreshold?: number;
  embeddingModel?: string;
  toolType?: 'rest_api' | 'web_search' | 'code_sandbox' | 'openapi_spec';
  apiUrl?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  bodyTemplate?: string;
  codeSnippet?: string;
  triggerType?: 'webhook' | 'manual_chat' | 'cron';
  cronSchedule?: string;
  webhookPath?: string;
  conditionField?: string;
  conditionOperator?: 'equals' | 'contains' | 'greater_than';
  conditionValue?: string;
}

export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  category: NodeTypeCategory;
  subtitle?: string;
  iconName?: string;
  config: NodeConfig;
  status?: 'idle' | 'running' | 'success' | 'error';
  executionTimeMs?: number;
  lastOutput?: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeLabel: string;
  category: NodeTypeCategory;
  status: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: Record<string, unknown>;
  latencyMs?: number;
  tokensUsed?: number;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  nodes: any[];
  edges: any[];
}

// === No-Code AI Agent Builder Types ===

export type WorkingStyle = 'simple' | 'detailed' | 'professional' | 'creative' | 'technical';
export type AutonomyLevel = 'ask_me' | 'guided' | 'automatic';
export type MemoryScope = 'none' | 'this_conversation' | 'across_conversations';
export type MemoryOptimization = 'basic' | 'balanced' | 'advanced';
export type OutputFormat = 'normal' | 'structured' | 'table' | 'report' | 'json' | 'code' | 'custom';

export interface AgentBehavior {
  style: WorkingStyle;
  autonomy: AutonomyLevel;
}

export interface AgentCapabilities {
  web_search: boolean;
  files: boolean;
  data_analysis: boolean;
  code_execution: boolean;
  database: boolean;
  apis: boolean;
  other_agents: boolean;
}

export interface AgentMemory {
  enabled: boolean;
  scope: MemoryScope;
  optimization: MemoryOptimization;
}

export interface AgentModel {
  provider: 'recommended' | 'custom';
  name: string;
  temperature: number;
  max_tokens: number;
}

export interface AgentOutput {
  format: OutputFormat;
  custom_instruction?: string;
}

export interface AgentAdvanced {
  system_prompt?: string;
  context_window?: number;
  retry_attempts?: number;
  tool_timeout_seconds?: number;
  error_handling?: string;
}

export interface AgentSpecification {
  name: string;
  purpose: string;
  description: string;
  tasks: string[];
  behavior: AgentBehavior;
  capabilities: AgentCapabilities;
  tools: string[];
  memory: AgentMemory;
  model: AgentModel;
  output: AgentOutput;
  advanced: AgentAdvanced;
  dependencies?: string[];
  inputs?: string[];
  outputs?: string[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  purpose: string;
  status: 'active' | 'draft' | 'archived';
  specification: AgentSpecification;
  created_at: string;
  updated_at: string;
}

export interface HumanReadableSummary {
  name: string;
  purpose: string;
  what_it_will_do: string[];
  suggested_sample_questions?: string[];
}

export interface RequirementAnalysisResponse {
  specification: AgentSpecification;
  summary: HumanReadableSummary;
}

export interface ToolStep {
  tool: string;
  title: string;
  status: string;
  detail?: string;
  output?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tool_steps?: ToolStep[];
}

export interface ChatResponse {
  response: string;
  tool_steps: ToolStep[];
  session_id: string;
  agent_id: string;
  timestamp: string;
}
