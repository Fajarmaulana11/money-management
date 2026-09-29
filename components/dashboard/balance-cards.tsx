import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function BalanceCards({
  totalBalance, monthlyIncome, monthlyExpense, netCashFlow,
}: { totalBalance: number; monthlyIncome: number; monthlyExpense: number; netCashFlow: number }) {
  const netColor = netCashFlow >= 0 ? "text-success" : "text-danger";

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {/* Total saldo: kartu utama (lebar penuh di mobile) */}
      <Card className="col-span-2 border-primary bg-primary text-white md:col-span-1">
        <div className="flex items-center justify-between p-4 pb-1 md:p-5 md:pb-2">
          <h3 className="text-sm font-medium text-white/80">Total Saldo</h3>
          <Wallet className="h-4 w-4 text-white/80" />
        </div>
        <div className="p-4 pt-1 md:p-5 md:pt-2">
          <p className="truncate text-2xl font-semibold tabular-nums md:text-xl xl:text-2xl">{formatCurrency(totalBalance)}</p>
          <p className="mt-1 text-xs text-white/80 md:hidden">
            Arus kas bulan ini:{" "}
            <span className="font-semibold text-white">
              {netCashFlow >= 0 ? "+" : ""}{formatCurrency(netCashFlow)}
            </span>
          </p>
        </div>
      </Card>

      <StatCard title="Pemasukan" suffix=" Bulan Ini" value={monthlyIncome} icon={TrendingUp} color="text-success" />
      <StatCard title="Pengeluaran" suffix=" Bulan Ini" value={monthlyExpense} icon={TrendingDown} color="text-danger" />
      {/* Di mobile, arus kas bersih sudah tampil di kartu Total Saldo */}
      <StatCard title="Arus Kas Bersih" value={netCashFlow} icon={ArrowLeftRight} color={netColor} className="hidden md:block" />
    </div>
  );
}

function StatCard({
  title, suffix, value, icon: Icon, color, className,
}: { title: string; suffix?: string; value: number; icon: typeof Wallet; color: string; className?: string }) {
  return (
    <Card className={cn("min-w-0", className)}>
      <div className="flex items-center justify-between gap-2 p-4 pb-1 md:p-5 md:pb-2">
        <h3 className="truncate text-xs font-medium text-muted sm:text-sm">
          {title}
          {suffix && <span className="hidden lg:inline">{suffix}</span>}
        </h3>
        <Icon className={`h-4 w-4 shrink-0 ${color}`} />
      </div>
      <div className="p-4 pt-1 md:p-5 md:pt-2">
        <p className={`truncate text-[clamp(0.95rem,4.2vw,1.25rem)] font-semibold tabular-nums md:text-2xl ${color}`}>
          {formatCurrency(value)}
        </p>
      </div>
    </Card>
  );
}
