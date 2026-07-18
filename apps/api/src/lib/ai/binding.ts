import db from '../db/settings.js';

export class AIEngineBinding {
  static async generateContent(userId: string, prompt: string) {
    try {
      // 1. Fetch User and Tenant Info
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
      if (!user) {
        throw new Error('User not found');
      }

      const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(user.tenant_id) as any;

      // 2. Fetch User Settings (Legacy compatibility)
      const userSettings = db.prepare('SELECT * FROM UserSettings WHERE user_id = ?').get(userId) as any;
      const integrationSettings = db.prepare('SELECT * FROM IntegrationSettings WHERE user_id = ?').get(userId) as any;

      if (!userSettings || !integrationSettings) {
        console.warn(`[AI] Settings not found for user ${userId}, using defaults.`);
      }

      // 3. Check AI Enablement
      if (integrationSettings && !integrationSettings.openai_api_key) {
        console.warn(`[AI] External AI API disabled for user ${userId}`);
        return { success: false, reason: 'AI disabled' };
      }

      // 4. Apply AI Verbosity Level
      const aiVerbosityLevel = userSettings?.compact_mode ? 'concise' : 'detailed';

      // 5. Generate Content
      console.log(`[AI] Generating content for user ${userId} (Tenant: ${tenant?.name}) with verbosity ${aiVerbosityLevel}`);
      
      // ... actual generation logic ...
      return { success: true, content: `Generated content with ${aiVerbosityLevel} verbosity for tenant ${tenant?.name}.` };
    } catch (error) {
      console.error('Failed to generate AI content:', error);
      return { success: false, error };
    }
  }
}

