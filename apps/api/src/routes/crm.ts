import { Router } from 'express';
import prisma from '../lib/db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// CRM readable by VIEWER+; write operations need MANAGER+ (enforced per-route below)
router.use(requireAuth, requireRole(['VIEWER']));

router.get('/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { deleted_at: null },
    });
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/customers', async (req, res) => {
  try {
    const customer = req.body;
    await prisma.customer.create({
      data: {
        id: customer.id,
        name: customer.name,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        industry: customer.industry,
        region: customer.region,
        account_value: customer.account_value,
        status: customer.status,
      },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals', async (req, res) => {
  try {
    const deals = await prisma.deal.findMany({
      where: { deleted_at: null },
    });
    res.json(deals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/deals/:id/stage', async (req, res) => {
  try {
    const { stage } = req.body;
    await prisma.deal.update({
      where: { id: req.params.id },
      data: { stage },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/interactions/:customerId', async (req, res) => {
  try {
    const interactions = await prisma.interaction.findMany({
      where: { customer_id: req.params.customerId },
      orderBy: { timestamp: 'desc' },
    });
    res.json(interactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/interactions', async (req, res) => {
  try {
    const interaction = req.body;
    await prisma.interaction.create({
      data: {
        id: interaction.id,
        customer_id: interaction.customer_id,
        type: interaction.type,
        description: interaction.description,
      },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
