"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastCtx {
  toast: (item: Omit<ToastItem, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const variantStyles: Record<ToastVariant, { bg: string; border: string; text: string; Icon: typeof Info }> = {
  success: { bg: "bg-emerald-50", border: "border-l-emerald-600", text: "text-emerald-700", Icon: CheckCircle2 },
  error: { bg: "bg-red-50", border: "border-l-red-600", text: "text-red-700", Icon: XCircle },
  warning: { bg: "bg-amber-50", border: "border-l-amber-600", text: "text-amber-600", Icon: AlertTriangle },
  info: { bg: "bg-navy-50", border: "border-l-navy-700", text: "text-navy-700", Icon: Info },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((xs) => xs.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setItems((xs) => [...xs, { ...item, id }]);
    setTimeout(() => remove(id), 4500);
  }, [remove]);

  const value: ToastCtx = {
    toast,
    success: (title, description) => toast({ variant: "success", title, description }),
    error: (title, description) => toast({ variant: "error", title, description }),
    warning: (title, description) => toast({ variant: "warning", title, description }),
    info: (title, description) => toast({ variant: "info", title, description }),
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { bg, border, text, Icon } = variantStyles[item.variant];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border border-border border-l-4 bg-surface-card px-4 py-3 shadow-lg transition-all duration-200",
        bg,
        border,
        visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      )}
    >
      <Icon className={cn("size-4 shrink-0 mt-0.5", text)} />
      <div className="min-w-0 flex-1">
        <div className={cn("text-[13px] font-semibold", text)}>{item.title}</div>
        {item.description && (
          <div className="mt-0.5 text-[12px] text-ink-600">{item.description}</div>
        )}
      </div>
      <button
        onClick={onClose}
        className="ml-1 grid size-5 place-items-center rounded-sm text-ink-400 hover:text-ink-700"
        aria-label="Yopish"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
