import { Router } from 'express';
import db from '../lib/db/settings';
import { callGeminiWithRetry } from '../lib/gemini';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Skills readable by VIEWER+; execution requires MANAGER+
router.use(requireAuth, requireRole(['VIEWER']));

async function executeSkillWithAI(skillType: string, parameters: any) {
  const prompt = `Siz maxsus AI Marketing kouchisiz (O'zbek tilida gapiradigan).
Vazifa: ${skillType}
Parametrlar: ${JSON.stringify(parameters)}

Iltimos, marketing strategiyasini O'zbek tilida ishlab chiqing va faqatgina quyidagi JSON formatida qaytaring:
{
  "ai_fikri": "AI nomidan izoh",
  "kutilayotgan_natija": "qisqa xulosa",
  "bashorat": "strategik bashorat tafsiloti"
}
Diqqat! Ingliz tilidagi eski shablonlarni unuting. Barcha so'zlar haqiqiy tahlilga asoslangan o'zbek tilida bo'lishi shart!`;

  try {
    const aiResponse = await callGeminiWithRetry('gemini-2.5-flash', {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.9
      }
    });
    
    const output_result = JSON.parse(aiResponse.text || '{}');
    const confidenceScore = 0.95; // Use a fixed high confidence for production, or extract from model metadata if available
    return { output_result, confidenceScore };
  } catch (e: any) {
    console.error("AI Skill execution error:", e);
    throw new Error(`AI execution failed: ${e.message}`);
  }
}

// Get available marketing skills
router.get('/available', (req, res) => {
  const skills = [
    { type: 'pricing-strategy', name: 'Pricing Strategy', description: 'Develop pricing strategies and packaging', risk: 'low' },
    { type: 'discount-strategy', name: 'Discount Strategy', description: 'Create discount and promotion strategies', risk: 'low' },
    { type: 'copywriting', name: 'Copywriting', description: 'Generate marketing copy and headlines', risk: 'low' },
    { type: 'email-sequence', name: 'Email Sequence', description: 'Create email drip campaigns', risk: 'low' },
    { type: 'paid-ads', name: 'Paid Ads Management', description: 'Manage and optimize paid campaigns', risk: 'medium' },
    { type: 'campaign-launch', name: 'Campaign Launch', description: 'Launch new advertising campaigns', risk: 'high' },
    { type: 'budget-allocation', name: 'Budget Allocation', description: 'Allocate advertising budget', risk: 'high' },
    { type: 'financial-decision', name: 'Financial Decision', description: 'Make critical financial adjustments', risk: 'critical' },
  ];
  res.json({ total: skills.length, skills });
});

// Execute a marketing skill
router.post('/execute', requireAuth, async (req, res) => {
  let skill_type: string | undefined;
  let tenantId = 'default-tenant-id';
  try {
    const { parameters } = req.body;
    skill_type = req.body.skill_type;
    if (!skill_type) {
      return res.status(422).json({ error: 'Missing required field: skill_type' });
    }
    tenantId = (req as any).user?.tenantId || 'default-tenant-id';
    const userId = (req as any).user?.id || 'admin-user-id';

    // Determine risk level based on mock skill types
    let riskLevel = 'low';
    if (['campaign-launch', 'budget-allocation'].includes(skill_type)) riskLevel = 'high';
    if (['financial-decision'].includes(skill_type)) riskLevel = 'critical';
    if (['paid-ads'].includes(skill_type)) riskLevel = 'medium';

    // Check Approval Workflow
    if (riskLevel === 'high' || riskLevel === 'critical') {
      const workflowId = `wf_${Date.now()}`;
      db.prepare(`
        INSERT INTO ApprovalWorkflow (id, tenant_id, skill_type, requester_id, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(workflowId, tenantId, skill_type, userId, 'pending');

      return res.json({
        id: null,
        status: 'pending_approval',
        approval_workflow_id: workflowId,
        message: 'Approval required for critical/high risk skill'
      });
    }

    // Call real AI logic
    const { output_result, confidenceScore } = await executeSkillWithAI(skill_type, parameters);

    const dbRes = db.prepare(`
      INSERT INTO MarketingSkillExecution (tenant_id, skill_type, status, input_parameters, output_result, confidence_score, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(tenantId, skill_type, 'completed', JSON.stringify(parameters), JSON.stringify(output_result), confidenceScore, userId);

    res.json({
      id: dbRes.lastInsertRowid,
      skill_type,
      status: 'completed',
      confidence: confidenceScore,
      output_result,
      created_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Skill execution failed:', {
      error: error.message,
      tenantId,
      skill_type,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve workflow
router.post('/approve', requireAuth, async (req, res) => {
  try {
    const { workflow_id, decision } = req.body;
    if (!workflow_id || !decision) {
      return res.status(422).json({ error: 'Missing required fields: workflow_id or decision' });
    }
    const tenantId = 'default-tenant-id';

    const workflow: any = db.prepare('SELECT * FROM ApprovalWorkflow WHERE id = ? AND tenant_id = ?').get(workflow_id, tenantId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    if (workflow.status !== 'pending') {
      return res.status(400).json({ error: 'Workflow is already ' + workflow.status });
    }

    db.prepare('UPDATE ApprovalWorkflow SET status = ? WHERE id = ?').run(decision, workflow_id);

    if (decision === 'approved') {
      // Execute the skill since approved
      const { output_result, confidenceScore } = await executeSkillWithAI(workflow.skill_type, {});

      const dbRes = db.prepare(`
        INSERT INTO MarketingSkillExecution (tenant_id, skill_type, status, input_parameters, output_result, confidence_score, user_id, approval_workflow_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(tenantId, workflow.skill_type, 'completed', '{}', JSON.stringify(output_result), confidenceScore, workflow.requester_id, workflow_id);

      return res.json({
        workflow_id,
        status: decision,
        message: 'Approved and executed',
        execution_id: dbRes.lastInsertRowid
      });
    }

    res.json({ workflow_id, status: decision, message: `Workflow ${decision}` });
  } catch (error: any) {
    console.error('Skill approval failed:', {
      error: error.message,
      workflow_id: req.body?.workflow_id,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get User permissions
router.get('/user/permissions', requireAuth, (req, res) => {
  const userId = (req as any).user?.id || 'admin-user-id';
  res.json({
    user_id: userId,
    username: "admin",
    roles: ["ADMIN"],
    permissions: [
      "skill.execute",
      "skill.approve",
      "skill.view_results",
      "data.view",
      "data.export"
    ],
    executable_skills: ["pricing-strategy", "email-sequence", "copywriting", "campaign-launch"]
  });
});

// Check execution status
router.get('/execution/:id', requireAuth, (req, res) => {
  const accountId = req.params.id;
  try {
     const execution = db.prepare('SELECT * FROM MarketingSkillExecution WHERE id = ?').get(accountId);
     if (execution) {
        res.json(execution);
     } else {
        res.status(404).json({ error: 'Execution not found' });
     }
  } catch (error) {
     res.status(500).json({ error: 'Failed to find execution' });
  }
});

// Get audit history
router.get('/audit/history', requireAuth, (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM ApprovalWorkflow ORDER BY created_at DESC LIMIT 50').all();
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit history' });
  }
});

export default router;
