import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Save, GitCommit, Zap, Database, Brain, Loader2, X, Settings, List } from 'lucide-react';
import CustomNode from './CustomNode';
import { workflowService, Workflow as WorkflowType, BackendWorkflowNode, BackendWorkflowEdge } from '../../services/workflowService';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: { label: 'New Lead Created', type: 'trigger', isValid: true },
    position: { x: 50, y: 250 },
  },
];

const initialEdges: Edge[] = [];

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [showTestResults, setShowTestResults] = useState(false);
  const [workflowName, setWorkflowName] = useState('New Automation Workflow');
  const [workflowId, setWorkflowId] = useState<string>(crypto.randomUUID());
  const [showWorkflowList, setShowWorkflowList] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState<WorkflowType[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const list = await workflowService.getWorkflows();
      setSavedWorkflows(list);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--color-text-muted)' } }, eds)),
    [setEdges]
  );

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
  };

  const addNode = (type: string, label: string) => {
    const id = crypto.randomUUID();
    const newNode = {
      id,
      type: 'custom',
      data: { label, type, isValid: true },
      position: {
        x: Math.random() * 400 + 50,
        y: Math.random() * 400 + 50,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await workflowService.saveWorkflow({
        id: workflowId,
        name: workflowName,
        nodes,
        edges,
        status: 'active',
        triggerType: 'manual',
      } as any);
      alert('Workflow saved successfully!');
      loadWorkflows();
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestLogs([]);
    setShowTestResults(true);
    try {
      const result = await workflowService.testWorkflow(nodes, edges);
      setTestLogs(result.logs);
    } catch (error) {
      console.error('Failed to test workflow:', error);
      setTestLogs(['Error: Failed to connect to execution engine.']);
    } finally {
      setIsTesting(false);
    }
  };

  const loadWorkflow = async (w: WorkflowType) => {
    try {
      const full = await workflowService.getWorkflow(w.id);
      setWorkflowId(full.id);
      setWorkflowName(full.name);
      // Map backend nodes back to React Flow format
      setNodes(full.nodes.map((n: BackendWorkflowNode) => ({
        id: n.id,
        type: 'custom',
        data: { ...n.config, label: n.label, type: n.type },
        position: n.position
      })));
      setEdges(full.edges.map((e: BackendWorkflowEdge) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.condition,
        animated: true,
        style: { stroke: 'var(--color-text-muted)' }
      })));
      setShowWorkflowList(false);
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface-ground relative overflow-hidden animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="h-14 border-b border-border-dark bg-surface-card flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowWorkflowList(!showWorkflowList)}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-ground rounded-lg transition-colors"
          >
            <List className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent border-none text-text-primary font-bold focus:ring-0 text-lg w-64"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleTest}
            disabled={isTesting}
            className="px-4 py-2 bg-surface-ground text-text-secondary rounded-lg hover:bg-surface-ground/80 transition-colors flex items-center gap-2 text-base font-bold disabled:opacity-50 border border-border-dark"
          >
            {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            Test Run
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 text-base font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Workflow
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Workflow List */}
        {showWorkflowList && (
          <div className="w-64 border-r border-border-dark bg-surface-card overflow-y-auto z-20 animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-border-dark">
              <h3 className="text-base font-bold text-text-muted uppercase tracking-widest">Saved Workflows</h3>
            </div>
            <div className="p-2 space-y-1">
              {savedWorkflows.map(w => (
                <button 
                  key={w.id}
                  onClick={() => loadWorkflow(w)}
                  className="w-full text-left px-3 py-2 rounded-lg text-base text-text-secondary hover:text-text-primary hover:bg-surface-ground transition-colors truncate"
                >
                  {w.name}
                </button>
              ))}
              {savedWorkflows.length === 0 && (
                <div className="p-4 text-base text-text-muted italic">No workflows saved yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
              <div className="flex items-center bg-surface-card border border-border-dark rounded-lg p-1 shadow-xl">
                <button 
                  onClick={() => addNode('trigger', 'New Trigger')}
                  className="px-3 py-1.5 text-base font-bold text-text-secondary hover:bg-surface-ground rounded-md transition-colors flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-yellow-500" /> Trigger
                </button>
                <button 
                  onClick={() => addNode('action', 'New Action')}
                  className="px-3 py-1.5 text-base font-bold text-text-secondary hover:bg-surface-ground rounded-md transition-colors flex items-center gap-2"
                >
                  <Database className="w-4 h-4 text-blue-500" /> Action
                </button>
                <button 
                  onClick={() => addNode('condition', 'New Condition')}
                  className="px-3 py-1.5 text-base font-bold text-text-secondary hover:bg-surface-ground rounded-md transition-colors flex items-center gap-2"
                >
                  <GitCommit className="w-4 h-4 text-purple-500" /> Condition
                </button>
                <button 
                  onClick={() => addNode('ai', 'New AI Node')}
                  className="px-3 py-1.5 text-base font-bold text-text-secondary hover:bg-surface-ground rounded-md transition-colors flex items-center gap-2"
                >
                  <Brain className="w-4 h-4 text-indigo-500" /> AI Node
                </button>
              </div>
            </div>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-surface-ground"
            >
              <Background color="#555" gap={20} size={1} />
              <Controls className="bg-surface-card border border-border-dark shadow-xl rounded-lg overflow-hidden fill-text-muted" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Node Configuration Panel */}
        {selectedNode && (
          <div className="w-80 border-l border-border-dark bg-surface-card p-6 z-20 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-text-primary flex items-center gap-2 text-base">
                <Settings className="w-5 h-5 text-text-muted" />
                Node Config
              </h3>
              <button onClick={() => setSelectedNode(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-base font-bold text-text-muted uppercase mb-2">Label</label>
                <input 
                  type="text" 
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: newLabel } } : n));
                    setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, label: newLabel } } : null);
                  }}
                  className="w-full bg-surface-ground border border-border-dark rounded-lg text-text-primary text-base focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-text-muted uppercase mb-2">Type</label>
                <div className="px-3 py-2 bg-surface-ground rounded-lg text-base text-text-secondary capitalize border border-border-dark">
                  {selectedNode.data.type}
                </div>
              </div>

              {selectedNode.data.type === 'trigger' && (
                <div>
                  <label className="block text-base font-bold text-text-muted uppercase mb-2">Event Trigger</label>
                  <select className="w-full bg-surface-ground border border-border-dark rounded-lg text-text-primary text-base">
                    <option>New Customer</option>
                    <option>New Order</option>
                    <option>Inventory Low</option>
                    <option>Invoice Overdue</option>
                  </select>
                </div>
              )}

              {selectedNode.data.type === 'action' && (
                <div>
                  <label className="block text-base font-bold text-text-muted uppercase mb-2">Action Type</label>
                  <select className="w-full bg-surface-ground border border-border-dark rounded-lg text-text-primary text-base">
                    <option>Send Email</option>
                    <option>Slack Notification</option>
                    <option>Update CRM</option>
                    <option>Create Task</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Execution Logs Panel */}
      {showTestResults && (
        <div className="absolute bottom-6 right-6 z-30 bg-surface-card border border-border-dark rounded-xl shadow-2xl w-[400px] animate-in slide-in-from-bottom-4 overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-border-dark bg-surface-ground/50">
            <h4 className="font-bold text-text-primary text-base flex items-center gap-2">
              Execution Logs
            </h4>
            <button onClick={() => setShowTestResults(false)} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar bg-surface-card">
            {testLogs.length === 0 ? (
              <div className="text-text-muted text-base font-mono">Waiting for execution...</div>
            ) : (
              <div className="space-y-2">
                {testLogs.map((log, idx) => (
                  <div key={`${idx}-${log.slice(0, 10)}`} className="text-base font-mono text-text-secondary border-l-2 border-border-dark pl-2">
                    <span className="text-text-muted">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
