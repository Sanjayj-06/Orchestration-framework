import React from 'react';
import { Bot, Plus, Library, Network, Home } from 'lucide-react';

interface HeaderNavProps {
  currentTab: 'landing' | 'library' | 'create' | 'dashboard' | 'workflows';
  onNavigate: (tab: 'landing' | 'library' | 'create' | 'dashboard' | 'workflows') => void;
  agentCount: number;
  apiConnected: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onNavigate,
  agentCount,
  apiConnected
}) => {
  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800/80 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 group text-left transition focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-base tracking-tight">AgentCraft</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                No-Code
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Canva for AI Agents</p>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 border-l border-slate-800 pl-6">
          <button
            onClick={() => onNavigate('landing')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              currentTab === 'landing'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>

          <button
            onClick={() => onNavigate('library')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              currentTab === 'library' || currentTab === 'dashboard'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            My Agents
            <span className="bg-slate-700/80 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {agentCount}
            </span>
          </button>

          <button
            onClick={() => onNavigate('workflows')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              currentTab === 'workflows'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Workflows
          </button>
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Backend Status indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800 px-2.5 py-1 rounded-full">
          {apiConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-medium">FastAPI Online</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-amber-400 font-medium">Local Mock Ready</span>
            </>
          )}
        </div>

        {/* Create Agent CTA Button */}
        <button
          onClick={() => onNavigate('create')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create New Agent
        </button>
      </div>
    </header>
  );
};
