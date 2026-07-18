import express from 'express';
import { N8NService } from './N8NService.ts';
import { N8NIntegrationConfig, N8NWorkflowMapping } from './types.ts';

const router = express.Router();

// Mock Configuration (In real app, load from DB)
const mockConfig: N8NIntegrationConfig = {
  id: '1',
  instanceUrl: 'https://n8n.example.com',
  apiKeyHash: 'hashed_api_key',
  webhookSecret: 'secret_key',
  enabled: true,
  allowedEvents: ['marketing.roi_drop', 'crm.new_lead'],
  createdAt: new Date().toISOString(),
  lastHealthCheck: new Date().toISOString(),
  status: 'healthy',
};

const mockMappings: N8NWorkflowMapping[] = [
  {
    id: '1',
    internalEvent: 'marketing.roi_drop',
    n8nWorkflowId: 'wf_123',
    triggerMode: 'sync',
    retryPolicy: { maxRetries: 3, backoffFactor: 2, initialDelayMs: 1000 },
    timeoutMs: 5000,
    enabled: true,
  },
];

const n8nService = new N8NService(mockConfig, mockMappings);

// --- Admin API ---

router.get('/config', (req, res) => {
  res.json(mockConfig);
});

router.post('/config', (req, res) => {
  const newConfig = req.body;
  n8nService.updateConfig(newConfig);
  res.json({ message: 'Configuration updated successfully' });
});

router.get('/mappings', (req, res) => {
  res.json(mockMappings);
});

// --- Webhook Receiver (Inbound) ---

router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-n8n-signature'] as string;
    const timestamp = req.headers['x-n8n-timestamp'] as string;
    const payload = req.body;

    if (!signature || !timestamp) {
      return res.status(400).json({ error: 'Missing signature or timestamp' });
    }

    const result = await n8nService.handleWebhook(payload, signature, timestamp);
    res.json(result);
  } catch (error: any) {
    console.error('Webhook processing failed:', error.message);
    res.status(401).json({ error: error.message });
  }
});

// --- Test Trigger (Outbound) ---

router.post('/trigger-test', async (req, res) => {
  try {
    const { eventType, payload } = req.body;
    await n8nService.dispatchEvent(eventType, payload);
    res.json({ message: `Event ${eventType} dispatched to n8n` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
