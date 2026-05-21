import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Sahifa topilmadi · RetailFlow AI",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-6 py-12">
      {/* Subtle navy grid background (matches landing hero) */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0B3D91 1px, transparent 1px), linear-gradient(to bottom, #0B3D91 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

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
        {/* Status code label */}
        <div className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700">
          Xato &middot; 404
        </div>

        {/* Huge 404 in IBM Plex Mono */}
        <div className="font-mono text-[9rem] font-bold leading-none -tracking-tight text-ink-900 sm:text-[12rem]">
          404
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Sahifa topilmadi
        </h1>

        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-600">
          Bu sahifa mavjud emas, o&apos;chirib tashlangan, yoki manzil
          noto&apos;g&apos;ri kiritilgan. Ehtimol uni qidirish va MXIK
          katalogidan topish osonroq bo&apos;lar.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button size="md" className="h-11 px-6 text-[15px]">
              <Home className="size-4" />
              Bosh sahifaga
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="md" className="h-11 px-6 text-[15px]">
              <ArrowLeft className="size-4" />
              Dashboard&apos;ga qaytish
            </Button>
          </Link>
        </div>

        {/* Support link */}
        <div className="mt-10 text-[13px] text-ink-500">
          Yoki{" "}
          <Link
            href="/yordam"
            className="font-medium text-navy-700 underline-offset-4 hover:underline"
          >
            yordam markazi
          </Link>{" "}
          bilan bog&apos;laning
        </div>
      </div>
    </div>
  );
}
