"use client";
import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";

type Toast = { id: number; title: string; description?: string; variant?: "default" | "success" | "destructive" };
const ToastContext = React.createContext<{ toast: (t: Omit<Toast, "id">) => void } | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="up">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            className={
              "rounded-md border bg-card p-4 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out " +
              (t.variant === "destructive"
                ? "border-border border-l-4 border-l-danger"
                : t.variant === "success"
                ? "border-border border-l-4 border-l-success"
                : "border-border")
            }
          >
            <ToastPrimitive.Title className="text-sm font-medium">{t.title}</ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="text-xs text-muted">{t.description}</ToastPrimitive.Description>
            )}
          </ToastPrimitive.Root>
        ))}
        {/* Mobile: di atas layar, lebar penuh (tidak menutupi bottom nav). Desktop: pojok kanan bawah. */}
        <ToastPrimitive.Viewport className="fixed inset-x-4 top-[calc(0.75rem+env(safe-area-inset-top))] z-[100] flex flex-col gap-2 outline-none md:inset-x-auto md:bottom-4 md:right-4 md:top-auto md:w-80" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
