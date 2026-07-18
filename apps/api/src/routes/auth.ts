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
import prisma from '../lib/db/prisma.js';
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

  const user = await prisma.user.findFirst({
    where: { email, deleted_at: null },
    include: { role: true },
  });

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
    role: (user.role?.name as string)?.toUpperCase() ?? 'VIEWER',
    tenant_id: user.tenant_id,
  };

  const accessToken = generateAccessToken(authUser);
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  // Persist refresh token hash
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await prisma.refreshToken.create({
    data: {
      id: crypto.randomUUID(),
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

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
router.post('/refresh', async (req, res) => {
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
  const stored = await prisma.refreshToken.findFirst({
    where: {
      token_hash: tokenHash,
      revoked_at: null,
      expires_at: { gt: new Date() },
    },
  });

  if (!stored) {
    return res.status(401).json({ error: 'Refresh token has been revoked or expired.' });
  }

  // Look up current user + role
  const user = await prisma.user.findFirst({
    where: { id: payload.id },
    include: { role: true },
  });

  if (!user || user.status !== 'active') {
    return res.status(401).json({ error: 'User not found or inactive.' });
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    role: (user.role?.name as string)?.toUpperCase() ?? 'VIEWER',
    tenant_id: user.tenant_id,
  };

  return res.json({ accessToken: generateAccessToken(authUser) });
});

// ─── POST /logout ─────────────────────────────────────────────────────────────
router.post('/logout', requireAuth, async (req, res) => {
  const { refreshToken } = req.body ?? {};

  if (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.updateMany({
      where: { token_hash: tokenHash },
      data: { revoked_at: new Date() },
    });
  }

  return res.json({ message: 'Logged out successfully.' });
});

// ─── GET /me ──────────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  const user = req.user!;
  const dbUser = await prisma.user.findFirst({
    where: { id: user.id, deleted_at: null },
    include: { role: true },
  });

  if (!dbUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({
    id: dbUser.id,
    email: dbUser.email,
    name: `${dbUser.first_name} ${dbUser.last_name ?? ''}`.trim(),
    role: (dbUser.role?.name as string)?.toUpperCase() ?? user.role,
    tenant_id: dbUser.tenant_id,
    status: dbUser.status,
  });
});

export default router;
