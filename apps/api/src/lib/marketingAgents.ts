import { Type } from '@google/genai';
import { callGeminiWithRetry } from './gemini';
import { logAIFailure } from './aiLogger';

// --- TYPES & INTERFACES ---

export interface MarketInsights {
  trends: string[];
  competitors: { name: string; strengths: string[]; weaknesses: string[] }[];
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  customerSentiment: string;
}

export interface CampaignStrategy {
  channels: { name: string; budget: string; targetAudience: string }[];
  objectives: string[];
  timeline: string;
  keyMetrics: string[];
}

export interface PerformanceOptimization {
  recommendations: { channel: string; action: string; expectedImpact: string }[];
  bidAdjustments: string;
  creativeSuggestions: string[];
}

export interface CampaignPerformanceAnalysis {
  roiAnalysis: string;
  cpaAnalysis: string;
  ctrAnalysis: string;
  overallPerformance: string;
  actionableInsights: string[];
}

export interface ContentMessaging {
  adCopy: { headline: string; body: string; cta: string }[];
  visualConcepts: string[];
  brandVoice: string;
}

export interface GrowthForecast {
  projections: { month: string; revenue: number; users: number }[];
  assumptions: string[];
  riskFactors: string[];
}

export interface UnifiedGrowthPlan {
  executiveSummary: string;
  strategicRoadmap: string[];
  budgetAllocation: string;
  expectedROI: string;
  nextSteps: string[];
}

// --- AGENT PROMPTS ---

const MARKET_ANALYST_PROMPT = `
ROLE: Market Analyst AI (Bozor Tahlilchisi)
TASK: Bozor dinamikasini, raqobatchilar strategiyasini va iste'molchi xatti-harakatlarini chuqur tahlil qilish.
OBJECTIVE: Ma'lumotlarga asoslangan (data-driven) tushunchalar orqali bozor imkoniyatlarini aniqlash.
CORE TASKS:
1. Sanoat trendlarini miqdoriy tahlil qilish (o'sish sur'atlari, bozor hajmi).
2. Raqobatchilarning narx siyosati, marketing kanallari va bozor ulushini tahlil qilish.
3. SWOT tahlilini aniq faktlar va raqamlar asosida o'tkazish.
4. Ijtimoiy tarmoqlar va sharhlar asosida mijozlar sentimentini (kayfiyatini) foizlarda baholash.
OUTPUT: Aniq raqamlar, foizlar va dalillarga asoslangan tahliliy hisobot.
LANGUAGE: Uzbek
`;

const CAMPAIGN_STRATEGIST_PROMPT = `
ROLE: Campaign Strategist AI (Kampaniya Strategi)
TASK: Maksimal ROI (daromadlilik) keltiruvchi ko'p kanalli marketing kampaniyalarini loyihalash.
OBJECTIVE: Byudjetni eng samarali kanallar bo'yicha taqsimlash va aniq KPI'larni belgilash.
CORE TASKS:
1. Kampaniya maqsadlarini SMART (aniq, o'lchanadigan, erishiladigan, dolzarb, vaqtga bog'liq) formatida belgilash.
2. Kanallarni tanlash (Social, Search, Display, Email) va ularning kutilayotgan samaradorligini asoslash.
3. Byudjetni kanallar bo'yicha matematik optimallashtirish (past CAC va yuqori LTV'ga yo'naltirilgan).
4. Maqsadli auditoriyani demografik, psixografik va xulq-atvor xususiyatlari bo'yicha segmentlash.
OUTPUT: Strategik kampaniya rejasi, byudjet taqsimoti va kutilayotgan KPI ko'rsatkichlari.
LANGUAGE: Uzbek
`;

const PERFORMANCE_OPTIMIZER_PROMPT = `
ROLE: Performance Optimizer AI (Samaradorlikni Optimallashtiruvchi)
TASK: Marketing kampaniyalarining real vaqtdagi ko'rsatkichlarini tahlil qilish va samaradorlikni oshirish.
OBJECTIVE: Xarajatlarni kamaytirish va konversiya darajasini (CR) maksimal darajaga ko'tarish.
CORE TASKS:
1. CTR (bosish darajasi), CPC (bosish narxi), ROAS (reklama xarajatlari rentabelligi) ko'rsatkichlarini benchmarklar bilan solishtirish.
2. Byudjetni kam samarali kanallardan yuqori samarali kanallarga o'tkazish bo'yicha aniq tavsiyalar berish.
3. A/B test natijalarini tahlil qilish va eng yaxshi kreativlarni aniqlash.
4. Funnel (sotuv voronkasi) dagi uzilish nuqtalarini aniqlash va ularni bartaraf etish.
OUTPUT: Miqdoriy tavsiyalar, bid (stavka) tuzatishlari va kreativ optimallashtirish rejasi.
LANGUAGE: Uzbek
`;

