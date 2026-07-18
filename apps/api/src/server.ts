import express from 'express';
import { ExecutionEngine } from './lib/workflow-engine/ExecutionEngine';
import { Workflow } from './lib/workflow-engine/types';
import { startTelegramBot, stopTelegramBot, getTelegramBotStatus } from './lib/telegram/bot';
import { processAICommand } from './lib/ai/agent';
import { GoogleGenAI } from '@google/genai';
import prisma from './lib/db/prisma.js';
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
app.get('/api/finance/accounts', requireAuth, requireRole(['VIEWER']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const accounts = await prisma.account.findMany({ where: { tenant_id: tenantId, deleted_at: null } });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

app.post('/api/finance/accounts', requireAuth, requireRole(['MANAGER']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  const { name, currency = 'UZS', balance = 0 } = req.body;
  const id = `acc-${Date.now()}`;
  try {
    await prisma.account.create({ data: { id, tenant_id: tenantId, name, currency, balance } });
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.get('/api/finance/categories', requireAuth, requireRole(['VIEWER']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const categories = await prisma.transactionCategory.findMany({ where: { tenant_id: tenantId, deleted_at: null } });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/finance/transactions', requireAuth, requireRole(['VIEWER']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const transactions = await prisma.$queryRaw`
      SELECT t.*, a.name as account_name, c.name as category_name 
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN transaction_categories c ON t.category_id = c.id
      WHERE t.tenant_id = ${tenantId} AND t.deleted_at IS NULL
      ORDER BY t.transaction_date DESC
      LIMIT 100
    `;
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/finance/transactions', requireAuth, requireRole(['MANAGER']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  const { account_id, category_id, type, amount, transaction_date, description, counterparty } = req.body;
  const id = `txn-${Date.now()}`;
  try {
    await prisma.$transaction([
      prisma.transaction.create({
        data: { id, tenant_id: tenantId, account_id, category_id, type, amount, transaction_date: new Date(transaction_date), description, counterparty }
      }),
      ...(type === 'income'
        ? [prisma.account.update({ where: { id: account_id }, data: { balance: { increment: amount } } })]
        : type === 'expense'
        ? [prisma.account.update({ where: { id: account_id }, data: { balance: { decrement: amount } } })]
        : []),
    ]);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.get('/api/finance/summary', requireAuth, requireRole(['VIEWER']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const incomeAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { tenant_id: tenantId, type: 'income', deleted_at: null },
    });
    const expenseAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { tenant_id: tenantId, type: 'expense', deleted_at: null },
    });

    const totalIncome = incomeAgg._sum.amount ?? 0;
    const totalExpense = expenseAgg._sum.amount ?? 0;
    const netProfit = Number(totalIncome) - Number(totalExpense);
    
    res.json({
      totalIncome,
      totalExpense,
      netProfit,
      ebitda: Number(totalIncome) > 0 ? ((netProfit / Number(totalIncome)) * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Telegram Settings API
app.get('/api/telegram/settings', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const settings = await prisma.telegramSettings.findFirst({ where: { tenant_id: tenantId } });
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/telegram/settings', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  const { bot_token, system_prompt, custom_code, auto_reply, use_custom_code, is_active } = req.body;
  
  try {
    const existing = await prisma.telegramSettings.findFirst({ where: { tenant_id: tenantId } });
    if (existing) {
      await prisma.telegramSettings.update({
        where: { tenant_id: tenantId },
        data: { bot_token, system_prompt, custom_code, auto_reply, use_custom_code, is_active, updated_at: new Date() },
      });
    } else {
      await prisma.telegramSettings.create({
        data: { tenant_id: tenantId, bot_token, system_prompt, custom_code, auto_reply, use_custom_code, is_active },
      });
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
    await prisma.telegramSettings.updateMany({ where: { tenant_id: tenantId }, data: { is_active: true } });
    const success = await startTelegramBot(tenantId);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start bot' });
  }
});

app.post('/api/telegram/stop', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    await prisma.telegramSettings.updateMany({ where: { tenant_id: tenantId }, data: { is_active: false } });
    await stopTelegramBot();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop bot' });
  }
});

app.get('/api/telegram/messages', requireAuth, requireRole(['VIEWER']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    const messages = await prisma.telegramMessage.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/telegram/messages', requireAuth, requireRole(['MANAGER']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  const { chat_id, text } = req.body;
  try {
    const settings = await prisma.telegramSettings.findFirst({ where: { tenant_id: tenantId } }) as any;
    if (!settings || !settings.bot_token) {
      return res.status(400).json({ error: 'Bot token not found' });
    }
    
    const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text })
    });
    
    if (response.ok) {
      await prisma.telegramMessage.create({
        data: { tenant_id: tenantId, chat_id, username: 'AI-BOS Bot (Manual)', text, is_bot: true }
      });
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to send message to Telegram' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.delete('/api/telegram/messages', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const tenantId = 'default-tenant-id';
  try {
    await prisma.telegramMessage.deleteMany({ where: { tenant_id: tenantId } });
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
app.get('/api/v1/customers', requireAuth, requireRole(['VIEWER']), async (req, res) => {
  const customers = await prisma.customer.findMany({ where: { deleted_at: null } });
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
      await prisma.legacyAuditLog.create({
        data: {
          user_id: 'system',
          tenant_id: 'default',
          action: 'AI_VOICE_FAILURE',
          module: 'VOICE_AGENT',
          ip_address: req.ip ?? '',
          old_value: 'Voice Command',
          new_value: errorMessage,
        }
      });
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
      console.log('[Server] Disconnecting Prisma Client...');
      await prisma.$disconnect();
    } catch (e) {
      console.error('[Server] Error disconnecting Prisma during shutdown:', e);
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
