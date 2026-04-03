export interface N8NIntegrationConfig {
  id: string;
  instanceUrl: string;
  apiKeyHash: string; // Stored securely
  webhookSecret: string; // For HMAC verification
  enabled: boolean;
  allowedEvents: string[];
  createdAt: string;
  lastHealthCheck: string;
  status: 'healthy' | 'degraded' | 'down';
}

export interface N8NWorkflowMapping {
  id: string;
  internalEvent: string; // e.g., 'marketing.roi_drop'
  n8nWorkflowId: string;
  triggerMode: 'sync' | 'async';
  retryPolicy: {
    maxRetries: number;
    backoffFactor: number; // e.g., 2 for exponential
    initialDelayMs: number;
  };
  timeoutMs: number;
  enabled: boolean;
}

export interface N8NWebhookLog {
  id: string;
  requestPayload: any;
  signatureValid: boolean;
  processed: boolean;
  responseStatus: number;
  timestamp: string;
  latencyMs: number;
}

export interface OutboundPayload {
  eventType: string;
  correlationId: string;
  userContext: {
    userId: string;
    role: string;
    permissions: string[];
  };
  module: string;
  data: any;
  timestamp: string;
}
