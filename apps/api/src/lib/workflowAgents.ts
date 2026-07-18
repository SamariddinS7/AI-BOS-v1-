import { Type } from '@google/genai';
import { callGeminiWithRetry } from './gemini';
import { logAIFailure } from './aiLogger';

// --- TYPES & INTERFACES ---

export interface WorkflowPerformanceAnalysis {
  executiveSummary: string;
  bottlenecks: {
    nodeId: string;
    nodeLabel: string;
    issue: string; // e.g., "High Latency", "Frequent Failures"
    averageDurationMs: number;
    failureRate: string;
    impact: 'High' | 'Medium' | 'Low';
  }[];
  optimizations: {
    nodeId?: string;
    suggestion: string;
    expectedImprovement: string;
    complexity: 'High' | 'Medium' | 'Low';
  }[];
  overallHealthMetrics: {
    totalExecutions: number;
    successRate: string;
    averageCompletionTimeMs: number;
    criticalFailures: number;
  };
}

// --- AGENT PROMPTS ---

const WORKFLOW_ANALYST_PROMPT = `
ROLE: Workflow Performance Analyst AI (Jarayon Samaradorligini Tahlil Qiluvchi)
TASK: Ish oqimining (workflow) bajarilish jurnallarini (logs) tahlil qilish, tugunlar (nodes) darajasidagi qiyinchiliklarni (bottlenecks) aniqlash va optimallashtirish takliflarini berish.
OBJECTIVE: Tizimning ishlash tezligini, ishonchliligini va samaradorligini oshirish.

CORE TASKS:
1. Qiyinchiliklarni aniqlash (Bottleneck Identification): Qaysi tugunlar eng ko'p vaqt talab qilayotganini va tez-tez xatoliklarga olib kelayotganini aniqlang.
2. Optimallashtirish takliflari (Optimization Suggestions): Muammoli tugunlarni yoki ish oqimi arxitekturasini yaxshilash bo'yicha aniq tavsiyalar bering.
3. Umumiy holatni baholash (Overall Health): Ish oqimining umumiy muvaffaqiyat darajasi va o'rtacha bajarilish vaqtini hisoblang.

INPUT DATA:
Ish oqimining tugunlari (nodes), chekkalari (edges) va ularning bajarilish tarixi, jumladan qancha vaqt ketgani (durationMs), holati (success/failure) va xatoliklar (errors).

OUTPUT:
Aniq raqamlar, tahliliy baholar va tuzilgan JSON hisobot. Barcha matnli maydonlar O'zbek tilida bo'lishi shart (status va kategoriyalardan tashqari).
`;

// --- AGENT IMPLEMENTATION ---

export class WorkflowAgentFramework {
  private async callAgent<T>(input: any, systemInstruction: string, responseSchema: any): Promise<T> {
    try {
      const response = await callGeminiWithRetry(
        "gemini-3.1-pro-preview",
        {
          contents: `Input Data (Execution Logs & Workflow Config): ${JSON.stringify(input)}\n\nUshbu ish oqimi ma'lumotlarini tahlil qiling va JSON formatida javob bering.`,
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
      await logAIFailure(reason, input, "WORKFLOW_AGENT");
      throw error;
    }
  }

  async runWorkflowAnalyst(data: any): Promise<WorkflowPerformanceAnalysis> {
    const schema = {
      type: Type.OBJECT,
      properties: {
        executiveSummary: { type: Type.STRING },
        bottlenecks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nodeId: { type: Type.STRING },
              nodeLabel: { type: Type.STRING },
              issue: { type: Type.STRING },
              averageDurationMs: { type: Type.NUMBER },
              failureRate: { type: Type.STRING },
              impact: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            },
            required: ["nodeId", "nodeLabel", "issue", "averageDurationMs", "failureRate", "impact"],
          },
        },
        optimizations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nodeId: { type: Type.STRING, nullable: true },
              suggestion: { type: Type.STRING },
              expectedImprovement: { type: Type.STRING },
              complexity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            },
            required: ["suggestion", "expectedImprovement", "complexity"],
          },
        },
        overallHealthMetrics: {
          type: Type.OBJECT,
          properties: {
            totalExecutions: { type: Type.NUMBER },
            successRate: { type: Type.STRING },
            averageCompletionTimeMs: { type: Type.NUMBER },
            criticalFailures: { type: Type.NUMBER },
          },
          required: ["totalExecutions", "successRate", "averageCompletionTimeMs", "criticalFailures"],
        },
      },
      required: ["executiveSummary", "bottlenecks", "optimizations", "overallHealthMetrics"],
    };

    return this.callAgent<WorkflowPerformanceAnalysis>(data, WORKFLOW_ANALYST_PROMPT, schema);
  }
}
