/**
 * Defines the secure communication protocol between agents.
 * Uses JSON-RPC over WebSocket/HTTP.
 */

export interface AgentMessage {
  id: string; // Unique message ID
  correlationId: string; // For tracking request/response chains
  timestamp: string; // ISO 8601
  sender: {
    agentId: string;
    signature: string; // HMAC-SHA256 signature of payload + timestamp
  };
  recipient: {
    agentId: string;
  };
  payloadType: string; // MIME type or custom type (e.g., 'application/vnd.ai-bos.task-request+json')
  payload: any;
}

export interface AgentResponse {
  id: string; // Response ID
  correlationId: string; // Matches request correlationId
  status: 'success' | 'failure' | 'pending';
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

export class AgentProtocol {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  /**
   * Signs a message payload to ensure integrity and authenticity.
   */
  public signMessage(payload: any, timestamp: string): string {
    const data = JSON.stringify(payload) + timestamp;
    // In a real implementation, use crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
    return `mock_signature_${data.length}`; 
  }

  /**
   * Verifies a received message signature.
   */
  public verifyMessage(message: AgentMessage): boolean {
    const expectedSignature = this.signMessage(message.payload, message.timestamp);
    // Timing-safe comparison required here
    return message.sender.signature === expectedSignature;
  }

  /**
   * Validates the message structure and payload type.
   */
  public validateSchema(message: AgentMessage): boolean {
    if (!message.id || !message.correlationId || !message.timestamp) return false;
    if (!message.sender?.agentId || !message.recipient?.agentId) return false;
    // Additional schema validation (e.g., using Zod)
    return true;
  }
}
