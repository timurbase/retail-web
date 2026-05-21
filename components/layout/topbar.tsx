"use client";

import { Search, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface TopbarProps {
  breadcrumb?: { label: string; href?: string }[];
}

/**
 * Inner form that reads `q` from the URL. Reading `useSearchParams` triggers
 * Next.js's CSR boundary requirement, so this is wrapped in <Suspense /> below
 * to keep statically-renderable pages happy.
 *
 * Input is uncontrolled + `defaultValue`, keyed on the current URL `q`, so the
 * field resets to the URL state on navigation without an effect/setState dance.
 */
function TopbarSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get("q") ?? "";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const value = (form.elements.namedItem("q") as HTMLInputElement | null)?.value ?? "";
    const trimmed = value.trim();
    router.push(`/qidirish${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
  }

  return (
    <form
      key={initialQ}
      onSubmit={handleSubmit}
      role="search"
      className="relative"
    >
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" />
      <input
        type="search"
        name="q"
        defaultValue={initialQ}
        placeholder="Mahsulot, MXIK yoki hujjat..."
        aria-label="Saytda qidirish"
        className="h-8 w-72 rounded-sm border border-border bg-surface pl-9 pr-14 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-sm border border-border bg-surface-card px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-500"
      >
        &#8984;K
      </span>
    </form>
  );
}

function TopbarSearchFallback() {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" />
      <input
        type="search"
        placeholder="Mahsulot, MXIK yoki hujjat..."
        aria-label="Saytda qidirish"
        disabled
        className="h-8 w-72 rounded-sm border border-border bg-surface pl-9 pr-14 text-[13px] text-ink-700 placeholder:text-ink-400"
      />
    </div>
  );
}

export function Topbar({ breadcrumb }: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-surface-card px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <MobileSidebar />
        <div className="text-[13px] text-ink-500 truncate">
          {breadcrumb && breadcrumb.length > 0
            ? breadcrumb.map((b, i) => (
                <span key={i}>
                  {i > 0 && <span className="mx-1.5 text-ink-300">/</span>}
                  {i === breadcrumb.length - 1 ? (
                    <strong className="text-ink-900 font-semibold">{b.label}</strong>
                  ) : (
                    <span>{b.label}</span>
                  )}
                </span>
              ))
            : null}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Wide search — hidden on small screens */}
        <div className="hidden md:block">
          <Suspense fallback={<TopbarSearchFallback />}>
            <TopbarSearchForm />
          </Suspense>
        </div>

        {/* Icon-only search on small screens */}
        <Link
          href="/qidirish"
          aria-label="Qidirish"
          className="md:hidden grid size-8 place-items-center rounded-sm border border-border text-ink-600 hover:bg-ink-100"
        >
          <Search className="size-4" />
        </Link>

        {/* Lang toggle — hidden on small */}
        <div className="hidden sm:flex items-center overflow-hidden rounded-sm border border-border font-mono text-[11px]">
          <button className="px-2.5 py-1 bg-navy-700 text-white">UZ</button>
          <button className="px-2.5 py-1 text-ink-600 hover:bg-ink-100">РУ</button>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Link
          href="/notifications"
          className={cn(
            "relative grid size-8 place-items-center rounded-sm border border-border text-ink-600 hover:bg-ink-100"
          )}
          aria-label="Bildirishnomalar"
        >
          <Bell className="size-4" />
          <span className="absolute -right-1 -top-1 grid size-3.5 place-items-center rounded-full bg-red-600 text-[9px] font-bold text-white font-mono leading-none">
            3
          </span>
        </Link>
      </div>
    </header>
  );
}
