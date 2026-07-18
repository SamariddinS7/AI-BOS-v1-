import express from 'express';
import prisma from '../lib/db/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// All admin endpoints require ADMIN role or higher
router.use(requireAuth, requireRole(['ADMIN']));

// --- User Management ---

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { deleted_at: null },
      include: { role: true, tenant: true },
    });
    const result = users.map((u) => ({
      ...u,
      role_name: u.role?.name ?? null,
      tenant_name: u.tenant?.name ?? null,
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', async (req, res) => {
  const { name, email, role_id, department, tenant_id } = req.body;
  try {
    const id = uuidv4();
    await prisma.user.create({
      data: { id, name, email, role_id, department, tenant_id, status: 'active' },
    });
    res.json({ id, name, email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role_id, department, status } = req.body;
  try {
    await prisma.user.update({
      where: { id },
      data: { name, email, role_id, department, status },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// --- Role & Permission Management ---

router.get('/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

router.get('/permissions', async (req, res) => {
  try {
    const permissions = await prisma.$queryRaw`SELECT * FROM Permissions`;
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// --- Audit Logs ---

router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.legacyAuditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: { user: true },
    });
    const result = logs.map((l) => ({
      ...l,
      user_name: (l as any).user?.name ?? null,
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

router.post('/audit-logs', async (req, res) => {
  const { user_id, action, module, ip_address, old_value, new_value, tenant_id = 'default' } = req.body;
  try {
    await prisma.legacyAuditLog.create({
      data: { user_id, tenant_id, action, module, ip_address, old_value, new_value },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// --- API Key Management ---

router.get('/api-keys', async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany();
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// --- Backup Management ---

router.get('/backups', async (req, res) => {
  try {
    const backups = await prisma.backup.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch backups' });
  }
});

// --- Tenants Management ---

router.get('/tenants', async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: { _count: { select: { users: true } } },
    });
    const result = tenants.map((t) => ({
      ...t,
      users: t._count.users,
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// --- System Dashboard Metrics ---

router.get('/dashboard-metrics', async (req, res) => {
  try {
    const activeUsers = await prisma.user.count({
      where: { status: 'active', deleted_at: null },
    });

    const totalWorkflows = await prisma.workflow.count();

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await prisma.legacyAuditLog.count({
      where: { timestamp: { gt: oneDayAgo } },
    });

    res.json({
      activeUsers,
      totalWorkflows,
      recentActivity,
      systemHealth: 'Healthy',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
