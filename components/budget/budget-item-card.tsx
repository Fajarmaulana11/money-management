"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { formatCurrency } from "@/lib/currency";
import {
  calculateBudgetUsage,
  budgetStatus,
} from "@/lib/calculations";

import { EditBudgetItemDialog } from "./edit-budget-item-dialog";

const STATUS_LABEL: Record<string, string> = {
  normal: "Normal",
  warning: "Mendekati batas",
  almost: "Hampir habis",
  over: "Melebihi anggaran",
};

const STATUS_COLOR: Record<string, string> = {
  normal: "bg-success",
  warning: "bg-warning",
  almost: "bg-warning",
  over: "bg-danger",
};

interface BudgetItemCardProps {
  itemId: string;
  categoryName: string;
  budgetAmount: number;
  spent: number;
}

export function BudgetItemCard({
  itemId,
  categoryName,
  budgetAmount,
  spent,
}: BudgetItemCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  const usage = calculateBudgetUsage(
    spent,
    budgetAmount
  );

  const status = budgetStatus(usage);

  const remaining = budgetAmount - spent;

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={() => setEditOpen(true)}
      >
        <CardContent className="flex flex-col gap-2 p-4">

          {/* HEADER */}

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {categoryName}
            </p>

            <span
              className={`text-xs font-medium ${
                status === "over"
                  ? "text-danger"
                  : status === "normal"
                    ? "text-success"
                    : "text-warning"
              }`}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>

          {/* PROGRESS */}

          <Progress
            value={Math.min(usage, 100)}
            indicatorClassName={STATUS_COLOR[status]}
          />

          {/* AMOUNT */}

          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              {formatCurrency(spent)} dari{" "}
              {formatCurrency(budgetAmount)}
            </span>

            <span>
              {remaining >= 0
                ? `Sisa ${formatCurrency(remaining)}`
                : `Lebih ${formatCurrency(
                    Math.abs(remaining)
                  )}`}
            </span>
          </div>

        </CardContent>
      </Card>

      {/* EDIT */}

      <EditBudgetItemDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        itemId={itemId}
        categoryName={categoryName}
        initialAmount={budgetAmount}
      />
    </>
  );
}