"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertOctagon, Home, RotateCw } from "lucide-react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // In production we'd send to Sentry / our error tracker
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-6 py-12">
      {/* RF brand mark at top */}
      <Link
        href="/"
        className="absolute left-6 top-6 flex items-center gap-2.5"
      >
        <div className="grid size-8 place-items-center rounded-md bg-navy-700 font-mono text-sm font-bold text-white">
          RF
        </div>
        <div className="leading-none">
          <div className="text-[15px] font-bold text-ink-900">RetailFlow</div>
          <div className="font-mono text-[10px] text-ink-500">AI &middot; BETA</div>
        </div>
      </Link>

      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {/* Big red octagon icon */}
        <div className="grid size-20 place-items-center rounded-full bg-red-50">
          <AlertOctagon
            className="size-12 text-red-700"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>

        {/* Status label */}
        <div className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-wider text-red-700">
          Xato &middot; Tizim xatoligi
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Nimadir noto&apos;g&apos;ri ketdi
        </h1>

        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-600">
          Tizimda kutilmagan xatolik yuz berdi. Texnik jamoa avtomatik
          ravishda xabardor qilindi. Iltimos, qayta urinib ko&apos;ring.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="md"
            className="h-11 px-6 text-[15px]"
            onClick={() => unstable_retry()}
          >
            <RotateCw className="size-4" />
            Qayta urinish
          </Button>
          <Link href="/">
            <Button variant="secondary" size="md" className="h-11 px-6 text-[15px]">
              <Home className="size-4" />
              Bosh sahifaga
            </Button>
          </Link>
        </div>

        {/* Technical details — collapsed */}
        <details className="mt-10 w-full max-w-md rounded-md border border-border bg-surface-card text-left">
          <summary className="cursor-pointer select-none px-4 py-3 text-[13px] font-semibold text-ink-700 hover:bg-ink-100">
            Texnik ma&apos;lumot (ishlab chiquvchilar uchun)
          </summary>
          <div className="border-t border-border px-4 py-3 space-y-2">
            <div className="flex items-baseline gap-2 text-[12px]">
              <span className="text-ink-500">Error ID:</span>
              <code className="font-mono text-ink-900 break-all">
                {error.digest ?? "—"}
              </code>
            </div>
            <div className="flex flex-col gap-1 text-[12px]">
              <span className="text-ink-500">Message:</span>
              <code className="block whitespace-pre-wrap break-words rounded-sm bg-ink-100 px-2 py-1.5 font-mono text-[12px] text-ink-900">
                {error.message || "Noma'lum xato"}
              </code>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
