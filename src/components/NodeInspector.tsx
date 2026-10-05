import React from 'react';
import type { Node } from '@xyflow/react';
import { Settings2, X, Trash2, Bot, Play, ExternalLink } from 'lucide-react';
import type { Agent } from '../types/agent';

interface NodeInspectorProps {
  selectedNode: Node | null;
  pipelineName: string;
  setPipelineName: (name: string) => void;
  nodesCount: number;
  edgesCount: number;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  pipelineName,
  setPipelineName,
  nodesCount,
  edgesCount,
  onDeleteNode,
  onClose
}) => {
  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-sm z-20">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Properties
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {selectedNode && (
            <button
              onClick={() => onDeleteNode(selectedNode.id)}
              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition"
              title="Delete Node"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-sm">
        {!selectedNode ? (
          // PIPELINE PROPERTIES
          <div className="space-y-6">
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Settings</h4>
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Pipeline Name
                </label>
                <input
                  type="text"
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-sm text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe what this pipeline does..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-sm text-xs resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="block text-xs text-slate-500 mb-1">Total Nodes</span>
                <span className="text-xl font-bold text-slate-800">{nodesCount}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="block text-xs text-slate-500 mb-1">Connections</span>
                <span className="text-xl font-bold text-slate-800">{edgesCount}</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Input Trigger</h4>
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">User Input</span>
                </div>
                <p className="text-xs text-slate-500">This pipeline starts when a user provides text input.</p>
                <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition">
                  Configure Input
                </button>
              </div>
            </div>
          </div>
        ) : selectedNode.type === 'agentNode' ? (
          // AGENT NODE PROPERTIES
          <div className="space-y-6">
             <div className="space-y-4 border-b border-slate-100 pb-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Agent Details</h4>
              
              {(() => {
                const agent = selectedNode.data.agent as Agent;
                if (!agent) return <div className="text-sm text-rose-500">Agent data missing</div>;
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{agent.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-medium text-slate-600">Active</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="block text-xs font-semibold text-slate-700 mb-1">Purpose</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {agent.purpose}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                       <span className="block text-xs font-semibold text-slate-700">Capabilities</span>
                       <div className="flex flex-wrap gap-1.5">
                         {agent.specification?.capabilities && Object.entries(agent.specification.capabilities).filter(([_, v]) => v).map(([k, _]) => (
                            <span key={k} className="text-xs text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md capitalize shadow-sm">
                              {k.replace('_', ' ')}
                            </span>
                         ))}
                       </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                       <button className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-blue-600 transition shadow-sm">
                         Open Agent Configuration
                         <ExternalLink className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => onDeleteNode(selectedNode.id)}
                         className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg text-sm font-semibold text-rose-600 transition shadow-sm"
                       >
                         Remove from Pipeline
                         <Trash2 className="w-4 h-4" />
                       </button>
                       <p className="text-[10px] text-slate-400 text-center pt-2">Agent internals cannot be edited in the pipeline builder.</p>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="space-y-4">
               <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data Flow</h4>
               
               <div className="space-y-3">
                 <div>
                   <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Input Source</span>
                   <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
                     From previous connected node
                   </div>
                 </div>
                 
                 <div>
                   <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Output Destination</span>
                   <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
                     Pass to next connected node
                   </div>
                 </div>
               </div>
            </div>
          </div>
        ) : selectedNode.type === 'startNode' ? (
           <div className="space-y-4">
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Input Node</h4>
             <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-sm">
                This node represents the beginning of the pipeline execution. When the pipeline runs, the initial user input is injected here and passed to the first agent.
             </div>
             <div className="pt-4 border-t border-slate-100">
               <button 
                 onClick={() => onDeleteNode(selectedNode.id)}
                 className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg text-sm font-semibold text-rose-600 transition shadow-sm"
               >
                 Remove from Pipeline
                 <Trash2 className="w-4 h-4" />
               </button>
             </div>
           </div>
        ) : selectedNode.type === 'outputNode' ? (
           <div className="space-y-4">
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Output Node</h4>
             <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-800 text-sm">
                This node captures the final result of the pipeline. The output of the last connected agent will be returned as the pipeline's execution result.
             </div>
             <div className="pt-4 border-t border-slate-100">
               <button 
                 onClick={() => onDeleteNode(selectedNode.id)}
                 className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg text-sm font-semibold text-rose-600 transition shadow-sm"
               >
                 Remove from Pipeline
                 <Trash2 className="w-4 h-4" />
               </button>
             </div>
           </div>
        ) : (
           <div className="text-sm text-slate-500">Unknown node type</div>
        )}
      </div>
    </aside>
  );
};
