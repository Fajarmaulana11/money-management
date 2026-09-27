import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  ctaLabel,
  onCta,
}: {
  icon: LucideIcon;
  title: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
      <Icon className="h-8 w-8 text-muted" />
      <p className="text-sm text-muted">{title}</p>
      {ctaLabel && (
        <Button size="sm" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
