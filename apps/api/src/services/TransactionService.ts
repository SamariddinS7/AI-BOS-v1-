import prisma from '../lib/db/prisma.js';
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
      const account = await prisma.account.findFirst({
        where: { id: data.account_id, tenant_id: data.tenant_id, deleted_at: null },
      });
      if (!account) {
        throw new Error(`Invalid account_id: ${data.account_id}. Account not found or does not belong to the tenant.`);
      }

      // 2. Validate Category
      const category = await prisma.transactionCategory.findFirst({
        where: { id: data.category_id, tenant_id: data.tenant_id, deleted_at: null },
      });
      if (!category) {
        throw new Error(`Invalid category_id: ${data.category_id}. Category not found or does not belong to the tenant.`);
      }

      // 3. Validate Deal (if provided)
      if (data.deal_id) {
        const deal = await prisma.deal.findFirst({
          where: { id: data.deal_id, tenant_id: data.tenant_id, deleted_at: null },
        });
        if (!deal) {
          throw new Error(`Invalid deal_id: ${data.deal_id}. Deal not found or does not belong to the tenant.`);
        }
      }

      // 4. Insert Transaction + Update Account Balance atomically
      const id = uuidv4();
      const balanceAdjustment = data.type === 'income' ? data.amount : -data.amount;

      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            id,
            tenant_id: data.tenant_id,
            account_id: data.account_id,
            category_id: data.category_id,
            deal_id: data.deal_id ?? null,
            type: data.type,
            amount: data.amount,
            transaction_date: data.transaction_date,
            description: data.description ?? null,
            created_by: data.created_by ?? null,
          },
        }),
        prisma.account.update({
          where: { id: data.account_id },
          data: { balance: { increment: balanceAdjustment } },
        }),
      ]);

      return { id, ...data };
    } catch (error: any) {
      console.error('Transaction Creation Error:', error.message);
      throw error;
    }
  }

  static async getTransactions(tenantId: string, limit: number = 50) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        orderBy: { transaction_date: 'desc' },
        take: limit,
        include: {
          category: true,
          account: true,
        },
      });

      return transactions.map((t) => ({
        id: t.id,
        date: t.transaction_date,
        description: t.description,
        category: (t as any).category?.name ?? null,
        amount: t.amount,
        status: t.is_verified ? 'Muvaffaqiyatli' : 'Jarayonda',
        type: t.type,
        account_name: (t as any).account?.name ?? null,
      }));
    } catch (error: any) {
      console.error('Fetch Transactions Error:', error.message);
      throw error;
    }
  }
}
