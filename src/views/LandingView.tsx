import React from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Code2,
  BarChart3,
  Headphones,
  FileText,
  PenTool,
  Clock,
  Layers,
  Download,
  PlayCircle
} from 'lucide-react';

interface LandingViewProps {
  onCreateAgent: (prefillPrompt?: string, prefillName?: string) => void;
  onExploreLibrary: () => void;
}

const TEMPLATE_EXAMPLES = [
  {
    title: 'Research Assistant',
    badge: 'Academic & Papers',
    desc: 'Finds, reads, and analyzes research papers, summarizes methodologies, and spots critical research gaps.',
    prompt: 'I want an assistant that can read research papers, summarize them and identify possible research gaps.',
    icon: BookOpen,
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30'
  },
  {
    title: 'Coding Assistant',
    badge: 'Software Engineering',
    desc: 'Full-stack programming companion that writes clean code, debugs runtime issues, and architects scalable solutions.',
    prompt: 'Help developers solve programming problems, debug runtime errors, and write clean Python & TypeScript code.',
    icon: Code2,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    title: 'Data Analysis Assistant',
    badge: 'Quantitative Insights',
    desc: 'Inspects CSVs & Excel spreadsheets, computes descriptive statistics, and surfaces actionable trends in tables.',
    prompt: 'Help me analyze Excel and CSV files, calculate key metrics, and generate clear insights.',
    icon: BarChart3,
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
  },
  {
    title: 'Customer Support Assistant',
    badge: 'Customer Success',
    desc: 'Resolves user tickets with empathy, retrieves knowledge-base solutions, and troubleshoots account issues.',
    prompt: 'Answer customer support inquiries politely, troubleshoot common problems, and escalate complex issues.',
    icon: Headphones,
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
  },
  {
    title: 'Document Analyzer',
    badge: 'Legal & Contracts',
    desc: 'Reads dense contracts, agreements, and PDFs to extract key clauses, obligations, dates, and risks.',
    prompt: 'Review legal documents and contracts, extract key clauses, and highlight risks and obligations.',
    icon: FileText,
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30'
  },
  {
    title: 'Content Writer',
    badge: 'Marketing & Copy',
    desc: 'Crafts audience-tailored articles, newsletters, hooks, and social media posts optimized for engagement.',
    prompt: 'Write engaging blog articles, newsletter sequences, and social media copy with catchy hooks.',
    icon: PenTool,
    color: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30'
  },
  {
    title: 'Personal Productivity Assistant',
    badge: 'Time Management',
    desc: 'Deconstructs goals into daily priorities, organizes schedules, and automates daily task checklists.',
    prompt: 'Organize my daily task backlog, plan time-blocked schedules, and keep me focused on core priorities.',
    icon: Clock,
    color: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30'
  },
  {
    title: 'Custom AI Assistant',
    badge: 'Any Workflow',
    desc: 'Build an assistant for any specialized domain: finance, healthcare, recruiting, operations, or personal hobbies.',
    prompt: 'Create an assistant tailored to my unique workflow and business requirements.',
    icon: Layers,
    color: 'from-indigo-500/20 to-sky-500/20 text-indigo-400 border-indigo-500/30'
  }
];

export const LandingView: React.FC<LandingViewProps> = ({
  onCreateAgent,
  onExploreLibrary
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-start pb-24 overflow-y-auto custom-scrollbar">
      {/* Hero Section */}
      <section className="w-full max-w-5xl px-6 pt-16 pb-12 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-wide mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          The No-Code AI Agent Studio
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight max-w-4xl">
          Build Your AI Agent <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            Without Coding
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-5 text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Describe what you want your AI assistant to do. We'll handle the technical setup.
          No prompts, memory graphs, or vector databases to configure.
        </p>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => onCreateAgent()}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:scale-95"
          >
            Create Your First Agent
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreLibrary}
            className="flex items-center gap-2 px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-xl text-sm font-medium transition hover:border-slate-600"
          >
            Browse Starter Library
          </button>
        </div>

        {/* Product Philosophy Pill */}
        <div className="mt-12 py-3 px-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-slate-400 shadow-inner">
          <span className="font-semibold text-slate-300">Simple 6-Step Flow:</span>
          <span className="text-indigo-400 font-medium">Describe</span>
          <span className="text-slate-600">→</span>
          <span className="text-indigo-400 font-medium">Configure</span>
          <span className="text-slate-600">→</span>
          <span className="text-indigo-400 font-medium">Create</span>
          <span className="text-slate-600">→</span>
          <span className="text-indigo-400 font-medium">Test</span>
          <span className="text-slate-600">→</span>
          <span className="text-indigo-400 font-medium">Save</span>
          <span className="text-slate-600">→</span>
          <span className="text-indigo-400 font-medium">Download Code</span>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="w-full max-w-5xl px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Zero Technical Knowledge</h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Just speak plain English. The AI synthesizer auto-detects tools, behaviors, and memory requirements for you.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3.5">
            <PlayCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Instant Live Test Dashboard</h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Chat with your created agent immediately. Inspect step-by-step tool actions, web searches, and memory states.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3.5">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Export Standalone Python Code</h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Download your agent as a self-contained Python project with full source code, tools, memory, and README.
          </p>
        </div>
      </section>

      {/* Secondary Section: "What can you build?" */}
      <section className="w-full max-w-5xl px-6 pt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
            What can you build?
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-400">
            Pick a starter template below or click to prefill your custom agent creation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATE_EXAMPLES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${item.color} border flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <button
                    onClick={() => onCreateAgent(item.prompt, item.title)}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition flex items-center justify-center gap-1.5"
                  >
                    Build This Agent
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Multi-Agent Architectural Teaser */}
      <section className="w-full max-w-5xl px-6 pt-14">
        <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 text-center relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            Multi-Agent Architecture Ready
          </span>

          <h3 className="mt-4 text-xl md:text-2xl font-bold text-slate-100">
            Chain Multiple Agents Into Intelligent Workflows
          </h3>

          <p className="mt-2 text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Every agent you build is a reusable modular component. Connect Planner Agents to Research Agents to Data Analysts and Writers seamlessly.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 sm:gap-3 py-2 px-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-mono text-slate-300">
            <span className="text-indigo-400 font-semibold">Planner Agent</span>
            <span className="text-slate-500">→</span>
            <span className="text-purple-400 font-semibold">Research Agent</span>
            <span className="text-slate-500">→</span>
            <span className="text-emerald-400 font-semibold">Data Analyst</span>
            <span className="text-slate-500">→</span>
            <span className="text-pink-400 font-semibold">Writer Agent</span>
          </div>
        </div>
      </section>
    </div>
  );
};
