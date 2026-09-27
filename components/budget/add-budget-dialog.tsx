"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";
import { Plus } from "lucide-react";
import type { Category } from "@/types/domain";

export function AddBudgetDialog({ month, year }: { month: number; year: number }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("*").eq("type", "expense").order("name");
      setCategories(data ?? []);
    })();
  }, [open]);

  async function handleSubmit() {
    if (!categoryId || amount <= 0) {
      toast({ title: "Lengkapi kategori dan jumlah anggaran", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    let { data: budget } = await supabase
      .from("budgets").select("id").eq("user_id", userData.user!.id).eq("month", month).eq("year", year).single();

    if (!budget) {
      const { data: created, error: createError } = await supabase
        .from("budgets").insert({ user_id: userData.user!.id, month, year }).select("id").single();
      if (createError) {
        toast({ title: "Gagal membuat anggaran", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      budget = created;
    }

    const { error } = await supabase.from("budget_items").upsert(
      { budget_id: budget!.id, category_id: categoryId, amount },
      { onConflict: "budget_id,category_id" }
    );
    setSubmitting(false);
    if (error) {
      toast({ title: "Gagal menyimpan anggaran", variant: "destructive" });
      return;
    }
    toast({ title: "Anggaran berhasil disimpan.", variant: "success" });
    setOpen(false);
    setCategoryId(""); setAmount(0);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" /> Buat Anggaran</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Buat Anggaran Bulan Ini</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Jumlah Anggaran</Label>
            <MoneyInput value={amount} onChange={setAmount} />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
