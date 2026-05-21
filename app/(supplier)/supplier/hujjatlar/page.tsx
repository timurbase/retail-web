import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  FileSpreadsheet,
  Search,
  Calendar,
  ChevronDown,
} from "lucide-react";

import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  getOutgoingInvoices,
  getSupplierStore,
} from "@/lib/store";
import type { OutgoingInvoiceStatus } from "@/lib/types";
import { formatSom, formatDate, cn } from "@/lib/utils";

const statusStyles: Record<OutgoingInvoiceStatus, string> = {
  draft: "bg-ink-100 border-ink-400 text-ink-600",
  sent: "bg-navy-50 border-navy-700 text-navy-700 dark:text-navy-300",
  received: "bg-navy-50 border-navy-700 text-navy-700 dark:text-navy-300",
  approved: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
  preparing: "bg-amber-50 border-amber-600 text-amber-600 dark:text-amber-300",
  delivering: "bg-amber-50 border-amber-600 text-amber-600 dark:text-amber-300",
  delivered: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
  paid: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
  cancelled: "bg-red-50 border-red-600 text-red-700 dark:text-red-300",
};

const statusLabel: Record<OutgoingInvoiceStatus, string> = {
  draft: "Qoralama",
  sent: "Yuborilgan",
  received: "Qabul qilindi",
  approved: "Tasdiqlandi",
  preparing: "Tayyorlanmoqda",
  delivering: "Yetkazib bermoqda",
  delivered: "Yetkazib berildi",
  paid: "To'landi",
  cancelled: "Bekor qilingan",
};

