import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNodeContainer } from './BaseNodeContainer';
import type { CustomNodeData } from '../../types/agent';
import { Zap, MessageSquare, Clock } from 'lucide-react';

export const TriggerNode: React.FC<NodeProps> = ({ id, selected, data }) => {
  const nodeData = data as unknown as CustomNodeData;
  const config = nodeData.config || {};

  const getTriggerIcon = () => {
    switch (config.triggerType) {
      case 'manual_chat':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'cron':
        return <Clock className="w-4 h-4 text-cyan-400" />;
      default:
        return <Zap className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <BaseNodeContainer
      id={id}
      selected={selected}
      data={nodeData}
      icon={getTriggerIcon()}
      categoryColor="#06b6d4"
      categoryLabel="Trigger Node"
      hasInputHandle={false}
      hasOutputHandle={true}
    >
      <div className="bg-slate-950/70 p-2 rounded border border-slate-800 font-mono text-[10px] text-slate-400">
        {config.triggerType === 'webhook' && (
          <div>Endpoint: <span className="text-cyan-300">{config.webhookPath || '/v1/webhook'}</span></div>
        )}
        {config.triggerType === 'manual_chat' && (
          <div>Trigger: <span className="text-cyan-300">Interactive Chat Prompt</span></div>
        )}
        {config.triggerType === 'cron' && (
          <div>Cron: <span className="text-cyan-300">{config.cronSchedule || '0 * * * *'}</span></div>
        )}
      </div>
    </BaseNodeContainer>
  );
};