const CAMPAIGN_PERFORMANCE_ANALYST_PROMPT = `
ROLE: Campaign Performance Analyst AI (Kampaniya Samaradorligi Tahlilchisi)
TASK: Marketing kampaniyalari samaradorligini ROI, CPA va CTR ma'lumotlari asosida tahlil qilish.
OBJECTIVE: Kampaniyalarning kuchli va zaif tomonlarini aniqlash hamda ularni yaxshilash bo'yicha amaliy tushunchalar berish.
CORE TASKS:
1. ROI (Investitsiya rentabelligi) ko'rsatkichlarini tahlil qilish va daromadlilikni baholash.
2. CPA (Har bir harakat uchun xarajat) ko'rsatkichlarini tahlil qilish va xarajatlar samaradorligini aniqlash.
3. CTR (Bosish darajasi) ko'rsatkichlarini tahlil qilish va auditoriya qiziqishini baholash.
4. Umumiy samaradorlikni xulosa qilish va amaliy tushunchalar (actionable insights) taqdim etish.
OUTPUT: ROI, CPA, CTR tahlillari, umumiy xulosa va amaliy tavsiyalar.
LANGUAGE: Uzbek
`;

const CONTENT_MESSAGING_PROMPT = `
ROLE: Content & Messaging AI (Kontent va Xabarlar Mutaxassisi)
TASK: Psixologik triggerlar va brend strategiyasiga asoslangan yuqori konversiyali kontent yaratish.
OBJECTIVE: Auditoriya e'tiborini jalb qilish va ularni harakatga (CTA) undash.
CORE TASKS:
1. Turli kanallar uchun (Facebook, Google Ads, Instagram) moslashtirilgan reklama matnlarini (headlines, body, CTA) yozish.
2. Vizual konsepsiyalarni auditoriya psixologiyasidan kelib chiqib ishlab chiqish.
3. Brend ovozini (Brand Voice) barcha kanallarda izchil saqlash.
4. Matnlarni A/B test uchun turli variantlarda (emotsional, ratsional, shoshilinch) tayyorlash.
OUTPUT: Tayyor reklama nusxalari, vizual yo'riqnomalar va kontent strategiyasi.
LANGUAGE: Uzbek
`;

const GROWTH_FORECAST_PROMPT = `
ROLE: Growth Forecast AI (O'sishni Bashorat qiluvchi)
TASK: Strategik ma'lumotlar va bozor trendlari asosida kelajakdagi o'sishni modellashtirish.
OBJECTIVE: Biznes qarorlari uchun aniq moliyaviy va operatsion prognozlarni taqdim etish.
CORE TASKS:
1. 6-12 oylik daromad (Revenue) va foydalanuvchilar o'sishini (User Acquisition) bashorat qilish.
2. Bashoratlar uchun matematik taxminlarni (assumptions) va o'sish drayverlarini keltirish.
3. Bozor o'zgaruvchanligi va raqobat asosida xavf omillarini (Risk Factors) miqdoriy baholash.
4. Turli ssenariylar (optimistik, realistik, pessimistik) bo'yicha prognozlar tayyorlash.
OUTPUT: Grafiklar uchun ma'lumotlar, o'sish prognozlari va xavf-xatarlarni boshqarish rejasi.
LANGUAGE: Uzbek
`;

const ORCHESTRATOR_PROMPT = `
ROLE: Marketing Orchestrator Agent (Marketing Orkeshtratori)
TASK: Barcha ixtisoslashgan AI agentlarining natijalarini yagona, yaxlit va strategik o'sish rejasiga birlashtirish.
MISSION: Strategiyaning barcha qismlari bir-birini to'ldirishini va umumiy biznes maqsadlariga xizmat qilishini ta'minlash.
CORE TASKS:
1. Sub-agentlar ma'lumotlarini sintez qilish va qarama-qarshiliklarni bartaraf etish.
2. Ijroiya xulosasini (Executive Summary) yuqori darajadagi menejment uchun tayyorlash.
3. Strategik yo'l xaritasini (Roadmap) ustuvorliklar asosida shakllantirish.
4. Kutilayotgan umumiy ROI va byudjet samaradorligini baholash.
OUTPUT: Yagona strategik o'sish rejasi (Unified Growth Plan), Roadmap va boshqaruv xulosasi.
LANGUAGE: Uzbek
`;

// --- AGENT IMPLEMENTATION ---

export class MarketingAgentFramework {
  // No constructor needed as we use the shared instance

