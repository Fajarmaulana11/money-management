"use client";
import { useMemo, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { rangeForPreset } from "@/lib/date";
import { sumByType, calculateNetCashFlow, groupExpenseByCategory } from "@/lib/calculations";
import { formatCurrency } from "@/lib/currency";
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
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Pemasukan</CardTitle></CardHeader><CardContent><p className="text-xl font-semibold text-success">{formatCurrency(income)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Pengeluaran</CardTitle></CardHeader><CardContent><p className="text-xl font-semibold text-danger">{formatCurrency(expense)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Arus Kas Bersih</CardTitle></CardHeader><CardContent><p className={`text-xl font-semibold ${netFlow >= 0 ? "text-success" : "text-danger"}`}>{formatCurrency(netFlow)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Pengeluaran per Kategori</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
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
            <div key={a.name} className="flex justify-between text-sm">
              <span className="text-muted">{a.name}</span>
              <span className="font-medium">{formatCurrency(a.balance)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
