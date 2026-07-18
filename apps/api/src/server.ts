import express from 'express';
import { ExecutionEngine } from './lib/workflow-engine/ExecutionEngine';
import { Workflow } from './lib/workflow-engine/types';
import { startTelegramBot, stopTelegramBot, getTelegramBotStatus } from './lib/telegram/bot';
import { processAICommand } from './lib/ai/agent';
import { GoogleGenAI } from '@google/genai';
import db from './lib/db/settings';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// archiver is CJS-only; cast to any to avoid ESM namespace type mismatch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const archiver = require('archiver') as any;
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WebSocketServer } from 'ws';

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import n8nRouter from './lib/n8n-integration/routes';
import settingsRouter from './routes/settings';
import analyticsRouter from './routes/analytics';
import crmRouter from './routes/crm';
import workflowsRouter from './routes/workflows';
import adminRouter from './routes/admin';
import integrationsRouter from './routes/integrations';
import accountingRouter from './routes/accounting';
import agentsRouter from './routes/agents';
import skillsRouter from './routes/skills';
import authRouter from './routes/auth';
import { apiGatewayMiddleware } from './middleware/gateway';
import { requireAuth } from './middleware/auth.js';
import { requireRole } from './middleware/rbac.js';

const app = express();
// In monorepo dev mode: API runs on API_PORT (5001), Vite runs on PORT (5000).
// In production: API runs on PORT (serves static frontend too).
const PORT = Number(process.env.API_PORT) || Number(process.env.PORT) || 5001;
console.log('APP_AUTH_TOKEN:', process.env.APP_AUTH_TOKEN ? 'DEFINED' : 'UNDEFINED');

