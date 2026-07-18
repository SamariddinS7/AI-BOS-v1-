import express from 'express';
import db from '../lib/db/settings.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// --- User Management ---

router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.*, r.name as role_name, t.name as tenant_name 
      FROM Users u
      LEFT JOIN Roles r ON u.role_id = r.id
      LEFT JOIN Tenants t ON u.tenant_id = t.id
    `).all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', (req, res) => {
  const { name, email, role_id, department, tenant_id } = req.body;
  try {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO Users (id, name, email, role_id, department, tenant_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `).run(id, name, email, role_id, department, tenant_id);
    res.json({ id, name, email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role_id, department, status } = req.body;
  try {
    db.prepare(`
      UPDATE Users 
      SET name = ?, email = ?, role_id = ?, department = ?, status = ?
      WHERE id = ?
    `).run(name, email, role_id, department, status, id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// --- Role & Permission Management ---

router.get('/roles', (req, res) => {
  try {
    const roles = db.prepare('SELECT * FROM Roles').all();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

router.get('/permissions', (req, res) => {
  try {
    const permissions = db.prepare('SELECT * FROM Permissions').all();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// --- Audit Logs ---

router.get('/audit-logs', (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT a.*, u.name as user_name 
      FROM AuditLog a
      LEFT JOIN Users u ON a.user_id = u.id
      ORDER BY a.timestamp DESC
      LIMIT 100
    `).all();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

router.post('/audit-logs', (req, res) => {
  const { user_id, action, module, ip_address, old_value, new_value, tenant_id = 'default' } = req.body;
  try {
    db.prepare(`
      INSERT INTO AuditLog (user_id, tenant_id, action, module, ip_address, old_value, new_value)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(user_id, tenant_id, action, module, ip_address, old_value, new_value);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// --- API Key Management ---

router.get('/api-keys', (req, res) => {
  try {
    const keys = db.prepare('SELECT * FROM ApiKeys').all();
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// --- Backup Management ---

router.get('/backups', (req, res) => {
  try {
    const backups = db.prepare('SELECT * FROM Backups ORDER BY created_at DESC').all();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch backups' });
  }
});

// --- Tenants Management ---

router.get('/tenants', (req, res) => {
  try {
    const tenants = db.prepare(`
      SELECT t.*, (SELECT count(*) FROM users WHERE tenant_id = t.id) as users
      FROM tenants t
    `).all();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// --- System Dashboard Metrics ---

router.get('/dashboard-metrics', (req, res) => {
  try {
    const activeUsers = db.prepare("SELECT count(*) as count FROM Users WHERE status = 'active'").get();
    const totalWorkflows = db.prepare("SELECT count(*) as count FROM Workflows").get();
    const recentLogs = db.prepare("SELECT count(*) as count FROM AuditLog WHERE timestamp > datetime('now', '-24 hours')").get();
    
    res.json({
      activeUsers: activeUsers.count,
      totalWorkflows: totalWorkflows.count,
      recentActivity: recentLogs.count,
      systemHealth: 'Healthy'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
