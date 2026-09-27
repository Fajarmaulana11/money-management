import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";
import { calculateGoalProgress } from "@/lib/calculations";
import { formatDate } from "@/lib/date";
import type { FinancialGoal } from "@/types/domain";
import { Target } from "lucide-react";

export function GoalCard({ goal }: { goal: FinancialGoal }) {
  const progress = calculateGoalProgress(goal.current_amount, goal.target_amount);
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: (goal.color ?? "#2563EB") + "20" }}>
            <Target className="h-5 w-5" style={{ color: goal.color ?? "#2563EB" }} />
          </div>
          <div>
            <p className="text-sm font-medium">{goal.name}</p>
            {goal.target_date && <p className="text-xs text-muted">Target: {formatDate(goal.target_date)}</p>}
          </div>
        </div>
        <Progress value={progress} />
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}</span>
          <span className="font-medium text-foreground">{progress.toFixed(1)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
