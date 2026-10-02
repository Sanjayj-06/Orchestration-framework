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

import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { NodeInspector } from '../components/NodeInspector';
import { ExecutionConsole } from '../components/ExecutionConsole';
import { JsonModal } from '../components/JsonModal';

import { LLMNode } from '../components/nodes/LLMNode';
import { MemoryNode } from '../components/nodes/MemoryNode';
import { ToolNode } from '../components/nodes/ToolNode';
import { TriggerNode } from '../components/nodes/TriggerNode';
import { LogicNode } from '../components/nodes/LogicNode';

import { STARTER_TEMPLATES } from '../data/templates';
import type { CustomNodeData, ExecutionLog, AgentTemplate, NodeTypeCategory, NodeConfig } from '../types/agent';
import { runWorkflow } from '../services/api';

const WorkflowsContent: React.FC = () => {
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
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [setNodes, setEdges, selectedNodeId]
  );

  // Simulation execution with backend API sync
  const handleRunSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setLogs([]);
    setIsConsoleOpen(true);

    const addLog = (
      nodeId: string,
      nodeLabel: string,
      category: NodeTypeCategory,
      status: 'info' | 'success' | 'warning' | 'error',
      message: string,
      details?: Record<string, unknown>,
      latencyMs?: number
    ) => {
      setLogs((prev) => [
        ...prev,
        {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: new Date().toLocaleTimeString(),
          nodeId,
          nodeLabel,
          category,
          status,
          message,
          details,
          latencyMs
        }
      ]);
    };

    try {
      // Backend workflow execution call
      const res = await runWorkflow('wf-active', 'Synthesize research and quantitative data');
      
      for (const step of res.steps || []) {
        addLog(
          `step_${step.step}`,
          step.agent,
          'llm',
          'success',
          `${step.action} -> ${step.output}`,
          { output: step.output },
          420
        );
        await new Promise((r) => setTimeout(r, 600));
      }
    } catch {
      // Fallback local simulation if backend offline
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const data = node.data as unknown as CustomNodeData;
        addLog(
          node.id,
          data.label,
          data.category,
          'success',
          `Executed ${data.label} step successfully.`,
          { category: data.category },
          350
        );
        await new Promise((r) => setTimeout(r, 450));
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetCanvas = () => {
    const template = STARTER_TEMPLATES.find((t) => t.id === selectedTemplateId) || STARTER_TEMPLATES[0];
    handleSelectTemplate(template);
  };

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 overflow-hidden">
      <Navbar
        agentName={agentName}
        setAgentName={setAgentName}
        selectedTemplate={selectedTemplateId}
        onSelectTemplate={handleSelectTemplate}
        onRunSimulation={handleRunSimulation}
        isSimulating={isSimulating}
        onViewJson={() => setIsJsonModalOpen(true)}
        onResetCanvas={handleResetCanvas}
        nodeCount={nodes.length}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar onAddNode={handleAddNode} />

        <div
          className={`flex-1 h-full relative transition-colors ${
            isDraggingOverCanvas ? 'bg-indigo-950/20' : ''
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
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
              style: { stroke: '#6366f1', strokeWidth: 2 }
            }}
          >
            <Background color="#1e293b" gap={20} size={1.5} variant={BackgroundVariant.Dots} />
            <Controls className="bg-slate-900 border-slate-700 fill-slate-300" />
            <MiniMap
              nodeColor={(n) => {
                const cat = (n.data as unknown as CustomNodeData)?.category;
                switch (cat) {
                  case 'trigger': return '#f59e0b';
                  case 'llm': return '#6366f1';
                  case 'memory': return '#a855f7';
                  case 'tool': return '#10b981';
                  case 'logic': return '#06b6d4';
                  default: return '#64748b';
                }
              }}
              maskColor="rgba(15, 23, 42, 0.75)"
            />
          </ReactFlow>

          {isDraggingOverCanvas && (
            <div className="absolute inset-0 border-2 border-dashed border-indigo-500 bg-indigo-500/5 pointer-events-none flex items-center justify-center">
              <span className="text-sm font-semibold text-indigo-400 bg-slate-950/80 px-4 py-2 rounded-xl border border-indigo-500/30">
                Drop to Add Node
              </span>
            </div>
          )}
        </div>

        {selectedNode && (
          <NodeInspector
            selectedNode={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onUpdateConfig={handleUpdateConfig}
            onDeleteNode={handleDeleteNode}
          />
        )}
      </div>

      <ExecutionConsole
        isOpen={isConsoleOpen}
        setIsOpen={setIsConsoleOpen}
        logs={logs}
        onRunTest={() => handleRunSimulation()}
        isSimulating={isSimulating}
      />

      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        graphJson={{ agentName, nodes, edges }}
      />

    </div>
  );
};

export const WorkflowsView: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowsContent />
    </ReactFlowProvider>
  );
};
