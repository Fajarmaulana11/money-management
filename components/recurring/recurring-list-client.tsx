"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Repeat, Plus, Pause, Play, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";
import { AddRecurringDialog } from "@/components/recurring/add-recurring-dialog";
import type { RecurringTransaction, Account, Category } from "@/types/domain";

const FREQ_LABEL: Record<string, string> = { daily: "Harian", weekly: "Mingguan", monthly: "Bulanan", yearly: "Tahunan" };

export function RecurringListClient({
  initialItems, accounts, categories,
}: { initialItems: RecurringTransaction[]; accounts: Account[]; categories: Category[] }) {
  const [items, setItems] = useState(initialItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function toggleActive(id: string, isActive: boolean) {
    const supabase = createClient();
    const { error } = await supabase.from("recurring_transactions").update({ is_active: !isActive }).eq("id", id);
    if (error) {
      toast({ title: "Gagal memperbarui status", variant: "destructive" });
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_active: !isActive } : i)));
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
    if (error) {
      toast({ title: "Gagal menghapus", variant: "destructive" });
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Transaksi berulang dihapus.", variant: "success" });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Tambah</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Repeat} title="Belum ada transaksi berulang" ctaLabel="Tambah" onCta={() => setDialogOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className={`min-w-0 flex-1 ${item.is_active ? "" : "opacity-60"}`}>
                  <p className="truncate text-sm font-medium">{item.description || item.category?.name}</p>
                  <p className="text-xs text-muted">
                    {FREQ_LABEL[item.frequency]} · {item.account?.name}
                  </p>
                  <p className="text-xs text-muted">Berikutnya {formatDate(item.next_execution_date)}</p>
                  <p className={`mt-1 text-sm font-semibold tabular-nums ${item.type === "income" ? "text-success" : "text-danger"}`}>
                    {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(item.id, item.is_active)} title={item.is_active ? "Pause" : "Resume"}>
                    {item.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} title="Hapus">
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddRecurringDialog open={dialogOpen} onOpenChange={setDialogOpen} accounts={accounts} categories={categories} onCreated={() => router.refresh()} />
    </div>
  );
}
