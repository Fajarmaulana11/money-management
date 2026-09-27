"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";
import { Plus } from "lucide-react";

export function AddGoalDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit() {
    if (!name.trim() || targetAmount <= 0) {
      toast({ title: "Lengkapi nama dan target jumlah", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("financial_goals").insert({
      user_id: userData.user!.id, name, target_amount: targetAmount,
      current_amount: currentAmount, target_date: targetDate || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Gagal membuat target", variant: "destructive" });
      return;
    }
    toast({ title: "Target keuangan berhasil dibuat.", variant: "success" });
    setOpen(false);
    setName(""); setTargetAmount(0); setCurrentAmount(0); setTargetDate("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" /> Buat Goal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Buat Target Keuangan</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Nama Target</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Dana Darurat" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Target Jumlah</Label>
            <MoneyInput value={targetAmount} onChange={setTargetAmount} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Jumlah Terkumpul Saat Ini</Label>
            <MoneyInput value={currentAmount} onChange={setCurrentAmount} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Target Tanggal (opsional)</Label>
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
