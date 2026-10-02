import React from 'react';
import type { NodeTypeCategory } from '../types/agent';
import {
  Sparkles,
  Database,
  Wrench,
  Zap,
  GitBranch,
  Plus,
  Info,
  GripVertical
} from 'lucide-react';

interface SidebarProps {
  onAddNode: (type: string, category: NodeTypeCategory, label: string) => void;
}

interface PaletteItem {
  type: string;
  category: NodeTypeCategory;
  label: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  const paletteItems: PaletteItem[] = [
    {
      type: 'triggerNode',
      category: 'trigger',
      label: 'Webhook Trigger',
      description: 'Trigger workflow via incoming REST HTTP request',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      accentColor: '#06b6d4'
    },
    {
      type: 'triggerNode',
      category: 'trigger',
      label: 'Interactive Chat Trigger',
      description: 'Trigger via user prompt from embed widget',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      accentColor: '#06b6d4'
    },
    {
      type: 'llmNode',
      category: 'llm',
      label: 'OpenAI GPT-4o Engine',
      description: 'Advanced reasoning, tool calling & prompt synthesis',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      accentColor: '#6366f1'
    },
    {
      type: 'llmNode',
      category: 'llm',
      label: 'Claude 3.5 Sonnet',
      description: 'Long-context reasoning & complex code analysis',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      accentColor: '#6366f1'
    },
    {
      type: 'llmNode',
      category: 'llm',
      label: 'Gemini 1.5 Pro Engine',
      description: 'Multimodal processing & large window retrieval',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      accentColor: '#6366f1'
    },
    {
      type: 'memoryNode',
      category: 'memory',
      label: 'Vector DB RAG Knowledge',
      description: 'Hybrid sparse + dense vector document retrieval',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      accentColor: '#10b981'
    },
    {
      type: 'memoryNode',
      category: 'memory',
      label: 'Short-Term History Buffer',
      description: 'Sliding window conversation memory',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      accentColor: '#10b981'
    },
    {
      type: 'memoryNode',
      category: 'memory',
      label: 'Key-Value User State',
      description: 'Persistent user session state variables',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      accentColor: '#10b981'
    },
    {
      type: 'toolNode',
      category: 'tool',
      label: 'Custom REST API Call',
      description: 'Invoke external HTTP services & webhooks',
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      accentColor: '#f59e0b'
    },
    {
      type: 'toolNode',
      category: 'tool',
      label: 'Tavily Web Search Tool',
      description: 'Real-time live internet information search',
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      accentColor: '#f59e0b'
    },
    {
      type: 'toolNode',
      category: 'tool',
      label: 'Python Code Sandbox',
      description: 'Execute isolated Python code in E2B microVM',
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      accentColor: '#f59e0b'
    },
    {
      type: 'logicNode',
      category: 'logic',
      label: 'If/Else Branch Router',
      description: 'Route execution flow based on variable values',
      icon: <GitBranch className="w-4 h-4 text-purple-400" />,
      accentColor: '#a855f7'
    }
  ];

  const categories: { key: NodeTypeCategory; title: string; color: string }[] = [
    { key: 'trigger', title: '1. Triggers & Inputs', color: 'text-cyan-400' },
    { key: 'llm', title: '2. LLM Core Engines', color: 'text-indigo-400' },
    { key: 'memory', title: '3. Memory Systems', color: 'text-emerald-400' },
    { key: 'tool', title: '4. Tools & API Integrations', color: 'text-amber-400' },
    { key: 'logic', title: '5. Logic & Control Flow', color: 'text-purple-400' }
  ];

  const onDragStart = (event: React.DragEvent, type: string, category: NodeTypeCategory, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type, category, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 bg-slate-900/90 border-r border-slate-800/80 flex flex-col h-[calc(100vh-4rem)] select-none backdrop-blur-md">
      <div className="p-4 border-b border-slate-800/80">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center justify-between">
          <span>Component Palette</span>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
            Drag onto canvas
          </span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Drag components directly onto the canvas to build your agent workflow.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
        {categories.map((cat) => {
          const items = paletteItems.filter((i) => i.category === cat.key);
          return (
            <div key={cat.key} className="space-y-2">
              <h4 className={`text-[11px] font-semibold tracking-wide uppercase ${cat.color}`}>
                {cat.title}
              </h4>

              <div className="space-y-1.5">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type, item.category, item.label)}
                    onClick={() => onAddNode(item.type, item.category, item.label)}
                    className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/90 border border-slate-800/80 hover:border-indigo-500/50 transition cursor-grab active:cursor-grabbing group flex items-start gap-2.5 shadow-sm"
                  >
                    <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 mt-1 shrink-0" />
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${item.accentColor}18`,
                        border: `1px solid ${item.accentColor}40`
                      }}
                    >
                      {item.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
                          {item.label}
                        </span>
                        <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>Drag & drop onto canvas or click + to add. Connect nodes with wires.</span>
      </div>
    </aside>
  );
};
