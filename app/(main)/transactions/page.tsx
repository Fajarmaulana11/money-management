import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { TransactionListClient } from "@/components/transactions/transaction-list-client";
import type { Transaction } from "@/types/domain";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();

  const [{ data: transactions }, { data: accounts }, { data: categories }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, category:categories(*), account:accounts(*)")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("accounts").select("*").eq("is_active", true).order("name"),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <div>
      <Header fullName={profile?.full_name ?? "User"} />
      <div className="px-4 pb-8 md:px-8">
        <h1 className="mb-4 text-xl font-semibold">Transaksi</h1>
        <TransactionListClient
          initialTransactions={(transactions ?? []) as Transaction[]}
          accounts={accounts ?? []}
          categories={categories ?? []}
        />
      </div>
    </div>
  );
}
