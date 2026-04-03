// src/lib/workflow-engine/types.ts

/**
 * Represents the status of a Workflow or Execution.
 */
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived' | 'running' | 'completed' | 'failed';

/**
 * Represents the type of a Workflow Node.
 */
export type NodeType = 'trigger' | 'action' | 'condition' | 'ai' | 'webhook' | 'transform' | 'delay';

/**
 * Represents a Node in the Workflow Graph.
 */
export interface WorkflowNode {
  id: string;
  workflowId: string;
  type: NodeType;
  label: string;
  config: Record<string, any>; // Flexible configuration based on node type
  retryPolicy?: {
    maxAttempts: number;
    backoff: 'fixed' | 'exponential';
    delayMs: number;
  };
  timeoutMs?: number;
  position: { x: number; y: number };
}

/**
 * Represents a connection (Edge) between two Nodes.
 */
export interface WorkflowEdge {
  id: string;
  workflowId: string;
  source: string; // Node ID
  target: string; // Node ID
  condition?: string; // Expression to evaluate (e.g., "output.confidence > 0.8")
}

/**
 * Represents the Workflow definition itself.
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: number;
  createdBy: string; // User ID
  status: WorkflowStatus;
  triggerType: 'manual' | 'schedule' | 'webhook' | 'event';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the execution context passed between nodes.
 */
export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  triggerPayload: any;
  steps: Record<string, NodeExecutionResult>; // Results of previous steps keyed by Node ID
  variables: Record<string, any>; // Global variables for this execution
}

/**
 * Represents the result of a single Node execution.
 */
export interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'failure' | 'skipped';
  output: any;
  error?: string;
  durationMs: number;
  timestamp: string;
}

/**
 * Interface for the Execution Engine.
 */
export interface IExecutionEngine {
  executeWorkflow(workflowId: string, payload: any): Promise<string>; // Returns executionId
  resumeExecution(executionId: string): Promise<void>;
  getExecutionStatus(executionId: string): Promise<WorkflowStatus>;
}
