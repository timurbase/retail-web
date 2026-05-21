"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#imkoniyatlar", label: "Imkoniyatlar" },
  { href: "/#narxlar", label: "Narxlar" },
  { href: "/about", label: "Biz haqimizda" },
  { href: "/blog", label: "Blog" },
  { href: "/bog-lanish", label: "Bog'lanish" },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  // Body scroll lock + Escape close while drawer open
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

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={close}>
          <div className="grid size-8 place-items-center rounded-md bg-navy-700 font-mono text-sm font-bold text-white">
            RF
          </div>
          <div className="leading-none">
            <div className="text-[15px] font-bold text-ink-900">RetailFlow</div>
            <div className="font-mono text-[10px] text-ink-500">AI · BETA</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium text-ink-600 hover:text-ink-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center overflow-hidden rounded-sm border border-border font-mono text-[11px]">
            <button className="bg-navy-700 px-2.5 py-1 text-white">UZ</button>
            <button className="px-2.5 py-1 text-ink-600 hover:bg-ink-100">РУ</button>
          </div>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <Link href="/login" className="hidden md:block">
            <Button variant="ghost" size="sm">Kirish</Button>
          </Link>
          <Link href="/register" className="hidden md:block">
            <Button variant="primary" size="sm">Bepul boshlash</Button>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={open}
            className="md:hidden grid size-9 place-items-center rounded-sm border border-border text-ink-600 hover:bg-ink-100"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile backdrop */}
      <div
        onClick={close}
        aria-hidden="true"
        className={cn(
          "md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-ink-900/50 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Mobile drawer — slides from top, below header */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Asosiy menyu"
        className={cn(
          "md:hidden fixed inset-x-0 top-16 z-50 border-b border-border bg-surface-card shadow-lg transition-transform duration-200 origin-top",
          open ? "translate-y-0" : "-translate-y-[110%]"
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={close}
              className="rounded-sm px-3 py-2.5 text-[14px] font-medium text-ink-700 hover:bg-ink-100"
            >
              {l.label}
            </Link>
          ))}

          <div className="mt-3 flex items-center gap-2 border-t border-border pt-4">
            <div className="flex items-center overflow-hidden rounded-sm border border-border font-mono text-[11px]">
              <button className="bg-navy-700 px-2.5 py-1 text-white">UZ</button>
              <button className="px-2.5 py-1 text-ink-600 hover:bg-ink-100">РУ</button>
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <Link href="/login" onClick={close}>
              <Button variant="ghost" size="sm" className="w-full">
                Kirish
              </Button>
            </Link>
            <Link href="/register" onClick={close}>
              <Button variant="primary" size="sm" className="w-full">
                Bepul boshlash
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
