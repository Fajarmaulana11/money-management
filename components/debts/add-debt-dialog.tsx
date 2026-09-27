"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";

export function AddDebtDialog({
  open, onOpenChange, onCreated,
}: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const [type, setType] = useState<"i_owe" | "owed_to_me">("i_owe");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit() {
    if (!personName.trim() || amount <= 0) {
      toast({ title: "Lengkapi nama dan jumlah", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("debts").insert({
      user_id: userData.user!.id, person_name: personName, amount, type,
      due_date: dueDate || null, description: description || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
      return;
    }
    toast({ title: "Catatan berhasil ditambahkan.", variant: "success" });
    onOpenChange(false);
    setPersonName(""); setAmount(0); setDueDate(""); setDescription("");
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Hutang / Piutang</DialogTitle></DialogHeader>
        <Tabs value={type} onValueChange={(v) => setType(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="i_owe">Saya Berhutang</TabsTrigger>
            <TabsTrigger value="owed_to_me">Piutang Saya</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Nama Orang</Label>
            <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Contoh: Budi" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Jumlah</Label>
            <MoneyInput value={amount} onChange={setAmount} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Jatuh Tempo (opsional)</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Deskripsi (opsional)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
