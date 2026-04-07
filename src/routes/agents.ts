import express from 'express';
import { agentDbService } from '../lib/db/agentDb';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tenantId = 'default-tenant-id'; // In a real app, this would come from auth
    const agents = await agentDbService.getAgents(tenantId);
    res.json(agents);
  } catch (error: any) {
    console.error('Error fetching agents:', error.message);
    res.status(500).json({ error: 'Agentlarni yuklashda xatolik yuz berdi' });
  }
});

router.post('/', async (req, res) => {
  try {
    const tenantId = 'default-tenant-id'; // In a real app, this would come from auth
    const userId = 'admin-user-id'; // In a real app, this would come from auth
    
    const agentData = {
      ...req.body,
      tenant_id: tenantId,
      created_by: userId
    };

    const newAgent = await agentDbService.registerAgent(agentData);
    res.status(201).json(newAgent);
  } catch (error: any) {
    console.error('Error registering agent:', error.message);
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const updatedAgent = await agentDbService.updateAgent(req.params.id, req.body);
    res.json(updatedAgent);
  } catch (error: any) {
    console.error('Error updating agent:', error.message);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await agentDbService.deleteAgent(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting agent:', error.message);
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/check-health', async (req, res) => {
  try {
    const agent = await agentDbService.getAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent topilmadi' });
    }

    let status = 'active';
    if (agent.webhook_url || agent.webhookUrl) {
      const url = agent.webhook_url || agent.webhookUrl;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'ping' }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        // If fetch succeeds (even with 4xx/5xx), the server is reachable
        status = 'active';
      } catch (error) {
        // Network error, timeout, or DNS failure
        status = 'error';
      }
    } else {
      // No webhook URL, consider it active or pending depending on your logic
      status = 'active';
    }

    const updatedAgent = await agentDbService.updateAgent(req.params.id, { status });
    res.json(updatedAgent);
  } catch (error: any) {
    console.error('Error checking agent health:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
