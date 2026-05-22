import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Pencil,
  Phone,
  MessageSquare,
  CreditCard,
  Ban,
  Sparkles,
  TrendingUp,
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
import { supplierPortal, ApiError } from "@/lib/api";
import type {
  OutgoingInvoiceStatus,
  SupplierStore,
  OutgoingInvoice,
  SupplierProduct,
} from "@/lib/types";
import { formatSom, formatDate, formatNumber, cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Deterministic seeded RNG from id
function seedFrom(id: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function initials(name: string): string {
  const cleaned = name
    .replace(/\b(MChJ|MCHJ|OOO|LLC|ООО)\b/gi, "")
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function joinedDuration(joinedAtIso: string): string {
  const NOW = new Date("2026-05-21T10:00:00Z").getTime();
  const joined = new Date(joinedAtIso).getTime();
  const days = Math.floor((NOW - joined) / 86400000);
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years > 0 && months > 0) return `${years} yil ${months} oy`;
  if (years > 0) return `${years} yil`;
  if (months > 0) return `${months} oy`;
  return `${days} kun`;
}

const storeStatusStyles: Record<string, string> = {
  active: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
  slow: "bg-amber-50 border-amber-600 text-amber-600 dark:text-amber-300",
  inactive: "bg-red-50 border-red-600 text-red-700 dark:text-red-300",
};

const storeStatusLabel: Record<string, string> = {
  active: "Faol",
  slow: "Sekin",
  inactive: "Nofaol",
};

const invoiceStatusStyles: Record<OutgoingInvoiceStatus, string> = {
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

const invoiceStatusLabel: Record<OutgoingInvoiceStatus, string> = {
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

const TASHKENT_STREETS = [
  "Amir Temur ko'chasi 24",
  "Mustaqillik shoh ko'chasi 12",
  "Bunyodkor ko'chasi 1A",
  "Shota Rustaveli 78",
  "Buyuk Ipak Yo'li 32",
  "Navoiy ko'chasi 56",
  "Furqat ko'chasi 14",
  "Sayilgoh ko'chasi 9",
];

export default async function StoreDetailPage({ params }: PageProps) {
  const { id } = await params;
  let supStore: SupplierStore;
  let storeInvoices: OutgoingInvoice[] = [];
  let products: SupplierProduct[] = [];
  try {
    const [storeRes, invoicesRes, productsRes] = await Promise.all([
      supplierPortal.stores.get(id),
      supplierPortal.invoices.list({ store: id, limit: 8 }),
      supplierPortal.products.list({ limit: 12 }),
    ]);
    supStore = storeRes;
    storeInvoices = invoicesRes.results;
    products = productsRes.results;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const rng = seedFrom(supStore.id);
  const productById = new Map(products.map((p) => [p.id, p]));

  const recentInvoices = storeInvoices.slice(0, 8);

  // KPI: bu oy buyurtma (count invoices last 30 days)
  const NOW = new Date("2026-05-21T10:00:00Z").getTime();
  const DAY = 86400000;
  const monthInvoices = storeInvoices.filter(
    (inv) => new Date(inv.sentAt).getTime() >= NOW - 30 * DAY,
  );
  const thisMonthOrders = monthInvoices.length;
  const thisMonthTurnover = supStore.monthlyVolume;

  // Top products from this store's invoices
  const productCounts = new Map<string, { count: number; total: number; name: string }>();
  for (const inv of storeInvoices) {
    for (const it of inv.items) {
      const prev = productCounts.get(it.productId) ?? {
        count: 0,
        total: 0,
        name: it.name,
      };
      prev.count += it.quantity;
      prev.total += it.total;
      productCounts.set(it.productId, prev);
    }
  }
  const topProducts = Array.from(productCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([pid, v]) => {
      const p = productById.get(pid);
      return {
        productId: pid,
        name: v.name,
        count: v.count,
        total: v.total,
        unit: p?.unit ?? "dona",
      };
    });
  const maxProductCount = Math.max(1, ...topProducts.map((p) => p.count));

  // 6-month payment chart (deterministic from store)
  const months = ["Dek", "Yan", "Fev", "Mar", "Apr", "May"];
  const paymentSeries = months.map((m, i) => {
    const r1 = rng();
    const r2 = rng();
    const r3 = rng();
    const paid = Math.round((4 + r1 * 8) * 1_000_000);
    const overdue = i === 5 ? Math.round(r2 * 1_500_000) : Math.round(r2 * 800_000);
    const pending = Math.round(r3 * 1_200_000);
    return { month: m, paid, overdue, pending };
  });
  const maxPaymentBar = Math.max(
    ...paymentSeries.map((p) => p.paid + p.overdue + p.pending),
  );
  const thisMonthPaid = paymentSeries[paymentSeries.length - 1].paid;
  const thisMonthOverdue = paymentSeries[paymentSeries.length - 1].overdue;

  // Credit limit visualization
  const creditUsagePct = Math.min(
    100,
    Math.round((supStore.outstandingBalance / supStore.creditLimit) * 100),
  );

  // Reliability sub-scores (deterministic)
  const subScores = [
    {
      label: "To'lov vaqtida",
      value: Math.min(10, supStore.reliabilityScore + (rng() - 0.5) * 0.6),
    },
    {
      label: "Hujjat tasdiqlash tezligi",
      value: Math.min(10, supStore.reliabilityScore + (rng() - 0.5) * 0.8),
    },
    {
      label: "Buyurtma muntazamligi",
      value: Math.min(10, supStore.reliabilityScore + (rng() - 0.5) * 0.7),
    },
  ];

  // Mock address
  const street = TASHKENT_STREETS[Math.floor(rng() * TASHKENT_STREETS.length)];
  const address = `${supStore.region}, ${supStore.district} tumani, ${street}`;

  return (
    <>
      <SupplierTopbar
        breadcrumb={[
          { label: "Do'konlar", href: "/supplier/do-konlar" },
          { label: supStore.name },
        ]}
      />

      <main className="flex-1 overflow-y-auto bg-surface">
        {/* Header */}
        <div className="border-b border-border bg-surface-card px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid size-14 shrink-0 place-items-center rounded-full bg-navy-700 text-[18px] font-bold text-white">
                  {initials(supStore.name)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-[26px] font-bold tracking-tight text-ink-900">
                      {supStore.name}
                    </h1>
                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                        storeStatusStyles[supStore.status],
                      )}
                    >
                      {storeStatusLabel[supStore.status]}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
                    <span className="font-mono">
                      STIR{" "}
                      <span className="font-semibold text-ink-900">
                        {supStore.stir}
                      </span>
                    </span>
                    <span className="text-ink-300">·</span>
                    <span>
                      {supStore.region} · {supStore.district}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary">
                  <Pencil className="size-4" />
                  Tahrirlash
                </Button>
                <Dropdown>
                  <DropdownItem icon={<Pencil className="size-3.5" />}>
                    Tahrirlash
                  </DropdownItem>
                  <DropdownItem icon={<CreditCard className="size-3.5" />}>
                    Kredit limit o&apos;zgartirish
                  </DropdownItem>
                  <DropdownItem icon={<MessageSquare className="size-3.5" />}>
                    Aloqaga chiqish
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem
                    variant="danger"
                    icon={<Ban className="size-3.5" />}
                  >
                    Bloklash
                  </DropdownItem>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
          {/* KPI strip */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Bu oy buyurtma"
              value={formatNumber(thisMonthOrders)}
              trend={{
                value:
                  supStore.growthPercent >= 0
                    ? `+${supStore.growthPercent.toFixed(1)}% o'tgan oyga`
                    : `${supStore.growthPercent.toFixed(1)}% o'tgan oyga`,
                direction: supStore.growthPercent >= 0 ? "up" : "down",
              }}
            />
            <KpiCard
              label="Bu oy aylanma"
              value={formatSom(thisMonthTurnover)}
              valueClassName="text-emerald-600 dark:text-emerald-400"
            />
            <KpiCard
              label="Total LTV"
              value={formatSom(supStore.totalLifetimeVolume)}
            />
            <KpiCard
              label="Reliability"
              value={`${supStore.reliabilityScore.toFixed(1)}/10`}
              valueClassName={
                supStore.reliabilityScore >= 8.5
                  ? "text-emerald-600 dark:text-emerald-400"
                  : supStore.reliabilityScore >= 7.0
                    ? "text-amber-600 dark:text-amber-300"
                    : "text-red-700 dark:text-red-300"
              }
              trend={{
                value:
                  supStore.reliabilityScore >= 8.5
                    ? "Yuqori ishonchli"
                    : "O'rtacha ishonchli",
                direction: supStore.reliabilityScore >= 8.5 ? "up" : "warn",
              }}
            />
          </div>

          {/* Two-col grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LEFT (2/3) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Buyurtmalar tarixi */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Buyurtmalar tarixi</CardTitle>
                  <span className="font-mono text-[11px] text-ink-500">
                    {formatNumber(storeInvoices.length)} ta
                  </span>
                </CardHeader>
                {recentInvoices.length === 0 ? (
                  <div className="px-5 py-10 text-center text-[13px] text-ink-500">
                    Buyurtmalar mavjud emas
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-[120px_100px_140px_1fr_90px] items-center gap-3 border-b border-border bg-ink-100/50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      <span>№</span>
                      <span>Sana</span>
                      <span>Status</span>
                      <span className="text-right">Summa</span>
                      <span className="text-right">Amal</span>
                    </div>
                    {recentInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="grid grid-cols-[120px_100px_140px_1fr_90px] items-center gap-3 border-b border-border px-5 py-2.5 last:border-0 hover:bg-ink-100/40"
                      >
                        <span className="font-mono text-[12px] font-semibold text-ink-900">
                          {inv.number}
                        </span>
                        <span className="font-mono text-[12px] text-ink-600">
                          {formatDate(inv.sentAt)}
                        </span>
                        <span
                          className={cn(
                            "inline-flex w-fit items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                            invoiceStatusStyles[inv.status],
                          )}
                        >
                          {invoiceStatusLabel[inv.status]}
                        </span>
                        <span className="text-right font-mono text-[12px] font-semibold text-ink-900">
                          {formatSom(inv.totalAmount)}
                        </span>
                        <span className="text-right">
                          <Link
                            href={`/supplier/hujjatlar/${inv.id}`}
                            className="text-[12px] font-medium text-navy-700 hover:underline dark:text-navy-300"
                          >
                            Ko&apos;rish →
                          </Link>
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </Card>

              {/* Top products */}
              {topProducts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Eng ko&apos;p sotib oladigan mahsulotlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5">
                      {topProducts.map((p) => {
                        const widthPct = Math.round(
                          (p.count / maxProductCount) * 100,
                        );
                        return (
                          <div
                            key={p.productId}
                            className="flex items-center gap-3"
                          >
                            <span className="w-48 shrink-0 truncate text-[13px] font-medium text-ink-700">
                              {p.name}
                            </span>
                            <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-ink-100">
                              <div
                                className="h-full bg-navy-700"
                                style={{ width: `${widthPct}%` }}
                              />
                            </div>
                            <div className="w-24 shrink-0 text-right font-mono text-[12px] font-semibold text-ink-900">
                              {formatNumber(p.count)} {p.unit}
                            </div>
                            <div className="w-32 shrink-0 text-right font-mono text-[11px] text-ink-500">
                              {formatSom(p.total)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment history chart */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>To&apos;lov tarixi</CardTitle>
                  <span className="font-mono text-[11px] text-ink-500">
                    so&apos;nggi 6 oy
                  </span>
                </CardHeader>
                <CardContent>
                  <PaymentChart series={paymentSeries} maxBar={maxPaymentBar} />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-[12px]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-sm bg-emerald-600" />
                        <span className="text-ink-600">To&apos;langan</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-sm bg-amber-600" />
                        <span className="text-ink-600">Kutilmoqda</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-sm bg-red-600" />
                        <span className="text-ink-600">Kechikkan</span>
                      </span>
                    </div>
                    <div className="font-mono text-ink-600">
                      Bu oy:{" "}
                      <strong className="text-emerald-700 dark:text-emerald-300">
                        {formatSom(thisMonthPaid)}
                      </strong>{" "}
                      to&apos;landi
                      {thisMonthOverdue > 0 && (
                        <>
                          {" · "}
                          <strong className="text-red-700 dark:text-red-300">
                            {formatSom(thisMonthOverdue)}
                          </strong>{" "}
                          kechikkan
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT (1/3) */}
            <div className="space-y-6">
              {/* Aloqa */}
              <Card>
                <CardHeader>
                  <CardTitle>Aloqa ma&apos;lumotlari</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-[13px]">
                  <Field label="Direktor" value={supStore.director} />
                  <Field label="Telefon" value={supStore.phone} mono />
                  <Field label="Manzil" value={address} />
                  <Field
                    label="Ulanish"
                    value={joinedDuration(supStore.joinedAt)}
                  />
                  <div className="flex gap-2 pt-1">
                    <Button variant="primary" className="flex-1">
                      <Phone className="size-3.5" />
                      Qo&apos;ng&apos;iroq
                    </Button>
                    <Button variant="secondary" className="flex-1">
                      <MessageSquare className="size-3.5" />
                      Telegram
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Kredit limit */}
              <Card>
                <CardHeader>
                  <CardTitle>Kredit limit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="font-mono text-[22px] font-bold tabular-nums text-ink-900">
                    {formatSom(supStore.creditLimit)}
                  </div>
                  <div>
                    <div className="relative h-2.5 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className={cn(
                          "h-full transition-all",
                          creditUsagePct >= 80
                            ? "bg-red-600"
                            : creditUsagePct >= 50
                              ? "bg-amber-600"
                              : "bg-emerald-600",
                        )}
                        style={{ width: `${creditUsagePct}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-ink-500">
                      <span>
                        Foydalanilgan:{" "}
                        <strong className="text-ink-900">
                          {creditUsagePct}%
                        </strong>
                      </span>
                      <span>{formatSom(supStore.outstandingBalance)}</span>
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full">
                    Limitni oshirish
                  </Button>
                </CardContent>
              </Card>

              {/* Reliability skoring */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Reliability skoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  {subScores.map((m) => {
                    const widthPct = Math.min(100, Math.max(0, m.value * 10));
                    return (
                      <div key={m.label}>
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="font-medium text-ink-700">
                            {m.label}
                          </span>
                          <span className="font-mono font-semibold text-ink-900">
                            {m.value.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI tahlil */}
          <Alert variant="info" className="mt-6">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0" />
              <div>
                <div className="font-semibold">AI tahlil</div>
                <div className="mt-1 text-[13px] leading-relaxed">
                  Bu do&apos;kon o&apos;rtacha{" "}
                  <strong className="font-mono">
                    {(2.4 + rng() * 1.2).toFixed(1)} kun
                  </strong>{" "}
                  ichida hujjatlarni tasdiqlaydi. To&apos;lov muddati{" "}
                  <strong className="font-mono">21 kun</strong> (o&apos;rtacha).
                  {supStore.reliabilityScore >= 9.0 ? (
                    <>
                      {" "}
                      Kredit limit oshirilishi mumkin (joriy reliability ≥ 9.0).
                    </>
                  ) : supStore.reliabilityScore >= 8.0 ? (
                    <>
                      {" "}
                      Hozirgi kredit limit barqaror — bu do&apos;kon barqaror
                      mijoz.
                    </>
                  ) : (
                    <>
                      {" "}
                      Kredit limitni saqlash tavsiya etiladi — reliability
                      o&apos;rtacha.
                    </>
                  )}
                </div>
              </div>
            </div>
          </Alert>
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
      <div className={cn("mt-1 text-ink-700", mono && "font-mono")}>{value}</div>
    </div>
  );
}

function PaymentChart({
  series,
  maxBar,
}: {
  series: { month: string; paid: number; overdue: number; pending: number }[];
  maxBar: number;
}) {
  const W = 600;
  const H = 160;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 22;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const barWidth = (innerW / series.length) * 0.65;
  const gap = (innerW / series.length) * 0.35;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="To'lov tarixi grafigi"
    >
      {series.map((s, i) => {
        const total = s.paid + s.pending + s.overdue;
        const totalH = (total / maxBar) * innerH;
        const paidH = (s.paid / maxBar) * innerH;
        const pendingH = (s.pending / maxBar) * innerH;
        const overdueH = (s.overdue / maxBar) * innerH;
        const x = padL + i * (barWidth + gap) + gap / 2;
        const yBase = padT + innerH;
        return (
          <g key={i}>
            {/* Overdue (top) */}
            <rect
              x={x}
              y={yBase - totalH}
              width={barWidth}
              height={overdueH}
              fill="#DC2626"
              rx="1"
            />
            {/* Pending (middle) */}
            <rect
              x={x}
              y={yBase - totalH + overdueH}
              width={barWidth}
              height={pendingH}
              fill="#D97706"
            />
            {/* Paid (bottom) */}
            <rect
              x={x}
              y={yBase - paidH}
              width={barWidth}
              height={paidH}
              fill="#059669"
              rx="1"
            />
            <text
              x={x + barWidth / 2}
              y={H - 6}
              fill="#64748b"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              textAnchor="middle"
            >
              {s.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
