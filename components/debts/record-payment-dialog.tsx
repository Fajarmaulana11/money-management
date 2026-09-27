"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";
import type { Debt } from "@/types/domain";

export function RecordPaymentDialog({
  debt, open, onOpenChange, onRecorded,
}: { debt: Debt; open: boolean; onOpenChange: (v: boolean) => void; onRecorded: () => void }) {
  const [amount, setAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const remaining = debt.amount - (debt.total_paid ?? 0);

  async function handleSubmit() {
    if (amount <= 0 || amount > remaining) {
      toast({ title: `Jumlah harus antara 1 dan ${remaining}`, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("debt_payments").insert({ debt_id: debt.id, amount });
    setSubmitting(false);
    if (error) {
      toast({ title: "Gagal mencatat pembayaran", variant: "destructive" });
      return;
    }
    toast({ title: "Pembayaran berhasil dicatat.", variant: "success" });
    onRecorded();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Catat Pembayaran — {debt.person_name}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">Sisa: <span className="font-medium text-foreground">Rp {remaining.toLocaleString("id-ID")}</span></p>
          <div className="flex flex-col gap-1.5">
            <Label>Jumlah Pembayaran</Label>
            <MoneyInput value={amount} onChange={setAmount} />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Menyimpan..." : "Simpan Pembayaran"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
