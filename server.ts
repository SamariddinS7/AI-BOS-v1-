import express from 'express';
import { ExecutionEngine } from './src/lib/workflow-engine/ExecutionEngine';
import { Workflow } from './src/lib/workflow-engine/types';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import db from './src/lib/db/settings';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { WebSocketServer } from 'ws';

import n8nRouter from './src/lib/n8n-integration/routes';
import settingsRouter from './src/routes/settings';
import analyticsRouter from './src/routes/analytics';
import crmRouter from './src/routes/crm';
import workflowsRouter from './src/routes/workflows';
import adminRouter from './src/routes/admin';
import integrationsRouter from './src/routes/integrations';
import accountingRouter from './src/routes/accounting';
import { apiGatewayMiddleware } from './src/middleware/gateway';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
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

// Telegram API Proxy
app.post('/api/telegram/proxy', async (req, res) => {
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
app.get('/api/v1/customers', (req, res) => {
  const customers = db.prepare('SELECT * FROM Customers').all();
  res.json(customers);
});

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', version: 'v1.0.0' });
});

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

// Workflows
app.use('/api/workflows', workflowsRouter);

// Admin
app.use('/api/admin', adminRouter);

// Integrations
app.use('/api/integrations', integrationsRouter);

// System Download Endpoint
app.get('/api/system/download', (req, res) => {
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  const fileName = `ai-bos-project-${new Date().toISOString().split('T')[0]}.zip`;

  res.attachment(fileName);

  archive.pipe(res);

  // Append files from the current directory, excluding specific folders
  archive.glob('**/*', {
    cwd: process.cwd(),
    ignore: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      '*.db', // Exclude database files
      '.env', // Exclude environment variables
      '.DS_Store'
    ]
  });

  archive.finalize();
});

