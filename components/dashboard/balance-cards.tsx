import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from "lucide-react";

export function BalanceCards({
  totalBalance, monthlyIncome, monthlyExpense, netCashFlow,
}: { totalBalance: number; monthlyIncome: number; monthlyExpense: number; netCashFlow: number }) {
  const items = [
    { title: "Total Saldo", value: totalBalance, icon: Wallet, color: "text-primary" },
    { title: "Pemasukan Bulan Ini", value: monthlyIncome, icon: TrendingUp, color: "text-success" },
    { title: "Pengeluaran Bulan Ini", value: monthlyExpense, icon: TrendingDown, color: "text-danger" },
    { title: "Arus Kas Bersih", value: netCashFlow, icon: ArrowLeftRight, color: netCashFlow >= 0 ? "text-success" : "text-danger" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map(({ title, value, icon: Icon, color }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{title}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-semibold md:text-2xl ${color}`}>{formatCurrency(value)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
