import prisma from '../db/prisma.js';
import fetch from 'node-fetch';
import crypto from 'crypto';

export class WebhookManager {
  static async trigger(tenantId: string, eventType: string, payload: any) {
    const subscriptions = await prisma.webhookSubscription.findMany({
      where: { tenant_id: tenantId, event_type: eventType, status: 'active' }
    });

    for (const sub of subscriptions) {
      this.deliver(sub, payload);
    }
  }

  private static async deliver(subscription: any, payload: any) {
    const startTime = Date.now();
    const signatureHex = subscription.secret 
      ? crypto.createHmac('sha256', subscription.secret).update(JSON.stringify(payload)).digest('hex')
      : null;

    try {
      const response = await fetch(subscription.target_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-BOS-Event': subscription.event_type,
          'X-AI-BOS-Signature': signatureHex || '',
          'X-Webhook-Signature': signatureHex ? `sha256=${signatureHex}` : '',
        },
        body: JSON.stringify(payload),
        timeout: 5000
      } as any);

      const responseTime = Date.now() - startTime;

      await prisma.integrationLog.create({
        data: {
          tenant_id: subscription.tenant_id,
          integration_id: subscription.id,
          type: 'webhook',
          action: subscription.event_type,
          status: response.ok ? 'success' : 'error',
          response_time: responseTime,
          payload: JSON.stringify({
            url: subscription.target_url,
            status: response.status,
            payload
          }),
        }
      });
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      await prisma.integrationLog.create({
        data: {
          tenant_id: subscription.tenant_id,
          integration_id: subscription.id,
          type: 'webhook',
          action: subscription.event_type,
          status: 'error',
          response_time: responseTime,
          payload: JSON.stringify({ url: subscription.target_url, payload }),
          error_message: error.message,
        }
      });
    }
  }
}
