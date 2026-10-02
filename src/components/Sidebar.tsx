import React from 'react';
import type { NodeTypeCategory } from '../types/agent';
import {
  Sparkles,
  Database,
  Wrench,
  Zap,
  GitBranch,
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
    // Triggers
    {
      type: 'triggerNode',
      category: 'trigger',
      label: 'Webhook Trigger',
      description: 'HTTP POST webhook payload',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      accentColor: '#06b6d4'
    },
    {
      type: 'triggerNode',
      category: 'trigger',
      label: 'Chat Widget Trigger',
      description: 'User prompt input widget',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      accentColor: '#06b6d4'
    },

    // LLM Engines
    {
      type: 'llmNode',
      category: 'llm',
      label: 'OpenAI GPT-4o',
      description: 'GPT-4o reasoning engine',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      accentColor: '#6366f1'
    },
    {
      type: 'llmNode',
      category: 'llm',
      label: 'Claude 3.5 Sonnet',
      description: 'Claude 3.5 Sonnet engine',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      accentColor: '#6366f1'
    },
    {
      type: 'llmNode',
      category: 'llm',
      label: 'Gemini 1.5 Pro',
      description: 'Google Gemini 1.5 Pro engine',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      accentColor: '#6366f1'
    },

    // Memory
    {
      type: 'memoryNode',
      category: 'memory',
      label: 'Vector DB (RAG)',
      description: 'Knowledge base doc search',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      accentColor: '#10b981'
    },
    {
      type: 'memoryNode',
      category: 'memory',
      label: 'Short-Term History',
      description: 'Sliding chat memory buffer',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      accentColor: '#10b981'
    },

    // Tools
    {
      type: 'toolNode',
      category: 'tool',
      label: 'Custom REST API',
      description: 'Invoke external HTTP endpoint',
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      accentColor: '#f59e0b'
    },
    {
      type: 'toolNode',
      category: 'tool',
      label: 'Tavily Web Search',
      description: 'Live web search API',
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      accentColor: '#f59e0b'
    },
    {
      type: 'toolNode',
      category: 'tool',
      label: 'Python Sandbox',
      description: 'E2B Python container code',
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      accentColor: '#f59e0b'
    },

    // Logic
    {
      type: 'logicNode',
      category: 'logic',
      label: 'If / Else Router',
      description: 'Conditional score branch',
      icon: <GitBranch className="w-4 h-4 text-purple-400" />,
      accentColor: '#a855f7'
    }
  ];

  const categories: { key: NodeTypeCategory; title: string; color: string }[] = [
    { key: 'trigger', title: 'Triggers', color: 'text-cyan-400' },
    { key: 'llm', title: 'LLM Engines', color: 'text-indigo-400' },
    { key: 'memory', title: 'Memory', color: 'text-emerald-400' },
    { key: 'tool', title: 'Tools & APIs', color: 'text-amber-400' },
    { key: 'logic', title: 'Logic', color: 'text-purple-400' }
  ];

  const onDragStart = (event: React.DragEvent, type: string, category: NodeTypeCategory, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type, category, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] select-none backdrop-blur-md z-10">
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
          <span>Component Library</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
            Drag to Canvas
          </span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Drag components into the canvas to build your workflow.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-4 custom-scrollbar">
        {categories.map((cat) => {
          const items = paletteItems.filter((i) => i.category === cat.key);
          return (
            <div key={cat.key} className="space-y-1.5">
              <h4 className={`text-[10px] font-bold tracking-wider uppercase px-1 ${cat.color}`}>
                {cat.title}
              </h4>

              <div className="space-y-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type, item.category, item.label)}
                    onClick={() => onAddNode(item.type, item.category, item.label)}
                    className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/60 transition cursor-grab active:cursor-grabbing group flex items-center gap-2 shadow-sm"
                  >
                    <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${item.accentColor}20`,
                        border: `1px solid ${item.accentColor}40`
                      }}
                    >
                      {item.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white block truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
