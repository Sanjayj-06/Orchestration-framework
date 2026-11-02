import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, Download, FlaskConical, Loader2, Pause, Play, RotateCcw, Sparkles, Workflow } from 'lucide-react';
import * as $3Dmol from '3dmol';
import { discoverMolecules, getMoleculeSdf, moleculeSvgUrl, type ChemistryMolecule, type ChemistryRunResult } from '../services/api';

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
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<$3Dmol.GLViewer | null>(null);
  const rotationTimer = useRef<number | null>(null);

  const loadViewer = async (molecule: ChemistryMolecule) => {
    if (!viewerRef.current) return;
    const sdf = await getMoleculeSdf(molecule.canonical_smiles);
    viewerRef.current.innerHTML = '';
    const viewer = $3Dmol.createViewer(viewerRef.current, { backgroundColor: '#0f172a' });
    viewer.addModel(sdf, 'sdf');
    viewer.setStyle({}, representation === 'sphere' ? { sphere: {} } : representation === 'stick' ? { stick: {} } : { stick: { radius: 0.18 }, sphere: { scale: 0.28 } });
    viewer.zoomTo();
    viewer.render();
    viewerInstance.current = viewer;
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
  }, [rotating, selected]);

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

  return (
    <div className="flex-1 overflow-auto bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/50 p-7">
          <div className="flex items-center gap-3 text-cyan-300 text-sm font-semibold uppercase tracking-widest">
            <FlaskConical className="w-5 h-5" /> Chemistry workspace
          </div>
          <h1 className="mt-3 text-3xl font-bold">Adaptive molecular discovery</h1>
          <p className="mt-2 max-w-3xl text-slate-300">Configure a natural-language objective, execute the reusable seven-agent chemistry pipeline, and inspect only structures validated by RDKit.</p>
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <input value={request} onChange={(event) => setRequest(event.target.value)} className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
            <button onClick={run} disabled={running} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-60">
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} {running ? 'Running pipeline' : 'Discover molecules'}
            </button>
          </div>
          {error && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/40 bg-rose-950/40 p-3 text-sm text-rose-200"><span>{error}</span>{error.includes('No provider key') && <button onClick={openSettings} className="rounded-lg bg-rose-200 px-3 py-1.5 font-semibold text-rose-950">Open Settings</button>}</div>}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300"><Workflow className="w-4 h-4" /> Default chemistry pipeline</div>
              <p className="mt-1 text-xs text-slate-400">Each agent receives the structured output of the previous agent.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${running ? 'bg-amber-400/15 text-amber-300' : result ? 'bg-emerald-400/15 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              {running ? 'Pipeline running' : result ? 'Pipeline completed' : 'Ready to run'}
            </span>
          </div>
          <div className="mt-5 grid gap-2 md:grid-cols-7">
            {pipelineAgents.map((agent, index) => {
              const completed = Boolean(result) || (running && index < activeAgentIndex);
              const active = running && index === activeAgentIndex;
              return (
                <React.Fragment key={agent}>
                  <div className={`rounded-xl border p-3 transition ${active ? 'border-cyan-400 bg-cyan-950/50 shadow-lg shadow-cyan-500/10' : completed ? 'border-emerald-400/40 bg-emerald-950/20' : 'border-slate-700 bg-slate-950/50'}`}>
                    <div className="flex items-center gap-2">
                      {completed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> : active ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-300" /> : <Circle className="h-4 w-4 shrink-0 text-slate-600" />}
                      <span className="text-[11px] font-semibold leading-tight text-slate-200">{agent}</span>
                    </div>
                    <div className={`mt-2 text-[10px] uppercase tracking-wider ${active ? 'text-cyan-300' : completed ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {active ? 'Running' : completed ? 'Completed' : 'Queued'}
                    </div>
                  </div>
                  {index < pipelineAgents.length - 1 && <div className="hidden items-center justify-center text-slate-600 md:flex">→</div>}
                </React.Fragment>
              );
            })}
          </div>
          {result && <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-950/20 p-3 text-xs text-emerald-200">Pipeline output: {result.final_molecules.length} ranked molecule{result.final_molecules.length === 1 ? '' : 's'} passed through validation and property analysis.</div>}
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
              ].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="text-xs text-slate-400">{label}</div><div className="mt-1 text-xl font-bold">{value}</div></div>)}
            </div>
            <div className="grid lg:grid-cols-[320px_1fr] gap-6">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Ranked candidates</h2>
                {result.final_molecules.map((molecule) => (
                  <button key={molecule.id} onClick={() => setSelected(molecule)} className={`w-full rounded-2xl border p-3 text-left transition ${selected?.id === molecule.id ? 'border-cyan-400 bg-cyan-950/40' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}>
                    <img src={moleculeSvgUrl(molecule.canonical_smiles)} alt={`2D structure for ${molecule.id}`} className="h-28 w-full rounded-xl bg-white object-contain" />
                    <div className="mt-3 flex items-center justify-between"><span className="font-semibold">{molecule.id}</span><span className="text-cyan-300">Rank {molecule.rank}</span></div>
                    <div className="mt-2 text-xs text-slate-400">MW {molecule.properties.molecular_weight} · QED {molecule.properties.qed}</div>
                  </button>
                ))}
              </div>
              {selected && (
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><h2 className="text-xl font-semibold">{selected.id} <span className="text-cyan-300 text-sm">Rank {selected.rank}</span></h2><p className="mt-1 text-xs text-slate-400 break-all">{selected.canonical_smiles}</p></div>
                    <div className="flex gap-2"><button onClick={() => setRotating((value) => !value)} className="rounded-lg border border-slate-700 p-2" title="Play or pause rotation">{rotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button><button onClick={() => viewerInstance.current?.zoomTo()} className="rounded-lg border border-slate-700 p-2" title="Reset camera"><RotateCcw className="w-4 h-4" /></button><button onClick={downloadSdf} className="rounded-lg border border-slate-700 p-2" title="Download SDF"><Download className="w-4 h-4" /></button></div>
                  </div>
                  <div className="mt-5 grid md:grid-cols-2 gap-4">
                    <div><img src={moleculeSvgUrl(selected.canonical_smiles)} alt={`2D structure for ${selected.id}`} className="h-72 w-full rounded-2xl bg-white object-contain" /><div className="mt-3 grid grid-cols-3 gap-2 text-xs">{Object.entries({ MW: selected.properties.molecular_weight, LogP: selected.properties.logp, TPSA: selected.properties.tpsa, HBD: selected.properties.hbd, HBA: selected.properties.hba, QED: selected.properties.qed }).map(([label, value]) => <div key={label} className="rounded-lg bg-slate-800 p-2"><div className="text-slate-400">{label}</div><div className="font-semibold">{value}</div></div>)}</div></div>
                    <div><div ref={viewerRef} className="h-72 w-full rounded-2xl overflow-hidden" /><select value={representation} onChange={(event) => setRepresentation(event.target.value as typeof representation)} className="mt-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"><option value="ball-stick">Ball and stick</option><option value="stick">Stick</option><option value="sphere">Space filling</option></select><p className="mt-3 text-xs text-slate-400">{selected.selection_reason} 2D and 3D coordinates are generated from the validated canonical SMILES.</p></div>
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
