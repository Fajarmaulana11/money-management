import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { BalanceCards } from "@/components/dashboard/balance-cards";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { ExpenseDistributionChart } from "@/components/dashboard/expense-distribution-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { calculateTotalBalance, sumByType, calculateNetCashFlow, groupExpenseByCategory } from "@/lib/calculations";
import { currentMonthRange, formatDate } from "@/lib/date";
import { format } from "date-fns";
import type { Transaction } from "@/types/domain";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: accounts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
    supabase.from("accounts").select("*").eq("is_active", true),
  ]);

  const { from, to } = currentMonthRange();

  const { data: monthTransactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*), account:accounts(*)")
    .gte("transaction_date", format(from, "yyyy-MM-dd"))
    .lte("transaction_date", format(to, "yyyy-MM-dd"))
    .neq("type", "transfer")
    .order("transaction_date", { ascending: true });

  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*), account:accounts(*)")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  const txns = (monthTransactions ?? []) as Transaction[];
  const totalBalance = calculateTotalBalance(accounts ?? []);
  const monthlyIncome = sumByType(txns, "income");
  const monthlyExpense = sumByType(txns, "expense");
  const netCashFlow = calculateNetCashFlow(txns);
  const expenseByCategory = groupExpenseByCategory(txns);

  const dailyMap = new Map<string, { income: number; expense: number }>();
  for (const t of txns) {
    const key = formatDate(t.transaction_date, "d MMM");
    const entry = dailyMap.get(key) ?? { income: 0, expense: 0 };
    if (t.type === "income") entry.income += t.amount;
    if (t.type === "expense") entry.expense += t.amount;
    dailyMap.set(key, entry);
  }
  const cashFlowData = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));

  return (
    <div>
      <Header fullName={profile?.full_name ?? "User"} showOnMobile />
      <div className="flex flex-col gap-4 px-4 pb-8 md:px-8">
        <BalanceCards totalBalance={totalBalance} monthlyIncome={monthlyIncome} monthlyExpense={monthlyExpense} netCashFlow={netCashFlow} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CashFlowChart data={cashFlowData} />
          <ExpenseDistributionChart data={expenseByCategory} />
        </div>
        <RecentTransactions transactions={(recentTransactions ?? []) as Transaction[]} />
      </div>
    </div>
  );
}
