import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { ReportsClient } from "@/components/reports/reports-client";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*), account:accounts(*)")
    .order("transaction_date", { ascending: true })
    .limit(2000);

  return (
    <div>
      <Header fullName={profile?.full_name ?? "User"} />
      <div className="px-4 pb-8 md:px-8">
        <h1 className="mb-4 text-xl font-semibold">Laporan</h1>
        <ReportsClient transactions={transactions ?? []} />
      </div>
    </div>
  );
}
