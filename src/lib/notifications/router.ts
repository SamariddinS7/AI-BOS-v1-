import db from '../db/settings.js';

export class NotificationRouter {
  static async send(userId: string, type: 'marketing' | 'financial' | 'ai' | 'system', payload: any) {
    try {
      const prefs = db.prepare('SELECT * FROM NotificationSettings WHERE user_id = ?').get(userId) as any;
      if (!prefs) return;

      // 1. Check Alert Type Preferences
      if (type === 'marketing' && !prefs.marketing_alerts) return;
      if (type === 'financial' && !prefs.financial_alerts) return;
      if (type === 'ai' && !prefs.ai_alerts) return;
      if (type === 'system' && !prefs.system_alerts) return;

      // 2. Check Delivery Channels
      if (prefs.email_enabled) {
        this.sendEmail(userId, payload);
      }
      if (prefs.sms_enabled) {
        this.sendSMS(userId, payload);
      }
      if (prefs.push_enabled) {
        this.sendPush(userId, payload);
      }
    } catch (error) {
      console.error('Failed to route notification:', error);
    }
  }

  private static sendEmail(userId: string, payload: any) {
    console.log(`[Email] Sending to ${userId}:`, payload);
  }

  private static sendSMS(userId: string, payload: any) {
    console.log(`[SMS] Sending to ${userId}:`, payload);
  }

  private static sendPush(userId: string, payload: any) {
    console.log(`[Push] Sending to ${userId}:`, payload);
  }
}
