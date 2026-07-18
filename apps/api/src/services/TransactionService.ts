import db from '../lib/db/settings';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTransactionDto {
  tenant_id: string;
  account_id: string;
  category_id: string;
  deal_id?: string;
  type: 'income' | 'expense';
  amount: number;
  transaction_date: string;
  description?: string;
  created_by?: string;
}

export class TransactionService {
  static async createTransaction(data: CreateTransactionDto) {
    try {
      // 1. Validate Account
      const account = db.prepare('SELECT id FROM accounts WHERE id = ? AND tenant_id = ?').get(data.account_id, data.tenant_id);
      if (!account) {
        throw new Error(`Invalid account_id: ${data.account_id}. Account not found or does not belong to the tenant.`);
      }

      // 2. Validate Category
      const category = db.prepare('SELECT id FROM transaction_categories WHERE id = ? AND tenant_id = ?').get(data.category_id, data.tenant_id);
      if (!category) {
        throw new Error(`Invalid category_id: ${data.category_id}. Category not found or does not belong to the tenant.`);
      }

      // 3. Validate Deal (if provided)
      if (data.deal_id) {
        const deal = db.prepare('SELECT id FROM deals WHERE id = ? AND tenant_id = ?').get(data.deal_id, data.tenant_id);
        if (!deal) {
          throw new Error(`Invalid deal_id: ${data.deal_id}. Deal not found or does not belong to the tenant.`);
        }
      }

      // 4. Insert Transaction
      const id = uuidv4();
      const stmt = db.prepare(`
        INSERT INTO transactions (
          id, tenant_id, account_id, category_id, deal_id, 
          type, amount, transaction_date, description, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        data.tenant_id,
        data.account_id,
        data.category_id,
        data.deal_id || null,
        data.type,
        data.amount,
        data.transaction_date,
        data.description || null,
        data.created_by || null
      );

      // 5. Update Account Balance
      const balanceAdjustment = data.type === 'income' ? data.amount : -data.amount;
      db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(balanceAdjustment, data.account_id);

      return { id, ...data };
    } catch (error: any) {
      console.error('Transaction Creation Error:', error.message);
      throw error;
    }
  }

  static async getTransactions(tenantId: string, limit: number = 50) {
    try {
      return db.prepare(`
        SELECT 
          t.id, 
          t.transaction_date as date, 
          t.description, 
          c.name as category, 
          t.amount, 
          CASE WHEN t.is_verified = 1 THEN 'Muvaffaqiyatli' ELSE 'Jarayonda' END as status,
          t.type,
          a.name as account_name
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        JOIN accounts a ON t.account_id = a.id
        WHERE t.tenant_id = ? AND t.deleted_at IS NULL
        ORDER BY t.transaction_date DESC
        LIMIT ?
      `).all(tenantId, limit);
    } catch (error: any) {
      console.error('Fetch Transactions Error:', error.message);
      throw error;
    }
  }
}
