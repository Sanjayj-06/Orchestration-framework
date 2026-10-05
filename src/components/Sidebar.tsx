import React, { useState } from 'react';
import type { Agent } from '../types/agent';
import { Search, Bot, GripVertical, Play, CheckCircle2, PackageOpen } from 'lucide-react';

interface SidebarProps {
  agents: Agent[];
}

export const Sidebar: React.FC<SidebarProps> = ({ agents }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const onDragStart = (event: React.DragEvent, type: string, data: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type, data }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full select-none shadow-sm z-10">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
          <span>Component Library</span>
        </h3>
        <p className="text-xs text-slate-500">
          Drag components into the canvas to build your AI workflow.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Basic Nodes */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <h4 className="text-[10px] font-bold tracking-wider uppercase text-slate-500 px-1">
            Pipeline I/O
          </h4>
          <div className="space-y-2">
            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'startNode', {})}
              className="p-3 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition cursor-grab active:cursor-grabbing group flex items-center gap-3"
            >
              <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-800 block group-hover:text-emerald-700">User Input</span>
                <span className="text-[10px] text-slate-500">Start of the workflow</span>
              </div>
            </div>

            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'outputNode', {})}
              className="p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition cursor-grab active:cursor-grabbing group flex items-center gap-3"
            >
              <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-800 block group-hover:text-indigo-700">Final Output</span>
                <span className="text-[10px] text-slate-500">End of the workflow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agents */}
        <div className="p-4 space-y-3 flex-1 flex flex-col min-h-0">
          <h4 className="text-[10px] font-bold tracking-wider uppercase text-blue-600 px-1">
            My Agents
          </h4>
          
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar pb-10">
            {filteredAgents.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center opacity-60">
                <PackageOpen className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-medium text-slate-600">No agents found</p>
                {agents.length === 0 && (
                   <p className="text-[10px] text-slate-500 mt-1">Create an agent first to use it here.</p>
                )}
              </div>
            ) : (
              filteredAgents.map(agent => (
                <div
                  key={agent.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, 'agentNode', { agent })}
                  className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 transition cursor-grab active:cursor-grabbing group flex items-start gap-2 shadow-sm"
                >
                  <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0 mt-2" />
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 block truncate transition-colors">
                      {agent.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {agent.purpose}
                    </span>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="text-[9px] font-medium text-slate-500 uppercase">Active</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
