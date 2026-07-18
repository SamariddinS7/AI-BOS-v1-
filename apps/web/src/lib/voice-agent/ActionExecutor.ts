import { VoiceCommand, ExecutionResult, IntentDefinition } from './types.ts';
import { IntentClassifier } from './IntentClassifier.ts';
import { logAIFailure } from '../aiLogger';

// Mock Services (Replace with real service calls)
const MockWorkflowService = {
  triggerWorkflow: async (id: string) => ({ success: true, message: `Workflow ${id} started.` })
};

const MockFinanceService = {
  getReport: async (period: string) => ({ success: true, data: { revenue: 150000, growth: '+12%' } })
};

const MockMarketingService = {
  optimizeCampaign: async (id: string, action?: string) => {
    if (action === 'increase_budget') {
      return { success: true, message: `Marketing budget for Campaign ${id} increased by 10%.` };
    }
    return { success: true, message: `Campaign ${id} optimized.` };
  }
};

export class ActionExecutor {
  private classifier: IntentClassifier;

  constructor(classifier: IntentClassifier) {
    this.classifier = classifier;
  }

  async execute(command: VoiceCommand, userPermissions: string[]): Promise<ExecutionResult> {
    const intentDef = this.classifier.getIntentDefinition(command.intent);

    if (!intentDef) {
      return { success: false, message: "I didn't understand that command." };
    }

    // 1. Security Check (RBAC)
    const missingPerms = intentDef.requiredPermissions.filter(p => !userPermissions.includes(p));
    if (missingPerms.length > 0) {
      return { success: false, message: `Access denied. Missing permissions: ${missingPerms.join(', ')}` };
    }

    // 2. Policy Check (Mock)
    if (command.intent === 'marketing.optimize' && command.entities.budget > 5000) {
      return { success: false, message: "Budget increase over $5000 requires manager approval." };
    }

    // 3. Execution Logic
    try {
      switch (command.intent) {
        case 'finance.report':
          const report = await MockFinanceService.getReport(command.entities.period);
          return { success: true, message: `Revenue for ${command.entities.period} is $${report.data.revenue}. Growth is ${report.data.growth}.`, data: report.data };

        case 'marketing.optimize':
          const result = await MockMarketingService.optimizeCampaign(command.entities.campaignId, command.entities.action);
          return { success: true, message: result.message };

        case 'workflow.trigger':
          const wfResult = await MockWorkflowService.triggerWorkflow(command.entities.workflowId);
          return { success: true, message: wfResult.message };

        default:
          return { success: false, message: "Action not implemented yet." };
      }
    } catch (error: any) {
      console.error(`Execution failed for ${command.intent}:`, error);
      const reason = error.message || "Buyruqni bajarishda xatolik yuz berdi.";
      await logAIFailure(reason, command, "VOICE_ACTION_EXECUTOR");
      return { success: false, message: reason };
    }
  }
}
