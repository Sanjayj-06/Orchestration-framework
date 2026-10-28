import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type Node
} from '@xyflow/react';

import { Sidebar } from '../components/Sidebar';
import { NodeInspector } from '../components/NodeInspector';
import { AgentNode, StartNode, OutputNode } from '../components/nodes/AgentNode';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import type { Agent } from '../types/agent';
import { chatWithAgent } from '../services/api';
import { Play, Save, CheckCircle2, AlertCircle, Bot, X, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { UNIVERSAL_FORMATTING_DIRECTIVE, generateDomainAwareMockReport } from '../constants/formatting';

interface BuildPipelineViewProps {
  agents?: Agent[];
}

const BuildPipelineContent: React.FC<BuildPipelineViewProps> = ({ agents = [] }) => {
  const [pipelineName, setPipelineName] = useState('Untitled Pipeline');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const [isDraggingOverCanvas, setIsDraggingOverCanvas] = useState(false);
  
  // Execution state
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [runInput, setRunInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [executionMode, setExecutionMode] = useState<'LOCAL_MOCK' | 'AI_RUNTIME'>('LOCAL_MOCK');
  
  type StepExecutionData = {
    id: string;
    name: string;
    status: string;
    input?: string;
    output?: string;
    duration?: number;
    isExpanded?: boolean;
    inputKeys?: string[];
    agentId?: string;
  };
  const [executionSteps, setExecutionSteps] = useState<StepExecutionData[]>([]);

  const toggleStepExpand = (stepId: string) => {
    setExecutionSteps(prev => prev.map(s => s.id === stepId ? { ...s, isExpanded: !s.isExpanded } : s));
  };

  const { screenToFlowPosition, deleteElements } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      agentNode: AgentNode,
      startNode: StartNode,
      outputNode: OutputNode
    }),
    []
  );

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } } as Edge, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (!isDraggingOverCanvas) setIsDraggingOverCanvas(true);
  }, [isDraggingOverCanvas]);

  const onDragLeave = useCallback(() => {
    setIsDraggingOverCanvas(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDraggingOverCanvas(false);

      const dataString = event.dataTransfer.getData('application/reactflow');
      if (!dataString) return;

      try {
        const { type, data } = JSON.parse(dataString);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });

        const id = `node_${Date.now()}`;
        let defaultData = { ...data, status: 'idle' };
        if (type === 'startNode') {
          defaultData.inputContract = {
            name: 'Research Topic',
            type: 'text',
            required: true,
            description: '',
            example: ''
          };
        }

        const newNode: Node = {
          id,
          type,
          position,
          data: defaultData
        };

        setNodes((nds) => [...nds, newNode]);
        setSelectedNodeId(id);
      } catch (err) {
        console.error('Failed to parse dropped node data:', err);
      }
    },
    [screenToFlowPosition, setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      deleteElements({ nodes: [{ id: nodeId }] });
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [deleteElements, selectedNodeId]
  );

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n));
  }, [setNodes]);

  const handleSave = () => {
    // In a real app, this would save to the backend.
    alert('Pipeline saved successfully!');
  };

  const handleRunClick = () => {
    // Validate pipeline
    if (nodes.length === 0) {
      alert('Cannot run an empty pipeline.');
      return;
    }
    
    const startNode = nodes.find(n => n.type === 'startNode');
    if (!startNode) {
      alert('Pipeline needs a "User Input" start node.');
      return;
    }

    setRunInput((startNode.data.inputContract as any)?.example || '');
    setIsRunModalOpen(true);
    setExecutionResult(null);
  };

  const executePipeline = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionSteps([]);
    
    const startNode = nodes.find(n => n.type === 'startNode');
    if (!startNode) {
      alert("Pipeline needs a User Input start node.");
      setIsExecuting(false);
      return;
    }

    // reset all statuses to idle
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));

    const executionContext: {
      originalInput: string;
      nodeResults: Record<string, { output: string; name: string }>;
    } = {
      originalInput: runInput,
      nodeResults: {}
    };

    let currentNode: Node | null = startNode;
    let currentSteps: StepExecutionData[] = [];

    while (currentNode) {
      const nodeId: string = currentNode.id;
      const nodeName = currentNode.type === 'startNode' ? 'User Input' 
        : currentNode.type === 'outputNode' ? 'Final Output' 
        : (currentNode.data.agent as Agent)?.name || 'Agent';
        
      const agent = currentNode.type === 'agentNode' ? currentNode.data.agent as Agent : null;

      let stepInputString = "";
      let inputObj: any = {};
      let inputKeys: string[] = [];

      if (currentNode.type === 'startNode') {
        stepInputString = executionContext.originalInput;
      } else if (currentNode.type === 'outputNode') {
        // Output node takes the last agent's output
        const lastNodeId = Object.keys(executionContext.nodeResults).pop();
        stepInputString = lastNodeId ? executionContext.nodeResults[lastNodeId].output : "";
      } else if (agent) {
        const lowerName = agent.name.toLowerCase();
        const outEdge = edges.find(e => e.source === nodeId);
        const targetNode = outEdge ? nodes.find(n => n.id === outEdge.target) : null;
        const isNextNodeFinalOutput = targetNode?.type === 'outputNode';
        const isReportOrFormatting = lowerName.includes("report") || lowerName.includes("format") || lowerName.includes("synthesiz") || agent.specification.output?.format === 'report' || isNextNodeFinalOutput;

        inputObj.originalQuestion = executionContext.originalInput;
        inputKeys.push("originalQuestion");

        if (lowerName.includes("fact")) {
          const resNodeId = Object.keys(executionContext.nodeResults).find(k => executionContext.nodeResults[k].name.toLowerCase().includes("research"));
          if (resNodeId) {
            inputObj.researchFindings = executionContext.nodeResults[resNodeId].output;
            inputKeys.push("researchFindings");
          }
        } else if (lowerName.includes("compar")) {
          const factNodeId = Object.keys(executionContext.nodeResults).find(k => executionContext.nodeResults[k].name.toLowerCase().includes("fact"));
          if (factNodeId) {
             inputObj.verifiedFindings = executionContext.nodeResults[factNodeId].output;
             inputKeys.push("verifiedFindings");
          }
        } else if (lowerName.includes("summary")) {
          const compNodeId = Object.keys(executionContext.nodeResults).find(k => executionContext.nodeResults[k].name.toLowerCase().includes("compar"));
          if (compNodeId) {
             inputObj.comparison = executionContext.nodeResults[compNodeId].output;
             inputKeys.push("comparison");
          }
        } else if (isReportOrFormatting) {
          // Accumulate all upstream findings into the synthesizer
          const resNodeId = Object.keys(executionContext.nodeResults).find(k => executionContext.nodeResults[k].name.toLowerCase().includes("research"));
          if (resNodeId) { inputObj.researchFindings = executionContext.nodeResults[resNodeId].output; inputKeys.push("researchFindings"); }
          
          const factNodeId = Object.keys(executionContext.nodeResults).find(k => executionContext.nodeResults[k].name.toLowerCase().includes("fact"));
          if (factNodeId) { inputObj.verifiedFindings = executionContext.nodeResults[factNodeId].output; inputKeys.push("verifiedFindings"); }
          
          const compNodeId = Object.keys(executionContext.nodeResults).find(k => executionContext.nodeResults[k].name.toLowerCase().includes("compar"));
          if (compNodeId) { inputObj.comparison = executionContext.nodeResults[compNodeId].output; inputKeys.push("comparison"); }
          
          const sumNodeId = Object.keys(executionContext.nodeResults).find(k => executionContext.nodeResults[k].name.toLowerCase().includes("summary"));
          if (sumNodeId) { inputObj.summary = executionContext.nodeResults[sumNodeId].output; inputKeys.push("summary"); }

          const prevNodeId = Object.keys(executionContext.nodeResults).pop();
          if (prevNodeId && !inputObj.summary && !inputObj.comparison && !inputObj.researchFindings) {
            inputObj.upstreamOutput = executionContext.nodeResults[prevNodeId].output;
            inputKeys.push("upstreamOutput");
          }

          // Inject universal formatting guideline into synthesis prompt
          inputObj.formattingDirective = UNIVERSAL_FORMATTING_DIRECTIVE;
          inputKeys.push("formattingDirective");
        } else if (!lowerName.includes("research")) {
           const prevNodeId = Object.keys(executionContext.nodeResults).pop();
           if (prevNodeId) {
             inputObj.previousOutput = executionContext.nodeResults[prevNodeId].output;
             inputKeys.push("previousOutput");
           }
        }
        stepInputString = JSON.stringify(inputObj, null, 2);
      }

      // Recursion Detection
      let possibleRecursion = false;
      for (const key in executionContext.nodeResults) {
        const pastOut = executionContext.nodeResults[key].output;
        if (pastOut && pastOut.length > 30) {
          const count = stepInputString.split(pastOut).length - 1;
          if (count > 2) {
            possibleRecursion = true;
            break;
          }
        }
      }

      if (possibleRecursion) {
        setExecutionResult(`Pipeline stopped: possible recursive context detected at node ${nodeName}.`);
        setIsExecuting(false);
        break;
      }
      
      const newStep: StepExecutionData = { 
        id: nodeId, 
        name: nodeName, 
        status: 'running', 
        input: stepInputString, 
        isExpanded: false,
        inputKeys,
        agentId: agent?.id
      };
      currentSteps.push(newStep);
      setExecutionSteps([...currentSteps]);
      
      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' } } : n));
      
      const startTime = Date.now();
      let nodeOutput = stepInputString;

      if (agent) {
        const outEdge = edges.find(e => e.source === nodeId);
        const targetNode = outEdge ? nodes.find(n => n.id === outEdge.target) : null;
        const isNextNodeFinalOutput = targetNode?.type === 'outputNode';
        const isReportOrFormatting = agent.name.toLowerCase().includes("report") || agent.name.toLowerCase().includes("format") || agent.name.toLowerCase().includes("synthesiz") || agent.specification.output?.format === 'report' || isNextNodeFinalOutput;

        if (executionMode === 'AI_RUNTIME') {
          try {
            const response = await chatWithAgent(agent.id, stepInputString);
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            const providerStr = agent.specification.model.provider === 'recommended' ? 'Auto (Configured Provider)' : agent.specification.model.provider;
            
            nodeOutput = `[Execution Mode: AI Runtime]
[Provider: ${providerStr}]
[Model: ${agent.specification.model.name}]
[Status: Completed in ${duration}s]

${response.response}`;
          } catch (err: any) {
            const errMsg = err.response?.data?.detail || err.message || 'Unknown error';
            nodeOutput = `[ERROR] AI Runtime Execution failed:\n${errMsg}`;
            
            // Record failure in context, update UI, and abort pipeline
            executionContext.nodeResults[nodeId] = { output: nodeOutput, name: nodeName };
            setExecutionResult(`Pipeline stopped due to AI Runtime error at node ${nodeName}.\n\nError:\n${errMsg}`);
            setIsExecuting(false);
            
            // Mark step as failed
            const duration = (Date.now() - startTime) / 1000;
            currentSteps = currentSteps.map(s => s.id === nodeId ? { ...s, status: 'failed', output: nodeOutput, duration } : s);
            setExecutionSteps([...currentSteps]);
            setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'error' } } : n));
            
            break;
          }
        } else {
          // Local Mock Execution Mode
          await new Promise(r => setTimeout(r, 1000));
          const purpose = agent.purpose || "general tasks";
          const lowerName = agent.name.toLowerCase();
          
          let mockContent = "";
          if (isReportOrFormatting || lowerName.includes("report")) {
            mockContent = generateDomainAwareMockReport(executionContext.originalInput);
          } else if (lowerName.includes("research")) {
            mockContent = `[LOCAL MOCK]\nResearch findings generated for:\n${inputObj.originalQuestion || ''}`;
          } else if (lowerName.includes("fact")) {
            mockContent = `[LOCAL MOCK]\nFact-check result generated from:\n${inputObj.researchFindings ? inputObj.researchFindings.substring(0, 50) + '...' : ''}`;
          } else if (lowerName.includes("compar")) {
            mockContent = `[LOCAL MOCK]\nComparison generated from:\n${inputObj.verifiedFindings ? inputObj.verifiedFindings.substring(0, 50) + '...' : ''}`;
          } else if (lowerName.includes("summary")) {
            mockContent = `[LOCAL MOCK]\nSummary generated from:\n${inputObj.comparison ? inputObj.comparison.substring(0, 50) + '...' : ''}`;
          } else {
            mockContent = `[LOCAL MOCK]\nProcessed based on purpose:\n${purpose}`;
          }
          nodeOutput = mockContent;
        }
        
        executionContext.nodeResults[nodeId] = {
          output: nodeOutput,
          name: nodeName
        };
      } else {
         await new Promise(r => setTimeout(r, 800)); 
      }

      const duration = (Date.now() - startTime) / 1000;
      
      currentSteps = currentSteps.map(s => s.id === nodeId ? { ...s, status: 'success', output: nodeOutput, duration } : s);
      setExecutionSteps([...currentSteps]);
      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'success', output: nodeOutput } } : n));

      if (currentNode.type === 'outputNode') {
        const cleanOutput = nodeOutput.replace(/^\[Execution Mode:[\s\S]*?\n\n/, '');
        setExecutionResult(cleanOutput || nodeOutput);
        setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'success', output: cleanOutput || nodeOutput } } : n));
        break;
      }

      const outEdge: Edge | undefined = edges.find(e => e.source === nodeId);
      if (!outEdge) {
        setExecutionResult(`Pipeline Execution Stopped (No further connections).\n\nLast Output:\n${nodeOutput}`);
        break;
      }

      currentNode = nodes.find(n => n.id === outEdge.target) || null;
    }
    
    setIsExecuting(false);
  };

  const resetExecution = () => {
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));
    setIsRunModalOpen(false);
    setRunInput('');
    setExecutionResult(null);
    setExecutionSteps([]);
  };

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-30 relative">
        <div className="flex flex-col justify-center">
           <div className="flex items-center gap-2">
             <h1 className="text-lg font-bold text-slate-900 tracking-tight">Build Pipeline</h1>
             <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">
               Low-Code
             </span>
           </div>
           <p className="text-xs text-slate-500">Compose your existing AI agents into reusable workflows.</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Pipeline Name</span>
             <span className="text-sm font-bold text-slate-800">{pipelineName}</span>
           </div>

           <div className="h-8 w-px bg-slate-200 mx-2"></div>

           <button 
             onClick={handleSave}
             className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 shadow-sm transition active:scale-95"
           >
             <Save className="w-4 h-4 text-slate-500" />
             Save
           </button>
           
           <button 
             onClick={handleRunClick}
             className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition active:scale-95"
           >
             <Play className="w-4 h-4 fill-current" />
             Run Pipeline
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar agents={agents} />

        <div
          className={`flex-1 h-full relative transition-colors ${
            isDraggingOverCanvas ? 'bg-blue-50' : ''
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 opacity-70">
              <div className="w-16 h-16 bg-white border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Bot className="w-8 h-8 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">Build your first agent workflow</h2>
              <p className="text-sm text-slate-500 max-w-sm text-center">
                Drag <b>User Input</b>, some <b>Agents</b>, and <b>Final Output</b> from the left sidebar here to get started.
              </p>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="custom-scrollbar"
            minZoom={0.2}
            maxZoom={1.5}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#94a3b8', strokeWidth: 2 }
            }}
          >
            <Background color="#cbd5e1" gap={24} size={1.5} variant={BackgroundVariant.Dots} />
            <Controls className="bg-white border-slate-200 fill-slate-600 shadow-sm rounded-lg overflow-hidden m-4" />
            <MiniMap
              className="rounded-lg shadow-sm border border-slate-200 overflow-hidden m-4"
              nodeColor={(n) => {
                if (n.type === 'agentNode') return '#3b82f6';
                if (n.type === 'startNode') return '#10b981';
                if (n.type === 'outputNode') return '#6366f1';
                return '#cbd5e1';
              }}
              maskColor="rgba(248, 250, 252, 0.8)"
            />
          </ReactFlow>

          {isDraggingOverCanvas && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50/50 pointer-events-none flex items-center justify-center z-20">
              <span className="text-sm font-bold text-blue-700 bg-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-500" />
                Drop to Add to Pipeline
              </span>
            </div>
          )}
        </div>

        <NodeInspector
          selectedNode={selectedNode}
          pipelineName={pipelineName}
          setPipelineName={setPipelineName}
          nodesCount={nodes.length}
          edgesCount={edges.length}
          onClose={() => setSelectedNodeId(null)}
          onDeleteNode={handleDeleteNode}
          updateNodeData={updateNodeData}
        />
      </div>

      {/* Run Modal Overlay */}
      {isRunModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Run Pipeline</h3>
                  <p className="text-xs text-slate-500">{pipelineName}</p>
                </div>
              </div>
              {!isExecuting && (
                <button onClick={resetExecution} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {!isExecuting && !executionResult && executionSteps.length === 0 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Execution Mode
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExecutionMode('LOCAL_MOCK')}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                          executionMode === 'LOCAL_MOCK' 
                            ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm' 
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-sm">Local Mock</div>
                        <div className="text-[10px] opacity-80">Safe, fast, simulated data</div>
                      </button>
                      <button
                        onClick={() => setExecutionMode('AI_RUNTIME')}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                          executionMode === 'AI_RUNTIME' 
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm' 
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-sm">AI Runtime</div>
                        <div className="text-[10px] opacity-80">Live execution with real LLMs</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-700">
                      Initial Input
                    </label>
                    <textarea
                      rows={4}
                      value={runInput}
                      onChange={(e) => setRunInput(e.target.value)}
                      placeholder="Enter the starting input for this pipeline..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Execution Mode Badge */}
                  <div className="flex justify-center mb-6">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                      executionMode === 'LOCAL_MOCK' 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      Execution Mode: {executionMode === 'LOCAL_MOCK' ? 'LOCAL MOCK • NO REAL AI / WEB SEARCH' : 'AI RUNTIME'}
                    </div>
                  </div>

                  {/* Execution Steps */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Execution Log</h4>
                    <div className="space-y-3 relative">
                      {/* Vertical connector line */}
                      <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>
                      
                      {executionSteps.map((step, i) => {
                        return (
                          <div key={`${step.id}-${i}`} className="flex flex-col relative z-10 w-full mb-3">
                            <div className="flex items-center gap-4">
                              <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 z-10">
                                 {step.status === 'success' ? <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> : 
                                  step.status === 'running' ? <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div> :
                                  step.status === 'failed' ? <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> :
                                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                              </div>
                              <div 
                                onClick={() => (step.status === 'success' || step.status === 'failed') && toggleStepExpand(step.id)} 
                                className={`flex-1 bg-white border ${step.status === 'failed' ? 'border-rose-300 bg-rose-50/20' : step.isExpanded ? 'border-blue-400 ring-1 ring-blue-400/20' : 'border-slate-200'} p-3 rounded-lg flex items-center justify-between shadow-sm ${(step.status === 'success' || step.status === 'failed') ? 'cursor-pointer hover:border-slate-300' : ''} transition`}
                              >
                                <div className="flex items-center gap-2">
                                  {(step.status === 'success' || step.status === 'failed') && (step.isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />)}
                                  <span className="text-sm font-semibold text-slate-800">{step.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {step.output && step.input && step.output.length > step.input.length * 3 && step.output.length > 500 && (
                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">⚠️ Large Output</span>
                                  )}
                                  {step.duration !== undefined && <span className="text-[11px] text-slate-400 font-mono">{step.duration.toFixed(1)}s</span>}
                                  {step.status === 'running' && <span className="text-xs font-bold text-blue-500 uppercase">Running</span>}
                                  {step.status === 'success' && <span className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Completed</span>}
                                  {step.status === 'failed' && <span className="text-xs font-bold text-rose-500 uppercase flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> Failed</span>}
                                  {step.status === 'idle' && <span className="text-xs font-bold text-slate-400 uppercase">Waiting</span>}
                                </div>
                              </div>
                            </div>
                            
                            {step.isExpanded && (
                              <div className="ml-10 mt-2 p-4 bg-slate-50 border border-slate-200 rounded-lg text-[13px] space-y-4 animate-fadeIn">
                                {step.inputKeys && step.inputKeys.length > 0 && (
                                  <div>
                                    <h5 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-1.5">INPUT KEYS</h5>
                                    <div className="text-slate-700 font-mono text-[11px] mb-4">
                                      {JSON.stringify(step.inputKeys)}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <h5 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">INPUT</h5>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {step.input ? step.input.length : 0} chars
                                    </span>
                                  </div>
                                  <div className="text-slate-700 bg-white p-2.5 rounded border border-slate-100 whitespace-pre-wrap font-mono text-[11px] max-h-32 overflow-y-auto custom-scrollbar shadow-sm">
                                    {step.input || 'No input'}
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <h5 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">OUTPUT</h5>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {step.output ? step.output.length : 0} chars
                                    </span>
                                  </div>
                                  <div className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200 text-[12px] max-h-64 overflow-y-auto custom-scrollbar shadow-xs">
                                    {step.output && (step.output.includes('#') || step.output.includes('|') || step.output.includes('**')) ? (
                                      <MarkdownRenderer content={step.output} />
                                    ) : (
                                      <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-700 m-0">
                                        {step.output || 'No output'}
                                      </pre>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Final Output */}
                  {executionResult && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Executive Final Output
                        </h4>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(executionResult);
                            alert('Executive Markdown report copied to clipboard!');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Markdown
                        </button>
                      </div>
                      <div className="bg-white border border-indigo-200 rounded-2xl p-6 text-slate-800 text-sm leading-relaxed shadow-sm">
                        <MarkdownRenderer content={executionResult} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
               {!isExecuting && !executionResult ? (
                 <>
                   <button onClick={resetExecution} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
                     Cancel
                   </button>
                   <button 
                     onClick={executePipeline}
                     disabled={!runInput.trim()}
                     className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm transition active:scale-95 flex items-center gap-2"
                   >
                     Run
                     <Play className="w-4 h-4 fill-current" />
                   </button>
                 </>
               ) : executionResult ? (
                 <button 
                   onClick={resetExecution}
                   className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-sm transition active:scale-95"
                 >
                   Close
                 </button>
               ) : (
                 <button 
                   disabled
                   className="px-6 py-2 bg-blue-400 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 opacity-70"
                 >
                   <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                   Running...
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export const BuildPipelineView: React.FC<BuildPipelineViewProps> = (props) => {
  return (
    <ReactFlowProvider>
      <BuildPipelineContent {...props} />
    </ReactFlowProvider>
  );
};
