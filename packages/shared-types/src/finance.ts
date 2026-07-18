// Finance module shared types (used by both apps/web and apps/api)

export interface Account {
  id: string;
  tenant_id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  currency: string;
  deleted_at?: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  account_id: string;
  category_id: string;
  deal_id?: string | null;
  type: 'income' | 'expense';
  amount: number;
  transaction_date: string;
  description?: string | null;
  is_verified: number; // 0 | 1 (SQLite boolean)
  created_by?: string | null;
  created_at: string;
}

export interface TransactionCategory {
  id: string;
  tenant_id: string;
  name: string;
  type: 'income' | 'expense';
}

export interface PnLStatement {
  revenue: number;
  cogs: number;
  gross_profit: number;
  operating_expenses: number;
  net_profit: number;
  period_start: string;
  period_end: string;
}

export interface CashflowStatement {
  operational_flow: number;
  investing_flow: number;
  financing_flow: number;
  net_cash_change: number;
  period_start: string;
  period_end: string;
}

export interface AccountingKPIs {
  currentBalance: number;
  expectedIncome: number;
  accountsPayable: number;
}
