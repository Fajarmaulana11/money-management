"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";
import type { Transaction } from "@/types/domain";
import { ChevronLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export function TransactionDetailClient({ transaction }: { transaction: Transaction }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", transaction.id);
    setDeleting(false);
    if (error) {
      toast({ title: "Gagal menghapus transaksi", description: "Terjadi kesalahan saat menyimpan data.", variant: "destructive" });
      return;
    }
    toast({ title: "Transaksi berhasil dihapus.", variant: "success" });
    router.push("/transactions");
    router.refresh();
  }

  const isIncome = transaction.type === "income";
  const isTransfer = transaction.type === "transfer";

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/transactions" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Kembali
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="text-center">
            <p className={`break-words text-2xl font-semibold tabular-nums sm:text-3xl ${isTransfer ? "text-foreground" : isIncome ? "text-success" : "text-danger"}`}>
              {isTransfer ? "" : isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
            </p>
            <p className="mt-1 text-sm text-muted">{transaction.category?.name ?? (isTransfer ? "Transfer" : "-")}</p>
          </div>

          <dl className="flex flex-col gap-3 border-t border-border pt-4 text-sm">
            <Row label="Rekening" value={transaction.account?.name ?? "-"} />
            <Row label="Tanggal" value={formatDate(transaction.transaction_date)} />
            <Row label="Deskripsi" value={transaction.description ?? "-"} />
            <Row label="Catatan" value={transaction.notes ?? "-"} />
            <Row label="Dibuat" value={formatDate(transaction.created_at, "d MMM yyyy, HH:mm")} />
          </dl>

          <Button variant="destructive" onClick={() => setConfirmOpen(true)} className="mt-2">
            <Trash2 className="h-4 w-4" /> Hapus Transaksi
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus transaksi ini?"
        description="Tindakan ini tidak dapat dibatalkan. Saldo rekening akan disesuaikan kembali."
        onConfirm={handleDelete}
        confirmLabel={deleting ? "Menghapus..." : "Hapus"}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium">{value}</dd>
    </div>
  );
}
