import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/db/prisma.js';
import crypto from 'crypto';

// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number, resetTime: number }>();

// Prune expired rate limit entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimits.entries()) {
    if (now > value.resetTime) {
      rateLimits.delete(key);
    }
  }
}, 300000).unref();

export const apiGatewayMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Only enforce for /api/v1 routes
  if (!req.path.startsWith('/api/v1')) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string;
  const startTime = Date.now();

  // 1. Authentication
  if (!apiKey) {
    return res.status(401).json({ error: 'API key missing' });
  }

  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const keyRecord = await prisma.apiKey.findFirst({ where: { key_hash: keyHash, status: 'active' } });

  if (!keyRecord) {
    return res.status(401).json({ error: 'Invalid or inactive API key' });
  }

  // Check expiration
  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
    return res.status(401).json({ error: 'API key expired' });
  }

  // 2. Rate Limiting (e.g., 100 requests per minute)
  const now = Date.now();
  const limitInfo = rateLimits.get(apiKey) || { count: 0, resetTime: now + 60000 };

  if (now > limitInfo.resetTime) {
    limitInfo.count = 1;
    limitInfo.resetTime = now + 60000;
  } else {
    limitInfo.count++;
  }

  rateLimits.set(apiKey, limitInfo);

  if (limitInfo.count > 100) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // 3. Logging (Intercept response to log)
  const originalJson = res.json;
  res.json = function (body) {
    const responseTime = Date.now() - startTime;

    prisma.integrationLog.create({
      data: {
        tenant_id: keyRecord.tenant_id,
        integration_id: keyRecord.id,
        type: 'request',
        action: `${req.method} ${req.path}`,
        status: res.statusCode < 400 ? 'success' : 'error',
        response_time: responseTime,
        payload: JSON.stringify({
          method: req.method,
          path: req.path,
          query: req.query,
          body: req.body,
          response: body,
        }),
      },
    }).catch((e: unknown) => {
      console.error('Failed to log integration request:', e);
    });

    return originalJson.call(this, body);
  };

  // Attach key info to request
  (req as any).apiKey = keyRecord;

  next();
};
