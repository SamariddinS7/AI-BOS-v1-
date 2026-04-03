import { N8NIntegrationConfig, N8NWorkflowMapping, OutboundPayload } from './types.ts';
import { N8NConnector } from './N8NConnector.ts';
import { SecurityLayer } from './SecurityLayer.ts';

export class N8NService {
  private connector: N8NConnector;
  private config: N8NIntegrationConfig;
  private mappings: Map<string, N8NWorkflowMapping>;

  constructor(config: N8NIntegrationConfig, mappings: N8NWorkflowMapping[]) {
    this.config = config;
    this.connector = new N8NConnector(config);
    this.mappings = new Map(mappings.map(m => [m.internalEvent, m]));
  }

  /**
   * Dispatches an internal event to n8n if a mapping exists.
   * @param eventType The internal event type (e.g., 'marketing.roi_drop').
   * @param payload The event data.
   */
  async dispatchEvent(eventType: string, payload: any): Promise<void> {
    const mapping = this.mappings.get(eventType);
    if (!mapping || !mapping.enabled) {
      console.log(`No active n8n mapping for event: ${eventType}`);
      return;
    }

    const outboundPayload: OutboundPayload = {
      eventType,
      correlationId: crypto.randomUUID(),
      userContext: {
        userId: 'system', // Replace with actual user context
        role: 'admin',
        permissions: ['read:all'],
      },
      module: 'ai-bos-core',
      data: payload,
      timestamp: new Date().toISOString(),
    };

    try {
      if (mapping.triggerMode === 'sync') {
        await this.connector.triggerWorkflow(mapping.n8nWorkflowId, outboundPayload);
        console.log(`Successfully triggered n8n workflow ${mapping.n8nWorkflowId} for event ${eventType}`);
      } else {
        // Async mode: In a real system, push to Redis queue.
        // For now, we simulate async by not awaiting.
        this.connector.triggerWorkflow(mapping.n8nWorkflowId, outboundPayload).catch(err => {
          console.error(`Async n8n trigger failed for ${eventType}:`, err);
        });
      }
    } catch (error) {
      console.error(`Failed to dispatch event ${eventType} to n8n:`, error);
      // Implement retry logic here if needed
    }
  }

  /**
   * Handles inbound webhook from n8n.
   * @param payload The raw request body.
   * @param signature The signature from header.
   * @param timestamp The timestamp from header.
   */
  async handleWebhook(payload: any, signature: string, timestamp: string): Promise<any> {
    // 1. Verify Timestamp
    if (!SecurityLayer.validateTimestamp(timestamp)) {
      throw new Error('Invalid timestamp: Request expired.');
    }

    // 2. Verify Signature
    if (!SecurityLayer.verifySignature(payload, signature, this.config.webhookSecret)) {
      throw new Error('Invalid signature: HMAC verification failed.');
    }

    // 3. Process Payload
    console.log('Received valid webhook from n8n:', payload);
    
    // Here we would route the payload to the appropriate internal service
    // e.g., update CRM, trigger AI analysis, etc.
    
    return { status: 'success', message: 'Webhook processed successfully' };
  }

  /**
   * Updates the integration configuration.
   * @param newConfig The new configuration.
   */
  updateConfig(newConfig: Partial<N8NIntegrationConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.connector = new N8NConnector(this.config);
  }
}
