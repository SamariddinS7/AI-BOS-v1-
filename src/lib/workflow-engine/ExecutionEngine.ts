import { IExecutionEngine, Workflow, WorkflowNode, ExecutionContext, NodeExecutionResult } from './types';
import { PluginSandbox } from './PluginSandbox';
import { GovernanceEngine } from './GovernanceEngine';
import db from '../db/settings.js';

/**
 * A Production-Grade Workflow Execution Engine.
 */
export class ExecutionEngine implements IExecutionEngine {
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, ExecutionContext> = new Map();
  private pluginSandbox: PluginSandbox;
  private governanceEngine: GovernanceEngine;

  constructor() {
    this.pluginSandbox = new PluginSandbox();
    this.governanceEngine = new GovernanceEngine();
  }

  /**
   * Registers a workflow definition.
   */
  public registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
    console.log(`[Engine] Registered workflow: ${workflow.name} (${workflow.id})`);
  }

  /**
   * Starts the execution of a workflow.
   */
  public async executeWorkflow(workflowId: string, payload: any): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Check permissions before starting
    const allowed = this.governanceEngine.evaluate({
      userId: 'system',
      workflowId,
      action: 'execute_workflow',
      resource: workflow.name,
    });

    if (!allowed) {
      throw new Error(`Execution blocked by governance policy.`);
    }

    const executionId = crypto.randomUUID();
    const context: ExecutionContext = {
      workflowId,
      executionId,
      triggerPayload: payload,
      steps: {},
      variables: {},
    };

    this.executions.set(executionId, context);
    
    // Persist execution start
    db.prepare('INSERT INTO WorkflowExecutions (id, workflow_id, status, trigger_data) VALUES (?, ?, ?, ?)')
      .run(executionId, workflowId, 'running', JSON.stringify(payload));

    this.log(executionId, null, 'info', `Started execution for workflow: ${workflow.name}`);

    // Find trigger node(s)
    const triggerNodes = workflow.nodes.filter(n => n.type === 'trigger');
    
    // Execute triggers
    try {
      for (const node of triggerNodes) {
        await this.executeNode(node, context, workflow);
      }
      
      // Update execution status to completed if all nodes finished successfully
      db.prepare('UPDATE WorkflowExecutions SET status = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?')
        .run('completed', executionId);
      
    } catch (error: any) {
      db.prepare('UPDATE WorkflowExecutions SET status = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?')
        .run('failed', executionId);
      this.log(executionId, null, 'error', `Workflow failed: ${error.message}`);
    }

    return executionId;
  }

  private log(executionId: string, nodeId: string | null, level: string, message: string) {
    console.log(`[Engine][${level.toUpperCase()}] ${message}`);
    try {
      db.prepare('INSERT INTO WorkflowLogs (execution_id, node_id, level, message) VALUES (?, ?, ?, ?)')
        .run(executionId, nodeId, level, message);
    } catch (e) {
      console.error('Failed to log to DB:', e);
    }
  }

  /**
   * Resumes a paused or failed execution.
   */
  public async resumeExecution(executionId: string): Promise<void> {
    const context = this.executions.get(executionId);
    if (!context) throw new Error(`Execution ${executionId} not found`);
    
    this.log(executionId, null, 'info', `Resuming execution ${executionId}`);
  }

  public async getExecutionStatus(executionId: string): Promise<any> {
    const exec = db.prepare('SELECT status FROM WorkflowExecutions WHERE id = ?').get(executionId);
    return exec ? (exec as any).status : 'not_found';
  }

  /**
   * Executes a single node.
   */
  private async executeNode(node: WorkflowNode, context: ExecutionContext, workflow: Workflow): Promise<void> {
    this.log(context.executionId, node.id, 'info', `Executing node: ${node.label}`);
    
    const startTime = Date.now();
    let result: NodeExecutionResult;

    try {
      const inputs = this.resolveInputs(node, context);
      const output = await this.runNodeLogic(node, inputs);

      result = {
        nodeId: node.id,
        status: 'success',
        output,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
      
      this.log(context.executionId, node.id, 'info', `Node ${node.label} completed successfully in ${result.durationMs}ms`);
    } catch (error: any) {
      this.log(context.executionId, node.id, 'error', `Node ${node.label} failed: ${error.message}`);
      result = {
        nodeId: node.id,
        status: 'failure',
        output: null,
        error: error.message,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
      
      throw error; // Propagate to stop workflow
    }

    context.steps[node.id] = result;

    if (result.status === 'success') {
      const nextNodes = this.findNextNodes(node, workflow, context);
      for (const nextNode of nextNodes) {
        await this.executeNode(nextNode, context, workflow);
      }
    }
  }

  private resolveInputs(node: WorkflowNode, context: ExecutionContext): any {
    // Placeholder for input resolution logic (e.g., {{steps.trigger.body.id}})
    return { ...context.triggerPayload, ...node.config };
  }

  private async runNodeLogic(node: WorkflowNode, inputs: any): Promise<any> {
    // In a real system, this delegates to PluginSandbox or specific handlers
    switch (node.type) {
      case 'trigger': return inputs;
      case 'action': 
        // Example: Use Plugin Sandbox for actions
        return this.pluginSandbox.execute('core-action-plugin', inputs, {
          secrets: {},
          logger: console,
          fetch: fetch,
        });
      case 'condition': return inputs.value > 10; // Mock condition
      case 'ai': return { text: "AI Generated Response based on " + JSON.stringify(inputs) };
      default: return {};
    }
  }

  private findNextNodes(currentNode: WorkflowNode, workflow: Workflow, context: ExecutionContext): WorkflowNode[] {
    const edges = workflow.edges.filter(e => e.source === currentNode.id);
    const nextNodes: WorkflowNode[] = [];

    for (const edge of edges) {
      // Evaluate condition if present
      if (edge.condition) {
        const conditionMet = this.evaluateCondition(edge.condition, context);
        if (!conditionMet) continue;
      }
      
      const targetNode = workflow.nodes.find(n => n.id === edge.target);
      if (targetNode) nextNodes.push(targetNode);
    }

    return nextNodes;
  }

  private evaluateCondition(expression: string, context: ExecutionContext): boolean {
    // Safe evaluation logic would go here.
    // For now, we assume true if no expression, or simple check.
    return true; 
  }
}
