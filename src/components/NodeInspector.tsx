import React from 'react';
import type { Node } from '@xyflow/react';
import type { CustomNodeData, NodeConfig } from '../types/agent';
import { Sliders, X, Trash2, Globe, Database, Sparkles } from 'lucide-react';

interface NodeInspectorProps {
  selectedNode: Node | null;
  onUpdateConfig: (nodeId: string, updatedConfig: Partial<NodeConfig>, label?: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  onUpdateConfig,
  onDeleteNode,
  onClose
}) => {
  if (!selectedNode) return null;

  const nodeData = selectedNode.data as unknown as CustomNodeData;
  const config = nodeData.config || {};
  const [label, setLabel] = React.useState(nodeData.label || '');

  React.useEffect(() => {
    setLabel(nodeData.label || '');
  }, [selectedNode.id, nodeData.label]);

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    onUpdateConfig(selectedNode.id, {}, newLabel);
  };

  return (
    <aside className="w-80 bg-slate-900/95 border-l border-slate-800/80 flex flex-col h-[calc(100vh-4rem)] backdrop-blur-md sticky top-16 right-0 z-20 shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Node Inspector
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 transition"
            title="Delete Node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-300">
            Node Display Name
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {nodeData.category === 'llm' && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LLM Model & Reasoning Config</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">
                Model Provider
              </label>
              <select
                value={config.provider || 'openai'}
                onChange={(e) =>
                  onUpdateConfig(selectedNode.id, {
                    provider: e.target.value as any,
                    model: e.target.value === 'openai' ? 'gpt-4o' : e.target.value === 'anthropic' ? 'claude-3-5-sonnet' : 'gemini-1.5-pro'
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google Gemini</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">
                Model Architecture
              </label>
              <select
                value={config.model || 'gpt-4o'}
                onChange={(e) => onUpdateConfig(selectedNode.id, { model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              >
                {config.provider === 'openai' && (
                  <>
                    <option value="gpt-4o">gpt-4o (Omni Reasoning)</option>
                    <option value="gpt-4o-mini">gpt-4o-mini (Fast)</option>
                    <option value="o1-preview">o1-preview (STEM Complex)</option>
                  </>
                )}
                {config.provider === 'anthropic' && (
                  <>
                    <option value="claude-3-5-sonnet">claude-3-5-sonnet (High Precision)</option>
                    <option value="claude-3-haiku">claude-3-haiku (Low Latency)</option>
                  </>
                )}
                {config.provider === 'google' && (
                  <>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (2M Context)</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Fast)</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <label className="font-semibold">Temperature</label>
                <span className="font-mono text-indigo-400">{config.temperature ?? 0.7}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.temperature ?? 0.7}
                onChange={(e) =>
                  onUpdateConfig(selectedNode.id, { temperature: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">
                System Prompt Instructions
              </label>
              <textarea
                rows={5}
                value={config.systemPrompt || ''}
                onChange={(e) => onUpdateConfig(selectedNode.id, { systemPrompt: e.target.value })}
                placeholder="You are an expert AI agent..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500">
                Tip: Insert dynamic outputs with <code className="text-indigo-300">{"{{node_id.output}}"}</code>
              </p>
            </div>
          </div>
        )}

        {nodeData.category === 'memory' && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>Memory Strategy Config</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">
                Memory Architecture
              </label>
              <select
                value={config.memoryType || 'vector_rag'}
                onChange={(e) =>
                  onUpdateConfig(selectedNode.id, { memoryType: e.target.value as any })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="vector_rag">Vector DB RAG Knowledge</option>
                <option value="short_term_buffer">Short-Term History Buffer</option>
                <option value="summarizer">Conversation Summarizer</option>
                <option value="kv_state">Key-Value User State</option>
              </select>
            </div>

            {config.memoryType === 'vector_rag' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Vector Collection Name
                  </label>
                  <input
                    type="text"
                    value={config.vectorCollection || 'support_docs_v2'}
                    onChange={(e) =>
                      onUpdateConfig(selectedNode.id, { vectorCollection: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Top-K Document Chunks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.topK ?? 4}
                    onChange={(e) =>
                      onUpdateConfig(selectedNode.id, { topK: parseInt(e.target.value) || 4 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {nodeData.category === 'tool' && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>Tool Integration Config</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">
                Tool Engine Type
              </label>
              <select
                value={config.toolType || 'rest_api'}
                onChange={(e) =>
                  onUpdateConfig(selectedNode.id, { toolType: e.target.value as any })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="rest_api">Custom REST HTTP API</option>
                <option value="web_search">Tavily Web Search</option>
                <option value="code_sandbox">Python Code Sandbox (E2B)</option>
              </select>
            </div>

            {config.toolType === 'rest_api' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    HTTP Method & Target URL
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={config.httpMethod || 'POST'}
                      onChange={(e) =>
                        onUpdateConfig(selectedNode.id, { httpMethod: e.target.value as any })
                      }
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-amber-300 font-mono font-bold"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                    <input
                      type="text"
                      value={config.apiUrl || ''}
                      onChange={(e) => onUpdateConfig(selectedNode.id, { apiUrl: e.target.value })}
                      placeholder="https://api.domain.com/v1/..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    JSON Body Template
                  </label>
                  <textarea
                    rows={4}
                    value={config.bodyTemplate || ''}
                    onChange={(e) =>
                      onUpdateConfig(selectedNode.id, { bodyTemplate: e.target.value })
                    }
                    placeholder='{ "param": "{{input.param}}" }'
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono text-[11px]"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
