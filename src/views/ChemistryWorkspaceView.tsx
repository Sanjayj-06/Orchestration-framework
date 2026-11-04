import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, Download, FlaskConical, Loader2, Pause, Play, RotateCcw, Sparkles, Workflow, Copy, Maximize2 } from 'lucide-react';
import * as $3Dmol from '3dmol';
import { discoverMolecules, getChemistryDemoRun, getMoleculeSdf, moleculeSvgUrl, type ChemistryMolecule, type ChemistryRunResult } from '../services/api';

const defaultRequest = 'Generate 5 drug-like molecules with molecular weight below 400 Da and good aqueous solubility.';
const pipelineAgents = [
  'Chemistry Requirement Analyst',
  'Molecular Research & Memory Agent',
  'Molecule Generation Agent',
  'Chemical Structure Validation Agent',
  'Molecular Property Analysis Agent',
  'Molecular Evaluation & Ranking Agent',
  'Molecular Discovery Report Agent'
];

export const ChemistryWorkspaceView: React.FC = () => {
  const [request, setRequest] = useState(defaultRequest);
  const [result, setResult] = useState<ChemistryRunResult | null>(null);
  const [selected, setSelected] = useState<ChemistryMolecule | null>(null);
  const [running, setRunning] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [rotating, setRotating] = useState(true);
  const [representation, setRepresentation] = useState<'stick' | 'sphere' | 'ball-stick'>('ball-stick');
  const [viewerReady, setViewerReady] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<$3Dmol.GLViewer | null>(null);
  const rotationTimer = useRef<number | null>(null);

  const loadViewer = async (molecule: ChemistryMolecule) => {
    if (!viewerRef.current) return;
    setViewerReady(false);
    const sdf = await getMoleculeSdf(molecule.canonical_smiles);
    viewerRef.current.innerHTML = '';
    const viewer = $3Dmol.createViewer(viewerRef.current, { backgroundColor: '#f8fafc' });
    viewer.addModel(sdf, 'sdf');
    viewer.setStyle({}, representation === 'sphere' ? { sphere: {} } : representation === 'stick' ? { stick: {} } : { stick: { radius: 0.18 }, sphere: { scale: 0.28 } });
    viewer.zoomTo();
    viewer.render();
    viewerInstance.current = viewer;
    setViewerReady(true);
  };

  useEffect(() => {
    if (!selected) return;
    loadViewer(selected).catch((viewerError: Error) => setError(viewerError.message));
    return () => {
      if (viewerInstance.current) viewerInstance.current.clear();
    };
  }, [selected, representation]);

  useEffect(() => {
    if (rotationTimer.current) window.clearInterval(rotationTimer.current);
    if (rotating && viewerInstance.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rotationTimer.current = window.setInterval(() => {
        viewerInstance.current?.rotate(1, 'y');
        viewerInstance.current?.render();
      }, 50);
    }
    return () => {
      if (rotationTimer.current) window.clearInterval(rotationTimer.current);
    };
  }, [rotating, selected, viewerReady]);

  const run = async () => {
    if (!request.trim()) return;
    setRunning(true);
    setActiveAgentIndex(0);
    setError(null);
    setResult(null);
    try {
      const next = await discoverMolecules(request.trim());
      setResult(next);
      setSelected(next.final_molecules[0] || null);
      setActiveAgentIndex(pipelineAgents.length);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'Chemistry workflow failed.');
    } finally {
      setRunning(false);
    }
  };

  const loadDemo = async () => {
    setRunning(true);
    setError(null);
    try {
      const demo = await getChemistryDemoRun();
      setResult(demo);
      setSelected(demo.final_molecules[0] || null);
      setActiveAgentIndex(pipelineAgents.length);
    } catch (demoError) {
      setError(demoError instanceof Error ? demoError.message : 'No completed chemistry preview is available.');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setActiveAgentIndex((current) => Math.min(current + 1, pipelineAgents.length - 1));
    }, 1400);
    return () => window.clearInterval(timer);
  }, [running]);

  const openSettings = () => {
    window.dispatchEvent(new CustomEvent('agentcraft:navigate', { detail: 'settings' }));
  };

  const downloadSdf = async () => {
    if (!selected) return;
    const sdf = await getMoleculeSdf(selected.canonical_smiles);
    const url = URL.createObjectURL(new Blob([sdf], { type: 'chemical/x-mdl-sdfile' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selected.id}.sdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copySmiles = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.canonical_smiles);
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1500px] space-y-6 p-6 lg:p-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-7 py-6">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
            <FlaskConical className="w-5 h-5" /> Chemistry workspace
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Adaptive molecular discovery</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Turn a research question into validated, ranked molecular candidates with a transparent seven-agent workflow.</p>
          </div>
          <div className="flex flex-col gap-3 px-7 py-5 md:flex-row">
            <input aria-label="Chemistry discovery request" value={request} onChange={(event) => setRequest(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10" />
            <button onClick={run} disabled={running} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} {running ? 'Running pipeline' : 'Discover molecules'}
            </button>
            <button onClick={loadDemo} disabled={running} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
              <Play className="w-4 h-4" /> Load last result
            </button>
          </div>
          {error && <div className="mx-7 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><span>{error}</span>{error.includes('No provider key') && <button onClick={openSettings} className="rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-white">Open Settings</button>}</div>}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Workflow className="w-4 h-4 text-cyan-600" /> Default chemistry pipeline</div>
              <p className="mt-1 text-xs text-slate-500">Each agent receives the structured output of the previous agent.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${running ? 'bg-amber-50 text-amber-700' : result ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {running ? 'Pipeline running' : result ? 'Pipeline completed' : 'Ready to run'}
            </span>
          </div>
          <div className="mt-5 grid gap-2 md:grid-cols-7">
            {pipelineAgents.map((agent, index) => {
              const completed = Boolean(result) || (running && index < activeAgentIndex);
              const active = running && index === activeAgentIndex;
              return (
                <React.Fragment key={agent}>
                  <div className={`rounded-xl border p-3 transition ${active ? 'border-cyan-400 bg-cyan-50 shadow-md shadow-cyan-500/10' : completed ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      {completed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> : active ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-300" /> : <Circle className="h-4 w-4 shrink-0 text-slate-600" />}
                      <span className="text-[11px] font-semibold leading-tight text-slate-700">{agent}</span>
                    </div>
                    <div className={`mt-2 text-[10px] uppercase tracking-wider ${active ? 'text-cyan-700' : completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {active ? 'Running' : completed ? 'Completed' : 'Queued'}
                    </div>
                  </div>
                  {index < pipelineAgents.length - 1 && <div className="hidden items-center justify-center text-slate-600 md:flex">→</div>}
                </React.Fragment>
              );
            })}
          </div>
          {result && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">Pipeline output: {result.final_molecules.length} ranked molecule{result.final_molecules.length === 1 ? '' : 's'} passed through validation and property analysis.</div>}
        </div>

        {result && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                ['Generated', result.summary.generated],
                ['RDKit valid', result.summary.valid],
                ['Selected', result.summary.selected],
                ['Rejected', result.summary.rejected],
                ['Duration', `${result.summary.duration_ms} ms`]
              ].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-xl font-bold text-slate-900">{value}</div></div>)}
            </div>
            <div className="grid lg:grid-cols-[320px_1fr] gap-6">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Ranked candidates</h2>
                {result.final_molecules.map((molecule) => (
                  <button key={molecule.id} onClick={() => setSelected(molecule)} className={`w-full rounded-2xl border p-3 text-left transition ${selected?.id === molecule.id ? 'border-cyan-400 bg-cyan-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}`}>
                    <img src={moleculeSvgUrl(molecule.canonical_smiles)} alt={`2D structure for ${molecule.id}`} className="h-28 w-full rounded-xl bg-white object-contain" />
                    <div className="mt-3 flex items-start justify-between gap-3"><span className="font-semibold text-slate-800">{molecule.name || 'Unnamed candidate'}</span><span className="shrink-0 text-cyan-700">Rank {molecule.rank}</span></div>
                    <div className="mt-1 text-[11px] text-slate-400">{molecule.id}</div>
                    <div className="mt-2 text-xs text-slate-500">MW {molecule.properties.molecular_weight} · QED {molecule.properties.qed}</div>
                  </button>
                ))}
              </div>
              {selected && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><h2 className="text-xl font-semibold text-slate-900">{selected.name || 'Unnamed candidate'} <span className="text-cyan-700 text-sm">Rank {selected.rank}</span></h2><p className="mt-1 text-xs text-slate-400">{selected.id}</p><p className="mt-1 text-xs text-slate-500 break-all">{selected.canonical_smiles}</p></div>
                    <div className="flex gap-2"><button onClick={copySmiles} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Copy canonical SMILES"><Copy className="w-4 h-4" /></button><button onClick={() => setRotating((value) => !value)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Play or pause rotation">{rotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button><button onClick={() => viewerInstance.current?.zoomTo()} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Reset camera"><RotateCcw className="w-4 h-4" /></button><button onClick={downloadSdf} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Download SDF"><Download className="w-4 h-4" /></button></div>
                  </div>
                  <div className="mt-5 grid md:grid-cols-2 gap-4">
                    <div><div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">2D structure</div><img src={moleculeSvgUrl(selected.canonical_smiles)} alt={`2D structure for ${selected.id}`} className="h-72 w-full rounded-2xl border border-slate-200 bg-white object-contain" /><div className="mt-3 grid grid-cols-3 gap-2 text-xs">{Object.entries({ MW: selected.properties.molecular_weight, LogP: selected.properties.logp, TPSA: selected.properties.tpsa, HBD: selected.properties.hbd, HBA: selected.properties.hba, QED: selected.properties.qed }).map(([label, value]) => <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-2"><div className="text-slate-500">{label}</div><div className="font-semibold text-slate-800">{value}</div></div>)}</div></div>
                    <div><div className="mb-2 flex items-center justify-between"><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Interactive 3D view</div><span className="text-[11px] text-slate-400">{rotating ? 'Auto-rotating' : 'Manual control'}</span></div><div ref={viewerRef} className="chemistry-viewer relative isolate h-72 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50" /><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><select value={representation} onChange={(event) => setRepresentation(event.target.value as typeof representation)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><option value="ball-stick">Ball and stick</option><option value="stick">Stick</option><option value="sphere">Space filling</option></select><span className="inline-flex items-center gap-1 text-xs text-slate-400"><Maximize2 className="h-3 w-3" /> Drag to rotate · scroll to zoom</span></div><p className="mt-3 text-xs leading-5 text-slate-500">{selected.selection_reason} 2D and 3D coordinates are generated from the validated canonical SMILES.</p></div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
