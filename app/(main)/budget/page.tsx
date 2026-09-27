import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { BudgetItemCard } from "@/components/budget/budget-item-card";
import { AddBudgetDialog } from "@/components/budget/add-budget-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PiggyBank } from "lucide-react";
import { currentMonthRange } from "@/lib/date";
import { format } from "date-fns";

export default async function BudgetPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: budget } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user!.id)
    .eq("month", month)
    .eq("year", year)
    .single();

  let items: {
    id: string;
    category_id: string;
    amount: number;
    category?: {
      name: string;
    };
  }[] = [];

  if (budget) {
    const { data } = await supabase
      .from("budget_items")
      .select("*, category:categories(name)")
      .eq("budget_id", budget.id);

    items = data ?? [];
  }

  const { from, to } = currentMonthRange();

  const { data: expenses } = await supabase
    .from("transactions")
    .select("category_id, amount")
    .eq("type", "expense")
    .gte("transaction_date", format(from, "yyyy-MM-dd"))
    .lte("transaction_date", format(to, "yyyy-MM-dd"));

  const spentByCategory = new Map<string, number>();

  for (const e of expenses ?? []) {
    spentByCategory.set(
      e.category_id,
      (spentByCategory.get(e.category_id) ?? 0) + e.amount
    );
  }

  return (
    <div>
      <Header fullName={profile?.full_name ?? "User"} />

      <div className="px-4 pb-8 md:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Anggaran Bulan Ini</h1>

          <AddBudgetDialog
            month={month}
            year={year}
          />
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="Belum ada budget bulan ini"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <BudgetItemCard
                key={item.category_id}
                itemId={item.id}
                categoryName={item.category?.name ?? "-"}
                budgetAmount={item.amount}
                spent={
                  spentByCategory.get(item.category_id) ?? 0
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}