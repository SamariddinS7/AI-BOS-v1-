import { IExecutionEngine, Workflow, WorkflowNode, ExecutionContext, NodeExecutionResult } from './types';
import { PluginSandbox } from './PluginSandbox';
import { GovernanceEngine } from './GovernanceEngine';
import { callGeminiWithRetry } from '../gemini';
import prisma from '../db/prisma.js';

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
      variables: {
        startTime: new Date().toISOString(),
        currentDate: new Date().toISOString().split('T')[0],
        currentTime: new Date().toISOString().split('T')[1].split('.')[0],
        environment: process.env.NODE_ENV || 'development',
        systemName: 'AI-BOS Core',
      },
    };

    this.executions.set(executionId, context);
    
    // Persist execution start
    await prisma.workflowExecution.create({
      data: {
        id: executionId,
        workflow_id: workflowId,
        status: 'running',
        trigger_data: JSON.stringify(payload),
      }
    });

    this.log(executionId, null, 'info', `Started execution for workflow: ${workflow.name}`);

    // Find trigger node(s)
    const triggerNodes = workflow.nodes.filter(n => n.type === 'trigger');
    
    // Execute triggers
    try {
      for (const node of triggerNodes) {
        await this.executeNode(node, context, workflow);
      }
      
      // Update execution status to completed if all nodes finished successfully
      await prisma.workflowExecution.update({
        where: { id: executionId },
        data: { status: 'completed', end_time: new Date() },
      });
      
    } catch (error: any) {
      await prisma.workflowExecution.update({
        where: { id: executionId },
        data: { status: 'failed', end_time: new Date() },
      });
      this.log(executionId, null, 'error', `Workflow failed: ${error.message}`);
    } finally {
      this.executions.delete(executionId);
    }

    return executionId;
  }

  private async log(executionId: string, nodeId: string | null, level: string, message: string) {
    console.log(`[Engine][${level.toUpperCase()}] ${message}`);
    try {
      await prisma.workflowLog.create({
        data: {
          execution_id: executionId,
          node_id: nodeId,
          level,
          message,
        }
      });
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
    const exec = await prisma.workflowExecution.findFirst({ where: { id: executionId } });
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
      const output = await this.runNodeLogic(node, inputs, context, workflow);

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
    const resolved: any = { ...node.config };
    
    // Simple template resolution: {{payload.key}}, {{steps.nodeId.output}}, {{vars.key}}
    const resolveValue = (val: any): any => {
      if (typeof val !== 'string') return val;
      
      return val.replace(/\{\{([^{}]+)\}\}/g, (_, path) => {
        const parts = path.trim().split('.');
        const root = parts[0];
        let current: any;

        if (root === 'payload') current = context.triggerPayload;
        else if (root === 'steps') current = context.steps;
        else if (root === 'vars') current = context.variables;
        else return `{{${path}}}`;

        for (let i = 1; i < parts.length; i++) {
          if (current && typeof current === 'object' && parts[i] in current) {
            current = current[parts[i]];
          } else {
            return `{{${path}}}`;
          }
        }
        return current;
      });
    };

    Object.keys(resolved).forEach(key => {
      resolved[key] = resolveValue(resolved[key]);
    });

    return resolved;
  }

  private async runNodeLogic(node: WorkflowNode, inputs: any, context: ExecutionContext, workflow: Workflow): Promise<any> {
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
      case 'ai': 
        return this.executeAINode(node, inputs, context, workflow);
      default: return {};
    }
  }

  private async executeAINode(node: WorkflowNode, inputs: any, context: ExecutionContext, workflow: Workflow): Promise<any> {
    const contextInfo = {
      workflowId: context.workflowId,
      executionId: context.executionId,
      currentNode: {
        id: node.id,
        label: node.label,
        type: node.type,
      },
      systemVariables: context.variables,
      triggerPayload: context.triggerPayload,
      previousSteps: Object.keys(context.steps).reduce((acc, nodeId) => {
        acc[nodeId] = {
          label: workflow.nodes.find(n => n.id === nodeId)?.label || nodeId,
          output: context.steps[nodeId].output,
          status: context.steps[nodeId].status
        };
        return acc;
      }, {} as any)
    };

    const prompt = `
      You are an AI Workflow Node in an enterprise BOS (Business Operating System).
      
      ### CURRENT STEP CONTEXT
      Node ID: ${node.id}
      Node Label: ${node.label}
      Node Configuration: ${JSON.stringify(node.config)}
      
      ### WORKFLOW STATE
      Trigger Payload: ${JSON.stringify(context.triggerPayload)}
      Previous Nodes Outputs: ${JSON.stringify(contextInfo.previousSteps)}
      System Variables: ${JSON.stringify(context.variables)}
      
      ### RESOLVED INPUTS
      ${JSON.stringify(inputs)}

      ### TASK
      ${node.config.prompt || "Analyze the current context and provide a relevant, structured response that helps the workflow proceed."}
      
      Respond in a professional business tone. If structured output is requested in the config, provide it.
    `;

    try {
      const response = await callGeminiWithRetry("gemini-1.5-flash", {
        contents: prompt,
        config: {
          systemInstruction: "You are the AI Intelligence Layer of AI-BOS. Your goal is to process workflow context and generate high-value, accurate business logic outputs."
        }
      });

      return {
        text: response.text,
        tokens: response.usageMetadata,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error("[Engine][AI] Node failed:", error.message);
      throw new Error(`AI Node Execution Failed: ${error.message}`);
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
