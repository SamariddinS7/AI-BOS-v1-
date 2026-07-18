export interface VoiceCommand {
  id: string;
  transcript: string;
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  timestamp: number;
  userId: string;
}

export interface IntentDefinition {
  name: string;
  description: string;
  requiredPermissions: string[];
  parameters: Record<string, string>; // e.g., { "period": "string", "metric": "number" }
}

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  requiresConfirmation?: boolean;
  confirmationContext?: any;
}

export interface VoiceSession {
  id: string;
  userId: string;
  startTime: number;
  lastInteraction: number;
  context: Record<string, any>; // Short-term memory
}

export type VoiceState = 'listening' | 'processing' | 'speaking' | 'idle' | 'error';

export interface TTSConfig {
  voiceId: string;
  language: 'uz' | 'ru' | 'en';
  speed: number;
}
