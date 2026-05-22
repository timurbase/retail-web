import Link from "next/link";
import {
  Bell,
  Download,
  Pencil,
  Phone,
  CheckCircle2,
  Gavel,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { supplierPortal, ApiError } from "@/lib/api";
import { formatSom, formatDate, cn } from "@/lib/utils";
import type { PaymentRecord } from "@/lib/types";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function pickString(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = params[key];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

interface AgingResponse {
  buckets: { label: string; count: number; sum: number }[];
}

function overdueColor(days: number): string {
  if (days <= 30) return "text-amber-600 dark:text-amber-300";
  if (days <= 60) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

const STATUS_META: Record<
  PaymentRecord["status"],
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: "Kutilmoqda",
    bg: "bg-amber-50",
    text: "text-amber-600 dark:text-amber-300",
    border: "border-amber-600",
  },
  paid: {
    label: "To'langan",
    bg: "bg-emerald-50",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-600",
  },
  overdue: {
    label: "Kechikkan",
    bg: "bg-red-50",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-600",
  },
  partial: {
    label: "Qisman to'langan",
    bg: "bg-navy-50",
    text: "text-navy-700 dark:text-navy-300",
    border: "border-navy-700",
  },
};

export default async function SupplierToLovlarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  let payments: PaymentRecord[] = [];
  // Aging summary from backend is informational; this page also computes its own
  // buckets from the visible payments list to keep all derived stats in sync.
  let _aging: AgingResponse | null = null;
  let loadError: string | null = null;
  try {
    const [paymentsRes, agingRes] = await Promise.all([
      supplierPortal.payments.list({
        status: pickString(params, "status"),
        aging: pickString(params, "aging"),
        search: pickString(params, "q") ?? pickString(params, "search"),
        ordering: pickString(params, "ordering"),
        limit: 200,
      }),
      supplierPortal.payments.aging().catch(() => null),
    ]);
    payments = paymentsRes.results;
    _aging = agingRes as AgingResponse | null;
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "To'lovlarni yuklab bo'lmadi";
  }
  void _aging;

  // KPI
  const pending = payments.filter((p) => p.status === "pending" || p.status === "partial");
  const overdue = payments.filter((p) => p.status === "overdue");
  const paid = payments.filter((p) => p.status === "paid");

  const totalPending =
    pending.reduce((s, p) => s + (p.amount - p.paidAmount), 0) +
    overdue.reduce((s, p) => s + (p.amount - p.paidAmount), 0);

  // "this month paid"
  const NOW = new Date("2026-05-21T10:00:00Z").getTime();
  const MONTH_MS = 30 * 86400000;
  const paidThisMonth = paid
    .filter((p) => p.paidAt && new Date(p.paidAt).getTime() >= NOW - MONTH_MS)
    .reduce((s, p) => s + p.paidAmount, 0);

  const overdueAmount = overdue.reduce((s, p) => s + (p.amount - p.paidAmount), 0);

  // Aging buckets
  const b0_30 = overdue.filter((p) => p.daysOverdue <= 30);
  const b31_60 = overdue.filter((p) => p.daysOverdue > 30 && p.daysOverdue <= 60);
  const b61_90 = overdue.filter((p) => p.daysOverdue > 60 && p.daysOverdue <= 90);
  const b90 = overdue.filter((p) => p.daysOverdue > 90);

  const agingTotal =
    b0_30.reduce((s, p) => s + (p.amount - p.paidAmount), 0) +
    b31_60.reduce((s, p) => s + (p.amount - p.paidAmount), 0) +
    b61_90.reduce((s, p) => s + (p.amount - p.paidAmount), 0) +
    b90.reduce((s, p) => s + (p.amount - p.paidAmount), 0);

  const sumAmount = (arr: PaymentRecord[]) =>
    arr.reduce((s, p) => s + (p.amount - p.paidAmount), 0);

  const agingBuckets = [
    { label: "0-30 kun", arr: b0_30, color: "bg-emerald-600", chip: "bg-emerald-50 text-emerald-700 dark:text-emerald-300 border-emerald-600" },
    { label: "31-60 kun", arr: b31_60, color: "bg-amber-600", chip: "bg-amber-50 text-amber-600 dark:text-amber-300 border-amber-600" },
    { label: "61-90 kun", arr: b61_90, color: "bg-orange-600", chip: "bg-orange-50 text-orange-600 dark:text-orange-400 border-orange-600" },
    { label: "90+ kun", arr: b90, color: "bg-red-600", chip: "bg-red-50 text-red-700 dark:text-red-300 border-red-600" },
  ];

  // Aging score: 100 — overdue% of total receivables (capped at 0)
  const totalReceivables = pending.reduce((s, p) => s + (p.amount - p.paidAmount), 0) + overdueAmount;
  const overdueRatio = totalReceivables > 0 ? overdueAmount / totalReceivables : 0;
  const agingScore = Math.max(0, Math.round(100 - overdueRatio * 100));

  // Combined sorted list — overdue first by daysOverdue desc, then pending by dueDate asc
  const overdueSorted = [...overdue].sort((a, b) => b.daysOverdue - a.daysOverdue);
  const pendingSorted = [...pending].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  const mainList = [...overdueSorted, ...pendingSorted].slice(0, 30);

  return (
    <>
      <SupplierTopbar
        breadcrumb={[{ label: "Supplier" }, { label: "To'lovlar" }]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {loadError && (
            <Alert variant="error" className="mb-4">
              {loadError}
            </Alert>
          )}
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                To&apos;lovlar
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Kutilayotgan tushum va kechikkan to&apos;lovlar boshqaruvi
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <Bell className="size-4" />
                Avto-eslatma sozlash
              </Button>
              <Button variant="secondary">
                <Download className="size-4" />
                Excel eksport
              </Button>
            </div>
          </div>

          {/* KPI */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Jami kutilayotgan"
              value={formatSom(totalPending)}
              valueClassName="text-amber-600 dark:text-amber-300"
              trend={{ value: `${pending.length + overdue.length} ta hujjat`, direction: "warn" }}
            />
            <KpiCard
              label="Bu oy paid"
              value={formatSom(paidThisMonth)}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: `${paid.length} ta to'lov`, direction: "up" }}
            />
            <KpiCard
              label="Kechikkan"
              value={`${overdue.length} ta`}
              valueClassName="text-red-600 dark:text-red-400"
              trend={{ value: formatSom(overdueAmount), direction: "down" }}
            />
            <KpiCard
              label="Aging score"
              value={`${agingScore}/100`}
              valueClassName={
                agingScore >= 80
                  ? "text-emerald-600 dark:text-emerald-400"
                  : agingScore >= 60
                  ? "text-amber-600 dark:text-amber-300"
                  : "text-red-600 dark:text-red-400"
              }
              trend={{
                value:
                  agingScore >= 80
                    ? "Yaxshi"
                    : agingScore >= 60
                    ? "O'rta"
                    : "Diqqat",
                direction: agingScore >= 80 ? "up" : "warn",
              }}
            />
          </div>

          {/* Aging report */}
          <Card className="mb-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>
                Kechikkan to&apos;lovlar &mdash; aging analizi
              </CardTitle>
              <span className="font-mono text-[11px] text-ink-500">
                Jami: {formatSom(agingTotal)} &middot; {overdue.length} ta
              </span>
            </CardHeader>
            <CardContent>
              {/* Stacked horizontal bar */}
              {agingTotal > 0 ? (
                <div className="mb-5 flex h-7 w-full overflow-hidden rounded-md border border-border">
                  {agingBuckets.map((b) => {
                    const sum = sumAmount(b.arr);
                    const pct = (sum / agingTotal) * 100;
                    if (pct < 1) return null;
                    return (
                      <div
                        key={b.label}
                        className={cn(b.color, "flex items-center justify-center text-[10px] font-mono font-semibold text-white")}
                        style={{ width: `${pct}%` }}
                        title={`${b.label}: ${formatSom(sum)}`}
                      >
                        {pct > 8 ? `${b.label.split(" ")[0]} · ${b.arr.length}` : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mb-5 rounded-md border border-dashed border-border bg-ink-100/40 px-5 py-6 text-center text-[13px] text-ink-500">
                  Kechikkan to&apos;lovlar yo&apos;q
                </div>
              )}

              {/* 4 buckets */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {agingBuckets.map((b) => {
                  const sum = sumAmount(b.arr);
                  const pct = agingTotal > 0 ? (sum / agingTotal) * 100 : 0;
                  return (
                    <div
                      key={b.label}
                      className={cn(
                        "rounded-md border p-3",
                        b.chip
                      )}
                    >
                      <div className="font-mono text-[10px] uppercase tracking-wider opacity-80">
                        {b.label}
                      </div>
                      <div className="mt-1 font-mono text-[18px] font-bold leading-tight">
                        {b.arr.length} ta
                      </div>
                      <div className="mt-0.5 font-mono text-[12px] font-semibold">
                        {formatSom(sum)}
                      </div>
                      <div className="mt-1 font-mono text-[10px] opacity-70">
                        {pct.toFixed(0)}% jamidan
                      </div>
                      {b.label === "90+ kun" && b.arr.length > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-sm bg-red-600 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
                          <Gavel className="size-3" />
                          Qonuniy aloqa kerak
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Main table */}
          <Card className="mb-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>To&apos;lovlar ro&apos;yxati</CardTitle>
              <span className="font-mono text-[11px] text-ink-500">
                {mainList.length} dan {payments.length} ko&apos;rsatildi
              </span>
            </CardHeader>
            <div className="overflow-x-auto">
              <div className="min-w-[1100px]">
                <div className="grid grid-cols-[140px_1.4fr_140px_110px_110px_100px_120px_60px] items-center gap-3 border-b border-border bg-ink-100/40 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                  <span>Hujjat #</span>
                  <span>Do&apos;kon</span>
                  <span className="text-right">Summa</span>
                  <span>Sana</span>
                  <span>Muddati</span>
                  <span className="text-right">Kechikkan</span>
                  <span>Status</span>
                  <span></span>
                </div>
                {mainList.map((p) => {
                  const st = STATUS_META[p.status];
                  const remaining = p.amount - p.paidAmount;
                  const isOverdue = p.status === "overdue";
                  return (
                    <div
                      key={p.id}
                      className="grid grid-cols-[140px_1.4fr_140px_110px_110px_100px_120px_60px] items-center gap-3 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/40"
                    >
                      <Link
                        href={`/supplier/hujjatlar/${p.invoiceId}`}
                        className="font-mono text-[12px] font-semibold text-navy-700 dark:text-navy-300 hover:underline truncate"
                      >
                        {p.invoiceNumber}
                      </Link>
                      <Link
                        href={`/supplier/do-konlar/${p.storeId}`}
                        className="text-[13px] text-ink-900 hover:text-navy-700 dark:hover:text-navy-300 hover:underline truncate"
                      >
                        {p.storeName}
                      </Link>
                      <span className="text-right font-mono text-[13px] font-semibold text-ink-900">
                        {formatSom(remaining)}
                      </span>
                      <span className="font-mono text-[11px] text-ink-600">
                        {formatDate(p.invoiceDate)}
                      </span>
                      <span className="font-mono text-[11px] text-ink-600">
                        {formatDate(p.dueDate)}
                      </span>
                      <span
                        className={cn(
                          "text-right font-mono text-[13px] font-semibold",
                          isOverdue ? overdueColor(p.daysOverdue) : "text-ink-500"
                        )}
                      >
                        {isOverdue ? `${p.daysOverdue} kun` : "—"}
                      </span>
                      <span
                        className={cn(
                          "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase",
                          st.bg,
                          st.border,
                          st.text
                        )}
                      >
                        {st.label}
                      </span>
                      <div className="justify-self-end">
                        <Dropdown>
                          <DropdownItem icon={<Bell className="size-3.5" />}>
                            Eslatma yuborish (SMS)
                          </DropdownItem>
                          <DropdownItem icon={<MessageSquare className="size-3.5" />}>
                            Telegram orqali eslatma
                          </DropdownItem>
                          <DropdownItem icon={<CheckCircle2 className="size-3.5" />}>
                            To&apos;lov belgilash
                          </DropdownItem>
                          <DropdownDivider />
                          <DropdownItem icon={<Phone className="size-3.5" />}>
                            Qo&apos;ng&apos;iroq qilish
                          </DropdownItem>
                          <DropdownItem icon={<Gavel className="size-3.5" />}>
                            Qonuniy aloqa
                          </DropdownItem>
                          <DropdownDivider />
                          <DropdownItem icon={<XCircle className="size-3.5" />} variant="danger">
                            Bekor qilish
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Auto-reminder rules */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Avto-eslatma qoidalari</CardTitle>
              <Link
                href="/supplier/sozlamalar"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
              >
                <Pencil className="size-3" />
                Tahrirlash
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="rounded-md border border-emerald-600 bg-emerald-50/60 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    7 kun
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-ink-900">
                    SMS eslatma
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-ink-500">
                    To&apos;lov muddati yaqinlashmoqda
                  </div>
                </div>
                <div className="rounded-md border border-amber-600 bg-amber-50/60 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-300">
                    14 kun
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-ink-900">
                    Email + SMS
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-ink-500">
                    Direktor va buxgalter
                  </div>
                </div>
                <div className="rounded-md border border-orange-600 bg-orange-50/60 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    30 kun
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-ink-900">
                    Qo&apos;ng&apos;iroq
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-ink-500">
                    Sotuv menejeri qo&apos;ng&apos;iroq qiladi
                  </div>
                </div>
                <div className="rounded-md border border-red-600 bg-red-50/60 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-red-700 dark:text-red-300">
                    60 kun
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-ink-900">
                    Qonuniy aloqa
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-ink-500">
                    Yuridik bo&apos;lim ishtirok etadi
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
