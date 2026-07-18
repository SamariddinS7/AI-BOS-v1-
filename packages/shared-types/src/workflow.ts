// Workflow engine shared types

export type WorkflowStatus = 'active' | 'inactive' | 'running' | 'error' | 'completed';
export type NodeType = 'trigger' | 'action' | 'condition' | 'ai' | 'notification' | 'data';

export interface WorkflowNode {
  id: string;
  workflowId: string;
  type: NodeType;
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  workflowId: string;
  source: string;
  target: string;
  label?: string;
  config: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  triggerType: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecutionResult {
  workflowId: string;
  success: boolean;
  output?: unknown;
  error?: string;
  executedAt: string;
  duration_ms?: number;
}
