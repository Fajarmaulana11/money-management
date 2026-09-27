import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { DebtsListClient } from "@/components/debts/debts-list-client";

export default async function DebtsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: debts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
    supabase.from("debts").select("*, debt_payments(amount)").order("created_at", { ascending: false }),
  ]);

  const enriched = (debts ?? []).map((d: any) => ({
    ...d,
    total_paid: (d.debt_payments ?? []).reduce((s: number, p: any) => s + p.amount, 0),
  }));

  return (
    <div>
      <Header fullName={profile?.full_name ?? "User"} />
      <div className="px-4 pb-8 md:px-8">
        <h1 className="mb-4 text-xl font-semibold">Hutang & Piutang</h1>
        <DebtsListClient initialDebts={enriched} />
      </div>
    </div>
  );
}
