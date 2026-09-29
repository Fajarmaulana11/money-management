"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Search, Receipt, Download, Plus } from "lucide-react";
import type { Transaction, Account, Category } from "@/types/domain";
import Papa from "papaparse";
import { formatDate } from "@/lib/date";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";
import { cn } from "@/lib/utils";

export function TransactionListClient({
  initialTransactions, accounts, categories,
}: { initialTransactions: Transaction[]; accounts: Account[]; categories: Category[] }) {
  const transactions = initialTransactions;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (accountFilter !== "all" && t.account_id !== accountFilter) return false;
      if (categoryFilter !== "all" && t.category_id !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const inDesc = t.description?.toLowerCase().includes(q);
        const inNotes = t.notes?.toLowerCase().includes(q);
        const inCategory = t.category?.name.toLowerCase().includes(q);
        if (!inDesc && !inNotes && !inCategory) return false;
      }
      return true;
    });
  }, [transactions, search, typeFilter, accountFilter, categoryFilter]);

  function handleExport() {
    const rows = filtered.map((t) => ({
      Date: formatDate(t.transaction_date),
      Type: t.type,
      Category: t.category?.name ?? "",
      Account: t.account?.name ?? "",
      Description: t.description ?? "",
      Amount: t.amount,
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaksi-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex gap-2 md:flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input type="search" placeholder="Cari transaksi..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={handleExport} title="Export CSV" aria-label="Export CSV" className="shrink-0 md:hidden">
            <Download className="h-4 w-4" />
          </Button>
        </div>
        {/* Mobile: filter jadi satu baris yang bisa digeser horizontal */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className={filterClass(typeFilter)}><SelectValue placeholder="Tipe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className={filterClass(accountFilter)}><SelectValue placeholder="Rekening" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Rekening</SelectItem>
              {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className={filterClass(categoryFilter)}><SelectValue placeholder="Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleExport} title="Export CSV" aria-label="Export CSV" className="hidden shrink-0 md:inline-flex">
            <Download className="h-4 w-4" />
          </Button>
          {/* Mobile sudah punya FAB "+" di bottom nav, jadi tombol ini
             hanya ditampilkan di layar md ke atas agar toolbar tidak overflow di mobile. */}
          <Button onClick={() => setAddOpen(true)} className="hidden shrink-0 md:inline-flex">
            <Plus className="h-4 w-4" /> Tambah Transaksi
          </Button>
        </div>
      </div>

      {filtered.length > 0 && (
        <p className="-mb-2 px-1 text-xs text-muted">{filtered.length} transaksi</p>
      )}
      <div className="rounded-lg border border-border bg-card p-1.5 shadow-subtle md:p-2">
        {filtered.length === 0 ? (
          <EmptyState icon={Receipt} title="Tidak ada transaksi" ctaLabel="+ Tambah Transaksi" onCta={() => setAddOpen(true)} />
        ) : (
          filtered.map((t) => <TransactionItem key={t.id} transaction={t} />)
        )}
      </div>

      <AddTransactionSheet open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

// Chip filter: lebar menyesuaikan isi di mobile, disorot saat filter aktif.
function filterClass(value: string) {
  return cn(
    "h-9 w-auto shrink-0 gap-2 rounded-full px-3.5 text-sm md:h-10 md:w-[8.5rem] md:rounded-sm",
    value !== "all" && "border-primary bg-primary/10 text-primary"
  );
}
