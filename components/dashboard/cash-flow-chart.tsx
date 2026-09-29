"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatCompact, formatCurrency } from "@/lib/currency";

export function CashFlowChart({ data }: { data: { date: string; income: number; expense: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Pemasukan vs Pengeluaran</CardTitle></CardHeader>
      <CardContent className="h-60 px-2 sm:h-72 sm:px-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={16} />
            <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#income)" strokeWidth={2} name="Pemasukan" />
            <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#expense)" strokeWidth={2} name="Pengeluaran" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
