import { Type } from '@google/genai';
import { MarketingAgentFramework } from './marketingAgents';
import { FinanceAgentFramework } from './financeAgents';
import { WorkflowAgentFramework } from './workflowAgents';
import { callGeminiWithRetry } from './gemini';
import { logAIFailure } from './aiLogger';

const EXECUTION_AGENT_PROMPT = (language: string) => `
ROLE: Autonomous Enterprise Microservice Agent (AI-BOS Core)

MISSION:
Operate as a distributed business control intelligence layer.
You do NOT directly modify databases.
You ONLY generate structured actions.

CORE WORKFLOW:
1. Understand user intent.
2. Identify affected domain module.
3. Generate structured Action JSON.
4. Evaluate risk score.

RULES:
- Never produce unstructured execution instructions.
- Never assume missing data.
- Always provide measurable expected impact.
- Classify risk as 'low', 'medium', or 'high'.
- All text fields (expected_impact, etc.) MUST be in ${language} language.
`;

const RESULT_ANALYSIS_PROMPT = (language: string) => `
ROLE: Post-Execution Analysis Engine

MISSION:
Analyze the results of an executed action and generate a structured report.

RULES:
- Be concise.
- Focus on measurable KPIs and financial impact.
- Assess the new risk level.
- All report fields (action_performed, objects_affected, kpi_change, financial_impact, risk_impact, stability_check, confidence_level) MUST be written in ${language} language.
`;



const getLocalizedMessage = (lang: string, key: string) => {
  const messages: any = {
    uz: {
      connection_error: "AI xizmatiga ulanishda xatolik yuz berdi.",
      json_error: "AI javobini tahlil qilishda xatolik yuz berdi (Malformed JSON).",
      admin_required: "Admin tasdig'i talab qilinadi",
      success_generic: "Amal muvaffaqiyatli bajarildi.",
      success_read: "Ma'lumotlar muvaffaqiyatli olindi.",
      success_propose: "Taklif muvaffaqiyatli yaratildi.",
      report_error: "Amal bajarildi (Hisobot yaratishda xatolik)",
      unknown: "Noma'lum",
      low: "Past"
    },
    ru: {
      connection_error: "Ошибка подключения к сервису AI.",
      json_error: "Ошибка при анализе ответа AI (Неверный JSON).",
      admin_required: "Требуется подтверждение администратора",
      success_generic: "Действие выполнено успешно.",
      success_read: "Данные успешно получены.",
      success_propose: "Предложение успешно создано.",
      report_error: "Действие выполнено (Ошибка создания отчета)",
      unknown: "Неизвестно",
      low: "Низкий"
    },
    en: {
      connection_error: "Error connecting to AI service.",
      json_error: "Error parsing AI response (Malformed JSON).",
      admin_required: "Admin confirmation required",
      success_generic: "Action completed successfully.",
      success_read: "Data retrieved successfully.",
      success_propose: "Proposal created successfully.",
      report_error: "Action completed (Report generation error)",
      unknown: "Unknown",
      low: "Low"
    }
  };
  return messages[lang]?.[key] || messages['uz'][key];
};

