"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, ArrowLeftRight, PiggyBank, Target, LayoutGrid, Plus,
  Wallet, FileBarChart, Repeat, HandCoins, Settings, LogOut, ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

const PRIMARY = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: PiggyBank },
  { href: "/goals", label: "Goals", icon: Target },
];

// Halaman yang di desktop ada di sidebar, tapi di mobile tidak muat di bottom nav.
const MORE = [
  { href: "/accounts", label: "Rekening", icon: Wallet },
  { href: "/reports", label: "Laporan", icon: FileBarChart },
  { href: "/recurring", label: "Transaksi Berulang", icon: Repeat },
  { href: "/debts", label: "Hutang & Piutang", icon: HandCoins },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE.some((m) => isActive(pathname, m.href));

  // Tutup menu "Lainnya" setiap kali pindah halaman.
  useEffect(() => setMoreOpen(false), [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-6 items-center">
          {PRIMARY.slice(0, 2).map((item) => (
            <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
          ))}

          <div className="flex justify-center">
            <button
              onClick={() => setAddOpen(true)}
              aria-label="Tambah Transaksi"
              className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-background transition-transform active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>

          {PRIMARY.slice(2).map((item) => (
            <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
          ))}
          <NavButton label="Lainnya" icon={LayoutGrid} active={moreActive || moreOpen} onClick={() => setMoreOpen(true)} />
        </div>
      </nav>

      <AddTransactionSheet open={addOpen} onOpenChange={setAddOpen} />

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Menu Lainnya</DialogTitle>
          </DialogHeader>
          <nav className="flex flex-col gap-1">
            {MORE.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors active:bg-background",
                    active ? "bg-primary/10 text-primary" : "text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted")} />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className="h-4 w-4 text-muted" />
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="mt-2 flex min-h-12 items-center gap-3 rounded-md border-t border-border px-3 pt-2 text-left text-sm font-medium text-danger active:bg-background"
            >
              <LogOut className="h-5 w-5" />
              Keluar
            </button>
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}

const itemClass = (active: boolean) =>
  cn(
       "flex h-full min-w-0 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors focus:outline-none focus-visible:bg-background",
    active ? "text-primary" : "text-muted"
  );

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: LucideIcon; active: boolean }) {
  return (
    <Link href={href} className={itemClass(active)} aria-current={active ? "page" : undefined}>
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

function NavButton({ label, icon: Icon, active, onClick }: { label: string; icon: LucideIcon; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={itemClass(active)}>
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
