import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Agent } from '../../types/agent';
import { Bot, Play, CheckCircle2 } from 'lucide-react';

export const AgentNode: React.FC<NodeProps> = ({ selected, data }) => {
  const agent = data.agent as Agent;
  
  if (!agent) {
    return (
      <div className={`w-64 bg-white border-2 rounded-xl shadow-sm ${selected ? 'border-blue-500 shadow-blue-500/20' : 'border-slate-200'}`}>
        <div className="p-4">
          <p className="text-sm font-semibold">Unknown Agent</p>
        </div>
      </div>
    );
  }

  const status = data.status as string; // 'idle', 'running', 'success', 'error'

  return (
    <div className={`w-64 bg-white border-2 rounded-xl shadow-sm transition-all ${
      selected ? 'border-blue-500 shadow-md shadow-blue-500/20 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
    }`}>
      {/* Input Handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 border-2 border-white bg-blue-500"
      />

      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[140px]">{agent.name}</h3>
              <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">{status === 'running' ? 'Running...' : status === 'success' ? 'Completed' : 'Agent'}</p>
            </div>
          </div>
          <div className="shrink-0">
            {status === 'running' && <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
            {status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2">
          {agent.purpose}
        </p>

        {/* Capabilities badgets (just a hint) */}
        <div className="flex flex-wrap gap-1 mt-1">
           {agent.specification?.capabilities && Object.entries(agent.specification.capabilities).filter(([_, v]) => v).slice(0, 3).map(([k, _]) => (
              <span key={k} className="text-[9px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded capitalize">
                {k.replace('_', ' ')}
              </span>
           ))}
           {agent.specification?.capabilities && Object.values(agent.specification.capabilities).filter(Boolean).length > 3 && (
             <span className="text-[9px] text-slate-400">+{Object.values(agent.specification.capabilities).filter(Boolean).length - 3}</span>
           )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 border-2 border-white bg-blue-500"
      />
    </div>
  );
};

export const StartNode: React.FC<NodeProps> = ({ selected }) => {
  return (
    <div className={`px-5 py-3 bg-white border-2 rounded-full shadow-sm flex items-center gap-2 ${
      selected ? 'border-emerald-500 shadow-emerald-500/20' : 'border-slate-200 hover:border-emerald-300'
    }`}>
      <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
      <span className="text-sm font-bold text-slate-900">User Input</span>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 border-2 border-white bg-emerald-500"
      />
    </div>
  );
};

export const OutputNode: React.FC<NodeProps> = ({ selected }) => {
  return (
    <div className={`px-5 py-3 bg-slate-900 border-2 rounded-full shadow-sm flex items-center gap-2 ${
      selected ? 'border-indigo-400 shadow-indigo-500/30' : 'border-slate-800 hover:border-slate-600'
    }`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 border-2 border-slate-900 bg-white"
      />
      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
      <span className="text-sm font-bold text-white">Final Output</span>
    </div>
  );
};
