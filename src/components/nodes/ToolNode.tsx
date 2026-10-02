import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNodeContainer } from './BaseNodeContainer';
import type { CustomNodeData } from '../../types/agent';
import { Wrench, Globe, Code } from 'lucide-react';

export const ToolNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const nodeData = data as unknown as CustomNodeData;
  const config = nodeData.config || {};

  const getToolIcon = () => {
    switch (config.toolType) {
      case 'web_search':
        return <Globe className="w-4 h-4 text-amber-400" />;
      case 'code_sandbox':
        return <Code className="w-4 h-4 text-amber-400" />;
      default:
        return <Wrench className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <BaseNodeContainer
      id={id}
      selected={selected}
      data={nodeData}
      icon={getToolIcon()}
      categoryColor="#f59e0b"
      categoryLabel="Tool / API"
    >
      <div className="space-y-1.5 text-[11px]">
        {config.toolType === 'rest_api' && (
          <div className="bg-slate-950/70 p-2 rounded border border-slate-800 space-y-1 font-mono text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                {config.httpMethod || 'POST'}
              </span>
              <span className="text-slate-400 truncate">{config.apiUrl || 'https://api.example.com'}</span>
            </div>
          </div>
        )}

        {config.toolType === 'web_search' && (
          <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
            Provider: <span className="text-amber-300">Tavily Web Index</span>
          </div>
        )}

        {config.toolType === 'code_sandbox' && (
          <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
            Runtime: <span className="text-amber-300">E2B Python 3.11 Sandbox</span>
          </div>
        )}
      </div>
    </BaseNodeContainer>
  );
};
