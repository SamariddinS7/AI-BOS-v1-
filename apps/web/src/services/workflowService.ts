import { Node, Edge } from 'reactflow';

export interface BackendWorkflowNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface BackendWorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition: string;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: BackendWorkflowNode[];
  edges: BackendWorkflowEdge[];
  status: 'draft' | 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
}

export interface Log {
  id: string;
  executionId: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  timestamp: string;
}

export const workflowService = {
  saveWorkflow: async (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> => {
    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...workflow,
        id: crypto.randomUUID(),
        version: 1,
        createdBy: 'user',
        triggerType: 'manual',
        nodes: workflow.nodes,
        edges: workflow.edges
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save workflow');
    }

    return await response.json();
  },

  updateWorkflow: async (id: string, data: Partial<Workflow>): Promise<Workflow> => {
    // Implement update logic
    return {} as Workflow;
  },

  testWorkflow: async (nodes: Node[], edges: Edge[]): Promise<{ success: boolean; logs: string[] }> => {
    const response = await fetch('/api/workflows/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.type || 'action',
          label: n.data?.label || 'Node',
          config: n.data,
          position: n.position
        })),
        edges: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          condition: e.label || ''
        }))
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, logs: error.logs || ['Unknown error'] };
    }

    return await response.json();
  },

  getWorkflows: async (): Promise<Workflow[]> => {
    const response = await fetch('/api/workflows');
    if (!response.ok) throw new Error('Failed to fetch workflows');
    return await response.json();
  },

  getWorkflow: async (id: string): Promise<Workflow> => {
    const response = await fetch(`/api/workflows/${id}`);
    if (!response.ok) throw new Error('Failed to fetch workflow');
    return await response.json();
  },

  getExecutions: async (workflowId: string): Promise<Execution[]> => {
    const response = await fetch(`/api/workflows/${workflowId}/executions`);
    if (!response.ok) throw new Error('Failed to fetch executions');
    return await response.json();
  },

  getLogs: async (executionId: string): Promise<Log[]> => {
    const response = await fetch(`/api/workflows/executions/${executionId}/logs`);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return await response.json();
  }
};
