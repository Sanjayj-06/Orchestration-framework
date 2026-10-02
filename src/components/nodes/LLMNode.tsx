import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNodeContainer } from './BaseNodeContainer';
import type { CustomNodeData } from '../../types/agent';
import { Sparkles } from 'lucide-react';

export const LLMNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const nodeData = data as unknown as CustomNodeData;
  const config = nodeData.config || {};

  const getProviderBadge = (provider?: string) => {
    switch (provider) {
      case 'openai':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">OpenAI</span>;
      case 'anthropic':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20">Anthropic</span>;
      case 'google':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20">Gemini</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">LLM Provider</span>;
    }
  };

  return (
    <BaseNodeContainer
      id={id}
      selected={selected}
      data={nodeData}
      icon={<Sparkles className="w-4 h-4 text-indigo-400" />}
      categoryColor="#6366f1"
      categoryLabel="LLM Engine"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span className="font-mono text-slate-400">{config.model || 'gpt-4o'}</span>
          {getProviderBadge(config.provider)}
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-800 text-[11px] font-mono text-slate-400 truncate">
          Temp: <span className="text-indigo-300">{config.temperature ?? 0.7}</span> | MaxTokens:{' '}
          <span className="text-indigo-300">{config.maxTokens ?? 1024}</span>
        </div>

        {config.systemPrompt && (
          <p className="text-[10px] text-slate-400 line-clamp-2 italic bg-slate-950/40 p-1.5 rounded border border-slate-800/60">
            "{config.systemPrompt}"
          </p>
        )}
      </div>
    </BaseNodeContainer>
  );
};
