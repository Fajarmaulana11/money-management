import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { GoalCard } from "@/components/goals/goal-card";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Target } from "lucide-react";

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: goals }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
    supabase.from("financial_goals").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <Header fullName={profile?.full_name ?? "User"} />
      <div className="px-4 pb-8 md:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Target Keuangan</h1>
          <AddGoalDialog />
        </div>
        {(goals ?? []).length === 0 ? (
          <EmptyState icon={Target} title="Belum ada financial goal" />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(goals ?? []).map((g) => <GoalCard key={g.id} goal={g} />)}
          </div>
        )}
      </div>
    </div>
  );
}
