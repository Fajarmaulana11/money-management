"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/currency";
import { EmptyState } from "@/components/ui/empty-state";
import { PieChart as PieIcon } from "lucide-react";

export function ExpenseDistributionChart({ data }: { data: { name: string; color: string; total: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Distribusi Pengeluaran</CardTitle></CardHeader>
      <CardContent className="h-72">
        {data.length === 0 ? (
          <EmptyState icon={PieIcon} title="Belum ada data pengeluaran bulan ini" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="total" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
