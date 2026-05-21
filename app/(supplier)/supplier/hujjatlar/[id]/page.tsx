import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Download,
  Pencil,
  Ban,
  Send,
  MessageSquare,
  CheckCircle2,
  Circle,
  Truck,
  Package,
  ClipboardCheck,
  FileText,
  Bell,
} from "lucide-react";

import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
} from "@/components/ui/dropdown";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  getOutgoingInvoice,
  getSupplierStore,
} from "@/lib/store";
import type { OutgoingInvoiceStatus } from "@/lib/types";
import { formatSom, formatDate, formatNumber, cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

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

// Status to progress index in 5-step timeline
const TIMELINE_STEPS = [
  { key: "sent", label: "Yuborildi", icon: Send },
  { key: "received", label: "Qabul qilindi", icon: ClipboardCheck },
  { key: "approved", label: "Tasdiqlandi", icon: CheckCircle2 },
  { key: "delivering", label: "Yetkazib bermoqda", icon: Truck },
  { key: "delivered", label: "Yetkazib berildi", icon: Package },
];

function statusToStepIndex(status: OutgoingInvoiceStatus): number {
  switch (status) {
    case "draft":
      return -1;
    case "sent":
      return 0;
    case "received":
      return 1;
    case "approved":
      return 2;
    case "preparing":
      return 2;
    case "delivering":
      return 3;
    case "delivered":
      return 4;
    case "paid":
      return 4;
    case "cancelled":
      return -1;
  }
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const inv = getOutgoingInvoice(id);
  if (!inv) notFound();

  const store = getSupplierStore(inv.storeId);
  const currentStep = statusToStepIndex(inv.status);

  // Build timeline timestamps deterministically based on sentAt
  const sentMs = new Date(inv.sentAt).getTime();
  const timelineTimes = TIMELINE_STEPS.map((_, idx) => {
    return new Date(sentMs + idx * 6 * 3600000).toISOString();
  });

  // Days remaining / overdue for payment
  const NOW = new Date("2026-05-21T10:00:00Z").getTime();
  const dueMs = new Date(inv.dueDate).getTime();
  const daysDiff = Math.floor((dueMs - NOW) / 86400000);
  const isPaid = inv.status === "paid";
  const paymentLate = !isPaid && daysDiff < 0;

  return (
    <>
      <SupplierTopbar
        breadcrumb={[
          { label: "Hujjatlar", href: "/supplier/hujjatlar" },
          { label: `№${inv.number}` },
        ]}
      />

      <main className="flex-1 overflow-y-auto bg-surface">
        {/* Header */}
        <div className="border-b border-border bg-surface-card px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider",
                      statusStyles[inv.status],
                    )}
                  >
                    {statusLabel[inv.status]}
                  </span>
                  <h1 className="font-mono text-[24px] font-bold tracking-tight text-ink-900">
                    {inv.number}
                  </h1>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
                  <span>Xaridor:</span>
                  {store ? (
                    <Link
                      href={`/supplier/do-konlar/${store.id}`}
                      className="font-semibold text-navy-700 hover:underline dark:text-navy-300"
                    >
                      {store.name}
                    </Link>
                  ) : (
                    <span className="text-ink-700">—</span>
                  )}
                  <span className="text-ink-300">·</span>
                  <span className="font-mono">
                    Yuborilgan {formatDate(inv.sentAt)}
                  </span>
                  <span className="text-ink-300">·</span>
                  <span className="font-mono">
                    Muddati {formatDate(inv.dueDate)}
                  </span>
                  <span className="text-ink-300">·</span>
                  <strong className="font-mono text-ink-900">
                    {formatSom(inv.totalAmount)}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary">
                  <Download className="size-4" />
                  PDF yuklab olish
                </Button>
                <Dropdown>
                  <DropdownItem icon={<Pencil className="size-3.5" />}>
                    Tahrirlash
                  </DropdownItem>
                  <DropdownItem icon={<Send className="size-3.5" />}>
                    Qayta yuborish
                  </DropdownItem>
                  <DropdownItem icon={<MessageSquare className="size-3.5" />}>
                    Aloqaga chiqish
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem
                    variant="danger"
                    icon={<Ban className="size-3.5" />}
                  >
                    Bekor qilish
                  </DropdownItem>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
          {/* KPI strip */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Mahsulotlar" value={formatNumber(inv.items.length)} />
            <KpiCard
              label="Jami summa"
              value={formatSom(inv.totalAmount)}
              valueClassName="text-emerald-600 dark:text-emerald-400"
            />
            <KpiCard label="Yuborilgan" value={formatDate(inv.sentAt)} />
            <div className="rounded-md border border-border bg-surface-card p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                Status
              </div>
              <div className="mt-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[12px] font-semibold uppercase tracking-wider",
                    statusStyles[inv.status],
                  )}
                >
                  {statusLabel[inv.status]}
                </span>
              </div>
              {inv.trackingNote && (
                <div className="mt-2 text-[11px] text-ink-500">
                  {inv.trackingNote}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LEFT (2/3) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Mahsulotlar table */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Mahsulotlar</CardTitle>
                  <span className="font-mono text-[11px] text-ink-500">
                    {inv.items.length} ta
                  </span>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-ink-100/40 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        <th className="w-10 px-3 py-2.5 text-left">№</th>
                        <th className="px-3 py-2.5 text-left">Mahsulot</th>
                        <th className="px-3 py-2.5 text-left">MXIK</th>
                        <th className="px-3 py-2.5 text-left">Birlik</th>
                        <th className="px-3 py-2.5 text-right">Miqdor</th>
                        <th className="px-3 py-2.5 text-right">Narx</th>
                        <th className="px-3 py-2.5 text-right">Summa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.items.map((it, idx) => (
                        <tr
                          key={`${it.productId}-${idx}`}
                          className="border-b border-border last:border-0 hover:bg-ink-100/30"
                        >
                          <td className="px-3 py-2.5 font-mono text-[11px] text-ink-500">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2.5 text-[13px] font-medium text-ink-900">
                            {it.name}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[11px] text-ink-700">
                            {it.mxik}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[12px] text-ink-600">
                            {it.unit}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-[12px] tabular-nums text-ink-900">
                            {formatNumber(it.quantity)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-[12px] tabular-nums text-ink-700">
                            {formatSom(it.price)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-[12px] font-semibold tabular-nums text-ink-900">
                            {formatSom(it.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border bg-ink-100/40">
                        <td
                          colSpan={6}
                          className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-ink-700"
                        >
                          JAMI
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-[15px] font-bold tabular-nums text-ink-900">
                          {formatSom(inv.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>

              {/* Delivery timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Yetkazib berish kuzatuvi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="relative">
                    {TIMELINE_STEPS.map((step, idx) => {
                      const isDone = idx <= currentStep;
                      const isCurrent =
                        idx === currentStep && inv.status !== "delivered" && inv.status !== "paid";
                      const isPending = idx > currentStep;
                      const Icon = step.icon;
                      const isLast = idx === TIMELINE_STEPS.length - 1;
                      return (
                        <li
                          key={step.key}
                          className="relative flex gap-4 pb-5 last:pb-0"
                        >
                          {/* Vertical line */}
                          {!isLast && (
                            <span
                              className={cn(
                                "absolute left-[15px] top-8 h-[calc(100%-12px)] w-0.5",
                                idx < currentStep
                                  ? "bg-emerald-600"
                                  : "bg-ink-200",
                              )}
                              aria-hidden
                            />
                          )}
                          {/* Dot */}
                          <span
                            className={cn(
                              "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2",
                              isDone &&
                                "border-emerald-600 bg-emerald-50 text-emerald-700 dark:text-emerald-300",
                              isCurrent &&
                                "border-amber-600 bg-amber-50 text-amber-600 animate-pulse dark:text-amber-300",
                              isPending && "border-ink-200 bg-surface text-ink-300",
                            )}
                          >
                            {isDone && !isCurrent ? (
                              <CheckCircle2 className="size-4" />
                            ) : isCurrent ? (
                              <Icon className="size-4" />
                            ) : (
                              <Circle className="size-3.5" />
                            )}
                          </span>
                          <div className="pt-1.5">
                            <div
                              className={cn(
                                "text-[13px] font-semibold",
                                isDone ? "text-ink-900" : "text-ink-500",
                              )}
                            >
                              {step.label}
                              {isCurrent && (
                                <span className="ml-2 inline-flex items-center rounded-full border border-amber-600 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">
                                  Hozir
                                </span>
                              )}
                            </div>
                            <div
                              className={cn(
                                "mt-0.5 font-mono text-[11px]",
                                isDone ? "text-ink-600" : "text-ink-400",
                              )}
                            >
                              {isDone ? fmtDateTime(timelineTimes[idx]) : "Kutilmoqda"}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT (1/3) */}
            <div className="space-y-6">
              {/* Xaridor */}
              <Card>
                <CardHeader>
                  <CardTitle>Xaridor (do&apos;kon)</CardTitle>
                </CardHeader>
                <CardContent>
                  {store ? (
                    <div className="space-y-3 text-[13px]">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-700 text-[13px] font-bold text-white">
                          {store.name
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-semibold text-ink-900">
                            {store.name}
                          </div>
                          <div className="mt-0.5 truncate font-mono text-[11px] text-ink-500">
                            {store.region} · {store.district}
                          </div>
                        </div>
                      </div>
                      <Field label="STIR" value={store.stir} mono />
                      <Field label="Direktor" value={store.director} />
                      <Field label="Telefon" value={store.phone} mono />
                      <Link
                        href={`/supplier/do-konlar/${store.id}`}
                        className="inline-flex items-center gap-1 pt-1 text-[12px] font-semibold text-navy-700 hover:underline dark:text-navy-300"
                      >
                        Profil ko&apos;rish →
                      </Link>
                    </div>
                  ) : (
                    <div className="text-[13px] text-ink-500">
                      Do&apos;kon ma&apos;lumotlari topilmadi.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* To'lov holati */}
              <Card>
                <CardHeader>
                  <CardTitle>To&apos;lov holati</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-[13px]">
                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                        isPaid
                          ? "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300"
                          : paymentLate
                            ? "bg-red-50 border-red-600 text-red-700 dark:text-red-300"
                            : "bg-amber-50 border-amber-600 text-amber-600 dark:text-amber-300",
                      )}
                    >
                      {isPaid
                        ? "To'landi"
                        : paymentLate
                          ? "Kechikkan"
                          : "Kutilmoqda"}
                    </span>
                  </div>
                  <Field label="Muddati" value={formatDate(inv.dueDate)} mono />
                  <div className="text-[12px] text-ink-600">
                    {isPaid && inv.paidAt ? (
                      <>
                        To&apos;langan sana:{" "}
                        <span className="font-mono text-ink-900">
                          {formatDate(inv.paidAt)}
                        </span>
                      </>
                    ) : paymentLate ? (
                      <span className="font-semibold text-red-700 dark:text-red-300">
                        {Math.abs(daysDiff)} kun kechikdi
                      </span>
                    ) : (
                      <>
                        Qolgan:{" "}
                        <span className="font-mono font-semibold text-ink-900">
                          {daysDiff} kun
                        </span>
                      </>
                    )}
                  </div>
                  {!isPaid && (
                    <Button variant="secondary" className="w-full">
                      <Bell className="size-3.5" />
                      Eslatma yuborish
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Hujjatlar */}
              <Card>
                <CardHeader>
                  <CardTitle>Hujjatlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-[13px]">
                  <div className="flex items-center justify-between rounded-sm border border-border bg-surface px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-4 shrink-0 text-navy-700 dark:text-navy-300" />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink-900">
                          Invoice PDF
                        </div>
                        <div className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                          Tayyor
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="grid size-7 shrink-0 place-items-center rounded-sm text-ink-500 hover:bg-ink-100"
                      aria-label="Yuklab olish"
                    >
                      <Download className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-sm border border-border bg-surface px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-4 shrink-0 text-amber-600 dark:text-amber-300" />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink-900">
                          EHF (Didox)
                        </div>
                        <div className="font-mono text-[10px] text-amber-600 dark:text-amber-300">
                          Imzo kutilmoqda
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contextual alert */}
          {inv.status === "delivered" && !isPaid && (
            <Alert variant="warning" className="mt-6">
              <div className="text-[13px]">
                Yetkazib berildi — to&apos;lov{" "}
                <strong className="font-mono">
                  {formatDate(inv.dueDate)}
                </strong>{" "}
                gacha qabul qilinishi kerak.{" "}
                {daysDiff > 0
                  ? `${daysDiff} kun qoldi.`
                  : `${Math.abs(daysDiff)} kun kechikdi.`}
              </div>
            </Alert>
          )}
          {inv.status === "paid" && (
            <Alert variant="success" className="mt-6">
              <div className="text-[13px]">
                Hujjat yopildi — to&apos;lov{" "}
                <strong className="font-mono">
                  {inv.paidAt ? formatDate(inv.paidAt) : "—"}
                </strong>{" "}
                sanasida qabul qilindi.
              </div>
            </Alert>
          )}
          {inv.status === "draft" && (
            <Alert variant="info" className="mt-6">
              <div className="text-[13px]">
                Bu qoralama — hali xaridorga yuborilmagan. Yuborish uchun
                hujjatni tahrirlang.
              </div>
            </Alert>
          )}
          {inv.status === "cancelled" && (
            <Alert variant="error" className="mt-6">
              <div className="text-[13px]">
                Bu hujjat bekor qilindi va qayta tiklanmaydi.
              </div>
            </Alert>
          )}
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div className={cn("mt-0.5 text-ink-700", mono && "font-mono")}>
        {value}
      </div>
    </div>
  );
}
