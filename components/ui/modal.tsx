"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, description, size = "md", children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full rounded-lg border border-border bg-surface-card shadow-2xl",
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-border px-5 py-4">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 className="text-[16px] font-semibold text-ink-900">{title}</h2>
              )}
              {description && (
                <p className="mt-0.5 text-[13px] text-ink-500">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-3 grid size-7 place-items-center rounded-sm text-ink-500 hover:bg-ink-100 hover:text-ink-900"
              aria-label="Yopish"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-border bg-ink-100/40 px-5 py-3",
        className
      )}
    >
      {children}
    </div>
  );
}
