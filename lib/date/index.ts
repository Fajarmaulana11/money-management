import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { id } from "date-fns/locale";

export function formatDate(date: string | Date, pattern = "d MMM yyyy") {
  return format(new Date(date), pattern, { locale: id });
}

export function currentMonthRange() {
  const now = new Date();
  return { from: startOfMonth(now), to: endOfMonth(now) };
}

export function rangeForPreset(preset: "this_month" | "last_month" | "3_months" | "6_months" | "this_year") {
  const now = new Date();
  switch (preset) {
    case "this_month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "last_month": {
      const lm = subMonths(now, 1);
      return { from: startOfMonth(lm), to: endOfMonth(lm) };
    }
    case "3_months":
      return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) };
    case "6_months":
      return { from: startOfMonth(subMonths(now, 5)), to: endOfMonth(now) };
    case "this_year":
      return { from: startOfYear(now), to: endOfMonth(now) };
  }
}
