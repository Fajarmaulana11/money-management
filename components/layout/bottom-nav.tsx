"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, PiggyBank, Target, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: PiggyBank },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/settings", label: "More", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {NAV.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <NavItem key={href} href={href} label={label} icon={Icon} active={pathname.startsWith(href)} />
        ))}

        <button
          onClick={() => setAddOpen(true)}
          aria-label="Tambah Transaksi"
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </button>

        {NAV.slice(2).map(({ href, label, icon: Icon }) => (
          <NavItem key={href} href={href} label={label} icon={Icon} active={pathname.startsWith(href)} />
        ))}
      </nav>
      <AddTransactionSheet open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link href={href} className={cn("flex flex-col items-center gap-0.5 px-3 py-2 text-[11px]", active ? "text-primary" : "text-muted")}>
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
