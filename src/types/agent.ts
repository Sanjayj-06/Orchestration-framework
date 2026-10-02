export type NodeTypeCategory = 'trigger' | 'llm' | 'memory' | 'tool' | 'logic';

export interface NodeConfig {
  // LLM Config
  provider?: 'openai' | 'anthropic' | 'google' | 'meta';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  responseFormat?: 'text' | 'json_object';
  
  // Memory Config
  memoryType?: 'short_term_buffer' | 'summarizer' | 'vector_rag' | 'kv_state';
  vectorCollection?: string;
  topK?: number;
  similarityThreshold?: number;
  embeddingModel?: string;

  // Tool Config
  toolType?: 'rest_api' | 'web_search' | 'code_sandbox' | 'openapi_spec';
  apiUrl?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  bodyTemplate?: string;
  codeSnippet?: string;

  // Trigger Config
  triggerType?: 'webhook' | 'manual_chat' | 'cron';
  cronSchedule?: string;
  webhookPath?: string;

  // Logic Config
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
