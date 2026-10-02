import React from 'react';
import type { ExecutionLog } from '../types/agent';
import {
  Terminal,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Coins,
  Send
} from 'lucide-react';

interface ExecutionConsoleProps {
  logs: ExecutionLog[];
  isSimulating: boolean;
  onRunTest: (testInput: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  logs,
  isSimulating,
  onRunTest,
  isOpen,
  setIsOpen
}) => {
  const [testInput, setTestInput] = React.useState('Customer asks: I need a refund for my order #1024 because it arrived damaged.');

  const totalTokens = logs.reduce((acc, log) => acc + (log.tokensUsed || 0), 0);
  const totalLatency = logs.reduce((acc, log) => acc + (log.latencyMs || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim() || isSimulating) return;
    onRunTest(testInput);
  };

  return (
    <div className="fixed bottom-0 left-72 right-80 z-20 transition-all duration-300">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 bg-slate-900 border-t border-x border-slate-800 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-850 select-none shadow-xl"
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">
            Live Execution Engine Telemetry & Chat Debugger
          </span>
          {logs.length > 0 && (
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {logs.length} trace events
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{totalLatency}ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>~{totalTokens} tokens</span>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="h-64 bg-slate-950/95 border-x border-t border-slate-800 p-3 flex flex-col gap-3 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter test user prompt to simulate execution graph..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              disabled={isSimulating}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simulate</span>
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[11px] custom-scrollbar p-2 bg-slate-900/60 rounded-lg border border-slate-850">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                No telemetry events yet. Click "Run Simulation" or submit a prompt above to trace execution.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 text-slate-300 hover:bg-slate-850/50 p-1.5 rounded transition"
                >
                  <span className="text-slate-500 shrink-0 text-[10px]">[{log.timestamp}]</span>

                  {log.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                  {log.status === 'info' && <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />}
                  {log.status === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                  {log.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}

                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-200">[{log.nodeLabel}]</span>{' '}
                    <span>{log.message}</span>
                  </div>

                  {log.latencyMs && (
                    <span className="text-[10px] text-indigo-400 shrink-0 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      {log.latencyMs}ms
                    </span>
                  )}
                  {log.tokensUsed && (
                    <span className="text-[10px] text-amber-400 shrink-0 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {log.tokensUsed} tok
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
