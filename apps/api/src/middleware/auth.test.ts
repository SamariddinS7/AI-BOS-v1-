/**
 * Auth & RBAC middleware tests
 *
 * Run:  REQUIRE_AUTH=true npm test -w apps/api
 *
 * Tests verify:
 *  1. Unauthenticated request → 401
 *  2. Invalid JWT → 401
 *  3. Expired JWT → 401
 *  4. Valid JWT but insufficient role → 403
 *  5. Valid JWT with correct role → 200
 *  6. Higher role passes lower-role-gated route
 */
import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { generateAccessToken, requireAuth } from './auth.js';
import { requireRole } from './rbac.js';

// Force auth for all tests in this file (no dev bypass)
process.env.REQUIRE_AUTH = 'true';

// ─── Test app ─────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

app.get('/public', (_req, res) => res.json({ ok: true }));
app.get('/protected', requireAuth, (req: any, res) => res.json({ user: req.user }));
app.get('/manager-only', requireAuth, requireRole(['MANAGER']), (_req, res) => res.json({ ok: true }));
app.get('/admin-only', requireAuth, requireRole(['ADMIN']), (_req, res) => res.json({ ok: true }));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function tokenFor(role: string) {
  return generateAccessToken({
    id: 'test-user',
    email: 'test@ai-bos.com',
    role,
    tenant_id: 'default-tenant-id',
  });
}

const SECRET = process.env.SESSION_SECRET || 'dev-access-secret-change-in-prod';

// ─── requireAuth ──────────────────────────────────────────────────────────────
describe('requireAuth middleware', () => {
  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/authentication required/i);
  });

  it('returns 401 for a malformed Bearer token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer not.a.valid.jwt');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });

  it('returns 401 for an already-expired token', async () => {
    const expiredToken = jwt.sign(
      { id: 'u', email: 'e@e.com', role: 'ADMIN', tenant_id: 't' },
      SECRET,
      { expiresIn: '-1s' },
    );
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  it('returns 200 and attaches user for a valid token', async () => {
    const token = tokenFor('ADMIN');
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ role: 'ADMIN', id: 'test-user' });
  });
});

// ─── requireRole ─────────────────────────────────────────────────────────────
describe('requireRole middleware', () => {
  it('returns 403 when VIEWER accesses a MANAGER-gated route', async () => {
    const res = await request(app)
      .get('/manager-only')
      .set('Authorization', `Bearer ${tokenFor('VIEWER')}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/insufficient permissions/i);
  });

  it('returns 403 when MANAGER accesses an ADMIN-gated route', async () => {
    const res = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${tokenFor('MANAGER')}`);
    expect(res.status).toBe(403);
  });

  it('allows MANAGER to pass a MANAGER-gated route', async () => {
    const res = await request(app)
      .get('/manager-only')
      .set('Authorization', `Bearer ${tokenFor('MANAGER')}`);
    expect(res.status).toBe(200);
  });

  it('allows ADMIN (higher) to pass a MANAGER-gated route', async () => {
    const res = await request(app)
      .get('/manager-only')
      .set('Authorization', `Bearer ${tokenFor('ADMIN')}`);
    expect(res.status).toBe(200);
  });

  it('allows OWNER to pass an ADMIN-gated route', async () => {
    const res = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${tokenFor('OWNER')}`);
    expect(res.status).toBe(200);
  });

  it('returns 401 (not 403) for missing token on role-gated route', async () => {
    const res = await request(app).get('/admin-only');
    expect(res.status).toBe(401);
  });
});
