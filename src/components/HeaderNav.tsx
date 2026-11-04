import React from 'react';
import { Network, Plus, FlaskConical } from 'lucide-react';

interface HeaderNavProps {
  currentTab: 'landing' | 'library' | 'create' | 'dashboard' | 'pipeline' | 'templates' | 'chemistry' | 'settings';
  onNavigate: (tab: 'landing' | 'library' | 'create' | 'dashboard' | 'pipeline' | 'templates' | 'chemistry' | 'settings') => void;
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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 group text-left transition focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center group-hover:bg-blue-700 transition-colors">
            <Network className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base tracking-tight">AgentCraft</span>
            </div>
            <p className="text-[11px] text-slate-500">Agent workspace</p>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 border-l border-slate-200 pl-6 ml-2">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition ${
              currentTab === 'landing'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition ${
              currentTab === 'library' || currentTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            My Agents
            <span className="bg-slate-200/60 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full font-mono leading-none">
              {agentCount}
            </span>
          </button>

          <button
            onClick={() => onNavigate('pipeline')}
            className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition ${
              currentTab === 'pipeline'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Build
          </button>

          <button
            onClick={() => onNavigate('templates')}
            className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition ${
              currentTab === 'templates'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Templates
          </button>

          <button
            onClick={() => onNavigate('chemistry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition ${
              currentTab === 'chemistry'
                ? 'bg-cyan-50 text-cyan-700'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Chemistry
          </button>
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Backend Status indicator */}
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 mr-2">
          {apiConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Connected
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Local Mock
            </>
          )}
        </div>

        <button onClick={() => onNavigate('settings')} className={`text-[13px] font-medium transition hidden sm:block ${
          currentTab === 'settings' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}>
          Settings
        </button>
        <button className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition hidden sm:block">
          Help
        </button>

        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-bold border border-indigo-200 cursor-pointer hover:bg-indigo-200 transition">
          US
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        {/* Create Agent CTA Button */}
        <button
          onClick={() => onNavigate('create')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[13px] font-medium shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Agent
        </button>
      </div>
    </header>
  );
};
