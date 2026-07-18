import express from 'express';
import prisma from '../lib/db/prisma.js';
import { Workflow, WorkflowNode, WorkflowEdge } from '../lib/workflow-engine/types';
import { ExecutionEngine } from '../lib/workflow-engine/ExecutionEngine';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// Workflow read/execute requires MANAGER+
router.use(requireAuth, requireRole(['MANAGER']));
const engine = new ExecutionEngine();

// Get all workflows
router.get('/', async (req, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: { updated_at: 'desc' }
    });
    res.json(workflows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single workflow with nodes and edges
router.get('/:id', async (req, res) => {
  try {
    const workflow = await prisma.workflow.findFirst({ where: { id: req.params.id } });
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

    const [nodes, edges] = await Promise.all([
      prisma.workflowNode.findMany({ where: { workflow_id: req.params.id } }),
      prisma.workflowEdge.findMany({ where: { workflow_id: req.params.id } })
    ]);

    res.json({
      ...workflow,
      nodes: nodes.map((n: any) => ({
        id: n.id,
        workflowId: n.workflow_id,
        type: n.type,
        label: n.label,
        config: JSON.parse(n.config || '{}'),
        position: { x: n.position_x, y: n.position_y }
      })),
      edges: edges.map((e: any) => ({
        id: e.id,
        workflowId: e.workflow_id,
        source: e.source_node_id,
        target: e.target_node_id,
        label: e.label,
        config: JSON.parse(e.config || '{}')
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create or Update workflow
router.post('/', async (req, res) => {
  const workflow: Workflow = req.body;
  const { id, name, description, status, triggerType, nodes, edges } = workflow;

  try {
    await prisma.$transaction(async (tx) => {
      // Upsert Workflow
      await tx.workflow.upsert({
        where: { id },
        update: {
          name,
          description: description || '',
          status,
          trigger_event: triggerType,
          updated_at: new Date()
        },
        create: {
          id,
          name,
          description: description || '',
          status,
          trigger_event: triggerType
        }
      });

      // Replace Nodes
      await tx.workflowNode.deleteMany({ where: { workflow_id: id } });
      if (nodes && nodes.length > 0) {
        await tx.workflowNode.createMany({
          data: nodes.map((node: any) => ({
            id: node.id,
            workflow_id: id,
            type: node.type,
            label: node.label,
            config: JSON.stringify(node.config),
            position_x: node.position.x,
            position_y: node.position.y
          }))
        });
      }

      // Replace Edges
      await tx.workflowEdge.deleteMany({ where: { workflow_id: id } });
      if (edges && edges.length > 0) {
        await tx.workflowEdge.createMany({
          data: edges.map((edge: any) => ({
            id: edge.id,
            workflow_id: id,
            source_node_id: edge.source,
            target_node_id: edge.target,
            label: edge.condition || '',
            config: JSON.stringify({})
          }))
        });
      }
    });

    res.status(201).json({ message: 'Workflow saved successfully', id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Execute Workflow
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const workflowData = await prisma.workflow.findFirst({ where: { id } });
    if (!workflowData) return res.status(404).json({ error: 'Workflow not found' });

    const [nodes, edges] = await Promise.all([
      prisma.workflowNode.findMany({ where: { workflow_id: id } }),
      prisma.workflowEdge.findMany({ where: { workflow_id: id } })
    ]);

    const fullWorkflow: Workflow = {
      ...workflowData,
      nodes: nodes.map((n: any) => ({
        id: n.id,
        workflowId: n.workflow_id,
        type: n.type,
        label: n.label,
        config: JSON.parse(n.config || '{}'),
        position: { x: n.position_x, y: n.position_y }
      })),
      edges: edges.map((e: any) => ({
        id: e.id,
        workflowId: e.workflow_id,
        source: e.source_node_id,
        target: e.target_node_id,
        condition: e.label
      }))
    } as any;

    engine.registerWorkflow(fullWorkflow);
    const executionId = await engine.executeWorkflow(id, payload);

    res.json({ executionId, status: 'started' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Executions
router.get('/:id/executions', async (req, res) => {
  try {
    const executions = await prisma.workflowExecution.findMany({
      where: { workflow_id: req.params.id },
      orderBy: { start_time: 'desc' }
    });
    res.json(executions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Execution Logs
router.get('/executions/:id/logs', async (req, res) => {
  try {
    const logs = await prisma.workflowLog.findMany({
      where: { execution_id: req.params.id },
      orderBy: { timestamp: 'asc' }
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
