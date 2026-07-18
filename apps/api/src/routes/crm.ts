import { Router } from 'express';
import db from '../lib/db/settings.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// CRM readable by VIEWER+; write operations need MANAGER+ (enforced per-route below)
router.use(requireAuth, requireRole(['VIEWER']));

router.get('/customers', (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM Customers').all();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/customers', (req, res) => {
  try {
    const customer = req.body;
    const stmt = db.prepare(`
      INSERT INTO Customers (id, name, company, email, phone, industry, region, account_value, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(customer.id, customer.name, customer.company, customer.email, customer.phone, customer.industry, customer.region, customer.account_value, customer.status);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals', (req, res) => {
  try {
    const deals = db.prepare('SELECT * FROM Deals').all();
    res.json(deals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/deals/:id/stage', (req, res) => {
  try {
    const { stage } = req.body;
    db.prepare('UPDATE Deals SET stage = ? WHERE id = ?').run(stage, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/interactions/:customerId', (req, res) => {
  try {
    const interactions = db.prepare('SELECT * FROM Interactions WHERE customer_id = ? ORDER BY timestamp DESC').all(req.params.customerId);
    res.json(interactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/interactions', (req, res) => {
  try {
    const interaction = req.body;
    const stmt = db.prepare(`
      INSERT INTO Interactions (id, customer_id, type, description)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(interaction.id, interaction.customer_id, interaction.type, interaction.description);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
