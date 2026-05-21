"use client";

import { Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  breadcrumb?: { label: string; href?: string }[];
}

export function Topbar({ breadcrumb }: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface-card px-6 py-3">
      <div className="text-[13px] text-ink-500">
        {breadcrumb && breadcrumb.length > 0 ? (
          breadcrumb.map((b, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1.5 text-ink-300">/</span>}
              {i === breadcrumb.length - 1 ? (
                <strong className="text-ink-900 font-semibold">{b.label}</strong>
              ) : (
                <span>{b.label}</span>
              )}
            </span>
          ))
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Mahsulot, MXIK yoki hujjat..."
            className="h-8 w-72 rounded-sm border border-border bg-surface pl-9 pr-3 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
          />
        </div>

        {/* Lang toggle */}
        <div className="flex items-center overflow-hidden rounded-sm border border-border font-mono text-[11px]">
          <button className="px-2.5 py-1 bg-navy-700 text-white">UZ</button>
          <button className="px-2.5 py-1 text-ink-600 hover:bg-ink-100">РУ</button>
        </div>

        {/* Notifications */}
        <button
          className={cn(
            "relative grid size-8 place-items-center rounded-sm border border-border text-ink-600 hover:bg-ink-100"
          )}
          aria-label="Bildirishnomalar"
        >
          <Bell className="size-4" />
          <span className="absolute -right-1 -top-1 grid size-3.5 place-items-center rounded-full bg-red-600 text-[9px] font-bold text-white font-mono leading-none">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
