import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { AccountCard } from "@/components/accounts/account-card";
import { AddAccountDialog } from "@/components/accounts/add-account-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/currency";
import { Wallet } from "lucide-react";

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: accounts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
    supabase.from("accounts").select("*").eq("is_active", true).order("created_at"),
  ]);

  const totalAssets = (accounts ?? []).reduce((sum, a) => sum + a.balance, 0);

  return (
    <div>
      <Header fullName={profile?.full_name ?? "User"} />
      <div className="px-4 pb-8 md:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Rekening</h1>
            <p className="text-sm text-muted">Total Aset: <span className="font-semibold text-foreground">{formatCurrency(totalAssets)}</span></p>
          </div>
          <AddAccountDialog />
        </div>

        {(accounts ?? []).length === 0 ? (
          <EmptyState icon={Wallet} title="Belum ada rekening" />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(accounts ?? []).map((a) => <AccountCard key={a.id} account={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
