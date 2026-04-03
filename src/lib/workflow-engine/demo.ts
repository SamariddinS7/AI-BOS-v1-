import { ExecutionEngine } from './ExecutionEngine';
import { Workflow } from './types';

// Mock Workflow Definition
const sampleWorkflow: Workflow = {
  id: 'wf_123',
  name: 'High CAC Alert',
  version: 1,
  createdBy: 'user_1',
  status: 'active',
  triggerType: 'webhook',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    {
      id: 'trigger_1',
      workflowId: 'wf_123',
      type: 'trigger',
      label: 'Webhook Trigger',
      config: {},
      position: { x: 0, y: 0 },
    },
    {
      id: 'action_1',
      workflowId: 'wf_123',
      type: 'action',
      label: 'Notify Finance',
      config: { channel: 'slack', message: 'CAC is high!' },
      position: { x: 100, y: 0 },
    },
  ],
  edges: [
    {
      id: 'edge_1',
      workflowId: 'wf_123',
      source: 'trigger_1',
      target: 'action_1',
    },
  ],
};

async function main() {
  console.log('--- Initializing AI-BOS Workflow Engine ---');
  
  const engine = new ExecutionEngine();
  
  // 0. Install Core Plugin (Simulated)
  await engine['pluginSandbox'].install('core-action-plugin', '1.0.0');

  // 1. Register Workflow
  engine.registerWorkflow(sampleWorkflow);

  // 2. Simulate Trigger
  const payload = { cac: 25, campaign: 'Q1_Promo' };
  console.log('--- Triggering Workflow ---');
  
  try {
    const executionId = await engine.executeWorkflow('wf_123', payload);
    console.log(`--- Execution Completed: ${executionId} ---`);
  } catch (error) {
    console.error('--- Execution Failed ---', error);
  }
}

main();
