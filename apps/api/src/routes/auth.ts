/**
 * /api/auth
 *
 * POST /api/auth/login   → { accessToken, refreshToken, user }
 * POST /api/auth/refresh → { accessToken }
 * POST /api/auth/logout  → revokes refresh token
 * GET  /api/auth/me      → current user info (requireAuth)
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../lib/db/settings.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  requireAuth,
  AuthUser,
} from '../middleware/auth.js';

const router = Router();

// ─── POST /login ──────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  const user = db
    .prepare(`
      SELECT u.id, u.tenant_id, u.first_name, u.last_name, u.email,
             u.password_hash, u.status, r.name AS role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND u.deleted_at IS NULL
    `)
    .get(email) as any;

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Account is not active.' });
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    role: (user.role_name as string)?.toUpperCase() ?? 'VIEWER',
    tenant_id: user.tenant_id,
  };

  const accessToken = generateAccessToken(authUser);
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  // Persist refresh token hash
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(crypto.randomUUID(), user.id, tokenHash, expiresAt);

  return res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name ?? ''}`.trim(),
      role: authUser.role,
      tenant_id: user.tenant_id,
    },
  });
});

// ─── POST /refresh ────────────────────────────────────────────────────────────
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body ?? {};

  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required.' });
  }

  // Verify JWT signature & expiry
  let payload: { id: string; email: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }

  // Check token is still in DB (not revoked)
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const stored = db
    .prepare(`
      SELECT * FROM refresh_tokens
      WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > datetime('now')
    `)
    .get(tokenHash) as any;

  if (!stored) {
    return res.status(401).json({ error: 'Refresh token has been revoked or expired.' });
  }

  // Look up current user + role
  const user = db
    .prepare(`
      SELECT u.id, u.tenant_id, u.email, r.name AS role_name, u.status
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `)
    .get(payload.id) as any;

  if (!user || user.status !== 'active') {
    return res.status(401).json({ error: 'User not found or inactive.' });
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    role: (user.role_name as string)?.toUpperCase() ?? 'VIEWER',
    tenant_id: user.tenant_id,
  };

  return res.json({ accessToken: generateAccessToken(authUser) });
});

// ─── POST /logout ─────────────────────────────────────────────────────────────
router.post('/logout', requireAuth, (req, res) => {
  const { refreshToken } = req.body ?? {};

  if (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    db.prepare(`
      UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE token_hash = ?
    `).run(tokenHash);
  }

  return res.json({ message: 'Logged out successfully.' });
});

// ─── GET /me ──────────────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  const user = req.user!;
  const dbUser = db
    .prepare(`
      SELECT u.id, u.tenant_id, u.first_name, u.last_name, u.email, u.status,
             r.name AS role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND u.deleted_at IS NULL
    `)
    .get(user.id) as any;

  if (!dbUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({
    id: dbUser.id,
    email: dbUser.email,
    name: `${dbUser.first_name} ${dbUser.last_name ?? ''}`.trim(),
    role: (dbUser.role_name as string)?.toUpperCase() ?? user.role,
    tenant_id: dbUser.tenant_id,
    status: dbUser.status,
  });
});

export default router;
