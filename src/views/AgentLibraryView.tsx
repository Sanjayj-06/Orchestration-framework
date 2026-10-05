import React, { useState } from 'react';
import {
  Plus, Edit, Copy, Download, Trash2, Search, Loader2, CheckCircle2, Bot, PowerOff, Power
} from 'lucide-react';
import type { Agent } from '../types/agent';
import { downloadAgentCode, duplicateAgent, deleteAgent, updateAgent } from '../services/api';

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
  const [activeTab, setActiveTab] = useState<'all'|'active'|'drafts'|'archived'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    confirmColor: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredAgents = agents.filter(
    (a) =>
      (activeTab === 'all' || a.status === activeTab) &&
      (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const handleDeactivate = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmAction({
      isOpen: true,
      title: 'Deactivate Agent',
      message: `Are you sure you want to deactivate "${agent.name}"?`,
      confirmText: 'Deactivate',
      confirmColor: 'bg-amber-600 hover:bg-amber-700',
      onConfirm: async () => {
        try {
          await updateAgent(agent.id, { status: 'archived' });
          showToast(`Deactivated "${agent.name}".`);
          onRefresh();
        } catch {
          showToast('Could not deactivate agent.');
        }
        setConfirmAction(null);
      }
    });
  };

  const handleActivate = async (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateAgent(agent.id, { status: 'active' });
      showToast(`Activated "${agent.name}".`);
      onRefresh();
    } catch {
      showToast('Could not activate agent.');
    }
  };

  const handleDelete = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmAction({
      isOpen: true,
      title: 'Delete Agent',
      message: `Are you sure you want to delete "${agent.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: 'bg-rose-600 hover:bg-rose-700',
      onConfirm: async () => {
        setDeletingId(agent.id);
        try {
          await deleteAgent(agent.id);
          showToast(`Deleted "${agent.name}".`);
          onRefresh();
        } catch {
          showToast('Could not delete agent.');
        } finally {
          setDeletingId(null);
          setConfirmAction(null);
        }
      }
    });
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-50">
      {/* Confirm Modal */}
      {confirmAction && confirmAction.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <h3 className="text-lg font-semibold text-slate-900">{confirmAction.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{confirmAction.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-md text-sm font-medium text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className={`px-4 py-2 text-white rounded-md text-sm font-medium transition ${confirmAction.confirmColor}`}
              >
                {confirmAction.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 px-4 py-2.5 rounded-md bg-slate-900 text-white text-xs font-medium shadow-lg flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="px-8 py-8 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Agents
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, test and manage your AI agents.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents..."
                className="bg-white border border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 text-[13px] rounded-md pl-9 pr-3 py-2 w-48 sm:w-64 focus:outline-none transition shadow-sm"
              />
            </div>
            <button className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-md text-[13px] font-medium text-slate-700 shadow-sm transition">
              Filter
            </button>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[13px] font-medium shadow-sm transition active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Create Agent
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
          {(['all', 'active'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[13px] font-medium capitalize transition border-b-2 ${
                activeTab === tab 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredAgents.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <h3 className="text-[15px] font-semibold text-slate-900">No agents found.</h3>
            <p className="mt-1 text-[13px] text-slate-500">Create an agent to get started.</p>
            <button onClick={onCreateNew} className="mt-4 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-md text-[13px] font-medium text-slate-700 shadow-sm transition">
              Create Agent
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Agent</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Capabilities</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Memory</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Run</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50 transition group">
                    <td className="px-4 py-3 min-w-[200px] max-w-[300px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-semibold text-slate-900 truncate">{agent.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{agent.purpose}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {agent.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center flex-wrap gap-1">
                        {agent.specification?.capabilities && Object.entries(agent.specification.capabilities).filter(([_, v]) => v).map(([k, _]) => (
                           <span key={k} className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded capitalize">
                             {k.replace('_', ' ')}
                           </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-[12px] text-slate-600 capitalize">
                        {agent.specification?.memory?.scope === 'none' ? 'None' : agent.specification?.memory?.optimization || 'Balanced'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-slate-500">
                      {agent.updated_at ? new Date(agent.updated_at).toLocaleDateString() : 'Recently'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onOpenAgent(agent)} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12px] font-medium rounded-md transition shadow-sm mr-2">
                          Open
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onEditAgent(agent); }} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md transition" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => handleDuplicate(agent, e)} disabled={duplicatingId === agent.id} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md transition" title="Duplicate">
                          {duplicatingId === agent.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={(e) => handleDownload(agent, e)} disabled={downloadingId === agent.id} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md transition" title="Download Code">
                          {downloadingId === agent.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        </button>
                        {agent.status === 'active' ? (
                          <button onClick={(e) => handleDeactivate(agent, e)} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md transition" title="Deactivate">
                            <PowerOff className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button onClick={(e) => handleActivate(agent, e)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md transition" title="Activate">
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={(e) => handleDelete(agent, e)} disabled={deletingId === agent.id} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition" title="Delete">
                          {deletingId === agent.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
