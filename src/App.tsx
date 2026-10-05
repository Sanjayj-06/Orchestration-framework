import React, { useState, useEffect, useCallback } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { LandingView } from './views/LandingView';
import { CreateAgentView } from './views/CreateAgentView';
import { AgentDashboardView } from './views/AgentDashboardView';
import { AgentLibraryView } from './views/AgentLibraryView';
import { BuildPipelineView } from './views/BuildPipelineView';
import type { Agent } from './types/agent';
import { getAgents, getAgent, checkHealth } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'landing' | 'library' | 'create' | 'dashboard' | 'pipeline' | 'templates'>('landing');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [prefillPrompt, setPrefillPrompt] = useState<string>('');
  const [prefillName, setPrefillName] = useState<string>('');
  const [apiConnected, setApiConnected] = useState<boolean>(true);

  // Fetch agents list
  const fetchAgents = useCallback(async () => {
    try {
      const data = await getAgents();
      setAgents(data);
      if (data.length > 0 && !activeAgent) {
        setActiveAgent(data[0]);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  }, [activeAgent]);

  // Check health and load agents on mount
  useEffect(() => {
    const checkStatus = async () => {
      const healthy = await checkHealth();
      setApiConnected(healthy);
      if (healthy) {
        fetchAgents();
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 8000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  // Navigation Handlers
  const handleStartCreateAgent = (prompt?: string, name?: string) => {
    setEditingAgent(null);
    setPrefillPrompt(prompt || '');
    setPrefillName(name || '');
    setCurrentTab('create');
  };

  const handleOpenAgent = (agent: Agent) => {
    setActiveAgent(agent);
    setCurrentTab('dashboard');
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setPrefillPrompt('');
    setPrefillName('');
    setCurrentTab('create');
  };

  const handleAgentCreatedOrUpdated = async (agentId: string) => {
    await fetchAgents();
    try {
      const fresh = await getAgent(agentId);
      setActiveAgent(fresh);
      setCurrentTab('dashboard');
    } catch {
      setCurrentTab('library');
    }
  };

  const handleAgentDuplicated = async (newAgent: Agent) => {
    await fetchAgents();
    setActiveAgent(newAgent);
    setCurrentTab('dashboard');
  };

  const handleAgentDeleted = async () => {
    await fetchAgents();
    setActiveAgent(null);
    setCurrentTab('library');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <HeaderNav
        currentTab={currentTab}
        onNavigate={(tab) => {
          if (tab === 'create') {
            setEditingAgent(null);
            setPrefillPrompt('');
            setPrefillName('');
          }
          setCurrentTab(tab);
        }}
        agentCount={agents.length}
        apiConnected={apiConnected}
      />

      <main className="flex-1 overflow-hidden relative flex flex-col">
        {currentTab === 'landing' && (
          <LandingView
            agents={agents}
            onCreateAgent={handleStartCreateAgent}
            onExploreLibrary={() => setCurrentTab('library')}
            onOpenAgent={handleOpenAgent}
          />
        )}

        {currentTab === 'library' && (
          <AgentLibraryView
            agents={agents}
            onOpenAgent={handleOpenAgent}
            onEditAgent={handleEditAgent}
            onCreateNew={() => handleStartCreateAgent()}
            onRefresh={fetchAgents}
          />
        )}

        {currentTab === 'create' && (
          <CreateAgentView
            initialPrompt={prefillPrompt}
            initialName={prefillName}
            editingAgentId={editingAgent ? editingAgent.id : undefined}
            existingSpec={editingAgent ? editingAgent.specification : undefined}
            onAgentCreated={handleAgentCreatedOrUpdated}
            onCancel={() => (activeAgent ? setCurrentTab('dashboard') : setCurrentTab('landing'))}
          />
        )}

        {currentTab === 'dashboard' && (
          activeAgent ? (
            <AgentDashboardView
              agent={activeAgent}
              onEditAgent={handleEditAgent}
              onAgentDuplicated={handleAgentDuplicated}
              onAgentDeleted={handleAgentDeleted}
              onBackToLibrary={() => setCurrentTab('library')}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <p className="text-sm text-slate-400">No agent selected.</p>
              <button
                onClick={() => setCurrentTab('library')}
                className="px-4 py-2 bg-indigo-600 text-xs font-semibold rounded-xl text-white"
              >
                Go to My Agents
              </button>
            </div>
          )
        )}

        {currentTab === 'pipeline' && <BuildPipelineView agents={agents} />}
        {currentTab === 'templates' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Agent Templates</h2>
            <p className="text-sm text-slate-500 max-w-md">Browse pre-configured agent templates to get started quickly. (Coming soon)</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
