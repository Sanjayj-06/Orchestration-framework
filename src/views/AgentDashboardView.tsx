import React, { useState, useEffect, useRef } from 'react';
import { Bot, Download, Copy, Edit, Trash2, Send, Globe, FileText, Calculator, Terminal, Database, CheckCircle2, RefreshCw, Loader2, ChevronRight, Link } from 'lucide-react';
import type { Agent, ChatMessage, ToolStep } from '../types/agent';
import { chatWithAgent, getChatHistory, clearChatHistory, downloadAgentCode, duplicateAgent, deleteAgent } from '../services/api';

interface AgentDashboardViewProps {
  agent: Agent;
  onEditAgent: (agent: Agent) => void;
  onAgentDuplicated: (newAgent: Agent) => void;
  onAgentDeleted: () => void;
  onBackToLibrary: () => void;
}

export const AgentDashboardView: React.FC<AgentDashboardViewProps> = ({
  agent, onEditAgent, onAgentDuplicated, onAgentDeleted, onBackToLibrary
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

  useEffect(() => {
    let isMounted = true;
    getChatHistory(agent.id).then((history) => {
      if (isMounted) setMessages(history);
    }).catch(() => {});
    return () => { isMounted = false; };
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

    const caps = agent.specification.capabilities;
    const txtLower = text.toLowerCase();
    const simulatedSteps: ToolStep[] = [];

    if (caps.web_search && (txtLower.includes('search') || txtLower.includes('find') || txtLower.includes('paper') || txtLower.includes('what'))) {
      simulatedSteps.push({ tool: 'web_search', title: 'Searching web for relevant findings...', status: 'running' });
    }
    if (caps.data_analysis && (txtLower.includes('data') || txtLower.includes('metrics') || txtLower.includes('calculate'))) {
      simulatedSteps.push({ tool: 'data_analysis', title: 'Analyzing dataset metrics...', status: 'running' });
    }
    if (simulatedSteps.length > 0) {
      setActiveToolSteps(simulatedSteps);
    }

    try {
      const response = await chatWithAgent(agent.id, text.trim());
      setActiveToolSteps(response.tool_steps || []);
      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`, role: 'assistant', content: response.response, timestamp: response.timestamp, tool_steps: response.tool_steps
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`, role: 'assistant', content: 'The AI service is temporarily busy. Please try again in a few moments.', timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory(agent.id);
      setMessages([]); setActiveToolSteps([]); showToast('Conversation memory cleared.');
    } catch { showToast('Could not reset history.'); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try { await downloadAgentCode(agent.id, agent.name); showToast(`Standalone project for ${agent.name} downloaded!`); }
    catch { showToast('Failed to download project code.'); }
    finally { setDownloading(false); }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try { const duplicated = await duplicateAgent(agent.id); showToast(`Agent duplicated as "${duplicated.name}"!`); onAgentDuplicated(duplicated); }
    catch { showToast('Failed to duplicate agent.'); }
    finally { setDuplicating(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${agent.name}"?`)) return;
    setDeleting(true);
    try { await deleteAgent(agent.id); onAgentDeleted(); }
    catch { showToast('Failed to delete agent.'); setDeleting(false); }
  };

  const samplePrompts = [
    'Find recent papers about sustainable software engineering.',
    'Summarize your primary workflow and tell me how we can get started.',
    'Analyze our key metrics and suggest actionable optimizations.'
  ];

  const spec = agent.specification;

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden text-slate-900 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-20 right-8 z-50 px-4 py-2.5 rounded-md bg-slate-900 text-white text-xs font-medium shadow-lg flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="h-[52px] border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBackToLibrary} className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition">My Agents</button>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2">
            <h1 className="text-[14px] font-bold text-slate-900">{agent.name}</h1>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onEditAgent(agent)} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-[12px] font-medium transition flex items-center gap-1.5 shadow-sm">
            <Edit className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={handleDuplicate} disabled={duplicating} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-[12px] font-medium transition flex items-center gap-1.5 shadow-sm">
            {duplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />} Duplicate
          </button>
          <button onClick={handleDownload} disabled={downloading} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[12px] font-medium transition flex items-center gap-1.5 shadow-sm">
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Export Code
          </button>
          <button onClick={handleDelete} disabled={deleting} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition ml-2">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Dense Specs */}
        <div className="w-[280px] border-r border-slate-200 bg-slate-50 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-5 shrink-0">
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Purpose</h3>
            <p className="text-[13px] text-slate-700 leading-relaxed">{agent.purpose}</p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Capabilities</h3>
            <div className="flex flex-col gap-2">
              {spec.capabilities.web_search && <div className="flex items-center gap-2 text-[12px] text-slate-700"><Globe className="w-3.5 h-3.5 text-slate-400" /> Web Search</div>}
              {spec.capabilities.files && <div className="flex items-center gap-2 text-[12px] text-slate-700"><FileText className="w-3.5 h-3.5 text-slate-400" /> File Processing</div>}
              {spec.capabilities.data_analysis && <div className="flex items-center gap-2 text-[12px] text-slate-700"><Calculator className="w-3.5 h-3.5 text-slate-400" /> Data Analysis</div>}
              {spec.capabilities.code_execution && <div className="flex items-center gap-2 text-[12px] text-slate-700"><Terminal className="w-3.5 h-3.5 text-slate-400" /> Code Execution</div>}
              {spec.capabilities.database && <div className="flex items-center gap-2 text-[12px] text-slate-700"><Database className="w-3.5 h-3.5 text-slate-400" /> Database Access</div>}
              {spec.capabilities.apis && <div className="flex items-center gap-2 text-[12px] text-slate-700"><Link className="w-3.5 h-3.5 text-slate-400" /> External APIs</div>}
            </div>
          </div>

          <div>
             <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Behaviour</h3>
             <div className="space-y-2 text-[12px]">
               <div className="flex justify-between items-center"><span className="text-slate-500">Style</span><span className="font-medium text-slate-900 capitalize">{spec.behavior.style}</span></div>
               <div className="flex justify-between items-center"><span className="text-slate-500">Independence</span><span className="font-medium text-slate-900 capitalize">{spec.behavior.autonomy.replace('_', ' ')}</span></div>
             </div>
          </div>

          <div>
             <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Memory System</h3>
             <div className="space-y-2 text-[12px]">
               <div className="flex justify-between items-center"><span className="text-slate-500">Scope</span><span className="font-medium text-slate-900 capitalize">{spec.memory.scope.replace('_', ' ')}</span></div>
               <div className="flex justify-between items-center"><span className="text-slate-500">Optimization</span><span className="font-medium text-slate-900 capitalize">{spec.memory.optimization}</span></div>
             </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200">
             <div className="text-[10px] text-slate-400 font-mono">Agent ID: {agent.id.slice(0, 8)}...</div>
          </div>
        </div>

        {/* Right Chat Interface */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="h-[40px] border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0 text-[12px]">
            <div className="flex items-center gap-2 font-medium text-slate-600"><Terminal className="w-3.5 h-3.5 text-slate-400" /> Runtime Console</div>
            <button onClick={handleClearChat} className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 transition"><RefreshCw className="w-3 h-3" /> Clear History</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:px-12 xl:px-24">
            {messages.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                <div className="w-12 h-12 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Bot className="w-6 h-6" /></div>
                <h3 className="text-lg font-bold text-slate-900">Agent Runtime Ready</h3>
                <p className="mt-1 text-[13px] text-slate-500">Send a command to initiate the agent's workflow.</p>
                <div className="w-full mt-8 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left mb-3">Example Commands</div>
                  {samplePrompts.map((p, i) => (
                    <button key={i} onClick={() => handleSendMessage(p)} className="w-full text-left text-[13px] text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-md p-3 transition shadow-sm flex items-center justify-between group">
                      <span>{p}</span><ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col text-[14px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{msg.role === 'user' ? 'You' : agent.name}</span>
                      <span className="text-[11px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {msg.tool_steps && msg.tool_steps.length > 0 && (
                      <div className="my-2 bg-slate-50 border border-slate-200 rounded-md p-3 text-[12px] font-mono w-full">
                        <div className="text-slate-500 font-semibold mb-1 flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> Agent Execution Log</div>
                        {msg.tool_steps.map((st, i) => (
                          <div key={i} className="pl-3 border-l-2 border-blue-200 py-0.5">
                            <span className="text-slate-800">{st.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex flex-col text-[14px] mt-6">
                     <div className="flex items-center gap-2 mb-2 font-bold text-slate-900">{agent.name} <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" /></div>
                     {activeToolSteps.length > 0 && (
                       <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-[12px] font-mono w-full">
                          {activeToolSteps.map((st, i) => (
                            <div key={i} className="pl-3 border-l-2 border-blue-200 py-0.5 text-slate-600">{st.title}</div>
                          ))}
                       </div>
                     )}
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 md:px-12 xl:px-24 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-end gap-2 bg-white border border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-xl p-2 transition shadow-sm">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder={`Message ${agent.name}...`}
                className="flex-1 bg-transparent text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none max-h-32 p-2"
                rows={1}
                disabled={isLoading}
              />
              <button type="submit" disabled={!inputMessage.trim() || isLoading} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 shrink-0 shadow-sm mb-0.5 mr-0.5">
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-center mt-2 text-[11px] text-slate-400">
               {agent.name} can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
