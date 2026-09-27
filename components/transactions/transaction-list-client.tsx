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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input placeholder="Cari transaksi..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[7.5rem]"><SelectValue placeholder="Tipe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-[8.5rem]"><SelectValue placeholder="Rekening" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Rekening</SelectItem>
              {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[8.5rem]"><SelectValue placeholder="Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleExport} title="Export CSV">
            <Download className="h-4 w-4" />
          </Button>
          {/* Mobile sudah punya FAB "+" di bottom nav, jadi tombol ini
             hanya ditampilkan di layar md ke atas agar toolbar tidak overflow di mobile. */}
          <Button onClick={() => setAddOpen(true)} className="hidden md:inline-flex">
            <Plus className="h-4 w-4" /> Tambah Transaksi
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-2 shadow-subtle">
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