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

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NodeInspector } from './components/NodeInspector';
import { ExecutionConsole } from './components/ExecutionConsole';
import { JsonModal } from './components/JsonModal';

import { LLMNode } from './components/nodes/LLMNode';
import { MemoryNode } from './components/nodes/MemoryNode';
import { ToolNode } from './components/nodes/ToolNode';
import { TriggerNode } from './components/nodes/TriggerNode';
import { LogicNode } from './components/nodes/LogicNode';

import { STARTER_TEMPLATES } from './data/templates';
import type { CustomNodeData, ExecutionLog, AgentTemplate, NodeTypeCategory, NodeConfig } from './types/agent';

const AppContent: React.FC = () => {
  const initialTemplate = STARTER_TEMPLATES[0];

  const [agentName, setAgentName] = useState(initialTemplate.name);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplate.id);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialTemplate.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialTemplate.edges);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isDraggingOverCanvas, setIsDraggingOverCanvas] = useState(false);

  const { screenToFlowPosition } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      llmNode: LLMNode,
      memoryNode: MemoryNode,
      toolNode: ToolNode,
      triggerNode: TriggerNode,
      logicNode: LogicNode
    }),
    []
  );

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleSelectTemplate = useCallback((template: AgentTemplate) => {
    setAgentName(template.name);
    setSelectedTemplateId(template.id);
    setNodes(template.nodes);
    setEdges(template.edges);
    setSelectedNodeId(null);
    setLogs([]);
  }, [setNodes, setEdges]);

  const handleAddNode = useCallback(
    (type: string, category: NodeTypeCategory, label: string) => {
      const id = `node_${Date.now()}`;
      const newNode: Node = {
        id,
        type,
        position: { x: 350 + Math.random() * 80, y: 150 + Math.random() * 80 },
        data: {
          label,
          category,
          subtitle: `${category.toUpperCase()} Node`,
          config: {
            provider: category === 'llm' ? 'openai' : undefined,
            model: category === 'llm' ? 'gpt-4o' : undefined,
            memoryType: category === 'memory' ? 'vector_rag' : undefined,
            toolType: category === 'tool' ? 'rest_api' : undefined
          }
        }
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(id);
    },
    [setNodes]
  );

  // Drag and Drop handlers
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
        const { type, category, label } = JSON.parse(dataString);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });

        const id = `node_${Date.now()}`;
        const newNode: Node = {
          id,
          type,
          position,
          data: {
            label,
            category,
            subtitle: `${category.toUpperCase()} Node`,
            config: {
              provider: category === 'llm' ? 'openai' : undefined,
              model: category === 'llm' ? 'gpt-4o' : undefined,
              memoryType: category === 'memory' ? 'vector_rag' : undefined,
              toolType: category === 'tool' ? 'rest_api' : undefined
            }
          }
        };

        setNodes((nds) => [...nds, newNode]);
        setSelectedNodeId(id);
      } catch (err) {
        console.error('Failed to parse dropped node data:', err);
      }
    },
    [screenToFlowPosition, setNodes]
  );

  const handleUpdateConfig = useCallback(
    (nodeId: string, updatedConfig: Partial<NodeConfig>, newLabel?: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const data = node.data as unknown as CustomNodeData;
            return {
              ...node,
              data: {
                ...data,
                label: newLabel !== undefined ? newLabel : data.label,
                config: {
                  ...data.config,
                  ...updatedConfig
                }
              }
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [setNodes, setEdges, selectedNodeId]
  );

  const handleResetCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setLogs([]);
  }, [setNodes, setEdges]);

  const handleRunSimulation = useCallback(
    async (promptInput?: string) => {
      if (isSimulating || nodes.length === 0) return;
      setIsSimulating(true);
      setIsConsoleOpen(true);
      setLogs([]);

      const addLog = (nodeId: string, nodeLabel: string, category: NodeTypeCategory, message: string, status: 'info' | 'success' | 'warning' | 'error', latencyMs?: number, tokensUsed?: number) => {
        const time = new Date().toLocaleTimeString();
        setLogs((prev) => [
          ...prev,
          {
            id: `log_${Date.now()}_${Math.random()}`,
            timestamp: time,
            nodeId,
            nodeLabel,
            category,
            status,
            message,
            latencyMs,
            tokensUsed
          }
        ]);
      };

      const setNodeStatus = (nodeId: string, status: 'idle' | 'running' | 'success' | 'error', executionTimeMs?: number) => {
        setNodes((nds) =>
          nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, status, executionTimeMs } } : n))
        );
      };

      const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

      nodes.forEach((n) => setNodeStatus(n.id, 'idle'));

      addLog('system', 'Execution Compiler', 'trigger', `Ingested Graph DAG with ${nodes.length} nodes and ${edges.length} edges. Beginning execution trace...`, 'info');
      await sleep(400);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const data = node.data as unknown as CustomNodeData;

        setNodeStatus(node.id, 'running');
        addLog(node.id, data.label, data.category, `Executing step logic for [${data.label}]...`, 'info');

        const stepTime = Math.floor(150 + Math.random() * 350);
        await sleep(stepTime);

        let logMessage = 'Step completed successfully.';
        let tokens = undefined;

        if (data.category === 'trigger') {
          logMessage = promptInput ? `Trigger payload received: "${promptInput}"` : `Trigger fired via webhook listener. Payload initialized.`;
        } else if (data.category === 'memory') {
          logMessage = `Retrieved top-K context chunks from vector collection "${data.config?.vectorCollection || 'default'}". Similarity score: 0.89`;
        } else if (data.category === 'llm') {
          tokens = Math.floor(200 + Math.random() * 450);
          logMessage = `Inference completed via ${data.config?.provider || 'openai'} (${data.config?.model || 'gpt-4o'}). Generated synthesized output.`;
        } else if (data.category === 'tool') {
          logMessage = `Invoked external tool API [${data.config?.apiUrl || 'HTTPS endpoint'}]. Status: 200 OK. Response payload parsed.`;
        } else if (data.category === 'logic') {
          logMessage = `Evaluated routing condition (${data.config?.conditionField} >= ${data.config?.conditionValue}). Condition passed.`;
        }

        setNodeStatus(node.id, 'success', stepTime);
        addLog(node.id, data.label, data.category, logMessage, 'success', stepTime, tokens);
        await sleep(200);
      }

      addLog('system', 'Execution Finished', 'trigger', 'DAG Execution completed cleanly with 0 errors.', 'success');
      setIsSimulating(false);
    },
    [isSimulating, nodes, edges, setNodes]
  );

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const compiledJsonSpec = useMemo(() => {
    return {
      agent_name: agentName,
      agent_id: `agent_${selectedTemplateId}`,
      version: "1.0.0",
      created_at: new Date().toISOString(),
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: (n.data as any).label,
        category: (n.data as any).category,
        config: (n.data as any).config
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label
      }))
    };
  }, [agentName, selectedTemplateId, nodes, edges]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 overflow-hidden">
      <Navbar
        agentName={agentName}
        setAgentName={setAgentName}
        selectedTemplate={selectedTemplateId}
        onSelectTemplate={handleSelectTemplate}
        onRunSimulation={() => handleRunSimulation()}
        isSimulating={isSimulating}
        onViewJson={() => setIsJsonModalOpen(true)}
        onResetCanvas={handleResetCanvas}
        nodeCount={nodes.length}
      />

      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar onAddNode={handleAddNode} />

        <main
          className={`flex-1 h-[calc(100vh-4rem)] relative transition-all ${
            isDraggingOverCanvas ? 'ring-4 ring-indigo-500/60 ring-inset bg-indigo-950/20' : ''
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {isDraggingOverCanvas && (
            <div className="absolute inset-0 z-30 bg-indigo-600/10 backdrop-blur-[2px] flex items-center justify-center pointer-events-none border-2 border-dashed border-indigo-400">
              <div className="bg-slate-900/90 text-indigo-300 font-semibold text-sm px-6 py-3 rounded-xl border border-indigo-500/40 shadow-2xl animate-bounce flex items-center gap-2">
                <span>✦ Drop component here to add to canvas</span>
              </div>
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
            className="bg-slate-950"
          >
            <Background color="#334155" variant={BackgroundVariant.Dots} gap={24} size={1.5} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const cat = (node.data as any)?.category;
                if (cat === 'llm') return '#6366f1';
                if (cat === 'memory') return '#10b981';
                if (cat === 'tool') return '#f59e0b';
                if (cat === 'trigger') return '#06b6d4';
                return '#a855f7';
              }}
              maskColor="rgba(3, 7, 18, 0.7)"
            />
          </ReactFlow>
        </main>

        <NodeInspector
          selectedNode={selectedNode}
          onUpdateConfig={handleUpdateConfig}
          onDeleteNode={handleDeleteNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>

      <ExecutionConsole
        logs={logs}
        isSimulating={isSimulating}
        onRunTest={(input) => handleRunSimulation(input)}
        isOpen={isConsoleOpen}
        setIsOpen={setIsConsoleOpen}
      />

      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        graphJson={compiledJsonSpec}
      />
    </div>
  );
};

export function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

export default App;
