import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import db from '../db/settings';

export async function processAICommand(text: string, systemInstruction?: string, lang: string = 'uz') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');
  const ai = new GoogleGenAI({ apiKey });

  const queryAnalyticsTool: FunctionDeclaration = {
    name: "queryAnalytics",
    description: "Query analytics data from the database. Use this to answer questions about revenue, expenses, or general performance metrics.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        metric: { type: Type.STRING, description: "The metric to query (e.g., 'revenue', 'expenses', 'profit')" },
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
        id: { type: Type.STRING, description: "Optional ID (customer_id for interactions)" },
        search: { type: Type.STRING, description: "Search term for names or descriptions" }
      },
      required: ["type"]
    }
  };

  const queryHRTool: FunctionDeclaration = {
    name: "queryHR",
    description: "Query HR data. Use this to find employee details, departments, or KPIs.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ["employees", "departments", "kpi"], description: "The type of data to query" },
        id: { type: Type.STRING, description: "Optional ID (employee_id for kpi)" },
        search: { type: Type.STRING, description: "Search term for employee names" }
      },
      required: ["type"]
    }
  };

  const queryInventoryTool: FunctionDeclaration = {
    name: "queryInventory",
    description: "Query inventory data. Use this to find products, stock levels, or warehouses.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ["products", "stock", "warehouses"], description: "The type of data to query" },
        id: { type: Type.STRING, description: "Optional product ID" },
        search: { type: Type.STRING, description: "Search term for product names" }
      },
      required: ["type"]
    }
  };

  const queryAccountingTool: FunctionDeclaration = {
    name: "queryAccounting",
    description: "Query accounting data. Use this to find transactions, accounts, or categories.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ["transactions", "accounts", "categories"], description: "The type of data to query" },
        id: { type: Type.STRING, description: "Optional transaction ID" },
        limit: { type: Type.NUMBER, description: "Limit the number of results" }
      },
      required: ["type"]
    }
  };

  const llmResponse = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `User said: "${text}". If they ask for data, call the appropriate tool. If not, return a natural language response. ${systemInstruction ? 'System Instruction: ' + systemInstruction : ''}`,
    config: {
      tools: [{ functionDeclarations: [queryAnalyticsTool, queryCRMTool, queryHRTool, queryInventoryTool, queryAccountingTool] }],
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
             contents: `Context: User asked "${text}". Data retrieved: ${JSON.stringify(data)}. Provide a natural language summary in ${lang}.`
          });
          resultMessage = finalResponse.text || 'Ma\'lumotlar olindi.';
        } catch (dbError: any) {
          console.error('DB Query Error:', dbError);
          resultMessage = 'Ma\'lumotlar bazasidan o\'qishda xatolik yuz berdi.';
        }
     } else if (call.name === 'queryCRM') {
        const { type, id, search } = call.args as any;
        let query = '';
        let params: any[] = [];

        if (type === 'customers') {
          query = 'SELECT * FROM customers';
          if (id) { query += ' WHERE id = ?'; params.push(id); }
          else if (search) { query += ' WHERE name LIKE ?'; params.push(`%${search}%`); }
        } else if (type === 'deals') {
          query = 'SELECT * FROM deals';
          if (id) { query += ' WHERE customer_id = ?'; params.push(id); }
          else if (search) { query += ' WHERE name LIKE ?'; params.push(`%${search}%`); }
        } else if (type === 'interactions') {
          query = 'SELECT * FROM interactions';
          if (id) { query += ' WHERE customer_id = ?'; params.push(id); }
        }

        try {
          const data = db.prepare(query).all(...params);
          const finalResponse = await ai.models.generateContent({
             model: 'gemini-3.1-pro-preview',
             contents: `Context: User asked "${text}". CRM Data retrieved: ${JSON.stringify(data)}. Provide a natural language summary in ${lang}.`
          });
          resultMessage = finalResponse.text || 'CRM ma\'lumotlari olindi.';
        } catch (dbError: any) {
          resultMessage = 'CRM ma\'lumotlarini olishda xatolik.';
        }
     } else if (call.name === 'queryHR') {
        const { type, id, search } = call.args as any;
        let query = '';
        let params: any[] = [];

        if (type === 'employees') {
          query = 'SELECT e.*, u.first_name, u.last_name, d.name as department_name FROM employees e JOIN users u ON e.user_id = u.id LEFT JOIN departments d ON e.department_id = d.id';
          if (search) { query += ' WHERE u.first_name LIKE ? OR u.last_name LIKE ?'; params.push(`%${search}%`, `%${search}%`); }
        } else if (type === 'departments') {
          query = 'SELECT * FROM departments';
        } else if (type === 'kpi') {
          query = 'SELECT * FROM kpi_records';
          if (id) { query += ' WHERE employee_id = ?'; params.push(id); }
        }

        try {
          const data = db.prepare(query).all(...params);
          const finalResponse = await ai.models.generateContent({
             model: 'gemini-3.1-pro-preview',
             contents: `Context: User asked "${text}". HR Data retrieved: ${JSON.stringify(data)}. Provide a natural language summary in ${lang}.`
          });
          resultMessage = finalResponse.text || 'HR ma\'lumotlari olindi.';
        } catch (dbError: any) {
          resultMessage = 'HR ma\'lumotlarini olishda xatolik.';
        }
     } else if (call.name === 'queryInventory') {
        const { type, id, search } = call.args as any;
        let query = '';
        let params: any[] = [];

        if (type === 'products') {
          query = 'SELECT * FROM products';
          if (search) { query += ' WHERE name LIKE ?'; params.push(`%${search}%`); }
        } else if (type === 'stock') {
          query = 'SELECT s.*, p.name as product_name, w.name as warehouse_name FROM inventory_stock s JOIN products p ON s.product_id = p.id JOIN warehouses w ON s.warehouse_id = w.id';
          if (id) { query += ' WHERE s.product_id = ?'; params.push(id); }
        } else if (type === 'warehouses') {
          query = 'SELECT * FROM warehouses';
        }

        try {
          const data = db.prepare(query).all(...params);
          const finalResponse = await ai.models.generateContent({
             model: 'gemini-3.1-pro-preview',
             contents: `Context: User asked "${text}". Inventory Data retrieved: ${JSON.stringify(data)}. Provide a natural language summary in ${lang}.`
          });
          resultMessage = finalResponse.text || 'Ombor ma\'lumotlari olindi.';
        } catch (dbError: any) {
          resultMessage = 'Ombor ma\'lumotlarini olishda xatolik.';
        }
     } else if (call.name === 'queryAccounting') {
        const { type, id, limit } = call.args as any;
        let query = '';
        let params: any[] = [];

        if (type === 'transactions') {
          query = 'SELECT * FROM transactions';
          if (id) { query += ' WHERE id = ?'; params.push(id); }
          query += ' ORDER BY transaction_date DESC LIMIT ?';
          params.push(limit || 10);
        } else if (type === 'accounts') {
          query = 'SELECT * FROM accounts';
        } else if (type === 'categories') {
          query = 'SELECT * FROM transaction_categories';
        }

        try {
          const data = db.prepare(query).all(...params);
          const finalResponse = await ai.models.generateContent({
             model: 'gemini-3.1-pro-preview',
             contents: `Context: User asked "${text}". Accounting Data retrieved: ${JSON.stringify(data)}. Provide a natural language summary in ${lang}.`
          });
          resultMessage = finalResponse.text || 'Buxgalteriya ma\'lumotlari olindi.';
        } catch (dbError: any) {
          resultMessage = 'Buxgalteriya ma\'lumotlarini olishda xatolik.';
        }
     }
  } else {
    // Try to parse as JSON first, if it fails, use the raw text
    const responseText = llmResponse.text || '{}';
    const match = responseText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const json = JSON.parse(match[0]);
        resultMessage = json.message || responseText;
      } catch (e) {
        resultMessage = responseText;
      }
    } else {
      resultMessage = responseText;
    }
  }

  return resultMessage;
}
