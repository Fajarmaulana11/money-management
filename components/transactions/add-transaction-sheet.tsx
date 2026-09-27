"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";
import type { Account, Category } from "@/types/domain";
import { format } from "date-fns";

export function AddTransactionSheet({
  open, onOpenChange, defaultTab = "expense",
}: { open: boolean; onOpenChange: (v: boolean) => void; defaultTab?: "expense" | "income" | "transfer" }) {
  const [tab, setTab] = useState<"expense" | "income" | "transfer">(defaultTab);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    (async () => {
      const supabase = createClient();
      const [{ data: acc }, { data: cat }] = await Promise.all([
        supabase.from("accounts").select("*").eq("is_active", true).order("name"),
        supabase.from("categories").select("*").order("name"),
      ]);
      setAccounts(acc ?? []);
      setCategories(cat ?? []);
    })();
  }, [open]);

  function reset() {
    setAmount(0);
    setCategoryId("");
    setAccountId("");
    setToAccountId("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
  }

  async function handleSubmit() {
    if (amount <= 0) {
      toast({ title: "Jumlah harus lebih dari 0", variant: "destructive" });
      return;
    }
    if (!accountId) {
      toast({ title: "Pilih rekening terlebih dahulu", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const supabase = createClient();

    if (tab === "transfer") {
      if (!toAccountId || toAccountId === accountId) {
        toast({ title: "Rekening tujuan tidak valid", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const { error } = await supabase.rpc("create_transfer", {
        p_from_account: accountId,
        p_to_account: toAccountId,
        p_amount: amount,
        p_date: date,
        p_description: description || null,
      });
      if (error) {
        toast({ title: "Gagal membuat transfer", description: "Terjadi kesalahan saat menyimpan data.", variant: "destructive" });
        setSubmitting(false);
        return;
      }
    } else {
      if (!categoryId) {
        toast({ title: "Pilih kategori terlebih dahulu", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("transactions").insert({
        user_id: userData.user!.id,
        account_id: accountId,
        category_id: categoryId,
        type: tab,
        amount,
        description: description || null,
        transaction_date: date,
      });
      if (error) {
        toast({ title: "Gagal menyimpan transaksi", description: "Terjadi kesalahan saat menyimpan data.", variant: "destructive" });
        setSubmitting(false);
        return;
      }
    }

    toast({ title: "Transaksi berhasil ditambahkan.", variant: "success" });
    setSubmitting(false);
    reset();
    onOpenChange(false);
    router.refresh();
  }

  const filteredCategories = categories.filter((c) => c.type === tab);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Jumlah</Label>
              <MoneyInput value={amount} onChange={setAmount} />
            </div>

            {tab !== "transfer" && (
              <div className="flex flex-col gap-1.5">
                <Label>Kategori</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label>{tab === "transfer" ? "Dari Rekening" : "Rekening"}</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger><SelectValue placeholder="Pilih rekening" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tab === "transfer" && (
              <div className="flex flex-col gap-1.5">
                <Label>Ke Rekening</Label>
                <Select value={toAccountId} onValueChange={setToAccountId}>
                  <SelectTrigger><SelectValue placeholder="Pilih rekening tujuan" /></SelectTrigger>
                  <SelectContent>
                    {accounts.filter((a) => a.id !== accountId).map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label>Tanggal</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Deskripsi (opsional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contoh: Makan siang" />
            </div>

            <Button onClick={handleSubmit} disabled={submitting} className="w-full">
              {submitting ? "Menyimpan..." : "Simpan Transaksi"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
