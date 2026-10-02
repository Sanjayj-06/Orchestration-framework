import React from 'react';
import { STARTER_TEMPLATES } from '../data/templates';
import type { AgentTemplate } from '../types/agent';
import {
  Play,
  FileCode2,
  RefreshCw,
  Rocket,
  LayoutGrid,
  Bot,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  agentName: string;
  setAgentName: (name: string) => void;
  selectedTemplate: string;
  onSelectTemplate: (template: AgentTemplate) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
  onViewJson: () => void;
  onResetCanvas: () => void;
  nodeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  agentName,
  setAgentName,
  onSelectTemplate,
  onRunSimulation,
  isSimulating,
  onViewJson,
  onResetCanvas,
  nodeCount
}) => {
  const [showTemplates, setShowTemplates] = React.useState(false);

  return (
    <header className="h-16 bg-slate-900/95 border-b border-slate-800/80 px-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 shadow-md">
      {/* Brand & Agent Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="bg-transparent font-semibold text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-1 -ml-1 border border-transparent hover:border-slate-700 transition"
              />
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                Draft Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              No-Code Agent Orchestrator • {nodeCount} Modular Nodes
            </p>
          </div>
        </div>

        {/* Template Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-xs font-medium text-slate-200 transition"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load Template</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showTemplates && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 divide-y divide-slate-800">
              {STARTER_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    setShowTemplates(false);
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-800/80 rounded-lg transition space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                      {tmpl.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onResetCanvas}
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium transition flex items-center gap-1.5"
          title="Reset Canvas"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          onClick={onViewJson}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
        >
          <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Export DAG</span>
        </button>

        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg transition-all ${
            isSimulating
              ? 'bg-amber-600 text-white animate-pulse cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40'
          }`}
        >
          <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Simulating Engine...' : 'Run Simulation'}</span>
        </button>

        <button
          onClick={() => alert('Agent deployed! Your live API endpoint is: https://api.agent-saas.com/v1/agents/live_agent_99/chat')}
          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Deploy Agent</span>
        </button>
      </div>
    </header>
  );
};
