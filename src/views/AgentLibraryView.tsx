import React, { useState } from 'react';
import {
  Bot,
  Plus,
  Play,
  Edit,
  Copy,
  Download,
  Trash2,
  Globe,
  FileText,
  Calculator,
  Terminal,
  Database,
  Search,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import type { Agent } from '../types/agent';
import { downloadAgentCode, duplicateAgent, deleteAgent } from '../services/api';

interface AgentLibraryViewProps {
  agents: Agent[];
  onOpenAgent: (agent: Agent) => void;
  onEditAgent: (agent: Agent) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
}

export const AgentLibraryView: React.FC<AgentLibraryViewProps> = ({
  agents,
  onOpenAgent,
  onEditAgent,
  onCreateNew,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(agent.id);
    try {
      await downloadAgentCode(agent.id, agent.name);
      showToast(`Standalone code for "${agent.name}" downloaded!`);
    } catch {
      showToast('Download failed. Please check backend connection.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDuplicate = async (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    setDuplicatingId(agent.id);
    try {
      await duplicateAgent(agent.id);
      showToast(`Duplicated "${agent.name}"!`);
      onRefresh();
    } catch {
      showToast('Duplication failed.');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = async (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${agent.name}"?`)) return;
    setDeletingId(agent.id);
    try {
      await deleteAgent(agent.id);
      showToast(`Deleted "${agent.name}".`);
      onRefresh();
    } catch {
      showToast('Could not delete agent.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10 overflow-y-auto custom-scrollbar">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/50 text-indigo-200 text-xs font-medium shadow-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            My Agents
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Open, run, edit, duplicate, or download your custom AI agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your agents..."
              className="bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-xl pl-8 pr-3 py-2 w-48 sm:w-60 focus:outline-none transition"
            />
          </div>

          {/* Create CTA */}
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 ? (
        <div className="py-20 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200">
              {searchQuery ? 'No matching agents found' : "You haven't created any agents yet."}
            </h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? 'Try searching with a different term or clear the search filter.'
                : 'Create your first AI agent by describing what you want it to do in plain English.'}
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        </div>
      ) : (
        /* Agent Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => {
            const spec = agent.specification;
            return (
              <div
                key={agent.id}
                onClick={() => onOpenAgent(agent)}
                className="group p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/60 hover:bg-slate-900 transition cursor-pointer flex flex-col justify-between shadow-sm relative"
              >
                <div>
                  {/* Top line: Name & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {agent.name}
                    </h3>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Active
                    </span>
                  </div>

                  {/* Purpose */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {agent.purpose}
                  </p>

                  {/* Capabilities Chips */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {spec.capabilities.web_search && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        <Globe className="w-2.5 h-2.5" /> Web
                      </span>
                    )}
                    {spec.capabilities.files && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        <FileText className="w-2.5 h-2.5" /> Files
                      </span>
                    )}
                    {spec.capabilities.data_analysis && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <Calculator className="w-2.5 h-2.5" /> Data
                      </span>
                    )}
                    {spec.capabilities.code_execution && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        <Terminal className="w-2.5 h-2.5" /> Code
                      </span>
                    )}
                    {spec.capabilities.database && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Database className="w-2.5 h-2.5" /> DB
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAgent(agent);
                    }}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Open & Test
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAgent(agent);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                      title="Edit Agent"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDuplicate(agent, e)}
                      disabled={duplicatingId === agent.id}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                      title="Duplicate Agent"
                    >
                      {duplicatingId === agent.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDownload(agent, e)}
                      disabled={downloadingId === agent.id}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition"
                      title="Download Code (.zip)"
                    >
                      {downloadingId === agent.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDelete(agent, e)}
                      disabled={deletingId === agent.id}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete Agent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
