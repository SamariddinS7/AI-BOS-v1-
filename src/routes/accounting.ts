import express from 'express';
import db from '../lib/db/settings';
import { TransactionService } from '../services/TransactionService';

const router = express.Router();

router.get('/kpis', (req, res) => {
  try {
    // Joriy Balans: sum(income) - sum(expense) where is_verified = 1
    const currentBalanceRow = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance
      FROM transactions
      WHERE is_verified = 1
    `).get();

    // Kutilayotgan Tushum: sum(income) where is_verified = 0
    const expectedIncomeRow = db.prepare(`
      SELECT SUM(amount) as expected
      FROM transactions
      WHERE type = 'income' AND is_verified = 0
    `).get();

    // To'lanishi Kerak: sum(expense) where is_verified = 0
    const accountsPayableRow = db.prepare(`
      SELECT SUM(amount) as payable
      FROM transactions
      WHERE type = 'expense' AND is_verified = 0
    `).get();

    res.json({
      currentBalance: currentBalanceRow.balance || 0,
      expectedIncome: expectedIncomeRow.expected || 0,
      accountsPayable: accountsPayableRow.payable || 0
    });
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
      created_by: userId
    };

    const newTransaction = await TransactionService.createTransaction(transactionData);
    res.status(201).json(newTransaction);
  } catch (error: any) {
    console.error('Error creating transaction:', error.message);
    res.status(400).json({ error: error.message });
  }
});

export default router;
