import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Agent } from '../../types/agent';
import { Bot, Play, CheckCircle2, AlertCircle } from 'lucide-react';

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
      status === 'error' ? 'border-rose-500 shadow-md shadow-rose-500/20 ring-4 ring-rose-500/10' :
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
            <div className={`w-8 h-8 rounded-lg ${status === 'error' ? 'bg-rose-50 border-rose-100' : 'bg-blue-50 border-blue-100'} border flex items-center justify-center shrink-0`}>
              <Bot className={`w-4 h-4 ${status === 'error' ? 'text-rose-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[140px]">{agent.name}</h3>
              <p className={`text-[10px] font-medium uppercase tracking-wider ${status === 'error' ? 'text-rose-600 font-bold' : 'text-blue-600'}`}>
                {status === 'running' ? 'Running...' : status === 'success' ? 'Completed' : status === 'error' ? 'Failed' : 'Agent'}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            {status === 'running' && <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
            {status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {status === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
          </div>
        </div>

        {/* Input/Output Data Flow Visuals */}
        <div className="flex flex-col gap-1 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
           <div className="flex justify-between items-center text-[10px] font-semibold">
             <span className="text-slate-500 uppercase tracking-wider">Input</span>
             <span className="text-slate-700 max-w-[100px] truncate" title="Data from previous node">{(data.inputContract as any)?.name || 'Data from previous'}</span>
           </div>
           <div className="h-px bg-slate-200 w-full my-0.5"></div>
           <div className="flex justify-between items-center text-[10px] font-semibold">
             <span className="text-slate-500 uppercase tracking-wider">Output</span>
             <span className="text-slate-700 max-w-[100px] truncate" title="Result to next node">{(data.outputContract as any)?.name || 'Result to next'}</span>
           </div>
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

export const StartNode: React.FC<NodeProps> = ({ selected, data }) => {
  const inputContract = data.inputContract as any;
  const status = data.status as string; // 'idle', 'running', 'success', 'error'

  return (
    <div className={`px-5 py-3 bg-white border-2 rounded-xl shadow-sm flex flex-col gap-1 min-w-[160px] ${
      selected ? 'border-emerald-500 shadow-emerald-500/20' : 'border-slate-200 hover:border-emerald-300'
    }`}>
      <div className="flex items-center gap-2">
        <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
        <span className="text-sm font-bold text-slate-900">User Input</span>
        <div className="ml-auto">
          {status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        </div>
      </div>
      
      {inputContract && (
        <div className="mt-2 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 truncate">
           <span className="uppercase tracking-wider opacity-70 mr-1">Input:</span>
           {inputContract.name || 'Text Input'}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 border-2 border-white bg-emerald-500"
      />
    </div>
  );
};

export const OutputNode: React.FC<NodeProps> = ({ selected, data }) => {
  const hasOutput = Boolean(data?.output);
  const status = data?.status as string;

  return (
    <div className={`px-5 py-3 bg-slate-900 border-2 rounded-2xl shadow-sm flex flex-col gap-1.5 transition-all min-w-[160px] ${
      selected ? 'border-indigo-400 shadow-indigo-500/30' : 'border-slate-800 hover:border-slate-600'
    }`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 border-2 border-slate-900 bg-white"
      />
      <div className="flex items-center gap-2">
        <CheckCircle2 className={`w-4 h-4 ${status === 'success' ? 'text-emerald-400' : 'text-indigo-400'}`} />
        <span className="text-sm font-bold text-white">Final Output</span>
      </div>
      {hasOutput && (
        <div className="flex items-center gap-1.5 text-[10px] text-indigo-300 font-semibold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Executive Report Ready</span>
        </div>
      )}
    </div>
  );
};

