import { Bell } from "lucide-react";
import { formatDate } from "@/lib/date";

export function Header({ fullName }: { fullName: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  return (
    <header className="flex items-center justify-between px-4 py-4 md:px-8 md:py-6">
      <div>
        <p className="text-lg font-semibold">{greeting}, {fullName.split(" ")[0]}</p>
        <p className="text-sm text-muted">{formatDate(new Date(), "EEEE, d MMMM yyyy")}</p>
      </div>
      <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-subtle">
        <Bell className="h-5 w-5 text-muted" />
      </button>
    </header>
  );
}
