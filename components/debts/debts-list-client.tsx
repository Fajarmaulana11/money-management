"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HandCoins, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { AddDebtDialog } from "@/components/debts/add-debt-dialog";
import { RecordPaymentDialog } from "@/components/debts/record-payment-dialog";
import type { Debt } from "@/types/domain";

const STATUS_LABEL: Record<string, string> = { active: "Aktif", partially_paid: "Sebagian Dibayar", paid: "Lunas", overdue: "Jatuh Tempo" };
const STATUS_COLOR: Record<string, string> = { active: "text-warning", partially_paid: "text-primary", paid: "text-success", overdue: "text-danger" };

export function DebtsListClient({ initialDebts }: { initialDebts: Debt[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);
  const router = useRouter();

  const iOwe = initialDebts.filter((d) => d.type === "i_owe");
  const owedToMe = initialDebts.filter((d) => d.type === "owed_to_me");

  function renderList(list: Debt[]) {
    if (list.length === 0) return <EmptyState icon={HandCoins} title="Belum ada catatan" />;
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {list.map((d) => {
          const remaining = d.amount - (d.total_paid ?? 0);
          return (
            <Card key={d.id}>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{d.person_name}</p>
                  <span className={`text-xs font-medium ${STATUS_COLOR[d.status]}`}>{STATUS_LABEL[d.status]}</span>
                </div>
                <p className="text-lg font-semibold">{formatCurrency(d.amount)}</p>
                <div className="flex justify-between text-xs text-muted">
                  <span>Dibayar: {formatCurrency(d.total_paid ?? 0)}</span>
                  <span>Sisa: {formatCurrency(Math.max(remaining, 0))}</span>
                </div>
                {d.due_date && <p className="text-xs text-muted">Jatuh tempo: {formatDate(d.due_date)}</p>}
                {d.status !== "paid" && (
                  <Button size="sm" variant="outline" onClick={() => setPaymentDebt(d)}>Catat Pembayaran</Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Tambah</Button>
      </div>
      <Tabs defaultValue="i_owe">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="i_owe">Saya Berhutang</TabsTrigger>
          <TabsTrigger value="owed_to_me">Piutang Saya</TabsTrigger>
        </TabsList>
        <TabsContent value="i_owe">{renderList(iOwe)}</TabsContent>
        <TabsContent value="owed_to_me">{renderList(owedToMe)}</TabsContent>
      </Tabs>

      <AddDebtDialog open={addOpen} onOpenChange={setAddOpen} onCreated={() => router.refresh()} />
      {paymentDebt && (
        <RecordPaymentDialog
          debt={paymentDebt}
          open={!!paymentDebt}
          onOpenChange={(v) => !v && setPaymentDebt(null)}
          onRecorded={() => { setPaymentDebt(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
