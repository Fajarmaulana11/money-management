import Link from "next/link";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";
import type { Transaction } from "@/types/domain";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Transaksi Terbaru</CardTitle>
        <Link href="/transactions" className="text-xs font-medium text-primary hover:underline">Lihat semua</Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {transactions.length === 0 ? (
          <EmptyState icon={Receipt} title="Tidak ada transaksi" />
        ) : (
          transactions.map((t) => <TransactionItem key={t.id} transaction={t} />)
        )}
      </CardContent>
    </Card>
  );
}
