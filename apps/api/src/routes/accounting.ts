import express from 'express';
import prisma from '../lib/db/prisma.js';
import { TransactionService } from '../services/TransactionService.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// Finance/accounting requires MANAGER role or higher
router.use(requireAuth, requireRole(['MANAGER']));

router.get('/kpis', async (req, res) => {
  try {
    // Joriy Balans: sum(income) - sum(expense) where is_verified = true
    const incomeAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'income', is_verified: true },
    });
    const expenseAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'expense', is_verified: true },
    });
    const currentBalance =
      (incomeAgg._sum.amount ?? 0) - (expenseAgg._sum.amount ?? 0);

    // Kutilayotgan Tushum: sum(income) where is_verified = false
    const expectedIncomeAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'income', is_verified: false },
    });
    const expectedIncome = expectedIncomeAgg._sum.amount ?? 0;

    // To'lanishi Kerak: sum(expense) where is_verified = false
    const accountsPayableAgg = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'expense', is_verified: false },
    });
    const accountsPayable = accountsPayableAgg._sum.amount ?? 0;

    res.json({ currentBalance, expectedIncome, accountsPayable });
  } catch (error) {
    console.error('Error fetching accounting KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch accounting KPIs' });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const tenantId = 'default-tenant-id'; // In a real app, this would come from auth
    const transactions = await TransactionService.getTransactions(tenantId);
    res.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/transactions', async (req, res) => {
  try {
    const tenantId = 'default-tenant-id'; // In a real app, this would come from auth
    const userId = 'admin-user-id'; // In a real app, this would come from auth

    const transactionData = {
      ...req.body,
      tenant_id: tenantId,
      created_by: userId,
    };

    const newTransaction = await TransactionService.createTransaction(transactionData);
    res.status(201).json(newTransaction);
  } catch (error: any) {
    console.error('Error creating transaction:', error.message);
    res.status(400).json({ error: error.message });
  }
});

export default router;
