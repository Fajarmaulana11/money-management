"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/currency";
import { EmptyState } from "@/components/ui/empty-state";
import { PieChart as PieIcon } from "lucide-react";

export function ExpenseDistributionChart({ data }: { data: { name: string; color: string; total: number }[] }) {
  const total = data.reduce((s, d) => s + d.total, 0);
  const sorted = [...data].sort((a, b) => b.total - a.total);

  return (
    <Card>
      <CardHeader><CardTitle>Distribusi Pengeluaran</CardTitle></CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={PieIcon} title="Belum ada data pengeluaran bulan ini" />
        ) : (
          // Mobile: donat di atas, daftar kategori di bawah. Desktop lebar: berdampingan.
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="h-44 w-44 shrink-0 sm:h-52 sm:w-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sorted} dataKey="total" nameKey="name" innerRadius="62%" outerRadius="100%" paddingAngle={2} stroke="none">
                    {sorted.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex max-h-52 w-full min-w-0 flex-col gap-2 overflow-y-auto text-sm">
              {sorted.map((d) => (
                <li key={d.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="min-w-0 flex-1 truncate text-muted">{d.name}</span>
                  <span className="shrink-0 text-xs text-muted tabular-nums">
                    {total > 0 ? Math.round((d.total / total) * 100) : 0}%
                  </span>
                  <span className="w-24 shrink-0 text-right font-medium tabular-nums">{formatCurrency(d.total)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
