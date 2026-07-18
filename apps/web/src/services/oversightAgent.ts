import { T } from '../theme/designSystem';

/**
 * N8N dan keladigan ma'lumot formati
 */
export interface N8NMetricInput {
  module: 'sales' | 'crm' | 'inventory' | 'marketing';
  metric: string;
  value: number;
  expected: number;
  change_percent: number;
  threshold: number;
  timeframe: string;
  context?: string;
}

/**
 * Avtomatik trigger natijasi
 */
export interface AutoTriggerResult {
  action_type: string;
  target_id: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Agent hisoboti formati
 */
export interface OversightReport {
  type: 'alert' | 'strategy' | 'failsafe';
  status: string;
  observations: string[];
  recommendations: string[];
  planType: 'operational' | 'tactical' | 'strategic';
  urgency: 'low' | 'medium' | 'high' | 'CRITICAL';
  autoTrigger?: AutoTriggerResult;
}

/**
 * OversightAgent: Nazoratchi va Maslahatchi Agent mantiqi
 */
export class OversightAgent {
  
  /**
   * KPI Watchdog: Anomaliyalarni tekshiradi
   */
  static processMetric(input: N8NMetricInput): OversightReport {
    const isCritical = input.change_percent <= -50;
    const isAnomaly = input.change_percent <= input.threshold;

    if (isCritical) {
      return this.generateFailSafe(input);
    }

    if (isAnomaly) {
      return this.generateAlert(input);
    }

    return this.generateNormalStatus(input);
  }

  /**
   * 🚨 ANOMALIYA ALERT (Watchdog Role)
   */
  private static generateAlert(input: N8NMetricInput): OversightReport {
    return {
      type: 'alert',
      status: `${input.module} - ${input.metric} Down ${input.value.toLocaleString()} (${input.change_percent}%)`,
      observations: [
        `Ko'rsatkich kutilganidan (${input.expected}) past.`,
        `Ehtimoliy sabab: Kampaniya to'xtatilgan yoki CRM faolligi past.`
      ],
      recommendations: [
        `O'tgan haftadagi yuqori natijali kampaniyani qayta yoqing.`,
        `Mijozlar bilan aloqani kuchaytirish uchun avtomatik xabar yuboring.`
      ],
      planType: 'operational',
      urgency: input.change_percent < -25 ? 'high' : 'medium',
      autoTrigger: input.change_percent > -30 ? {
        action_type: "resume_campaign",
        target_id: `CAMPAIGN_${input.module.toUpperCase()}_01`,
        reason: `caused ${input.change_percent}% drop`,
        confidence: "high"
      } : undefined
    };
  }

  /**
   * 🔒 FAIL-SAFE (Emergency Role)
   */
  private static generateFailSafe(input: N8NMetricInput): OversightReport {
    return {
      type: 'failsafe',
      status: `CRITICAL DROP: ${input.metric} has fallen by ${input.change_percent}%`,
      observations: [
        "Tizimli uzilish yoki kritik xatolik aniqlandi.",
        "Ma'lumotlar oqimi 50% dan ko'proqqa kamaygan."
      ],
      recommendations: [
        "Darhol asoschi (founder) ga SMS xabar yuborish.",
        "Barcha avtomatik kampaniyalarni vaqtincha to'xtatish.",
        "Tizim holatini qo'lda tekshirish."
      ],
      planType: 'operational',
      urgency: 'CRITICAL'
    };
  }

  /**
   * 🧠 STRATEGIK MASLAHAT (Advisor Role)
   */
  static generateDailyStrategy(snapshot: N8NMetricInput[]): OversightReport {
    const avgChange = snapshot.reduce((a, b) => a + b.change_percent, 0) / snapshot.length;
    
    return {
      type: 'strategy',
      status: avgChange > 0 ? "O'sish tendensiyasi" : "Pasayish tendensiyasi",
      observations: snapshot.map(s => `${s.module}: ${s.change_percent}% o'zgarish.`),
      recommendations: [
        "Resurslarni eng yuqori ROI berayotgan kanallarga yo'naltiring.",
        "Kelgusi 30 kunlik prognozni qayta ko'rib chiqing."
      ],
      planType: 'strategic',
      urgency: 'low'
    };
  }

  private static generateNormalStatus(input: N8NMetricInput): OversightReport {
    return {
      type: 'strategy',
      status: "Barqaror holat",
      observations: [`${input.metric} normal chegarada.`],
      recommendations: ["Joriy strategiyani davom ettiring."],
      planType: 'tactical',
      urgency: 'low'
    };
  }
}