// Middleware
app.use(express.json({ limit: '50mb' }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Initialize the Workflow Engine
const engine = new ExecutionEngine();

// Initialize Gemini (Lazy Initialization)
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing');
      throw new Error('GEMINI_API_KEY is missing');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Finance API
app.get('/api/finance/accounts', requireAuth, requireRole(['VIEWER']), (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const accounts = db.prepare('SELECT * FROM accounts WHERE tenant_id = ? AND deleted_at IS NULL').all(tenantId);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

app.post('/api/finance/accounts', requireAuth, requireRole(['MANAGER']), (req, res) => {
  const tenantId = 'default-tenant-id';
  const { name, currency = 'UZS', balance = 0 } = req.body;
  const id = `acc-${Date.now()}`;
  try {
    db.prepare('INSERT INTO accounts (id, tenant_id, name, currency, balance) VALUES (?, ?, ?, ?, ?)').run(id, tenantId, name, currency, balance);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.get('/api/finance/categories', requireAuth, requireRole(['VIEWER']), (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const categories = db.prepare('SELECT * FROM transaction_categories WHERE tenant_id = ? AND deleted_at IS NULL').all(tenantId);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/finance/transactions', requireAuth, requireRole(['VIEWER']), (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const transactions = db.prepare(`
      SELECT t.*, a.name as account_name, c.name as category_name 
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN transaction_categories c ON t.category_id = c.id
      WHERE t.tenant_id = ? AND t.deleted_at IS NULL
      ORDER BY t.transaction_date DESC
      LIMIT 100
    `).all(tenantId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/finance/transactions', requireAuth, requireRole(['MANAGER']), (req, res) => {
  const tenantId = 'default-tenant-id';
  const { account_id, category_id, type, amount, transaction_date, description, counterparty } = req.body;
  const id = `txn-${Date.now()}`;
  try {
    db.transaction(() => {
      db.prepare(`
        INSERT INTO transactions (id, tenant_id, account_id, category_id, type, amount, transaction_date, description, counterparty) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, tenantId, account_id, category_id, type, amount, transaction_date, description, counterparty);
      
      // Update account balance
      if (type === 'income') {
        db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, account_id);
      } else if (type === 'expense') {
        db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, account_id);
      }
    })();
    res.json({ success: true, id });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.get('/api/finance/summary', requireAuth, requireRole(['VIEWER']), (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const income = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE tenant_id = ? AND type = 'income' AND deleted_at IS NULL").get(tenantId) as any;
    const expense = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE tenant_id = ? AND type = 'expense' AND deleted_at IS NULL").get(tenantId) as any;
    
    const totalIncome = income?.total || 0;
    const totalExpense = expense?.total || 0;
    const netProfit = totalIncome - totalExpense;
    
    res.json({
      totalIncome,
      totalExpense,
      netProfit,
      ebitda: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Telegram Settings API
app.get('/api/telegram/settings', requireAuth, requireRole(['ADMIN']), (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const settings = db.prepare('SELECT * FROM TelegramSettings WHERE tenant_id = ?').get(tenantId);
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/telegram/settings', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  const { bot_token, system_prompt, custom_code, auto_reply, use_custom_code, is_active } = req.body;
  
  try {
    const existing = db.prepare('SELECT tenant_id FROM TelegramSettings WHERE tenant_id = ?').get(tenantId);
    if (existing) {
      db.prepare(`
        UPDATE TelegramSettings 
        SET bot_token = ?, system_prompt = ?, custom_code = ?, auto_reply = ?, use_custom_code = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE tenant_id = ?
      `).run(bot_token, system_prompt, custom_code, auto_reply ? 1 : 0, use_custom_code ? 1 : 0, is_active ? 1 : 0, tenantId);
    } else {
      db.prepare(`
        INSERT INTO TelegramSettings (tenant_id, bot_token, system_prompt, custom_code, auto_reply, use_custom_code, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(tenantId, bot_token, system_prompt, custom_code, auto_reply ? 1 : 0, use_custom_code ? 1 : 0, is_active ? 1 : 0);
    }

    if (is_active) {
      await startTelegramBot(tenantId);
    } else {
      await stopTelegramBot();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update telegram settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.get('/api/telegram/status', requireAuth, requireRole(['VIEWER']), (req, res) => {
  res.json({ isPolling: getTelegramBotStatus() });
});

app.post('/api/telegram/start', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    db.prepare('UPDATE TelegramSettings SET is_active = 1 WHERE tenant_id = ?').run(tenantId);
    const success = await startTelegramBot(tenantId);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start bot' });
  }
});

app.post('/api/telegram/stop', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    db.prepare('UPDATE TelegramSettings SET is_active = 0 WHERE tenant_id = ?').run(tenantId);
    await stopTelegramBot();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop bot' });
  }
});

app.get('/api/telegram/messages', requireAuth, requireRole(['VIEWER']), (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const messages = db.prepare('SELECT * FROM TelegramMessages WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50').all(tenantId);
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/telegram/messages', requireAuth, requireRole(['MANAGER']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  const { chat_id, text } = req.body;
  try {
    const settings = db.prepare('SELECT bot_token FROM TelegramSettings WHERE tenant_id = ?').get(tenantId) as any;
    if (!settings || !settings.bot_token) {
      return res.status(400).json({ error: 'Bot token not found' });
    }
    
    const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text })
    });
    
    if (response.ok) {
      db.prepare('INSERT INTO TelegramMessages (tenant_id, chat_id, username, text, is_bot) VALUES (?, ?, ?, ?, 1)').run(
        tenantId, chat_id, 'AI-BOS Bot (Manual)', text
      );
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to send message to Telegram' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.delete('/api/telegram/messages', requireAuth, requireRole(['ADMIN']), (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    db.prepare('DELETE FROM TelegramMessages WHERE tenant_id = ?').run(tenantId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

// Telegram API Proxy
app.post('/api/telegram/proxy', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { token, method, body } = req.body;
  if (!token || !method) {
    return res.status(400).json({ ok: false, description: 'Token and method are required' });
  }

  const url = `https://api.telegram.org/bot${token}/${method}`;
  try {
    const response = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error(`Telegram proxy error (${method}):`, error);
    res.status(500).json({ ok: false, description: error.message || 'Proxy error' });
  }
});

// --- API Routes ---

// External API v1 (Protected by Gateway)
app.get('/api/v1/customers', requireAuth, requireRole(['VIEWER']), (req, res) => {
  const customers = db.prepare('SELECT * FROM Customers').all();
  res.json(customers);
});

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', version: 'v1.0.0' });
});

// Auth — must be registered BEFORE protected routes (no auth required for login/refresh)
app.use('/api/auth', authRouter);

// Analytics
app.use('/api/analytics', analyticsRouter);

// Settings
app.use('/api/settings', settingsRouter);

// n8n Integration
app.use('/api/integrations/n8n', n8nRouter);

// CRM
app.use('/api/crm', crmRouter);

// Accounting
app.use('/api/accounting', accountingRouter);

// Agents
app.use('/api/agents', agentsRouter);

// Skills
app.use('/api/skills/execute', (req, res) => {
  return res.json({ MAGIC: "THIS IS SERVER.TS ROOT" });
});

app.use('/api/skills', (req, res, next) => {
  console.log(`[API] Routing to Skills: ${req.method} ${req.url}`);
  next();
}, skillsRouter);

// Workflows
app.use('/api/workflows', workflowsRouter);

// Admin
app.use('/api/admin', adminRouter);

// Integrations
app.use('/api/integrations', integrationsRouter);

// System Download Endpoint — OWNER only (downloads entire project source)
app.get('/api/system/download', requireAuth, requireRole(['OWNER']), (req, res) => {
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  const fileName = `ai-bos-project-${new Date().toISOString().split('T')[0]}.zip`;

  res.attachment(fileName);

  archive.pipe(res);

  archive.glob('**/*', {
    cwd: process.cwd(),
    ignore: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      '*.db',
      '.env',
      '.DS_Store'
    ]
  });

  archive.finalize();
});

// Voice Processing
app.post('/voice/process', requireAuth, requireRole(['VIEWER']), async (req, res) => {
  console.log('Voice processing request received');
  try {
    const { audioBase64, lang } = req.body;
    console.log('Request body:', { lang, audioLength: audioBase64?.length });
    
    const ai = getAiClient();
    
    const sttResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      contents: [{
        parts: [{
          inlineData: {
            mimeType: 'audio/webm',
            data: audioBase64
          }
        }]
      }],
      config: {
        systemInstruction: `Transcribe the following audio in ${lang}. Return only the text.`
      }
    });
    const transcript = sttResponse.text || '';

    const resultMessage = await processAICommand(transcript, undefined, lang);

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: resultMessage }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    res.json({ 
      transcript,
      result: { success: true, message: resultMessage },
      audioBase64: audioData 
    });
  } catch (error: any) {
    const errorMessage = error.message || JSON.stringify(error);
    
    try {
      db.prepare(`
        INSERT INTO AuditLog (user_id, tenant_id, action, module, ip_address, old_value, new_value)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('system', 'default', 'AI_VOICE_FAILURE', 'VOICE_AGENT', req.ip, 'Voice Command', errorMessage);
    } catch (logError) {
      console.error('Failed to log AI failure to AuditLog:', logError);
    }

    if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
      return res.status(503).json({ error: 'AI xizmati mavjud emas (API kaliti noto\'g\'ri)' });
    }
    
    console.error('Voice processing error:', error);
    res.status(500).json({ 
      error: 'Kechirasiz, ovozli buyruqni qayta ishlashda xatolik yuz berdi.',
      details: errorMessage 
    });
  }
});

// NOTE: apiGatewayMiddleware (API-key auth for external /api/v1/* calls) is applied
// inside integrationsRouter for those specific routes. The global catch-all was removed
// because it was registered after all route handlers and never fired.

// API Catch-all
app.use('/api/*path', (req, res) => {
  console.warn(`[API] 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AI-BOS Automation Engine', env: process.env.NODE_ENV });
});

// --- Frontend Serving ---
// Dev:  Vite runs as a separate process on PORT 5000 (apps/web/vite.config.ts),
//       proxying /api and /voice requests to this API server on API_PORT 5001.
// Prod: This server statically serves the built frontend from apps/web/dist/.

async function startServer() {
  console.log(`Starting API server in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}...`);
  if (process.env.NODE_ENV === 'production') {
    // Serve built frontend from apps/web/dist/
    const webDist = path.resolve(__dirname, '../../web/dist');
    app.use(express.static(webDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(webDist, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`AI-BOS Engine initialized.`);

    setTimeout(async () => {
      try {
        console.log('Starting Telegram bot on startup...');
        await startTelegramBot('default-tenant-id');
      } catch (error) {
        console.error('Failed to start Telegram bot on startup:', error);
      }
    }, 5000);
  });

  // WebSocket Server for Real-time Analytics
  // Path '/ws' allows Vite dev proxy to forward WS connections from port 5000 → 5001
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('error', (err) => {
    console.error('WebSocket server error:', err);
  });

  wss.on('connection', (ws) => {
    console.log('Client connected to Real-time Analytics');

    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to AI-BOS Real-time Stream' }));

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // Simulate real-time data updates
  const simulationInterval = setInterval(() => {
    const modules = ['revenue', 'sales', 'marketing', 'hr', 'inventory', 'expenses', 'finance'];
    const randomModule = modules[Math.floor(Math.random() * modules.length)];
    
    const isAnomaly = Math.random() > 0.9;
    
    const update = isAnomaly ? {
      type: 'anomaly_detected',
      module: randomModule,
      data: {
        message: `Unusual ${randomModule} activity detected`,
        impact: `${(Math.random() * 5).toFixed(2)}% impact`,
        timestamp: new Date().toISOString()
      }
    } : {
      type: 'analytics_update',
      module: randomModule,
      data: {
        value: Math.floor(Math.random() * 10000) + 1000,
        message: `New ${randomModule} data received`,
        timestamp: new Date().toISOString()
      }
    };

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(update));
      }
    });
  }, 3000);

  // Graceful shutdown handler
  const shutdown = async (signal: string) => {
    console.log(`[Server] Received ${signal}. Starting graceful shutdown...`);
    clearInterval(simulationInterval);
    
    try {
      console.log('[Server] Stopping Telegram Bot...');
      await stopTelegramBot();
    } catch (e) {
      console.error('[Server] Error stopping Telegram bot during shutdown:', e);
    }

    try {
      console.log('[Server] Closing WebSocket Server...');
      wss.clients.forEach((client) => {
        client.close();
      });
      wss.close();
    } catch (e) {
      console.error('[Server] Error closing WebSockets during shutdown:', e);
    }

    try {
      console.log('[Server] Closing SQLite Database...');
      if (db && typeof db.close === 'function') {
        db.close();
      }
    } catch (e) {
      console.error('[Server] Error closing database during shutdown:', e);
    }

    console.log('[Server] Closing HTTP Server...');
    server.close(() => {
      console.log('[Server] HTTP Server closed successfully.');
      process.exit(0);
    });

    setTimeout(() => {
      console.warn('[Server] Force exiting after timeout');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
