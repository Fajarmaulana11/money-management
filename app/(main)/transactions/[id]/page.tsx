import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { TransactionDetailClient } from "@/components/transactions/transaction-detail-client";
import type { Transaction } from "@/types/domain";

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();

  const { data: transaction } = await supabase
    .from("transactions")
    .select("*, category:categories(*), account:accounts(*)")
    .eq("id", id)
    .single();

  if (!transaction) notFound();

  return (
    <div>
      <Header fullName={profile?.full_name ?? "User"} />
      <div className="px-4 pb-8 md:px-8">
        <TransactionDetailClient transaction={transaction as Transaction} />
      </div>
    </div>
  );
}