const TABS: { key: OutgoingInvoiceStatus | "all"; label: string }[] = [
  { key: "all", label: "Hammasi" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Yuborilgan" },
  { key: "received", label: "Qabul qilindi" },
  { key: "approved", label: "Tasdiqlandi" },
  { key: "preparing", label: "Tayyorlanmoqda" },
  { key: "delivering", label: "Yetkazib bermoqda" },
  { key: "delivered", label: "Yetkazib berildi" },
  { key: "paid", label: "To'landi" },
  { key: "cancelled", label: "Bekor qilingan" },
];

const NOW = new Date("2026-05-21T10:00:00Z").getTime();
const DAY = 86400000;

export default function HujjatlarListPage() {
  const invoices = getOutgoingInvoices();

  // Counts per status
  const counts: Record<string, number> = { all: invoices.length };
  for (const inv of invoices) {
    counts[inv.status] = (counts[inv.status] ?? 0) + 1;
  }

  // KPIs
  const thisWeek = invoices.filter(
    (inv) => new Date(inv.sentAt).getTime() >= NOW - 7 * DAY,
  ).length;
  const deliveredCount = invoices.filter(
    (inv) => inv.status === "delivered" || inv.status === "paid",
  ).length;
  const pendingPayment = invoices
    .filter(
      (inv) =>
        inv.status === "delivered" ||
        inv.status === "approved" ||
        inv.status === "received",
    )
    .reduce((s, inv) => s + inv.totalAmount, 0);
  const thisMonthPaid = invoices
    .filter(
      (inv) =>
        inv.status === "paid" &&
        inv.paidAt &&
        new Date(inv.paidAt).getTime() >= NOW - 30 * DAY,
    )
    .reduce((s, inv) => s + inv.totalAmount, 0);

  // Show first 50
  const visible = invoices.slice(0, 50);

  return (
    <>
      <SupplierTopbar breadcrumb={[{ label: "Hujjatlar" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Yuborilgan hujjatlar
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Do&apos;konlarga jo&apos;natilgan invoice&apos;lar — jami{" "}
                <span className="font-mono font-semibold text-ink-700">
                  {invoices.length} ta
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <FileSpreadsheet className="size-4" />
                Bulk import (Excel)
              </Button>
              <Link href="/supplier/hujjatlar/yangi">
                <Button>
                  <Plus className="size-4" />
                  Yangi hujjat
                </Button>
              </Link>
            </div>
          </div>

          {/* KPI strip */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Bu hafta yuborilgan"
              value={thisWeek}
              trend={{ value: "+12 o'tgan haftaga", direction: "up" }}
            />
            <KpiCard
              label="Yetkazib berildi"
              value={deliveredCount}
              valueClassName="text-emerald-600 dark:text-emerald-400"
            />
            <KpiCard
              label="Kutilayotgan to'lov"
              value={formatSom(pendingPayment)}
              valueClassName="text-amber-600 dark:text-amber-300"
            />
            <KpiCard
              label="Bu oy paid"
              value={formatSom(thisMonthPaid)}
              valueClassName="text-emerald-600 dark:text-emerald-400"
            />
          </div>

          {/* Tabs */}
          <Card className="mb-4 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {TABS.map((t) => {
                const active = t.key === "all";
                const count = counts[t.key] ?? 0;
                return (
                  <button
                    key={t.key}
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                      active
                        ? "bg-navy-700 text-white"
                        : "border border-border bg-surface-card text-ink-600 hover:bg-ink-100",
                    )}
                  >
                    {t.label}
                    <span
                      className={cn(
                        "font-mono text-[10px]",
                        active ? "text-white/80" : "text-ink-400",
                      )}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search + sort + date filter row */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="search"
                  placeholder="Invoice raqami yoki do'kon nomi..."
                  className="h-9 w-full rounded-sm border border-border bg-surface pl-9 pr-3 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-2 focus:-outline-offset-1 focus:outline-navy-700"
                />
              </div>
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-sm border border-border bg-surface-card px-3 text-[13px] text-ink-700 hover:bg-ink-100"
              >
                <span className="text-ink-500">Saralash:</span>
                <span className="font-medium">Eng so&apos;nggi</span>
                <ChevronDown className="size-3.5 text-ink-400" />
              </button>
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-sm border border-border bg-surface-card px-3 text-[13px] text-ink-700 hover:bg-ink-100"
              >
                <Calendar className="size-3.5 text-ink-500" />
                <span className="font-mono">21.04 — 21.05.2026</span>
              </button>
            </div>
          </Card>

          {/* Invoice list */}
          <Card>
            {visible.length === 0 ? (
              <div className="px-5 py-12 text-center text-[13px] text-ink-500">
                Hujjatlar mavjud emas
              </div>
            ) : (
              <div>
                {visible.map((inv) => {
                  const store = getSupplierStore(inv.storeId);
                  const isDeliveredLate =
                    inv.status === "delivered" &&
                    new Date(inv.sentAt).getTime() <= NOW - 7 * DAY &&
                    !inv.paidAt;
                  const topProducts = inv.items.slice(0, 3);
                  return (
                    <Link
                      key={inv.id}
                      href={`/supplier/hujjatlar/${inv.id}`}
                      className={cn(
                        "relative grid grid-cols-[1.4fr_1fr_auto] items-center gap-4 border-b border-border px-5 py-3.5 transition-colors last:border-0 hover:bg-ink-100/50",
                        isDeliveredLate && "border-l-4 border-l-red-600",
                      )}
                    >
                      {/* Left: status + invoice */}
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "inline-flex w-fit shrink-0 items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                            statusStyles[inv.status],
                          )}
                        >
                          {statusLabel[inv.status]}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[13px] font-semibold text-ink-900">
                              {inv.number}
                            </span>
                            {isDeliveredLate && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-red-600 bg-red-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-red-700 dark:text-red-300">
                                ⚠ Kechikkan
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] text-ink-500">
                            Xaridor:{" "}
                            <span className="text-ink-700">
                              {store?.name ?? "—"}
                            </span>
                            {store && (
                              <>
                                {" · "}
                                <span className="font-mono">{store.region}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: items count + emojis */}
                      <div className="hidden min-w-0 sm:block">
                        <div className="text-[12px] font-medium text-ink-700">
                          {inv.items.length} ta mahsulot
                        </div>
                        <div className="mt-0.5 truncate font-mono text-[10px] text-ink-500">
                          {topProducts.map((p, idx) => {
                            const emojiMatch = p.name.match(
                              /^(\p{Emoji}|\p{Extended_Pictographic})/u,
                            );
                            const emoji = emojiMatch ? emojiMatch[0] : "•";
                            return (
                              <span key={idx} className="mr-1.5">
                                {emoji}
                              </span>
                            );
                          })}
                          {inv.items.length > 3 && (
                            <span className="text-ink-400">
                              +{inv.items.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: dates + amount + chevron */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="font-mono text-[12px] font-semibold tabular-nums text-ink-900">
                            {formatSom(inv.totalAmount)}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-ink-500">
                            {formatDate(inv.sentAt)}
                            {" · muddat "}
                            {formatDate(inv.dueDate)}
                          </div>
                        </div>
                        <ChevronRight className="size-4 shrink-0 text-ink-300" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="font-mono text-[12px] text-ink-500">
                <span className="font-semibold text-ink-700">
                  1–{visible.length}
                </span>{" "}
                / {invoices.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-sm border border-border text-ink-400 hover:bg-ink-100 disabled:opacity-40"
                  disabled
                  aria-label="Oldingi"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-sm bg-navy-700 font-mono text-[12px] font-semibold text-white"
                >
                  1
                </button>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-sm border border-border text-ink-600 hover:bg-ink-100"
                >
                  <span className="font-mono text-[12px]">2</span>
                </button>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-sm border border-border text-ink-600 hover:bg-ink-100"
                >
                  <span className="font-mono text-[12px]">3</span>
                </button>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-sm border border-border text-ink-600 hover:bg-ink-100"
                  aria-label="Keyingi"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
