"use client";
import { Input } from "@/components/ui/input";
import { parseCurrencyInput } from "@/lib/currency";

export function MoneyInput({
  value, onChange, placeholder = "0",
}: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">Rp</span>
      <Input
        inputMode="numeric"
        className="pl-9"
        placeholder={placeholder}
        value={value ? value.toLocaleString("id-ID") : ""}
        onChange={(e) => onChange(parseCurrencyInput(e.target.value))}
      />
    </div>
  );
}
