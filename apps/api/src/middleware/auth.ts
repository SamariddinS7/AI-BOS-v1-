import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/db/prisma.js';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const ACCESS_SECRET = process.env.SESSION_SECRET || 'dev-access-secret-change-in-prod';
const REFRESH_SECRET = ACCESS_SECRET + '_refresh';

// In development, if REQUIRE_AUTH is not 'true', skip authentication
// so the frontend works without a login flow. Set REQUIRE_AUTH=true in tests.
const DEV_BYPASS =
  process.env.NODE_ENV !== 'production' && process.env.REQUIRE_AUTH !== 'true';

const DEV_USER: AuthUser = {
  id: 'admin-user-id',
  email: 'admin@ai-bos.com',
  role: 'ADMIN',
  tenant_id: 'default-tenant-id',
};

// ─── Token helpers ────────────────────────────────────────────────────────────

export function generateAccessToken(payload: AuthUser): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: { id: string; email: string }): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): AuthUser {
  return jwt.verify(token, ACCESS_SECRET) as AuthUser;
}

export function verifyRefreshToken(token: string): { id: string; email: string } {
  return jwt.verify(token, REFRESH_SECRET) as { id: string; email: string };
}

// ─── requireAuth middleware ───────────────────────────────────────────────────

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  // 1. Bearer JWT token
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;

      // IP allowlist enforcement (carry forward from legacy)
      const clientIp = req.ip || req.socket.remoteAddress || '';
      try {
        const sec = await prisma.securitySettings.findUnique({ where: { user_id: decoded.id } });
        if (sec) {
          const allowedIps: string[] = JSON.parse((sec as any).allowed_ips || '[]');
          if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
            res.status(403).json({ error: 'Access denied from this IP address.' });
            return;
          }
        }
      } catch {
        // Security settings not critical — proceed
      }

      return next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired access token.' });
      return;
    }
  }

  // 2. Dev bypass — auto-authenticate as ADMIN so the frontend works
  if (DEV_BYPASS) {
    req.user = DEV_USER;
    return next();
  }

  // 3. No credentials
  res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
};
