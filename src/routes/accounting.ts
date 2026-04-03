import express from 'express';
import db from '../lib/db/settings';

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

router.get('/transactions', (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT 
        t.id, 
        t.transaction_date as date, 
        t.description, 
        c.name as category, 
        t.amount, 
        CASE WHEN t.is_verified = 1 THEN 'Muvaffaqiyatli' ELSE 'Jarayonda' END as status,
        t.type
      FROM transactions t
      LEFT JOIN transaction_categories c ON t.category_id = c.id
      ORDER BY t.transaction_date DESC
      LIMIT 50
    `).all();
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
