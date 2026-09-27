export type AccountType = "cash" | "bank" | "ewallet" | "credit_card" | "investment" | "other";
export type TransactionType = "income" | "expense" | "transfer";
export type CategoryType = "income" | "expense";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";
export type DebtType = "i_owe" | "owed_to_me";
export type DebtStatus = "active" | "partially_paid" | "paid" | "overdue";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  currency: string;
  locale: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  is_default: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  transaction_date: string;
  notes: string | null;
  attachment_url: string | null;
  transfer_group_id: string | null;
  created_at: string;
  account?: Account;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  month: number;
  year: number;
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  category_id: string;
  amount: number;
  category?: Category;
  spent?: number;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_achieved: boolean;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  frequency: RecurringFrequency;
  next_execution_date: string;
  is_active: boolean;
  account?: Account;
  category?: Category;
}

export interface Debt {
  id: string;
  user_id: string;
  person_name: string;
  amount: number;
  type: DebtType;
  due_date: string | null;
  description: string | null;
  status: DebtStatus;
  total_paid?: number;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
}
