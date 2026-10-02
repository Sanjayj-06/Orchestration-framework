import type {
  Agent,
  AgentSpecification,
  RequirementAnalysisResponse,
  ChatResponse,
  ChatMessage
} from '../types/agent';

const API_BASE = '/api';

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeRequirement(requirement: string, name?: string): Promise<RequirementAnalysisResponse> {
  const res = await fetch(`${API_BASE}/analyze-requirement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirement, name: name || undefined })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to analyze requirement' }));
    throw new Error(err.detail || 'The AI service is temporarily busy. Please try again.');
  }
  return res.json();
}

export async function getAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/agents`);
  if (!res.ok) {
    throw new Error('Failed to retrieve agents');
  }
  return res.json();
}

export async function getAgent(agentId: string): Promise<Agent> {
  const res = await fetch(`${API_BASE}/agents/${agentId}`);
  if (!res.ok) {
    throw new Error('Agent not found');
  }
  return res.json();
}

export async function createAgent(specification: AgentSpecification, name?: string): Promise<Agent> {
  const res = await fetch(`${API_BASE}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ specification, name: name || specification.name })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create agent' }));
    throw new Error(err.detail || 'Could not save the agent. Please try again.');
  }
  return res.json();
}

export async function updateAgent(agentId: string, updateData: Partial<Agent>): Promise<Agent> {
  const res = await fetch(`${API_BASE}/agents/${agentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update agent' }));
    throw new Error(err.detail || 'Could not update the agent.');
  }
  return res.json();
}

export async function deleteAgent(agentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/agents/${agentId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Failed to delete agent');
  }
}

export async function duplicateAgent(agentId: string): Promise<Agent> {
  const res = await fetch(`${API_BASE}/agents/${agentId}/duplicate`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error('Failed to duplicate agent');
  }
  return res.json();
}

export async function downloadAgentCode(agentId: string, agentName: string): Promise<void> {
  const res = await fetch(`${API_BASE}/agents/${agentId}/download`);
  if (!res.ok) {
    throw new Error('Failed to download agent code');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const slug = agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'agent';
  a.download = `${slug}.zip`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function chatWithAgent(agentId: string, message: string, sessionId?: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/agents/${agentId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'The AI assistant is temporarily busy.' }));
    throw new Error(err.detail || 'The AI service is temporarily busy. Please try again.');
  }
  return res.json();
}

export async function getChatHistory(agentId: string, sessionId?: string): Promise<ChatMessage[]> {
  const url = sessionId ? `${API_BASE}/agents/${agentId}/history?session_id=${sessionId}` : `${API_BASE}/agents/${agentId}/history`;
  const res = await fetch(url);
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function clearChatHistory(agentId: string, sessionId?: string): Promise<void> {
  const url = sessionId ? `${API_BASE}/agents/${agentId}/history?session_id=${sessionId}` : `${API_BASE}/agents/${agentId}/history`;
  await fetch(url, { method: 'DELETE' });
}

export async function getWorkflows(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/workflows`);
  if (!res.ok) return [];
  return res.json();
}

export async function runWorkflow(workflowId: string, input: string): Promise<any> {
  const res = await fetch(`${API_BASE}/workflows/${workflowId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  });
  if (!res.ok) throw new Error('Workflow execution failed');
  return res.json();
}