export async function executeAICommand(command: string, context: any, language: string = 'uz') {
  // 1. Detect Intent & Route
  const intentPrompt = `
    User Command: "${command}"
    Context: ${JSON.stringify(context)}
    
    Analyze the command and generate a structured ActionIntent JSON.
    Available Modules: marketing, finance, inventory, hr, sales, workflow.
    If module is 'marketing', specify a 'sub_agent' if applicable: market_analyst, campaign_strategist, performance_optimizer, content_messaging, growth_forecast, orchestrator.
    If module is 'finance', specify a 'sub_agent' if applicable: finance_analyst.
    If module is 'workflow', specify a 'sub_agent' if applicable: workflow_analyst.
    
    IMPORTANT: All text fields in the JSON output MUST be written in the ${language} language.
  `;

  let intentResponse;
  try {
    intentResponse = await callGeminiWithRetry(
      "gemini-3.1-pro-preview",
      {
        contents: intentPrompt,
        config: {
          systemInstruction: EXECUTION_AGENT_PROMPT(language),
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }],
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action_type: { type: Type.STRING },
              module: { type: Type.STRING },
              sub_agent: { type: Type.STRING, nullable: true },
              target_id: { type: Type.STRING, nullable: true },
              risk_level: { type: Type.STRING, description: "low, medium, high" },
              expected_impact: { type: Type.STRING },
              requires_confirmation: { type: Type.BOOLEAN }
            },
            required: ["action_type", "module", "risk_level", "expected_impact", "requires_confirmation"]
          }
        }
      }
    );
  } catch (error: any) {
    const reason = error.message || getLocalizedMessage(language, 'connection_error');
    await logAIFailure(reason, context, command);
    return {
      status: "failed",
      reason,
      intent: null
    };
  }

  let intent;
  try {
    intent = JSON.parse(intentResponse.text || "{}");
  } catch (e) {
    const reason = getLocalizedMessage(language, 'json_error');
    await logAIFailure(reason, context, command);
    return {
      status: "failed",
      reason,
      intent: null
    };
  }

  // 2. Permission Validation (Mock)
  if (intent.requires_confirmation) {
    return {
      status: "blocked",
      reason: getLocalizedMessage(language, 'admin_required'),
      intent
    };
  }

  // 3. Execute Action (Router Logic)
  const action_id = `ACT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  let result;

  // ROUTER: Delegate to specialized agents
  if (intent.module === 'marketing') {
    const marketingFramework = new MarketingAgentFramework();
    let agentOutput;

    try {
      switch (intent.sub_agent) {
        case 'market_analyst':
          agentOutput = await marketingFramework.runMarketAnalyst(context);
          break;
        case 'campaign_strategist':
          agentOutput = await marketingFramework.runCampaignStrategist(context);
          break;
        case 'performance_optimizer':
          agentOutput = await marketingFramework.runPerformanceOptimizer(context);
          break;
        case 'content_messaging':
          agentOutput = await marketingFramework.runContentMessaging(context);
          break;
        case 'growth_forecast':
          agentOutput = await marketingFramework.runGrowthForecast(context);
          break;
        case 'orchestrator':
        default:
          agentOutput = await marketingFramework.runOrchestrator({
            market: context.market || "O'zbekiston bozori",
            budget: context.budget || "Noma'lum",
            audience: context.audience || "Barcha",
            historical: context.historical || "Ma'lumot yo'q"
          });
          break;
      }

      result = {
        success: true,
        action_id,
        message: `Marketing agenti (${intent.sub_agent || 'orchestrator'}) muvaffaqiyatli bajarildi.`,
        data: agentOutput
      };
    } catch (error: any) {
      result = {
        success: false,
        message: `Marketing agentini ishga tushirishda xatolik: ${error.message}`
      };
    }
  } else if (intent.module === 'finance') {
    const financeFramework = new FinanceAgentFramework();
    let agentOutput;

    try {
      // Currently only one main finance analyst agent
      agentOutput = await financeFramework.runFinanceAnalyst(context);

      result = {
        success: true,
        action_id,
        message: `Moliya agenti (finance_analyst) muvaffaqiyatli bajarildi.`,
        data: agentOutput
      };
    } catch (error: any) {
      result = {
        success: false,
        message: `Moliya agentini ishga tushirishda xatolik: ${error.message}`
      };
    }
  } else if (intent.module === 'workflow') {
    const workflowFramework = new WorkflowAgentFramework();
    let agentOutput;

    try {
      agentOutput = await workflowFramework.runWorkflowAnalyst(context);

      result = {
        success: true,
        action_id,
        message: `Ish oqimi agenti (workflow_analyst) muvaffaqiyatli bajarildi.`,
        data: agentOutput
      };
    } catch (error: any) {
      result = {
        success: false,
        message: `Ish oqimi agentini ishga tushirishda xatolik: ${error.message}`
      };
    }
  } else if (intent.action_type.toUpperCase() === "READ" || intent.action_type.toUpperCase() === "PROPOSE") {
    const responsePrompt = `As an AI-BOS Core agent, provide a realistic ${intent.action_type} response for the module '${intent.module}'. The user asked: '${command}'. Provide a concise, professional business response in ${language}.`;
    
    let aiResponse;
    try {
      aiResponse = await callGeminiWithRetry(
        "gemini-3.1-pro-preview",
        {
          contents: responsePrompt,
          config: {
            tools: [{ googleSearch: {} }],
          }
        }
      );
    } catch (error: any) {
      result = {
        success: false,
        message: error.message || "Javob yaratishda xatolik yuz berdi."
      };
    }
    
    if (aiResponse) {
      result = {
        success: true,
        action_id,
        message: intent.action_type.toUpperCase() === "READ" ? getLocalizedMessage(language, 'success_read') : getLocalizedMessage(language, 'success_propose'),
        data: { info: aiResponse.text }
      };
    }
  } else {
    // Mock execution for other actions
    result = {
      success: true,
      action_id,
      message: getLocalizedMessage(language, 'success_generic'),
      data: { affected_items: 3, value: 5000 },
      old_state: { metric: 2.0 },
      new_state: { metric: 3.8 }
    };
  }

  if (!result.success) {
    return {
      status: "failed",
      reason: result.message,
      intent,
      result
    };
  }

  // 4. Analyze Result
  if (intent.action_type.toUpperCase() === "READ" || intent.action_type.toUpperCase() === "PROPOSE" || intent.module === 'marketing' || intent.module === 'workflow') {
    return {
      status: "success",
      intent,
      result
    };
  }

  const reportPrompt = `
    Action Intent: ${JSON.stringify(intent)}
    Execution Result: ${JSON.stringify(result)}
    
    Analyze the execution and generate a PostExecutionReport JSON.
    IMPORTANT: All text fields in the JSON output MUST be written in the ${language} language.
  `;

  let reportResponse;
  try {
    reportResponse = await callGeminiWithRetry(
      "gemini-3.1-pro-preview",
      {
        contents: reportPrompt,
        config: {
          systemInstruction: RESULT_ANALYSIS_PROMPT(language),
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action_performed: { type: Type.STRING },
              objects_affected: { type: Type.STRING },
              kpi_change: { type: Type.STRING },
              financial_impact: { type: Type.STRING },
              risk_impact: { type: Type.STRING },
              stability_check: { type: Type.STRING },
              confidence_level: { type: Type.STRING }
            },
            required: ["action_performed", "objects_affected", "kpi_change", "financial_impact", "risk_impact", "stability_check", "confidence_level"]
          }
        }
      }
    );
  } catch (error: any) {
    // If report generation fails, return a default/error report but don't fail the whole action
    return {
      status: "success",
      intent,
      result,
      report: {
        action_performed: getLocalizedMessage(language, 'report_error'),
        objects_affected: getLocalizedMessage(language, 'unknown'),
        kpi_change: getLocalizedMessage(language, 'unknown'),
        financial_impact: getLocalizedMessage(language, 'unknown'),
        risk_impact: getLocalizedMessage(language, 'unknown'),
        stability_check: getLocalizedMessage(language, 'unknown'),
        confidence_level: getLocalizedMessage(language, 'low')
      }
    };
  }

  let report;
  try {
    report = JSON.parse(reportResponse.text || "{}");
  } catch (e) {
    report = {
      action_performed: getLocalizedMessage(language, 'unknown'),
      objects_affected: getLocalizedMessage(language, 'unknown'),
      kpi_change: getLocalizedMessage(language, 'unknown'),
      financial_impact: getLocalizedMessage(language, 'unknown'),
      risk_impact: getLocalizedMessage(language, 'unknown'),
      stability_check: getLocalizedMessage(language, 'unknown'),
      confidence_level: getLocalizedMessage(language, 'low')
    };
  }

  return {
    status: "success",
    intent,
    result,
    report
  };
}
