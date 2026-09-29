import { Bell } from "lucide-react";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

/**
 * Header sapaan. Di mobile hanya tampil di Dashboard (showOnMobile) agar
 * halaman lain tidak kehilangan ~80px ruang layar; judul halaman sudah cukup.
 */
export function Header({ fullName, showOnMobile = false }: { fullName: string; showOnMobile?: boolean }) {
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  return (
    <>
      {!showOnMobile && <div aria-hidden className="h-[calc(1rem+env(safe-area-inset-top))] md:hidden" />}
      <header
        className={cn(
          "items-center justify-between gap-3 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] md:px-8 md:py-6",
          showOnMobile ? "flex" : "hidden md:flex"
        )}
      >
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{greeting}, {fullName.split(" ")[0]}</p>
          <p className="text-sm text-muted">{formatDate(new Date(), "EEEE, d MMMM yyyy")}</p>
        </div>
        <button aria-label="Notifikasi" className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card shadow-subtle">
          <Bell className="h-5 w-5 text-muted" />
        </button>
      </header>
    </>
  );
}
