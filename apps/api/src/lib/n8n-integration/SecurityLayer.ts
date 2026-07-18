import crypto from 'crypto';

export class SecurityLayer {
  private static readonly ALGORITHM = 'sha256';
  private static readonly MAX_TIMESTAMP_DRIFT_MS = 300000; // 5 minutes

  /**
   * Generates HMAC signature for outbound requests.
   * @param payload The JSON payload to sign.
   * @param secret The shared secret key.
   * @returns The hex-encoded signature.
   */
  static signPayload(payload: any, secret: string): string {
    const data = JSON.stringify(payload);
    return crypto.createHmac(this.ALGORITHM, secret).update(data).digest('hex');
  }

  /**
   * Verifies HMAC signature for inbound requests.
   * @param payload The raw request body.
   * @param signature The signature from header (X-N8N-Signature).
   * @param secret The shared secret key.
   * @returns True if valid.
   */
  static verifySignature(payload: any, signature: string, secret: string): boolean {
    if (!signature) return false;
    const expectedSignature = this.signPayload(payload, secret);
    // Use timingSafeEqual to prevent timing attacks
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    
    if (signatureBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  }

  /**
   * Validates timestamp to prevent replay attacks.
   * @param timestamp The timestamp from header (X-N8N-Timestamp).
   * @returns True if within window.
   */
  static validateTimestamp(timestamp: string): boolean {
    const requestTime = new Date(timestamp).getTime();
    const now = Date.now();
    const drift = Math.abs(now - requestTime);
    return drift <= this.MAX_TIMESTAMP_DRIFT_MS;
  }

  /**
   * Hashes API keys for secure storage.
   * @param apiKey The raw API key.
   * @returns The hashed key.
   */
  static hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
}
