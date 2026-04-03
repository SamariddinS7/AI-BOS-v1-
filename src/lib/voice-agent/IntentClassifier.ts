import { VoiceCommand, IntentDefinition, ExecutionResult, VoiceSession } from './types.ts';

// Mock AI Service for Intent Classification (Replace with real LLM/NLU call)
export class IntentClassifier {
  private intents: Map<string, IntentDefinition>;

  constructor() {
    this.intents = new Map();
    this.registerIntents();
  }

  private registerIntents() {
    this.intents.set('finance.report', {
      name: 'finance.report',
      description: 'Get financial report metrics',
      requiredPermissions: ['read:finance'],
      parameters: { period: 'string', metric: 'string' }
    });
    this.intents.set('marketing.optimize', {
      name: 'marketing.optimize',
      description: 'Optimize marketing campaigns',
      requiredPermissions: ['write:marketing'],
      parameters: { campaignId: 'string', action: 'string' }
    });
    this.intents.set('workflow.trigger', {
      name: 'workflow.trigger',
      description: 'Trigger an automation workflow',
      requiredPermissions: ['execute:workflow'],
      parameters: { workflowId: 'string' }
    });
    // Add more intents...
  }

  async classify(text: string, session: VoiceSession): Promise<VoiceCommand> {
    // Simulate minimal AI processing delay (e.g., 20ms)
    await new Promise(resolve => setTimeout(resolve, 20));

    const lowerText = text.toLowerCase();
    let intent = 'unknown';
    let entities: any = {};
    let confidence = 0.0;

    // Simple keyword-based logic for demonstration (Real system uses LLM/NLU)
    if (lowerText.includes('report') || lowerText.includes('hisobot') || lowerText.includes('otchet')) {
      intent = 'finance.report';
      confidence = 0.95;
      entities = { period: 'last_month', metric: 'revenue' }; // Mock extraction
    } else if (lowerText.includes('optimize') || lowerText.includes('optimallashtirish') || lowerText.includes('marketing') || lowerText.includes('byudjet')) {
      intent = 'marketing.optimize';
      confidence = 0.88;
      entities = { campaignId: 'cmp_123', action: 'increase_budget', budget: 500 };
    } else if (lowerText.includes('workflow') || lowerText.includes('ishga tushir')) {
      intent = 'workflow.trigger';
      confidence = 0.92;
      entities = { workflowId: 'wf_new_lead' };
    }

    return {
      id: crypto.randomUUID(),
      transcript: text,
      intent,
      entities,
      confidence,
      timestamp: Date.now(),
      userId: session.userId
    };
  }

  getIntentDefinition(intentName: string): IntentDefinition | undefined {
    return this.intents.get(intentName);
  }
}
