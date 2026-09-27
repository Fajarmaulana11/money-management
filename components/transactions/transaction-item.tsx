import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { Transaction } from "@/types/domain";
import * as Icons from "lucide-react";

export function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === "income";
  const isTransfer = transaction.type === "transfer";
  const Icon = (Icons as any)[toPascalCase(transaction.category?.icon ?? "circle-dollar-sign")] ?? Icons.CircleDollarSign;

  return (
    <Link
      href={`/transactions/${transaction.id}`}
      className="flex items-center justify-between rounded-md px-2 py-2.5 hover:bg-background"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: (transaction.category?.color ?? "#94A3B8") + "20" }}
        >
          <Icon className="h-4 w-4" style={{ color: transaction.category?.color ?? "#94A3B8" }} />
        </div>
        <div>
          <p className="text-sm font-medium">
            {transaction.description || transaction.category?.name || (isTransfer ? "Transfer" : "Transaksi")}
          </p>
          <p className="text-xs text-muted">
            {transaction.account?.name} · {formatDate(transaction.transaction_date)}
          </p>
        </div>
      </div>
      <p className={`text-sm font-semibold ${isTransfer ? "text-foreground" : isIncome ? "text-success" : "text-danger"}`}>
        {isTransfer ? "" : isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
      </p>
    </Link>
  );
}

function toPascalCase(kebab: string) {
  return kebab.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}
