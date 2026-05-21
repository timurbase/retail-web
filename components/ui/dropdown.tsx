"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  trigger?: React.ReactNode;
  align?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export function Dropdown({ trigger, align = "right", children, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="grid size-8 place-items-center rounded-sm text-ink-500 hover:bg-ink-100 hover:text-ink-900"
        aria-label="Menyu"
      >
        {trigger ?? <MoreHorizontal className="size-4" />}
      </button>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[180px] rounded-md border border-border bg-surface-card py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  onClick?: () => void;
  variant?: "default" | "danger";
  icon?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}

export function DropdownItem({ onClick, variant = "default", icon, children, disabled }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] transition-colors",
        disabled && "cursor-not-allowed opacity-50",
        !disabled && variant === "default" && "text-ink-700 hover:bg-ink-100",
        !disabled && variant === "danger" && "text-red-700 hover:bg-red-50"
      )}
    >
      {icon && <span className="text-ink-500">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-border" />;
}
