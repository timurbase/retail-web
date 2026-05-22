"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarContent,
  type SidebarUser,
  type SidebarBadges,
} from "./sidebar";

export function MobileSidebar({
  user,
  badges,
}: {
  user?: SidebarUser;
  badges?: SidebarBadges;
} = {}) {
  const [open, setOpen] = useState(false);

  // Body scroll lock + Escape close
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menyuni ochish"
        aria-expanded={open}
        className="lg:hidden grid size-8 place-items-center rounded-sm border border-border text-ink-600 hover:bg-ink-100"
      >
        <Menu className="size-4" />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-ink-900/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Asosiy menyu"
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-navy-900 text-white shadow-2xl transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button — pinned top-right, doesn't disturb existing brand block */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Menyuni yopish"
          className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-sm text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>

        <SidebarContent
          onNavigate={() => setOpen(false)}
          user={user}
          badges={badges}
        />
      </aside>
    </>
  );
}
