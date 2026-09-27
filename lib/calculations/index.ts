import type { Transaction } from "@/types/domain";

export function calculateTotalBalance(accounts: { balance: number }[]): number {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}

export function sumByType(transactions: Transaction[], type: "income" | "expense"): number {
  return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
}

export function calculateNetCashFlow(transactions: Transaction[]): number {
  return sumByType(transactions, "income") - sumByType(transactions, "expense");
}

export function calculateBudgetUsage(spent: number, budgetAmount: number): number {
  if (budgetAmount <= 0) return 0;
  return Math.min((spent / budgetAmount) * 100, 999);
}

export function budgetStatus(usagePercent: number): "normal" | "warning" | "almost" | "over" {
  if (usagePercent > 100) return "over";
  if (usagePercent > 90) return "almost";
  if (usagePercent > 70) return "warning";
  return "normal";
}

export function calculateGoalProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
}

export function groupExpenseByCategory(transactions: Transaction[]) {
  const map = new Map<string, { name: string; color: string; total: number }>();
  for (const t of transactions) {
    if (t.type !== "expense" || !t.category) continue;
    const key = t.category.id;
    const existing = map.get(key);
    if (existing) {
      existing.total += t.amount;
    } else {
      map.set(key, { name: t.category.name, color: t.category.color ?? "#94A3B8", total: t.amount });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}
