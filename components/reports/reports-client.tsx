"use client";
import { useMemo, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { rangeForPreset } from "@/lib/date";
import { sumByType, calculateNetCashFlow, groupExpenseByCategory } from "@/lib/calculations";
import { formatCompact, formatCurrency } from "@/lib/currency";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Transaction } from "@/types/domain";
import { isWithinInterval, parseISO } from "date-fns";

const PRESETS = [
  { value: "this_month", label: "Bulan Ini" },
  { value: "last_month", label: "Bulan Lalu" },
  { value: "3_months", label: "3 Bulan" },
  { value: "6_months", label: "6 Bulan" },
  { value: "this_year", label: "Tahun Ini" },
];

export function ReportsClient({ transactions }: { transactions: Transaction[] }) {
  const [preset, setPreset] = useState("this_month");
  const range = rangeForPreset(preset as any)!;

  const filtered = useMemo(
    () => transactions.filter((t) => isWithinInterval(parseISO(t.transaction_date), { start: range.from, end: range.to }) && t.type !== "transfer"),
    [transactions, range]
  );

  const income = sumByType(filtered, "income");
  const expense = sumByType(filtered, "expense");
  const netFlow = calculateNetCashFlow(filtered);
  const byCategory = groupExpenseByCategory(filtered);
  const accountBalances = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (!t.account) continue;
      map.set(t.account.name, t.account.balance);
    }
    return Array.from(map.entries()).map(([name, balance]) => ({ name, balance }));
  }, [transactions]);

  return (
    <div className="flex flex-col gap-4">
      <Select value={preset} onValueChange={setPreset}>
        <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card className="min-w-0"><CardHeader className="p-4 pb-1 md:p-5 md:pb-2"><CardTitle>Pemasukan</CardTitle></CardHeader><CardContent className="p-4 pt-1 md:p-5 md:pt-2"><p className="truncate text-[clamp(0.95rem,4.2vw,1.25rem)] font-semibold tabular-nums text-success md:text-xl">{formatCurrency(income)}</p></CardContent></Card>
        <Card className="min-w-0"><CardHeader className="p-4 pb-1 md:p-5 md:pb-2"><CardTitle>Pengeluaran</CardTitle></CardHeader><CardContent className="p-4 pt-1 md:p-5 md:pt-2"><p className="truncate text-[clamp(0.95rem,4.2vw,1.25rem)] font-semibold tabular-nums text-danger md:text-xl">{formatCurrency(expense)}</p></CardContent></Card>
        <Card className="col-span-2 min-w-0 md:col-span-1"><CardHeader className="p-4 pb-1 md:p-5 md:pb-2"><CardTitle>Arus Kas Bersih</CardTitle></CardHeader><CardContent className="p-4 pt-1 md:p-5 md:pt-2"><p className={`truncate text-xl font-semibold tabular-nums ${netFlow >= 0 ? "text-success" : "text-danger"}`}>{formatCurrency(netFlow)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Pengeluaran per Kategori</CardTitle></CardHeader>
        {/* Tinggi mengikuti jumlah kategori agar bar tidak berdesakan di layar kecil */}
        <CardContent className="px-2 sm:px-5" style={{ height: Math.max(220, byCategory.length * 36 + 48) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={92}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string) => (v.length > 13 ? v.slice(0, 12) + "…" : v)}
              />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" fill="#2563EB" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Saldo per Rekening</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {accountBalances.map((a) => (
            <div key={a.name} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-muted">{a.name}</span>
              <span className="shrink-0 font-medium tabular-nums">{formatCurrency(a.balance)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
