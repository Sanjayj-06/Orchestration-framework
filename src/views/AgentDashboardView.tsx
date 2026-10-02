import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Download,
  Copy,
  Edit,
  Trash2,
  Send,
  Sparkles,
  Brain,
  Globe,
  FileText,
  Calculator,
  Terminal,
  Database,
  Unplug,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ChevronRight
} from 'lucide-react';
import type { Agent, ChatMessage, ToolStep } from '../types/agent';
import {
  chatWithAgent,
  getChatHistory,
  clearChatHistory,
  downloadAgentCode,
  duplicateAgent,
  deleteAgent
} from '../services/api';

interface AgentDashboardViewProps {
  agent: Agent;
  onEditAgent: (agent: Agent) => void;
  onAgentDuplicated: (newAgent: Agent) => void;
  onAgentDeleted: () => void;
  onBackToLibrary: () => void;
}

export const AgentDashboardView: React.FC<AgentDashboardViewProps> = ({
  agent,
  onEditAgent,
  onAgentDuplicated,
  onAgentDeleted,
  onBackToLibrary
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolSteps, setActiveToolSteps] = useState<ToolStep[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load chat history
  useEffect(() => {
    let isMounted = true;
    getChatHistory(agent.id)
      .then((history) => {
        if (isMounted) setMessages(history);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [agent.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeToolSteps]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    setActiveToolSteps([]);

    // Temporary optimistic tool step based on capabilities
    const caps = agent.specification.capabilities;
    const txtLower = text.toLowerCase();
    const simulatedSteps: ToolStep[] = [];

    if (caps.web_search && (txtLower.includes('search') || txtLower.includes('find') || txtLower.includes('paper') || txtLower.includes('what'))) {
      simulatedSteps.push({
        tool: 'web_search',
        title: 'Searching web for relevant findings...',
        status: 'running'
      });
    }
    if (caps.data_analysis && (txtLower.includes('data') || txtLower.includes('metrics') || txtLower.includes('calculate'))) {
      simulatedSteps.push({
        tool: 'data_analysis',
        title: 'Analyzing dataset metrics...',
        status: 'running'
      });
    }
    if (simulatedSteps.length > 0) {
      setActiveToolSteps(simulatedSteps);
    }

    try {
      const response = await chatWithAgent(agent.id, text.trim());
      setActiveToolSteps(response.tool_steps || []);

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
        tool_steps: response.tool_steps
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'The AI service is temporarily busy. Please try again in a few moments.',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory(agent.id);
      setMessages([]);
      setActiveToolSteps([]);
      showToast('Conversation memory cleared.');
    } catch {
      showToast('Could not reset history.');
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAgentCode(agent.id, agent.name);
      showToast(`Standalone project for ${agent.name} downloaded!`);
    } catch (err: any) {
      showToast('Failed to download project code.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const duplicated = await duplicateAgent(agent.id);
      showToast(`Agent duplicated as "${duplicated.name}"!`);
      onAgentDuplicated(duplicated);
    } catch (err: any) {
      showToast('Failed to duplicate agent.');
    } finally {
      setDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${agent.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteAgent(agent.id);
      onAgentDeleted();
    } catch (err: any) {
      showToast('Failed to delete agent.');
      setDeleting(false);
    }
  };

  // Sample prompt suggestions based on agent type
  const samplePrompts = [
    'Find recent papers about sustainable software engineering.',
    'Summarize your primary workflow and tell me how we can get started.',
    'Analyze our key metrics and suggest actionable optimizations.'
  ];

  const spec = agent.specification;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-950">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="absolute top-20 right-8 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/50 text-indigo-200 text-xs font-medium shadow-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header / Actions Bar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLibrary}
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            ← My Agents
          </button>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold text-slate-100">{agent.name}</h1>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Active
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditAgent(agent)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-700/80 rounded-lg text-xs font-medium transition"
            title="Edit Agent Configuration"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>

          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-700/80 rounded-lg text-xs font-medium transition disabled:opacity-60"
            title="Duplicate Agent"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-60"
            title="Download Standalone Python Project"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Download Code (.zip)
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition"
            title="Delete Agent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Specs (Left) & Chat (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Agent Overview & Specs */}
        <div className="w-80 md:w-96 border-r border-slate-800 bg-slate-900/40 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4 shrink-0">
          {/* Purpose Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Agent Purpose
            </span>
            <p className="mt-1 text-xs text-slate-200 leading-relaxed">{agent.purpose}</p>
          </div>

          {/* Capabilities */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Enabled Capabilities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {spec.capabilities.web_search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  <Globe className="w-3 h-3" /> Web Search
                </span>
              )}
              {spec.capabilities.files && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <FileText className="w-3 h-3" /> Document Files
                </span>
              )}
              {spec.capabilities.data_analysis && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <Calculator className="w-3 h-3" /> Data Analysis
                </span>
              )}
              {spec.capabilities.code_execution && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <Terminal className="w-3 h-3" /> Code Sandbox
                </span>
              )}
              {spec.capabilities.database && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Database className="w-3 h-3" /> Database
                </span>
              )}
              {spec.capabilities.apis && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-pink-500/10 text-pink-300 border border-pink-500/20">
                  <Unplug className="w-3 h-3" /> APIs
                </span>
              )}
              {spec.capabilities.other_agents && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  <Bot className="w-3 h-3" /> Agent Chaining
                </span>
              )}
            </div>
          </div>

          {/* Memory Specification */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Memory System
              </span>
              <Brain className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-xs font-semibold text-purple-300 capitalize">
              {spec.memory.scope.replace('_', ' ')}
            </p>
            <p className="text-[11px] text-slate-400 leading-snug">
              {spec.memory.optimization === 'balanced'
                ? 'Balanced Optimization: Automatically retains essential context while pruning unnecessary tokens.'
                : `${spec.memory.optimization} optimization mode enabled.`}
            </p>
          </div>

          {/* Behavior & Autonomy */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Working Behavior
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Style</span>
                <span className="font-medium text-slate-200 capitalize">{spec.behavior.style}</span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Autonomy</span>
                <span className="font-medium text-slate-200 capitalize">
                  {spec.behavior.autonomy.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Response Format */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Output Format
            </span>
            <p className="mt-1 text-xs text-slate-200 capitalize font-medium">
              {spec.output.format}
            </p>
          </div>

          {/* Multi-Agent Metadata readiness */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="font-mono text-slate-500">ID: {agent.id}</span>
            <span className="text-indigo-400 font-medium">Multi-Agent Node</span>
          </div>
        </div>

        {/* Right Main Pane: Interactive Test Agent Chat */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
          {/* Chat Header */}
          <div className="h-12 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 bg-slate-900/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Test Your Agent
              <span className="text-slate-500 font-normal">| Live Runtime Session</span>
            </div>

            <button
              onClick={handleClearChat}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
              title="Clear conversation history"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Memory
            </button>
          </div>

          {/* Messages Flow Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">Test {agent.name}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Send a test message below to run your agent. Watch how it executes tools, remembers context, and synthesizes answers.
                  </p>
                </div>

                <div className="w-full space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Suggested Test Queries:
                  </span>
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p)}
                      className="w-full text-left text-xs bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-indigo-300 rounded-xl p-3 transition shadow-sm flex items-center justify-between group"
                    >
                      <span className="line-clamp-1">{p}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {msg.role === 'user' ? 'You' : agent.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Tool steps if assistant executed tools */}
                  {msg.tool_steps && msg.tool_steps.length > 0 && (
                    <div className="mb-2 max-w-xl w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5 shadow-sm">
                      <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
                        <Terminal className="w-3 h-3" />
                        Tool Activity:
                      </div>
                      {msg.tool_steps.map((st, i) => (
                        <div key={i} className="text-slate-300 pl-4 border-l border-indigo-500/40 py-0.5">
                          <span className="font-medium text-slate-200">{st.title}</span>
                          {st.output && (
                            <p className="text-[10px] text-slate-400 mt-0.5">{st.output}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {/* Active Live Tool Step Indicators */}
            {isLoading && (
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-400 px-1">
                  <Bot className="w-3.5 h-3.5 animate-bounce" />
                  {agent.name} is thinking...
                </div>

                {activeToolSteps.length > 0 && (
                  <div className="max-w-xl w-full p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs space-y-2 shadow-md">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1.5 text-[11px]">
                      <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                      Executing agent capabilities...
                    </span>
                    {activeToolSteps.map((st, i) => (
                      <div key={i} className="text-slate-300 pl-3 border-l-2 border-indigo-500 text-[11px]">
                        {st.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-slate-950 border border-slate-800 focus-within:border-indigo-500 rounded-2xl px-4 py-2 transition"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${agent.name} a question or give it a task...`}
                className="flex-1 bg-transparent text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
