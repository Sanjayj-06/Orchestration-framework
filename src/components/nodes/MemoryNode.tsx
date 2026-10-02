import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNodeContainer } from './BaseNodeContainer';
import type { CustomNodeData } from '../../types/agent';
import { Database } from 'lucide-react';

export const MemoryNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const nodeData = data as unknown as CustomNodeData;
  const config = nodeData.config || {};

  const getMemoryLabel = () => {
    switch (config.memoryType) {
      case 'vector_rag':
        return 'Vector RAG Knowledge';
      case 'short_term_buffer':
        return 'Short-Term History Buffer';
      case 'summarizer':
        return 'Conversation Summarizer';
      case 'kv_state':
        return 'Key-Value User State';
      default:
        return 'Memory Subsystem';
    }
  };

  return (
    <BaseNodeContainer
      id={id}
      selected={selected}
      data={nodeData}
      icon={<Database className="w-4 h-4 text-emerald-400" />}
      categoryColor="#10b981"
      categoryLabel="Memory"
    >
      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between text-slate-300">
          <span className="font-semibold">{getMemoryLabel()}</span>
        </div>

        {config.memoryType === 'vector_rag' && (
          <div className="bg-slate-950/70 p-2 rounded border border-slate-800 space-y-1 font-mono text-[10px] text-slate-400">
            <div>Collection: <span className="text-emerald-300">{config.vectorCollection || 'default'}</span></div>
            <div>Top-K: <span className="text-emerald-300">{config.topK ?? 4}</span> | Sim: <span className="text-emerald-300">{config.similarityThreshold ?? 0.75}</span></div>
          </div>
        )}

        {config.memoryType === 'short_term_buffer' && (
          <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
            Window size: <span className="text-emerald-300">Last 6 turns</span>
          </div>
        )}
      </div>
    </BaseNodeContainer>
  );
};
