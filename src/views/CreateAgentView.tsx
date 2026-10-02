import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  AlertCircle,
  Loader2,
  Brain,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type {
  AgentSpecification,
  HumanReadableSummary,
  WorkingStyle,
  AutonomyLevel,
  MemoryScope,
  MemoryOptimization,
  OutputFormat,
  AgentCapabilities
} from '../types/agent';
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
  const [step, setStep] = useState<1 | 2>(existingSpec ? 2 : 1);
  const [requirement, setRequirement] = useState(initialPrompt);
  const [agentNameInput, setAgentNameInput] = useState(initialName);
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

  const [_summary, setSummary] = useState<HumanReadableSummary | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);

  useEffect(() => {
    if (initialPrompt && !existingSpec) {
      setRequirement(initialPrompt);
    }
    if (initialName) {
      setAgentNameInput(initialName);
    }
  }, [initialPrompt, initialName, existingSpec]);

  const handleAnalyzeRequirement = async () => {
    if (!requirement.trim()) {
      setErrorMessage('Please describe what you want your AI assistant to do.');
      return;
    }
    setErrorMessage(null);
    setIsAnalyzing(true);
    try {
      const res = await analyzeRequirement(requirement.trim(), agentNameInput.trim() || undefined);
      setSpec(res.specification);
      setSummary(res.summary);
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
    setSpec({
      ...spec,
      capabilities: updatedCaps,
      tools: activeTools
    });
  };

  const handleCreateAgent = async () => {
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10 overflow-y-auto custom-scrollbar">
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Describe Requirement */}
      {step === 1 && (
        <div className="space-y-8 animate-fadeIn">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              Step 1 of 2
            </span>
            <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              What would you like your AI agent to do?
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-slate-400">
              Describe your need in simple everyday language. We'll automatically configure tools, memory, and behavior for you.
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative rounded-2xl bg-slate-900 border border-slate-700/80 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition p-4 shadow-sm">
              <textarea
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                rows={5}
                placeholder='Example: "I want an assistant that can read research papers, summarize them and identify possible research gaps."'
                className="w-full bg-transparent text-sm md:text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Natural language requirement</span>
                <span>{requirement.length} characters</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400">Try these examples:</span>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRequirement(p)}
                    className="text-[11px] bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 border border-slate-700/60 rounded-lg px-2.5 py-1.5 transition text-left"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              What should we call your agent? <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={agentNameInput}
              onChange={(e) => setAgentNameInput(e.target.value)}
              placeholder="e.g., Research Assistant (leave blank to auto-generate)"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyzeRequirement}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing your requirements...
                </>
              ) : (
                <>
                  Create Configuration
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Configure & Review Agent */}
      {step === 2 && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Banner: We've understood what you need */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 shadow-md">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              We've understood what you need
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">{spec.name}</h2>
            <p className="mt-1 text-xs md:text-sm text-slate-300 leading-relaxed">{spec.purpose}</p>

            {spec.tasks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-indigo-500/20">
                <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wide">
                  What it will do:
                </span>
                <ol className="mt-2 space-y-1.5 text-xs text-slate-300 list-decimal list-inside">
                  {spec.tasks.map((task, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="text-slate-200">{task}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Section A: Agent Purpose */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Agent Purpose & Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={spec.name}
                  onChange={(e) => setSpec({ ...spec, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Purpose</label>
                <input
                  type="text"
                  value={spec.purpose}
                  onChange={(e) => setSpec({ ...spec, purpose: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Description</label>
              <textarea
                value={spec.description}
                onChange={(e) => setSpec({ ...spec, description: e.target.value })}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Section B: How Should the Agent Behave? */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">How should your agent behave?</h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-2">Working Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'simple', label: 'Simple & direct' },
                  { id: 'detailed', label: 'Detailed & explanatory' },
                  { id: 'professional', label: 'Professional' },
                  { id: 'creative', label: 'Creative' },
                  { id: 'technical', label: 'Technical' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() =>
                      setSpec({
                        ...spec,
                        behavior: { ...spec.behavior, style: st.id as WorkingStyle }
                      })
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                      spec.behavior.style === st.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-2">Independence</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    id: 'ask_me',
                    title: 'Ask Me',
                    desc: 'Ask me before taking important actions.'
                  },
                  {
                    id: 'guided',
                    title: 'Work With Guidance',
                    desc: 'Complete normal tasks independently but ask when something important is unclear.'
                  },
                  {
                    id: 'automatic',
                    title: 'Work Automatically',
                    desc: 'Complete tasks with minimal interruptions.'
                  }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      setSpec({
                        ...spec,
                        behavior: { ...spec.behavior, autonomy: item.id as AutonomyLevel }
                      })
                    }
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      spec.behavior.autonomy === item.id
                        ? 'bg-indigo-600/10 border-indigo-500 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                        {spec.behavior.autonomy === item.id && (
                          <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section C: What should your agent be able to use? (Capabilities) */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">What should your agent be able to use?</h3>
              <p className="text-xs text-slate-400 mt-0.5">Toggle the capabilities you want this agent to use.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'web_search', title: '🌐 Web Search', desc: 'Find information from the internet.' },
                { key: 'files', title: '📄 Files', desc: 'Read and analyze documents.' },
                { key: 'data_analysis', title: '🧮 Data Analysis', desc: 'Analyze datasets and calculate results.' },
                { key: 'code_execution', title: '💻 Code Execution', desc: 'Run code when needed.' },
                { key: 'database', title: '🗄 Database', desc: 'Read or work with database information.' },
                { key: 'apis', title: '🔌 APIs', desc: 'Connect to external services.' },
                { key: 'other_agents', title: '🤖 Other Agents', desc: 'Allow this agent to work with other agents.' }
              ].map((item) => {
                const isEnabled = spec.capabilities[item.key as keyof AgentCapabilities];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleCapability(item.key as keyof AgentCapabilities)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                      isEnabled
                        ? 'bg-indigo-600/10 border-indigo-500/80 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                        isEnabled
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isEnabled && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section D: Memory */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                Should your agent remember things?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Memory allows your agent to remember useful information from previous interactions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'none', title: 'No Memory', desc: 'Start fresh every time.' },
                { id: 'this_conversation', title: 'Remember This Conversation', desc: 'Remember information while working on the current task.' },
                { id: 'across_conversations', title: 'Remember Across Conversations', desc: 'Keep useful information so the agent can use it later.' }
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() =>
                    setSpec({
                      ...spec,
                      memory: {
                        ...spec.memory,
                        enabled: m.id !== 'none',
                        scope: m.id as MemoryScope
                      }
                    })
                  }
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    spec.memory.scope === m.id
                      ? 'bg-purple-600/10 border-purple-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200">{m.title}</span>
                    {spec.memory.scope === m.id && (
                      <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>

            {spec.memory.enabled && (
              <div className="pt-3 border-t border-slate-800">
                <label className="block text-[11px] font-semibold text-slate-400 mb-2">
                  Memory Optimization
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'basic', label: 'Basic', desc: 'Keep only the most important information.' },
                    { id: 'balanced', label: 'Balanced (Default)', desc: 'Automatically keep useful information while removing unnecessary context.' },
                    { id: 'advanced', label: 'Advanced', desc: 'Optimize memory using summarization and relevance-based retrieval.' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setSpec({
                          ...spec,
                          memory: { ...spec.memory, optimization: opt.id as MemoryOptimization }
                        })
                      }
                      className={`p-2.5 rounded-xl text-left border transition ${
                        spec.memory.optimization === opt.id
                          ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section E: Model Settings */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">AI Model</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => {
                  setIsCustomModel(false);
                  setSpec({ ...spec, model: { ...spec.model, provider: 'recommended', name: 'auto' } });
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  !isCustomModel
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200">Recommended</span>
                  {!isCustomModel && (
                    <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  We will automatically choose an appropriate model.
                </p>
              </div>

              <div
                onClick={() => setIsCustomModel(true)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  isCustomModel
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200">Custom Model</span>
                  {isCustomModel && (
                    <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Select a specific model and creativity parameters.
                </p>
              </div>
            </div>

            {isCustomModel && (
              <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Model</label>
                  <select
                    value={spec.model.name}
                    onChange={(e) =>
                      setSpec({ ...spec, model: { ...spec.model, provider: 'custom', name: e.target.value } })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="gpt-4o">GPT-4o (Fast & Powerful)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (Ultra Fast)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Creativity / Temperature: {spec.model.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={spec.model.temperature}
                    onChange={(e) =>
                      setSpec({
                        ...spec,
                        model: { ...spec.model, temperature: parseFloat(e.target.value) }
                      })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Max Response Tokens
                  </label>
                  <input
                    type="number"
                    value={spec.model.max_tokens}
                    onChange={(e) =>
                      setSpec({
                        ...spec,
                        model: { ...spec.model, max_tokens: parseInt(e.target.value) || 2048 }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section F: Output Format */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">How should your agent respond?</h3>
              <p className="text-xs text-slate-400 mt-0.5">Select the preferred format for answers.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'normal', label: 'Normal conversation' },
                { id: 'structured', label: 'Structured response' },
                { id: 'table', label: 'Table' },
                { id: 'report', label: 'Report' },
                { id: 'json', label: 'JSON' },
                { id: 'code', label: 'Code' },
                { id: 'custom', label: 'Custom' }
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() =>
                    setSpec({
                      ...spec,
                      output: { ...spec.output, format: fmt.id as OutputFormat }
                    })
                  }
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                    spec.output.format === fmt.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

            {spec.output.format === 'custom' && (
              <div className="pt-2 animate-fadeIn">
                <input
                  type="text"
                  value={spec.output.custom_instruction || ''}
                  onChange={(e) =>
                    setSpec({
                      ...spec,
                      output: { ...spec.output, custom_instruction: e.target.value }
                    })
                  }
                  placeholder="Describe your preferred response layout or tone..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Section G: Collapsible Advanced Settings */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 transition focus:outline-none"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                Advanced Settings (Optional for Power Users)
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="p-5 pt-0 space-y-4 border-t border-slate-800/60 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    System Instructions Prompt
                  </label>
                  <textarea
                    value={spec.advanced.system_prompt || ''}
                    onChange={(e) =>
                      setSpec({
                        ...spec,
                        advanced: { ...spec.advanced, system_prompt: e.target.value }
                      })
                    }
                    rows={3}
                    placeholder="Custom low-level system instructions for the LLM..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Context Window (Tokens)
                    </label>
                    <input
                      type="number"
                      value={spec.advanced.context_window || 8000}
                      onChange={(e) =>
                        setSpec({
                          ...spec,
                          advanced: { ...spec.advanced, context_window: parseInt(e.target.value) || 8000 }
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Tool Execution Timeout (Seconds)
                    </label>
                    <input
                      type="number"
                      value={spec.advanced.tool_timeout_seconds || 30}
                      onChange={(e) =>
                        setSpec({
                          ...spec,
                          advanced: {
                            ...spec.advanced,
                            tool_timeout_seconds: parseInt(e.target.value) || 30
                          }
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Retry Attempts on Error
                    </label>
                    <input
                      type="number"
                      value={spec.advanced.retry_attempts || 3}
                      onChange={(e) =>
                        setSpec({
                          ...spec,
                          advanced: { ...spec.advanced, retry_attempts: parseInt(e.target.value) || 3 }
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Modify Requirement
            </button>
            <button
              onClick={handleCreateAgent}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Agent...
                </>
              ) : (
                <>
                  Create & Launch Agent
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
