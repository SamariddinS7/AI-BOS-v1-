import { Type } from '@google/genai';
import { callGeminiWithRetry } from './gemini';
import { logAIFailure } from './aiLogger';

// --- TYPES & INTERFACES ---

export interface FinancialAnalysis {
  executiveSummary: string;
  budgetAnalysis: {
    totalBudget: string;
    actualSpend: string;
    variance: string;
    status: 'Under Budget' | 'Over Budget' | 'On Track';
  };
  expenseBreakdown: {
    category: string;
    amount: string;
    percentage: string;
    trend: 'up' | 'down' | 'stable';
  }[];
  forecast: {
    nextMonthProjection: string;
    quarterlyProjection: string;
    confidenceLevel: string;
  };
  recommendations: string[];
  riskAssessment: string;
}

// --- AGENT PROMPTS ---

const FINANCE_ANALYST_PROMPT = `
ROLE: Finance Analyst AI (Moliya Tahlilchisi)
TASK: Moliyaviy ma'lumotlarni tahlil qilish, byudjetlashtirish, prognozlash va xarajatlarni optimallashtirish.
OBJECTIVE: Biznesning moliyaviy sog'lomligini ta'minlash va samarali qarorlar qabul qilish uchun aniq tahlillarni taqdim etish.
CORE TASKS:
1. Byudjet tahlili (Budgeting): Rejalashtirilgan va haqiqiy xarajatlarni solishtirish, farqlarni (variance) aniqlash.
2. Xarajatlar tahlili (Expense Tracking): Xarajatlarni kategoriyalar bo'yicha ajratish va asosiy xarajat drayverlarini aniqlash.
3. Prognozlash (Forecasting): O'tgan davr ma'lumotlari asosida kelgusi oy va chorak uchun moliyaviy holatni bashorat qilish.
4. Tavsiyalar (Recommendations): Xarajatlarni qisqartirish va daromadlilikni oshirish bo'yicha aniq, amalga oshirish mumkin bo'lgan takliflar berish.
5. Xatarlarni baholash (Risk Assessment): Moliyaviy barqarorlikka tahdid soluvchi omillarni aniqlash.

INPUT DATA:
Foydalanuvchi tomonidan taqdim etilgan moliyaviy hisobotlar, tranzaksiyalar ro'yxati yoki byudjet parametrlari.

OUTPUT:
Aniq raqamlar, foizlar va tahliliy xulosalarga asoslangan tuzilgan JSON hisobot.
Barcha matnli maydonlar O'zbek tilida bo'lishi shart.
`;

// --- AGENT IMPLEMENTATION ---

export class FinanceAgentFramework {
  // No constructor needed as we use the shared instance

  private async callAgent<T>(input: any, systemInstruction: string, responseSchema: any): Promise<T> {
    try {
      const response = await callGeminiWithRetry(
        "gemini-3.1-pro-preview",
        {
          contents: `Input Data: ${JSON.stringify(input)}\n\nUshbu moliyaviy ma'lumotlarni tahlil qiling va JSON formatida javob bering.`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        }
      );
      return JSON.parse(response.text || "{}") as T;
    } catch (error: any) {
      const reason = error.message || "AI agentini ishga tushirishda xatolik yuz berdi.";
      await logAIFailure(reason, input, "FINANCE_AGENT");
      throw error;
    }
  }

  async runFinanceAnalyst(data: any): Promise<FinancialAnalysis> {
    const schema = {
      type: Type.OBJECT,
      properties: {
        executiveSummary: { type: Type.STRING },
        budgetAnalysis: {
          type: Type.OBJECT,
          properties: {
            totalBudget: { type: Type.STRING },
            actualSpend: { type: Type.STRING },
            variance: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['Under Budget', 'Over Budget', 'On Track'] },
          },
          required: ["totalBudget", "actualSpend", "variance", "status"],
        },
        expenseBreakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              amount: { type: Type.STRING },
              percentage: { type: Type.STRING },
              trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
            },
            required: ["category", "amount", "percentage", "trend"],
          },
        },
        forecast: {
          type: Type.OBJECT,
          properties: {
            nextMonthProjection: { type: Type.STRING },
            quarterlyProjection: { type: Type.STRING },
            confidenceLevel: { type: Type.STRING },
          },
          required: ["nextMonthProjection", "quarterlyProjection", "confidenceLevel"],
        },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        riskAssessment: { type: Type.STRING },
      },
      required: ["executiveSummary", "budgetAnalysis", "expenseBreakdown", "forecast", "recommendations", "riskAssessment"],
    };

    return this.callAgent<FinancialAnalysis>(data, FINANCE_ANALYST_PROMPT, schema);
  }
}
