import React from 'react';
import { Plus, LayoutGrid, Clock, CheckCircle2, Play } from 'lucide-react';
import type { Agent } from '../types/agent';

interface LandingViewProps {
  agents: Agent[];
  onCreateAgent: (prefillPrompt?: string, prefillName?: string) => void;
  onExploreLibrary: () => void;
  onOpenAgent: (agent: Agent) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  agents,
  onCreateAgent,
  onExploreLibrary,
  onOpenAgent
}) => {
  const activeAgents = agents.filter(a => a.status === 'active').length;
  
  return (
    <div className="w-full flex flex-col px-6 py-10 overflow-y-auto custom-scrollbar h-full bg-slate-50">
      <div className="max-w-5xl mx-auto w-full space-y-10">
        
        {/* Top Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Good morning 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Build and manage your AI agents.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onExploreLibrary}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-[13px] font-medium transition shadow-sm"
            >
              Browse Templates
            </button>
            <button
              onClick={() => onCreateAgent()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[13px] font-medium shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Agent
            </button>
          </div>
        </section>

        {/* Workspace Stats */}
        <section>
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Your Workspace</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Agents</span>
              <span className="text-2xl font-semibold text-slate-900 mt-1">{agents.length}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Active</span>
              <span className="text-2xl font-semibold text-emerald-600 mt-1">{activeAgents}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Workflows</span>
              <span className="text-2xl font-semibold text-slate-900 mt-1">0</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Runs</span>
              <span className="text-2xl font-semibold text-slate-900 mt-1">24</span>
            </div>
          </div>
        </section>

        {/* Recent Agents */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recent Agents</h2>
            <button onClick={() => onExploreLibrary()} className="text-[12px] text-blue-600 hover:text-blue-700 font-medium transition">View All →</button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            {agents.length === 0 ? (
               <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <LayoutGrid className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">No agents yet</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Your first AI agent is a few sentences away.</p>
                  <button onClick={() => onCreateAgent()} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-md transition">Create Agent</button>
               </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {agents.slice(0, 3).map((agent) => (
                  <div key={agent.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{agent.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{agent.purpose || agent.description}</p>
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                           <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                           </span>
                           {agent.specification?.capabilities && Object.entries(agent.specification.capabilities).filter(([_, v]) => v).slice(0,2).map(([k, _]) => (
                             <span key={k} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 capitalize">
                               {k.replace('_', ' ')}
                             </span>
                           ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1 shrink-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        12 mins ago
                      </div>
                      <button 
                        onClick={() => onOpenAgent(agent)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md transition shadow-sm"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h2>
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-2">
             <div className="flex items-center gap-3 p-3 hover:bg-slate-50 transition rounded-md">
               <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                 <Play className="w-3 h-3" />
               </div>
               <div className="flex-1 text-sm text-slate-700">
                 <span className="font-semibold text-slate-900">Research Assistant</span> completed a run
               </div>
               <div className="text-[11px] text-slate-400 shrink-0">12 mins ago</div>
             </div>
             
             <div className="flex items-center gap-3 p-3 hover:bg-slate-50 transition rounded-md">
               <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                 <LayoutGrid className="w-3 h-3" />
               </div>
               <div className="flex-1 text-sm text-slate-700">
                 <span className="font-semibold text-slate-900">Coding Assistant</span> was updated
               </div>
               <div className="text-[11px] text-slate-400 shrink-0">2 hours ago</div>
             </div>
             
             <div className="flex items-center gap-3 p-3 hover:bg-slate-50 transition rounded-md">
               <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                 <Plus className="w-3 h-3" />
               </div>
               <div className="flex-1 text-sm text-slate-700">
                 <span className="font-semibold text-slate-900">Jarvis</span> was created
               </div>
               <div className="text-[11px] text-slate-400 shrink-0">Yesterday</div>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
};
