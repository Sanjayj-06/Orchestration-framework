import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { CustomNodeData } from '../../types/agent';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface BaseNodeContainerProps {
  id: string;
  selected?: boolean;
  data: CustomNodeData;
  icon: React.ReactNode;
  categoryColor: string;
  categoryLabel: string;
  hasInputHandle?: boolean;
  hasOutputHandle?: boolean;
  children?: React.ReactNode;
}

export const BaseNodeContainer: React.FC<BaseNodeContainerProps> = ({
  selected,
  data,
  icon,
  categoryColor,
  categoryLabel,
  hasInputHandle = true,
  hasOutputHandle = true,
  children
}) => {
  const getStatusBadge = () => {
    switch (data.status) {
      case 'running':
        return (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Executing...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>{data.executionTimeMs ? `${data.executionTimeMs}ms` : 'Ready'}</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Failed</span>
          </div>
        );
      default:
        return (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-sm">
            {categoryLabel}
          </span>
        );
    }
  };

  return (
    <div
      className={`node-card relative group min-w-[260px] rounded-xl transition-all duration-200 backdrop-blur-md bg-white border text-slate-900 shadow-sm ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10'
          : data.status === 'running'
          ? 'border-amber-500/80 ring-2 ring-amber-500/30'
          : 'border-slate-200 hover:border-blue-300'
      }`}
    >
      <div
        className="h-1 rounded-t-xl w-full"
        style={{ backgroundColor: categoryColor }}
      />

      <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: `${categoryColor}15`, border: `1px solid ${categoryColor}30` }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate leading-tight">
              {data.label}
            </h4>
            {data.subtitle && (
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {data.subtitle}
              </p>
            )}
          </div>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {children && <div className="p-3 text-xs space-y-2">{children}</div>}

      {hasInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-white !border-2 !border-blue-400 hover:!scale-125 transition-transform"
        />
      )}
      {hasOutputHandle && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-white !border-2 !border-emerald-400 hover:!scale-125 transition-transform"
        />
      )}
    </div>
  );
};
