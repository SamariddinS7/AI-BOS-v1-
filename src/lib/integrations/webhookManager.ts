import db from '../db/settings';
import fetch from 'node-fetch';
import crypto from 'crypto';

export class WebhookManager {
  static async trigger(tenantId: string, eventType: string, payload: any) {
    const subscriptions = db.prepare('SELECT * FROM WebhookSubscriptions WHERE tenant_id = ? AND event_type = ? AND status = "active"')
      .all(tenantId, eventType);

    for (const sub of subscriptions) {
      this.deliver(sub, payload);
    }
  }

  private static async deliver(subscription: any, payload: any) {
    const startTime = Date.now();
    const signature = subscription.secret 
      ? crypto.createHmac('sha256', subscription.secret).update(JSON.stringify(payload)).digest('hex')
      : null;

    try {
      const response = await fetch(subscription.target_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-BOS-Event': subscription.event_type,
          'X-AI-BOS-Signature': signature || '',
        },
        body: JSON.stringify(payload),
        timeout: 5000
      } as any);

      const responseTime = Date.now() - startTime;

      db.prepare(`
        INSERT INTO IntegrationLogs (tenant_id, integration_id, type, action, status, response_time, payload)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        subscription.tenant_id,
        subscription.id,
        'webhook',
        subscription.event_type,
        response.ok ? 'success' : 'error',
        responseTime,
        JSON.stringify({
          url: subscription.target_url,
          status: response.status,
          payload
        })
      );
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      db.prepare(`
        INSERT INTO IntegrationLogs (tenant_id, integration_id, type, action, status, response_time, payload, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        subscription.tenant_id,
        subscription.id,
        'webhook',
        subscription.event_type,
        'error',
        responseTime,
        JSON.stringify({ url: subscription.target_url, payload }),
        error.message
      );
    }
  }
}