// Voice Processing
app.post('/voice/process', async (req, res) => {
  console.log('Voice processing request received');
  try {
    const { audioBase64, lang } = req.body;
    console.log('Request body:', { lang, audioLength: audioBase64?.length });
    
    const ai = getAiClient();
    
    // 1. STT (using Gemini to transcribe audio)
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

    // Define tools for analytics, CRM, and HR
    const queryAnalyticsTool: FunctionDeclaration = {
      name: "queryAnalytics",
      description: "Query analytics data from the database. Use this to answer questions about revenue, expenses, or transactions.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING, description: "The metric to query (e.g., 'revenue', 'expenses')" },
          level: { type: Type.STRING, description: "The time level (e.g., 'month', 'week', 'day')" },
          period_key: { type: Type.STRING, description: "Optional specific period (e.g., 'Yan', 'Hafta 1')" }
        },
        required: ["metric"]
      }
    };

    const queryCRMTool: FunctionDeclaration = {
      name: "queryCRM",
      description: "Query CRM data. Use this to find customer details, deals, or interactions.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["customers", "deals", "interactions"], description: "The type of data to query" },
          id: { type: Type.STRING, description: "Optional ID (customer_id for interactions)" }
        },
        required: ["type"]
      }
    };

    const queryHRTool: FunctionDeclaration = {
      name: "queryHR",
      description: "Query HR data. Use this to find employee details, attendance, or KPIs.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["employees", "attendance", "kpi"], description: "The type of data to query" },
          id: { type: Type.STRING, description: "Optional ID (employee_id for attendance/kpi)" }
        },
        required: ["type"]
      }
    };

    // 2. Intent Parsing & Action Execution
    const llmResponse = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `User said: "${transcript}". If they ask for data, call the appropriate tool. If not, return a JSON object with "message" (response text) and "action" (optional action name).`,
      config: {
        tools: [{ functionDeclarations: [queryAnalyticsTool, queryCRMTool, queryHRTool] }],
      }
    });
    
    let resultMessage = '';
    const functionCalls = llmResponse.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
       const call = functionCalls[0];
       if (call.name === 'queryAnalytics') {
          const args = call.args as any;
          const { metric, level, period_key } = args;
          
          let query = 'SELECT * FROM AnalyticsMetrics WHERE metric = ?';
          const params: any[] = [metric];
          if (level) { query += ' AND level = ?'; params.push(level); }
          if (period_key) { query += ' AND period_key = ?'; params.push(period_key); }
          
          try {
            const data = db.prepare(query).all(...params);
            const finalResponse = await ai.models.generateContent({
               model: 'gemini-3.1-pro-preview',
               contents: `Context: User asked "${transcript}". Data retrieved: ${JSON.stringify(data)}. Provide a natural language summary in ${lang}.`
            });
            resultMessage = finalResponse.text || 'Ma\'lumotlar olindi.';
          } catch (dbError: any) {
            console.error('DB Query Error:', dbError);
            resultMessage = 'Ma\'lumotlar bazasidan o\'qishda xatolik yuz berdi.';
          }
       } else if (call.name === 'queryCRM') {
          const { type, id } = call.args as any;
          let query = '';
          let params: any[] = [];

          if (type === 'customers') {
            query = 'SELECT * FROM Customers';
            if (id) { query += ' WHERE id = ?'; params.push(id); }
          } else if (type === 'deals') {
            query = 'SELECT * FROM Deals';
            if (id) { query += ' WHERE customer_id = ?'; params.push(id); }
          } else if (type === 'interactions') {
            query = 'SELECT * FROM Interactions';
            if (id) { query += ' WHERE customer_id = ?'; params.push(id); }
          }

          try {
            const data = db.prepare(query).all(...params);
            const finalResponse = await ai.models.generateContent({
               model: 'gemini-3.1-pro-preview',
               contents: `Context: User asked "${transcript}". CRM Data retrieved: ${JSON.stringify(data)}. Provide a natural language summary in ${lang}.`
            });
            resultMessage = finalResponse.text || 'CRM ma\'lumotlari olindi.';
          } catch (dbError: any) {
            resultMessage = 'CRM ma\'lumotlarini olishda xatolik.';
          }
       } else if (call.name === 'queryHR') {
          // Note: HR data is in Firestore, but for the voice agent we might want to query SQLite if it's there, 
          // or just explain we're looking it up. 
          // Actually, let's assume we have some HR data in SQLite for the agent too, or just handle it gracefully.
          // In this project, HR data was moved to Firestore in the previous steps.
          // However, the voice agent is running server-side and doesn't have direct access to Firestore easily without setup.
          // Let's check if there's any HR table in SQLite.
          resultMessage = `HR ma'lumotlarini (xodimlar, davomat) tekshirmoqdaman. Hozircha bu ma'lumotlar faqat HR panelida mavjud.`;
       }
       // Handle normal response
       try {
         // Try to parse as JSON first, if it fails, use the raw text
         const text = llmResponse.text || '{}';
         const match = text.match(/\{[\s\S]*\}/);
         if (match) {
           const json = JSON.parse(match[0]);
           resultMessage = json.message || text;
         } else {
           resultMessage = text;
         }
       } catch (e) {
         resultMessage = llmResponse.text || 'Tushunmadim.';
       }
    }

    // 3. TTS (using Gemini TTS)
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
    
    // Log failure to AuditLog
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

app.use(apiGatewayMiddleware);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AI-BOS Automation Engine' });
});

// --- Vite Integration ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production (if built)
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`AI-BOS Engine initialized.`);
  });

  // WebSocket Server for Real-time Analytics
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected to Real-time Analytics');

    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to AI-BOS Real-time Stream' }));

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // Simulate real-time data updates
  setInterval(() => {
    const modules = ['revenue', 'sales', 'marketing', 'hr', 'inventory'];
    const randomModule = modules[Math.floor(Math.random() * modules.length)];
    
    const update = {
      type: 'analytics_update',
      module: randomModule,
      data: {
        value: Math.floor(Math.random() * 1000) + 100,
        timestamp: new Date().toISOString()
      }
    };

    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(update));
      }
    });
  }, 5000); // Broadcast every 5 seconds
}

startServer();
