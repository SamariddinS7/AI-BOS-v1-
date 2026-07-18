import express from 'express';
import prisma from '../lib/db/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { apiGatewayMiddleware } from '../middleware/gateway';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// --- Public API Gateway Entry Point ---
// External requests via /api/v1/* use API-key auth (apiGatewayMiddleware)
router.use('/v1', apiGatewayMiddleware);

// All internal integration management endpoints require ADMIN role
router.use(requireAuth, requireRole(['ADMIN']));

// Example V1 API Routes
router.get('/v1/customers', async (req, res) => {
  const customers = await prisma.customer.findMany({
    where: { tenant_id: (req as any).apiKey.tenant_id, deleted_at: null }
  });
  res.json(customers);
});

router.post('/v1/customers', async (req, res) => {
  const { name, email, company } = req.body;
  const id = `CUST-${uuidv4().slice(0, 8).toUpperCase()}`;
  const customer = await prisma.customer.create({
    data: { id, tenant_id: (req as any).apiKey.tenant_id, name, email, company, status: 'Active' }
  });
  res.json({ id: customer.id, name: customer.name, email: customer.email });
});

// --- Internal Management Routes (for the UI) ---

// Plugins
router.get('/plugins', async (req, res) => {
  const plugins = await prisma.plugin.findMany();
  res.json(plugins);
});

router.post('/plugins/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await prisma.plugin.update({ where: { id }, data: { status } });
  res.json({ success: true });
});

// Webhooks
router.get('/webhooks', async (req, res) => {
  const webhooks = await prisma.webhookSubscription.findMany();
  res.json(webhooks);
});

router.post('/webhooks', async (req, res) => {
  const { event_type, target_url, secret } = req.body;
  const id = uuidv4();
  await prisma.webhookSubscription.create({
    data: { id, tenant_id: 'default', event_type, target_url, secret, status: 'active' }
  });
  res.json({ id, event_type, target_url });
});

router.post('/webhooks/:id/test', async (req, res) => {
  const { id } = req.params;
  const webhook = await prisma.webhookSubscription.findFirst({ where: { id } }) as any;
  if (!webhook) {
    return res.status(404).json({ error: 'Webhook not found' });
  }

  // Generate a test payload based on event_type or just a generic test message
  const payload = req.body.payload || {
    event: webhook.event_type || 'team.message',
    payload: {
      message: 'Test message from AI-BOS',
    }
  };

  try {
    const signatureHex = webhook.secret
      ? crypto.createHmac('sha256', webhook.secret).update(JSON.stringify(payload)).digest('hex')
      : null;

    const fetch = require('node-fetch');
    const response = await fetch(webhook.target_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-BOS-Event': webhook.event_type,
        'X-AI-BOS-Signature': signatureHex || '',
        'X-Webhook-Signature': signatureHex ? `sha256=${signatureHex}` : '',
      },
      body: JSON.stringify(payload),
      timeout: 5000
    });

    const responseText = await response.text();

    await prisma.integrationLog.create({
      data: {
        tenant_id: webhook.tenant_id,
        integration_id: webhook.id,
        type: 'webhook',
        action: webhook.event_type,
        status: response.ok ? 'success' : 'error',
        response_time: 0,
        payload: JSON.stringify({
          url: webhook.target_url,
          status: response.status,
          payload
        })
      }
    });

    res.json({ success: true, status: response.status, response: responseText });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API Keys
router.get('/api-keys', async (req, res) => {
  const keys = await prisma.apiKey.findMany({
    select: { id: true, name: true, scopes: true, status: true, created_at: true, expires_at: true }
  });
  res.json(keys);
});

router.post('/api-keys', async (req, res) => {
  const { name, scopes } = req.body;
  const rawKey = `sk_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const id = uuidv4();

  await prisma.apiKey.create({
    data: {
      id,
      user_id: 'admin',
      tenant_id: 'default',
      key_hash: keyHash,
      name,
      scopes: JSON.stringify(scopes),
      status: 'active'
    }
  });

  res.json({ id, name, key: rawKey });
});

// Monitoring
router.get('/gateway/stats', async (req, res) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalRequests, errorCount, avgLatencyResult, recentLogs] = await Promise.all([
    prisma.integrationLog.count({ where: { timestamp: { gt: twentyFourHoursAgo } } }),
    prisma.integrationLog.count({ where: { timestamp: { gt: twentyFourHoursAgo }, status: 'error' } }),
    prisma.integrationLog.aggregate({
      _avg: { response_time: true },
      where: { timestamp: { gt: twentyFourHoursAgo } }
    }),
    prisma.integrationLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    })
  ]);

  const stats = {
    total_requests: totalRequests,
    avg_latency: avgLatencyResult._avg.response_time ?? 0,
    error_count: errorCount
  };

  res.json({ stats, recentLogs });
});

export default router;
