import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNodeContainer } from './BaseNodeContainer';
import type { CustomNodeData } from '../../types/agent';
import { GitBranch } from 'lucide-react';

export const LogicNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const nodeData = data as unknown as CustomNodeData;
  const config = nodeData.config || {};

  return (
    <BaseNodeContainer
      id={id}
      selected={selected}
      data={nodeData}
      icon={<GitBranch className="w-4 h-4 text-purple-400" />}
      categoryColor="#a855f7"
      categoryLabel="Logic / Router"
    >
      <div className="bg-slate-950/70 p-2 rounded border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
        <div>Field: <span className="text-purple-300">{config.conditionField || 'fit_score'}</span></div>
        <div>Operator: <span className="text-purple-300">{config.conditionOperator || 'greater_than'}</span></div>
        <div>Target Value: <span className="text-purple-300">{config.conditionValue || '70'}</span></div>
      </div>
    </BaseNodeContainer>
  );
};
