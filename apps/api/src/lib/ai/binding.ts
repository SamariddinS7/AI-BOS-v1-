import prisma from '../db/prisma.js';

export class AIEngineBinding {
  static async generateContent(userId: string, prompt: string) {
    try {
      // 1. Fetch User and Tenant Info
      const user = await prisma.user.findFirst({ where: { id: userId, deleted_at: null } }) as any;
      if (!user) {
        throw new Error('User not found');
      }

      const tenant = await prisma.tenant.findFirst({ where: { id: user.tenant_id, deleted_at: null } }) as any;

      // 2. Fetch User Settings (Legacy compatibility)
      const userSettings = await prisma.userSettings.findFirst({ where: { user_id: userId } }) as any;
      const integrationSettings = await prisma.integrationSettings.findFirst({ where: { user_id: userId } }) as any;

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
