import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { RecurringListClient } from "@/components/recurring/recurring-list-client";

export default async function RecurringPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: recurring }, { data: accounts }, { data: categories }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
    supabase.from("recurring_transactions").select("*, account:accounts(*), category:categories(*)").order("next_execution_date"),
    supabase.from("accounts").select("*").eq("is_active", true).order("name"),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <div>
      <Header fullName={profile?.full_name ?? "User"} />
      <div className="px-4 pb-8 md:px-8">
        <h1 className="mb-4 text-xl font-semibold">Transaksi Berulang</h1>
        <RecurringListClient initialItems={recurring ?? []} accounts={accounts ?? []} categories={categories ?? []} />
      </div>
    </div>
  );
}
