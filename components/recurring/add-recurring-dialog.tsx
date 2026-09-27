"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";
import { format } from "date-fns";
import type { Account, Category } from "@/types/domain";

export function AddRecurringDialog({
  open, onOpenChange, accounts, categories, onCreated,
}: { open: boolean; onOpenChange: (v: boolean) => void; accounts: Account[]; categories: Category[]; onCreated: () => void }) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState(0);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [nextDate, setNextDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit() {
    if (!accountId || !categoryId || amount <= 0) {
      toast({ title: "Lengkapi semua field wajib", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("recurring_transactions").insert({
      user_id: userData.user!.id, account_id: accountId, category_id: categoryId,
      type, amount, description: description || null, frequency, next_execution_date: nextDate,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
      return;
    }
    toast({ title: "Transaksi berulang berhasil dibuat.", variant: "success" });
    onOpenChange(false);
    onCreated();
  }

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Transaksi Berulang</DialogTitle></DialogHeader>
        <Tabs value={type} onValueChange={(v) => setType(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Jumlah</Label>
            <MoneyInput value={amount} onChange={setAmount} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent>{filteredCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Rekening</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="Pilih rekening" /></SelectTrigger>
              <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Frekuensi</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Eksekusi Berikutnya</Label>
            <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Deskripsi (opsional)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contoh: Netflix" />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
