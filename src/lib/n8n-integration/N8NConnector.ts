import { N8NIntegrationConfig, N8NWorkflowMapping, OutboundPayload } from './types.ts';
import { SecurityLayer } from './SecurityLayer.ts';

interface CircuitBreakerState {
  status: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: number;
}

export class N8NConnector {
  private config: N8NIntegrationConfig;
  private circuitBreaker: CircuitBreakerState = {
    status: 'closed',
    failureCount: 0,
    lastFailureTime: 0,
  };

  private readonly MAX_FAILURES = 5;
  private readonly RESET_TIMEOUT_MS = 30000; // 30 seconds

  constructor(config: N8NIntegrationConfig) {
    this.config = config;
  }

  /**
   * Triggers an n8n workflow securely.
   * @param workflowId The ID of the n8n workflow.
   * @param payload The data to send.
   * @returns The response from n8n.
   */
  async triggerWorkflow(workflowId: string, payload: OutboundPayload): Promise<any> {
    if (this.circuitBreaker.status === 'open') {
      if (Date.now() - this.circuitBreaker.lastFailureTime > this.RESET_TIMEOUT_MS) {
        this.circuitBreaker.status = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN. n8n integration is temporarily disabled.');
      }
    }

    const url = `${this.config.instanceUrl}/webhook/${workflowId}`;
    const signature = SecurityLayer.signPayload(payload, this.config.webhookSecret);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-BOS-Signature': signature,
          'X-AI-BOS-Timestamp': new Date().toISOString(),
          'X-N8N-API-Key': this.config.apiKeyHash, // In real scenario, use actual key, hash is for storage
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`n8n responded with status: ${response.status}`);
      }

      this.resetCircuitBreaker();
      return await response.json();
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    if (this.circuitBreaker.failureCount >= this.MAX_FAILURES) {
      this.circuitBreaker.status = 'open';
      console.error('n8n Integration Circuit Breaker OPENED due to repeated failures.');
    }
  }

  private resetCircuitBreaker() {
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.status = 'closed';
  }
}
