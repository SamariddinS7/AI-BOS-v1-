import express from 'express';
import db from '../lib/db/settings';
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
router.get('/v1/customers', (req, res) => {
  const customers = db.prepare('SELECT * FROM Customers WHERE tenant_id = ?').all((req as any).apiKey.tenant_id);
  res.json(customers);
});

router.post('/v1/customers', (req, res) => {
  const { name, email, company } = req.body;
  const id = `CUST-${uuidv4().slice(0, 8).toUpperCase()}`;
  db.prepare(`
    INSERT INTO Customers (id, tenant_id, name, email, company, status)
    VALUES (?, ?, ?, ?, ?, 'Active')
  `).run(id, (req as any).apiKey.tenant_id, name, email, company);
  
  res.json({ id, name, email });
});

// --- Internal Management Routes (for the UI) ---

// Plugins
router.get('/plugins', (req, res) => {
  const plugins = db.prepare('SELECT * FROM Plugins').all();
  res.json(plugins);
});

router.post('/plugins/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.prepare('UPDATE Plugins SET status = ? WHERE id = ?').run(status, id);
  res.json({ success: true });
});

// Webhooks
router.get('/webhooks', (req, res) => {
  const webhooks = db.prepare('SELECT * FROM WebhookSubscriptions').all();
  res.json(webhooks);
});

router.post('/webhooks', (req, res) => {
  const { event_type, target_url, secret } = req.body;
  const id = uuidv4();
  db.prepare(`
    INSERT INTO WebhookSubscriptions (id, tenant_id, event_type, target_url, secret, status)
    VALUES (?, 'default', ?, ?, ?, 'active')
  `).run(id, event_type, target_url, secret);
  res.json({ id, event_type, target_url });
});

router.post('/webhooks/:id/test', async (req, res) => {
  const { id } = req.params;
  const webhook = db.prepare('SELECT * FROM WebhookSubscriptions WHERE id = ?').get(id) as any;
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
    const crypto = require('crypto');
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

    db.prepare(`
      INSERT INTO IntegrationLogs (tenant_id, integration_id, type, action, status, response_time, payload)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      webhook.tenant_id,
      webhook.id,
      'webhook',
      webhook.event_type,
      response.ok ? 'success' : 'error',
      0,
      JSON.stringify({
        url: webhook.target_url,
        status: response.status,
        payload
      })
    );

    res.json({ success: true, status: response.status, response: responseText });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API Keys
router.get('/api-keys', (req, res) => {
  const keys = db.prepare('SELECT id, name, scopes, status, created_at, expires_at FROM ApiKeys').all();
  res.json(keys);
});

router.post('/api-keys', (req, res) => {
  const { name, scopes } = req.body;
  const rawKey = `sk_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const id = uuidv4();
  
  db.prepare(`
    INSERT INTO ApiKeys (id, user_id, tenant_id, key_hash, name, scopes, status)
    VALUES (?, 'admin', 'default', ?, ?, ?, 'active')
  `).run(id, keyHash, name, JSON.stringify(scopes));
  
  res.json({ id, name, key: rawKey });
});

// Monitoring
router.get('/gateway/stats', (req, res) => {
  const stats = db.prepare(`
    SELECT 
      count(*) as total_requests,
      avg(response_time) as avg_latency,
      sum(case when status = 'error' then 1 else 0 end) as error_count
    FROM IntegrationLogs
    WHERE timestamp > datetime('now', '-24 hours')
  `).get();
  
  const recentLogs = db.prepare(`
    SELECT * FROM IntegrationLogs 
    ORDER BY timestamp DESC 
    LIMIT 50
  `).all();
  
  res.json({ stats, recentLogs });
});

export default router;
