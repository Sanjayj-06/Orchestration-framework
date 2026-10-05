import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Check, AlertCircle, Loader2, Globe, FileText, Calculator, Terminal, Link, Bot } from 'lucide-react';
import type { AgentSpecification, WorkingStyle, AutonomyLevel, MemoryScope, AgentCapabilities } from '../types/agent';
import { analyzeRequirement, createAgent, updateAgent } from '../services/api';

interface CreateAgentViewProps {
  initialPrompt?: string;
  initialName?: string;
  editingAgentId?: string;
  existingSpec?: AgentSpecification;
  onAgentCreated: (agentId: string) => void;
  onCancel: () => void;
}

const EXAMPLE_PROMPTS = [
  'Help me analyze Excel files and generate insights.',
  'Search the web and prepare a report about a topic.',
  'Help students solve programming problems.',
  'Review legal contracts and highlight potential risks.'
];

export const CreateAgentView: React.FC<CreateAgentViewProps> = ({
  initialPrompt = '',
  initialName = '',
  editingAgentId,
  existingSpec,
  onAgentCreated,
  onCancel
}) => {
  const [step, setStep] = useState<number>(existingSpec ? 3 : 1);
  const [requirement, setRequirement] = useState(initialPrompt);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [spec, setSpec] = useState<AgentSpecification>(() => {
    if (existingSpec) return existingSpec;
    return {
      name: initialName || 'New Assistant',
      purpose: '',
      description: '',
      tasks: [],
      behavior: { style: 'detailed', autonomy: 'guided' },
      capabilities: {
        web_search: true,
        files: true,
        data_analysis: false,
        code_execution: false,
        database: false,
        apis: false,
        other_agents: false
      },
      tools: ['web_search', 'file_processing'],
      memory: { enabled: true, scope: 'across_conversations', optimization: 'balanced' },
      model: { provider: 'recommended', name: 'auto', temperature: 0.5, max_tokens: 2048 },
      output: { format: 'normal', custom_instruction: '' },
      advanced: {
        system_prompt: '',
        context_window: 8000,
        retry_attempts: 3,
        tool_timeout_seconds: 30,
        error_handling: 'graceful'
      }
    };
  });

  // _summary is removed

  useEffect(() => {
    if (initialPrompt && !existingSpec) {
      setRequirement(initialPrompt);
    }
  }, [initialPrompt, existingSpec]);

  const handleAnalyzeRequirement = async () => {
    if (!requirement.trim()) {
      setErrorMessage('Please describe what you want your AI assistant to do.');
      return;
    }
    setErrorMessage(null);
    setIsAnalyzing(true);
    try {
      const res = await analyzeRequirement(requirement.trim(), undefined);
      setSpec(res.specification);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'The AI service is temporarily busy. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleCapability = (key: keyof AgentCapabilities) => {
    const updatedCaps = { ...spec.capabilities, [key]: !spec.capabilities[key] };
    const toolMap: Record<keyof AgentCapabilities, string> = {
      web_search: 'web_search',
      files: 'file_processing',
      data_analysis: 'data_analysis',
      code_execution: 'code_execution',
      database: 'database',
      apis: 'apis',
      other_agents: 'other_agents'
    };
    const activeTools = (Object.keys(updatedCaps) as (keyof AgentCapabilities)[])
      .filter((k) => updatedCaps[k])
      .map((k) => toolMap[k]);
    setSpec({ ...spec, capabilities: updatedCaps, tools: activeTools });
  };

  const handleCreateAgent = async () => {
    setStep(7);
    setIsSaving(true);
    setErrorMessage(null);
    try {
      if (editingAgentId) {
        const updated = await updateAgent(editingAgentId, {
          name: spec.name,
          purpose: spec.purpose,
          description: spec.description,
          specification: spec
        });
        onAgentCreated(updated.id);
      } else {
        const created = await createAgent(spec, spec.name);
        onAgentCreated(created.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not save the agent. Please try again.');
      setStep(6);
    } finally {
      setIsSaving(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`} />
          {i < 6 && <div className={`w-6 h-px ${step > i ? 'bg-blue-600' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col h-full bg-slate-50 overflow-y-auto custom-scrollbar items-center py-12 px-6">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-10 relative">
        {step < 7 && <StepIndicator />}

        {errorMessage && step !== 7 && (
          <div className="mb-6 p-4 rounded-md bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-[13px]">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Describe */}
        {step === 1 && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">What do you want your AI agent to do?</h1>
              <p className="mt-2 text-[14px] text-slate-500">Describe it in your own words. No technical knowledge required.</p>
            </div>
            
            <div className="relative">
              <textarea
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                rows={5}
                placeholder="I want an assistant that..."
                className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] text-slate-900 placeholder:text-slate-400 rounded-xl p-4 focus:outline-none resize-none transition"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[12px] font-semibold text-slate-500">Try these examples:</span>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => setRequirement(p)} className="text-[12px] bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-md px-3 py-1.5 transition text-left">
                    "{p}"
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button onClick={onCancel} className="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition">Cancel</button>
              <button onClick={handleAnalyzeRequirement} disabled={isAnalyzing} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[14px] font-medium transition disabled:opacity-70 shadow-sm">
                {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Understanding...</> : <>Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Understand */}
        {step === 2 && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">We understand your idea.</h1>
              <p className="mt-2 text-[14px] text-slate-500">Does this look right?</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500">Agent Name</h3>
                  <div className="text-lg font-bold text-slate-900">{spec.name}</div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-500 mb-1">Purpose</h3>
                <p className="text-[14px] text-slate-800 leading-relaxed">{spec.purpose}</p>
              </div>

              {spec.tasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 mb-2">Main Tasks</h3>
                  <ul className="space-y-1.5">
                    {spec.tasks.map((task, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[14px] text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition">Edit</button>
              <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[14px] font-medium transition shadow-sm">
                Looks Good <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Behaviour */}
        {step === 3 && (
          <div className="animate-fadeIn space-y-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">How should your agent behave?</h1>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-slate-900 mb-3">Behaviour style</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'simple', label: 'Simple & direct' },
                  { id: 'detailed', label: 'Detailed' },
                  { id: 'professional', label: 'Professional' },
                  { id: 'creative', label: 'Creative' },
                  { id: 'technical', label: 'Technical' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSpec({ ...spec, behavior: { ...spec.behavior, style: st.id as WorkingStyle } })}
                    className={`py-2 px-4 rounded-full text-[13px] font-medium border transition ${
                      spec.behavior.style === st.id ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-slate-900 mb-3">How independently should it work?</label>
              <div className="space-y-3">
                {[
                  { id: 'ask_me', title: 'Ask Me', desc: 'Ask before important actions.' },
                  { id: 'guided', title: 'Work With Guidance', desc: 'Complete normal tasks independently and ask when something important is unclear.' },
                  { id: 'automatic', title: 'Work Automatically', desc: 'Complete tasks with minimal interruptions.' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSpec({ ...spec, behavior: { ...spec.behavior, autonomy: item.id as AutonomyLevel } })}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      spec.behavior.autonomy === item.id ? 'bg-blue-50/50 border-blue-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-[14px] font-bold text-slate-900 mb-0.5">{item.title}</div>
                      <p className="text-[13px] text-slate-500">{item.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${spec.behavior.autonomy === item.id ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                      {spec.behavior.autonomy === item.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition"><ArrowLeft className="w-4 h-4"/> Back</button>
              <button onClick={() => setStep(4)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[14px] font-medium transition shadow-sm">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Capabilities */}
        {step === 4 && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">What should your agent be able to use?</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'web_search', title: 'Web Search', icon: Globe, desc: 'Find information from the internet.' },
                { key: 'files', title: 'Files', icon: FileText, desc: 'Read and analyze documents.' },
                { key: 'code_execution', title: 'Code', icon: Terminal, desc: 'Run code when needed.' },
                { key: 'data_analysis', title: 'Data Analysis', icon: Calculator, desc: 'Analyze spreadsheets and datasets.' },
                { key: 'apis', title: 'APIs', icon: Link, desc: 'Connect to external services.' },
                { key: 'other_agents', title: 'Other Agents', icon: Bot, desc: 'Work with other agents.' }
              ].map((item) => {
                const isEnabled = spec.capabilities[item.key as keyof AgentCapabilities];
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleCapability(item.key as keyof AgentCapabilities)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      isEnabled ? 'bg-blue-50/50 border-blue-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`mt-0.5 p-2 rounded-lg ${isEnabled ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                       <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-[14px] font-bold text-slate-900 truncate">{item.title}</h4>
                      </div>
                      <p className="text-[12px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${isEnabled ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                      {isEnabled && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setStep(3)} className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition"><ArrowLeft className="w-4 h-4"/> Back</button>
              <button onClick={() => setStep(5)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[14px] font-medium transition shadow-sm">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Memory */}
        {step === 5 && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Should your agent remember information?</h1>
              <p className="mt-2 text-[14px] text-slate-500">Memory helps your agent retain useful information while working.</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'none', title: 'No Memory', desc: 'Start fresh every time.' },
                { id: 'this_conversation', title: 'Conversation Memory', desc: 'Remember information during the current conversation.' },
                { id: 'across_conversations', title: 'Long-Term Memory', desc: 'Remember useful information across conversations.' }
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSpec({ ...spec, memory: { ...spec.memory, enabled: m.id !== 'none', scope: m.id as MemoryScope } })}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    spec.memory.scope === m.id ? 'bg-blue-50/50 border-blue-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-[14px] font-bold text-slate-900 mb-0.5">{m.title}</div>
                    <p className="text-[13px] text-slate-500">{m.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${spec.memory.scope === m.id ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                    {spec.memory.scope === m.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setStep(4)} className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition"><ArrowLeft className="w-4 h-4"/> Back</button>
              <button onClick={() => setStep(6)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[14px] font-medium transition shadow-sm">
                Review Agent <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Review */}
        {step === 6 && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review your agent</h1>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
              <div>
                 <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">AGENT</h3>
                 <div className="text-[16px] font-bold text-slate-900">{spec.name}</div>
              </div>
              
              <div>
                 <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">PURPOSE</h3>
                 <div className="text-[14px] text-slate-700">{spec.purpose}</div>
              </div>

              <div>
                 <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">BEHAVIOUR</h3>
                 <div className="text-[14px] text-slate-700 capitalize">{spec.behavior.style} • {spec.behavior.autonomy.replace('_', ' ')}</div>
              </div>

              <div>
                 <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">CAPABILITIES</h3>
                 <div className="flex flex-wrap gap-1.5 mt-1">
                   {Object.entries(spec.capabilities).filter(([_,v]) => v).map(([k]) => (
                     <span key={k} className="text-[12px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md capitalize">
                       {k.replace('_', ' ')}
                     </span>
                   ))}
                   {Object.entries(spec.capabilities).filter(([_,v]) => v).length === 0 && <span className="text-[14px] text-slate-500">None</span>}
                 </div>
              </div>

              <div>
                 <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">MEMORY</h3>
                 <div className="text-[14px] text-slate-700 capitalize">{spec.memory.scope.replace('_', ' ')}</div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setStep(5)} className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition"><ArrowLeft className="w-4 h-4"/> Back</button>
              <button onClick={handleCreateAgent} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[14px] font-medium transition shadow-sm">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Create Agent
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Creating State */}
        {step === 7 && (
          <div className="animate-fadeIn flex flex-col items-center justify-center py-10 space-y-6 text-center min-h-[300px]">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                <div className="w-16 h-16 relative bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                   <Bot className="w-8 h-8 animate-pulse" />
                </div>
             </div>
             
             <div>
               <h2 className="text-xl font-bold text-slate-900">Creating your agent...</h2>
               <div className="mt-6 space-y-2 text-left w-64 mx-auto">
                 <div className="flex items-center gap-3 text-[14px] text-slate-700">
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Understanding requirements
                 </div>
                 <div className="flex items-center gap-3 text-[14px] text-slate-700">
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Configuring behaviour
                 </div>
                 <div className="flex items-center gap-3 text-[14px] text-slate-700">
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Setting capabilities
                 </div>
                 <div className="flex items-center gap-3 text-[14px] text-blue-600 font-medium animate-pulse">
                   <Loader2 className="w-4 h-4 animate-spin" /> Preparing runtime
                 </div>
               </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
