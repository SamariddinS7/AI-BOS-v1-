import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import prisma from '../db/prisma.js';

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
        
        try {
          const where: any = { metric };
          if (level) where.level = level;
          if (period_key) where.period_key = period_key;
          const data = await prisma.analyticsMetric.findMany({ where });
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

        try {
          let data: any[] = [];
          if (type === 'customers') {
            const where: any = { deleted_at: null };
            if (id) where.id = id;
            else if (search) where.name = { contains: search };
            data = await prisma.customer.findMany({ where });
          } else if (type === 'deals') {
            const where: any = { deleted_at: null };
            if (id) where.customer_id = id;
            else if (search) where.name = { contains: search };
            data = await prisma.deal.findMany({ where });
          } else if (type === 'interactions') {
            const where: any = { deleted_at: null };
            if (id) where.customer_id = id;
            data = await prisma.interaction.findMany({ where });
          }
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

        try {
          let data: any[] = [];
          if (type === 'employees') {
            const where: any = { deleted_at: null };
            if (search) {
              where.user = { OR: [{ first_name: { contains: search } }, { last_name: { contains: search } }] };
            }
            data = await prisma.employee.findMany({ where, include: { user: true, department: true } });
          } else if (type === 'departments') {
            data = await prisma.department.findMany({ where: { deleted_at: null } });
          } else if (type === 'kpi') {
            const where: any = { deleted_at: null };
            if (id) where.employee_id = id;
            data = await prisma.kpiRecord.findMany({ where });
          }
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

        try {
          let data: any[] = [];
          if (type === 'products') {
            const where: any = { deleted_at: null };
            if (search) where.name = { contains: search };
            data = await prisma.product.findMany({ where });
          } else if (type === 'stock') {
            const where: any = { deleted_at: null };
            if (id) where.product_id = id;
            data = await prisma.inventoryStock.findMany({ where, include: { product: true, warehouse: true } });
          } else if (type === 'warehouses') {
            data = await prisma.warehouse.findMany({ where: { deleted_at: null } });
          }
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

        try {
          let data: any[] = [];
          if (type === 'transactions') {
            const where: any = { deleted_at: null };
            if (id) where.id = id;
            data = await prisma.transaction.findMany({
              where,
              orderBy: { transaction_date: 'desc' },
              take: limit || 10,
            });
          } else if (type === 'accounts') {
            data = await prisma.account.findMany({ where: { deleted_at: null } });
          } else if (type === 'categories') {
            data = await prisma.transactionCategory.findMany({ where: { deleted_at: null } });
          }
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