  private async callAgent<T>(input: any, systemInstruction: string, responseSchema: any): Promise<T> {
    try {
      const response = await callGeminiWithRetry(
        "gemini-3.1-pro-preview",
        {
          contents: `Input Data: ${JSON.stringify(input)}\n\nUshbu ma'lumotlarni o'z rolingizga muvofiq qayta ishlang va JSON formatida javob bering.`,
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
      await logAIFailure(reason, input, "MARKETING_AGENT");
      throw error;
    }
  }

  async runMarketAnalyst(data: any): Promise<MarketInsights> {
    const schema = {
      type: Type.OBJECT,
      properties: {
        trends: { type: Type.ARRAY, items: { type: Type.STRING } },
        competitors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
        swot: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            threats: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        customerSentiment: { type: Type.STRING },
      },
      required: ["trends", "competitors", "swot", "customerSentiment"],
    };
    return this.callAgent<MarketInsights>(data, MARKET_ANALYST_PROMPT, schema);
  }

  async runCampaignStrategist(data: any): Promise<CampaignStrategy> {
    const schema = {
      type: Type.OBJECT,
      properties: {
        channels: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              budget: { type: Type.STRING },
              targetAudience: { type: Type.STRING },
            },
          },
        },
        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
        timeline: { type: Type.STRING },
        keyMetrics: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["channels", "objectives", "timeline", "keyMetrics"],
    };
    return this.callAgent<CampaignStrategy>(data, CAMPAIGN_STRATEGIST_PROMPT, schema);
  }

  async runPerformanceOptimizer(data: any): Promise<PerformanceOptimization> {
    const schema = {
      type: Type.OBJECT,
      properties: {
        recommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              channel: { type: Type.STRING },
              action: { type: Type.STRING },
              expectedImpact: { type: Type.STRING },
            },
          },
        },
        bidAdjustments: { type: Type.STRING },
        creativeSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["recommendations", "bidAdjustments", "creativeSuggestions"],
    };
    return this.callAgent<PerformanceOptimization>(data, PERFORMANCE_OPTIMIZER_PROMPT, schema);
  }

  async runCampaignPerformanceAnalyst(data: any): Promise<CampaignPerformanceAnalysis> {
    const schema = {
      type: Type.OBJECT,
      properties: {
        roiAnalysis: { type: Type.STRING },
        cpaAnalysis: { type: Type.STRING },
        ctrAnalysis: { type: Type.STRING },
        overallPerformance: { type: Type.STRING },
        actionableInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["roiAnalysis", "cpaAnalysis", "ctrAnalysis", "overallPerformance", "actionableInsights"],
    };
    return this.callAgent<CampaignPerformanceAnalysis>(data, CAMPAIGN_PERFORMANCE_ANALYST_PROMPT, schema);
  }

  async runContentMessaging(data: any): Promise<ContentMessaging> {
    const schema = {
      type: Type.OBJECT,
      properties: {
        adCopy: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              body: { type: Type.STRING },
              cta: { type: Type.STRING },
            },
          },
        },
        visualConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
        brandVoice: { type: Type.STRING },
      },
      required: ["adCopy", "visualConcepts", "brandVoice"],
    };
    return this.callAgent<ContentMessaging>(data, CONTENT_MESSAGING_PROMPT, schema);
  }

  async runGrowthForecast(data: any): Promise<GrowthForecast> {
    const schema = {
      type: Type.OBJECT,
      properties: {
        projections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              month: { type: Type.STRING },
              revenue: { type: Type.NUMBER },
              users: { type: Type.NUMBER },
            },
          },
        },
        assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
        riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["projections", "assumptions", "riskFactors"],
    };
    return this.callAgent<GrowthForecast>(data, GROWTH_FORECAST_PROMPT, schema);
  }

  async runOrchestrator(businessData: any) {
    // 1. Market Analysis
    const marketInsights = await this.runMarketAnalyst(businessData.market || {});
    
    // 2. Campaign Strategy
    const strategy = await this.runCampaignStrategist({ 
      insights: marketInsights, 
      budget: businessData.budget || "Noma'lum" 
    });

    // 3. Performance Optimization (based on current performance if provided)
    const optimization = await this.runPerformanceOptimizer({
      currentPerformance: businessData.performance || {},
      strategy
    });

    // 3.5. Campaign Performance Analysis
    const performanceAnalysis = await this.runCampaignPerformanceAnalyst({
      roiData: businessData.roiData || {},
      cpaData: businessData.cpaData || {},
      ctrData: businessData.ctrData || {},
      strategy
    });

    // 4. Content Generation
    const content = await this.runContentMessaging({ 
      strategy, 
      audience: businessData.audience || "Umumiy" 
    });

    // 5. Growth Forecast
    const forecast = await this.runGrowthForecast({ 
      strategy, 
      historical: businessData.historical || [] 
    });

    // 6. Final Orchestration
    const orchestratorSchema = {
      type: Type.OBJECT,
      properties: {
        executiveSummary: { type: Type.STRING },
        strategicRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
        budgetAllocation: { type: Type.STRING },
        expectedROI: { type: Type.STRING },
        nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["executiveSummary", "strategicRoadmap", "budgetAllocation", "expectedROI", "nextSteps"],
    };

    const finalPlan = await this.callAgent<UnifiedGrowthPlan>({
      marketInsights,
      strategy,
      optimization,
      performanceAnalysis,
      content,
      forecast
    }, ORCHESTRATOR_PROMPT, orchestratorSchema);

    return {
      marketInsights,
      strategy,
      optimization,
      performanceAnalysis,
      content,
      forecast,
      finalPlan
    };
  }
}
