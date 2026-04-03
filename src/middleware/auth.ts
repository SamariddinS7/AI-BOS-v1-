import { Request, Response, NextFunction } from 'express';
import db from '../lib/db/settings.js';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Mock user extraction from JWT
  const userId = 'admin';
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';

  try {
    // 1. Fetch Security Settings
    const securitySettings = db.prepare('SELECT * FROM SecuritySettings WHERE user_id = ?').get(userId) as any;
    
    if (securitySettings) {
      // 2. IP Allowlist Enforcement
      const allowedIps = JSON.parse(securitySettings.allowed_ips || '[]');
      if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
        return res.status(403).json({ error: 'Access denied from this IP address.' });
      }

      // 3. Session Timeout Enforcement
      // In a real app, check JWT expiration or session last_activity against session_timeout_minutes
      const timeoutMinutes = securitySettings.session_timeout_minutes || 30;
      // const session = db.prepare('SELECT last_activity FROM SessionLog WHERE user_id = ? AND status = "active"').get(userId);
      // if (session && (Date.now() - new Date(session.last_activity).getTime()) > timeoutMinutes * 60000) {
      //   return res.status(401).json({ error: 'Session expired due to inactivity.' });
      // }
    }

    // Attach user to request
    (req as any).user = { id: userId, ip: clientIp };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};
