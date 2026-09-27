"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";
import { Plus } from "lucide-react";

const TYPES = [
  { value: "cash", label: "Tunai" },
  { value: "bank", label: "Bank" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "credit_card", label: "Kartu Kredit" },
  { value: "investment", label: "Investasi" },
  { value: "other", label: "Lainnya" },
];

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [balance, setBalance] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit() {
    if (!name.trim()) {
      toast({ title: "Nama rekening wajib diisi", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("accounts").insert({
      user_id: userData.user!.id, name, type, balance,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Gagal menambah rekening", variant: "destructive" });
      return;
    }
    toast({ title: "Rekening berhasil ditambahkan.", variant: "success" });
    setOpen(false);
    setName(""); setBalance(0); setType("bank");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" /> Tambah Rekening</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Rekening</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Nama Rekening</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: BCA" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Tipe</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Saldo Awal</Label>
            <MoneyInput value={balance} onChange={setBalance} />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
