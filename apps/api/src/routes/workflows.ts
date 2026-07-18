import express from 'express';
import db from '../lib/db/settings.js';
import { Workflow, WorkflowNode, WorkflowEdge } from '../lib/workflow-engine/types';
import { ExecutionEngine } from '../lib/workflow-engine/ExecutionEngine';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// Workflow read/execute requires MANAGER+
router.use(requireAuth, requireRole(['MANAGER']));
const engine = new ExecutionEngine();

// Get all workflows
router.get('/', (req, res) => {
  try {
    const workflows = db.prepare('SELECT * FROM Workflows ORDER BY updated_at DESC').all();
    res.json(workflows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single workflow with nodes and edges
router.get('/:id', (req, res) => {
  try {
    const workflow = db.prepare('SELECT * FROM Workflows WHERE id = ?').get(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

    const nodes = db.prepare('SELECT * FROM WorkflowNodes WHERE workflow_id = ?').all(req.params.id);
    const edges = db.prepare('SELECT * FROM WorkflowEdges WHERE workflow_id = ?').all(req.params.id);

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
router.post('/', (req, res) => {
  const workflow: Workflow = req.body;
  const { id, name, description, status, triggerType, nodes, edges } = workflow;

  const transaction = db.transaction(() => {
    // Upsert Workflow
    const existing = db.prepare('SELECT id FROM Workflows WHERE id = ?').get(id);
    if (existing) {
      db.prepare('UPDATE Workflows SET name = ?, description = ?, status = ?, trigger_event = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(name, description || '', status, triggerType, id);
    } else {
      db.prepare('INSERT INTO Workflows (id, name, description, status, trigger_event) VALUES (?, ?, ?, ?, ?)')
        .run(id, name, description || '', status, triggerType);
    }

    // Replace Nodes
    db.prepare('DELETE FROM WorkflowNodes WHERE workflow_id = ?').run(id);
    const insertNode = db.prepare('INSERT INTO WorkflowNodes (id, workflow_id, type, label, config, position_x, position_y) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const node of nodes) {
      insertNode.run(node.id, id, node.type, node.label, JSON.stringify(node.config), node.position.x, node.position.y);
    }

    // Replace Edges
    db.prepare('DELETE FROM WorkflowEdges WHERE workflow_id = ?').run(id);
    const insertEdge = db.prepare('INSERT INTO WorkflowEdges (id, workflow_id, source_node_id, target_node_id, label, config) VALUES (?, ?, ?, ?, ?, ?)');
    for (const edge of edges) {
      insertEdge.run(edge.id, id, edge.source, edge.target, edge.condition || '', JSON.stringify({}));
    }
  });

  try {
    transaction();
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
    
    // In a real system, we'd load the workflow from DB and pass to engine
    const workflowData = db.prepare('SELECT * FROM Workflows WHERE id = ?').get(id);
    if (!workflowData) return res.status(404).json({ error: 'Workflow not found' });

    const nodes = db.prepare('SELECT * FROM WorkflowNodes WHERE workflow_id = ?').all(id);
    const edges = db.prepare('SELECT * FROM WorkflowEdges WHERE workflow_id = ?').all(id);

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
router.get('/:id/executions', (req, res) => {
  try {
    const executions = db.prepare('SELECT * FROM WorkflowExecutions WHERE workflow_id = ? ORDER BY start_time DESC').all(req.params.id);
    res.json(executions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Execution Logs
router.get('/executions/:id/logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM WorkflowLogs WHERE execution_id = ? ORDER BY timestamp ASC').all(req.params.id);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
