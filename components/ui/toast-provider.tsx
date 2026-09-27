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
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            className={
              "rounded-md border p-4 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out " +
              (t.variant === "destructive"
                ? "border-danger bg-danger/10"
                : t.variant === "success"
                ? "border-success bg-success/10"
                : "border-border bg-card")
            }
          >
            <ToastPrimitive.Title className="text-sm font-medium">{t.title}</ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="text-xs text-muted">{t.description}</ToastPrimitive.Description>
            )}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
