import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Check,
  Download,
  Trash2,
  Plus,
  Upload,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
} from "@/components/ui/dropdown";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  getSupplier,
  getDocuments,
  getProducts,
} from "@/lib/store";
import {
  formatSom,
  formatDate,
  formatNumber,
  cn,
} from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

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
    .replace(/\b(OOO|MChJ|MCHJ|LLC|JSC|АО|ООО|Bottlers|Distribution|Trade|Goods)\b/gi, "")
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const statusStyles: Record<string, string> = {
  approved: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
  review: "bg-amber-50 border-amber-600 text-amber-600 dark:text-amber-300",
  pending: "bg-navy-50 border-navy-700 text-navy-700 dark:text-navy-300",
  rejected: "bg-red-50 border-red-600 text-red-700 dark:text-red-300",
  duplicate: "bg-ink-100 border-ink-400 text-ink-600",
};

const statusLabels: Record<string, string> = {
  approved: "Tasdiqlangan",
  review: "Review",
  pending: "Kutmoqda",
  rejected: "Rad etilgan",
  duplicate: "Dublikat",
};

export default async function SupplierDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supplier = getSupplier(id);
  if (!supplier) notFound();

  const rng = seedFrom(supplier.id);

  // Real docs from this supplier
  const allDocs = getDocuments();
  const realDocs = allDocs.filter((d) => d.supplier.id === supplier.id);

  // KPIs
  const totalDocsCount = realDocs.length + 38 + Math.floor(rng() * 25);
  const thisMonthCount = 8 + Math.floor(rng() * 10);
  const totalTurnover = realDocs.reduce((sum, d) => sum + d.totalAmount, 0) +
    Math.round((60 + rng() * 80) * 1_000_000);
  const aiAccuracy = Math.round(88 + rng() * 9);

  // Build a docs list — real + mocked extension
  const mockExtraCount = Math.max(0, 10 - realDocs.length);
  const mockExtraDocs = Array.from({ length: mockExtraCount }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (5 + i * 4 + Math.floor(rng() * 3)));
    const statuses = ["approved", "approved", "approved", "review", "pending"];
    const status = statuses[Math.floor(rng() * statuses.length)];
    return {
      id: null as string | null,
      number: `${12200 + i + Math.floor(rng() * 40)}`,
      date: d.toISOString(),
      totalAmount: Math.round((0.8 + rng() * 4) * 1_000_000),
      status,
    };
  });

  const docsTable = [
    ...realDocs.slice(0, 10).map((d) => ({
      id: d.id,
      number: d.number,
      date: d.date,
      totalAmount: d.totalAmount,
      status: d.status,
    })),
    ...mockExtraDocs,
  ].slice(0, 10);

  // Top products from this supplier — pick 8 from catalog deterministically
  const allProducts = getProducts();
  const topProducts = Array.from({ length: 8 }, (_, i) => {
    const product = allProducts[i % allProducts.length];
    const count = Math.round(180 - i * 18 - rng() * 12);
    return { product, count };
  });
  const maxProductCount = Math.max(...topProducts.map((t) => t.count));

  // Confidence trend (30-day, dots+line)
  const trendPoints = Array.from({ length: 30 }, (_, i) => {
    const base = 0.85 + Math.sin(i / 6) * 0.06;
    return Math.max(0.6, Math.min(1, base + (rng() - 0.5) * 0.08));
  });
  const trendW = 600;
  const trendH = 140;
  const tPadT = 10;
  const tPadB = 22;
  const tPadL = 8;
  const tPadR = 8;
  const tInnerW = trendW - tPadL - tPadR;
  const tInnerH = trendH - tPadT - tPadB;
  const trendPoly = trendPoints
    .map((p, i) => {
      const x = tPadL + (i / (trendPoints.length - 1)) * tInnerW;
      const y = tPadT + (1 - (p - 0.5) / 0.5) * tInnerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <>
      <Topbar
        breadcrumb={[
          { label: "Yetkazib beruvchilar", href: "/yetkazib-beruvchilar" },
          { label: supplier.name },
        ]}
      />

      <main className="flex-1 overflow-y-auto bg-surface">
        {/* Page header */}
        <div className="border-b border-border bg-surface-card px-8 py-6">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/yetkazib-beruvchilar"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-500 hover:text-navy-700 dark:text-navy-300"
            >
              <ArrowLeft className="size-3.5" />
              Orqaga
            </Link>

            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="grid size-14 shrink-0 place-items-center rounded-full bg-navy-700 text-[18px] font-bold text-white">
                  {initials(supplier.name)}
                </div>
                <div className="min-w-0">
                  <h1 className="flex items-center gap-2.5 text-[26px] font-bold tracking-tight text-ink-900">
                    <span className="truncate">{supplier.name}</span>
                    {supplier.verified && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                        title="Soliq.uz orqali tasdiqlangan"
                      >
                        <Check className="size-2.5" strokeWidth={3} />
                        Tasdiqlangan
                      </span>
                    )}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
                    <span className="font-mono">
                      STIR{" "}
                      <span className="text-ink-900 font-semibold">
                        {supplier.stir}
                      </span>
                    </span>
                    <span className="text-ink-300">·</span>
                    <span className="font-mono text-[11px] text-ink-400">
                      {supplier.id}
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
                  <DropdownItem icon={<Download className="size-3.5" />}>
                    Hujjatlarni eksport
                  </DropdownItem>
                  <DropdownItem icon={<MessageSquare className="size-3.5" />}>
                    Sharh qoldirish
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem
                    variant="danger"
                    icon={<Trash2 className="size-3.5" />}
                  >
                    Yetkazib beruvchini o&apos;chirish
                  </DropdownItem>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-8 py-8">
          {/* KPI strip */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Jami hujjat"
              value={formatNumber(totalDocsCount)}
            />
            <KpiCard
              label="Bu oy hujjat"
              value={formatNumber(thisMonthCount)}
              valueClassName="text-navy-700 dark:text-navy-300"
              trend={{ value: "+18% oldingi oy", direction: "up" }}
            />
            <KpiCard
              label="Jami aylanma"
              value={formatSom(totalTurnover)}
            />
            <KpiCard
              label="AI aniqlik"
              value={`${aiAccuracy}%`}
              valueClassName={
                aiAccuracy >= 90
                  ? "text-emerald-600 dark:text-emerald-400"
                  : aiAccuracy >= 70
                  ? "text-amber-600 dark:text-amber-300"
                  : "text-red-700 dark:text-red-300"
              }
              trend={{
                value:
                  aiAccuracy >= 90
                    ? "Yuqori sifat"
                    : "Tekshirish kerak",
                direction: aiAccuracy >= 90 ? "up" : "warn",
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LEFT (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hujjatlar tarixi */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Hujjatlar tarixi</CardTitle>
                  <span className="font-mono text-[11px] text-ink-500">
                    {formatNumber(totalDocsCount)} ta
                  </span>
                </CardHeader>
                <div className="grid grid-cols-[90px_100px_140px_1fr_90px] items-center gap-3 border-b border-border bg-ink-100/50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                  <span>№</span>
                  <span>Sana</span>
                  <span>Status</span>
                  <span className="text-right">Summa</span>
                  <span className="text-right">Amal</span>
                </div>
                {docsTable.map((d, i) => (
                  <div
                    key={`${d.number}-${i}`}
                    className="grid grid-cols-[90px_100px_140px_1fr_90px] items-center gap-3 border-b border-border px-5 py-2.5 last:border-0 hover:bg-ink-100/40"
                  >
                    <span className="font-mono text-[12px] font-semibold text-ink-900">
                      №{d.number}
                    </span>
                    <span className="font-mono text-[12px] text-ink-600">
                      {formatDate(d.date)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wide",
                        statusStyles[d.status] ?? statusStyles.pending
                      )}
                    >
                      {statusLabels[d.status] ?? d.status}
                    </span>
                    <span className="text-right font-mono text-[12px] font-semibold text-ink-900">
                      {formatSom(d.totalAmount)}
                    </span>
                    <span className="text-right">
                      {d.id ? (
                        <Link
                          href={`/hujjatlar/${d.id}`}
                          className="text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                        >
                          Ko&apos;rish →
                        </Link>
                      ) : (
                        <span className="text-[12px] text-ink-400">—</span>
                      )}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-5 py-3 text-[12px] text-ink-500">
                  <span className="font-mono">
                    1-{docsTable.length} /{" "}
                    <span className="font-semibold text-ink-900">
                      {formatNumber(totalDocsCount)}
                    </span>
                  </span>
                  <Link
                    href="/hujjatlar"
                    className="font-medium text-navy-700 dark:text-navy-300 hover:underline"
                  >
                    Barchasini ko&apos;rish →
                  </Link>
                </div>
              </Card>

              {/* Eng ko'p mahsulot */}
              <Card>
                <CardHeader>
                  <CardTitle>Eng ko&apos;p mahsulot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {topProducts.map(({ product, count }, i) => {
                      const widthPct = Math.round((count / maxProductCount) * 100);
                      return (
                        <div
                          key={`${product.id}-${i}`}
                          className="flex items-center gap-3"
                        >
                          <Link
                            href={`/nomenklatura/${product.id}`}
                            className="w-44 shrink-0 truncate text-[13px] font-medium text-ink-700 hover:text-navy-700 dark:text-navy-300 hover:underline"
                          >
                            {product.name}
                          </Link>
                          <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-ink-100">
                            <div
                              className="h-full bg-navy-700"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                          <div className="w-20 shrink-0 text-right font-mono text-[12px] font-semibold text-ink-900">
                            {formatNumber(count)} {product.unit}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Aniqlik trend */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Aniqlik trend</CardTitle>
                  <span className="font-mono text-[11px] text-ink-500">
                    so&apos;nggi 30 kun
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex items-end gap-6">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Hozirgi
                      </div>
                      <div className="mt-1 font-mono text-[20px] font-bold text-emerald-700 dark:text-emerald-300">
                        {Math.round(trendPoints[trendPoints.length - 1] * 100)}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        30 kun o&apos;rtacha
                      </div>
                      <div className="mt-1 font-mono text-[13px] font-medium text-ink-700">
                        {Math.round(
                          (trendPoints.reduce((s, p) => s + p, 0) /
                            trendPoints.length) *
                            100
                        )}
                        %
                      </div>
                    </div>
                  </div>

                  <svg
                    viewBox={`0 0 ${trendW} ${trendH}`}
                    className="w-full"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Aniqlik trend grafigi"
                  >
                    {/* Threshold lines */}
                    {[
                      { v: 0.9, color: "#059669", label: "90%" },
                      { v: 0.6, color: "#D97706", label: "60%" },
                    ].map((t) => {
                      const y = tPadT + (1 - (t.v - 0.5) / 0.5) * tInnerH;
                      return (
                        <g key={t.v}>
                          <line
                            x1={tPadL}
                            y1={y}
                            x2={trendW - tPadR}
                            y2={y}
                            stroke={t.color}
                            strokeOpacity="0.25"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                          <text
                            x={trendW - tPadR}
                            y={y - 3}
                            fill={t.color}
                            fontSize="9"
                            fontFamily="IBM Plex Mono, monospace"
                            textAnchor="end"
                          >
                            {t.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Line */}
                    <polyline
                      points={trendPoly}
                      fill="none"
                      stroke="#0B3D91"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {/* Dots */}
                    {trendPoints.map((p, i) => {
                      const x = tPadL + (i / (trendPoints.length - 1)) * tInnerW;
                      const y = tPadT + (1 - (p - 0.5) / 0.5) * tInnerH;
                      const color =
                        p >= 0.9
                          ? "#059669"
                          : p >= 0.6
                          ? "#D97706"
                          : "#B91C1C";
                      return (
                        <circle key={i} cx={x} cy={y} r="2" fill={color} />
                      );
                    })}
                  </svg>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT (1/3) */}
            <div className="space-y-6">
              {/* Aloqa ma'lumotlari */}
              <Card>
                <CardHeader>
                  <CardTitle>Aloqa ma&apos;lumotlari</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-[13px]">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      STIR
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-ink-900">
                        {supplier.stir}
                      </span>
                      {supplier.verified && (
                        <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Check className="size-2.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Manzil
                    </div>
                    <div className="mt-1 text-ink-700">
                      Toshkent shahar, Yunusobod tumani, Amir Temur ko&apos;chasi
                      24
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Direktor
                    </div>
                    <div className="mt-1 text-ink-700">
                      Saidov Bobur Karimovich
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Telefon
                    </div>
                    <div className="mt-1 font-mono text-ink-700">
                      +998 71 234 56 78
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Email
                    </div>
                    <div className="mt-1 font-mono text-ink-700">
                      info@
                      {supplier.name.split(/\s+/)[0].toLowerCase()}.uz
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Hujjatlar qabul qilish
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <Check className="size-3" strokeWidth={3} />
                      Faol · Didox webhook
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tezkor amallar */}
              <Card>
                <CardHeader>
                  <CardTitle>Tezkor amallar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="primary" className="w-full justify-start">
                    <Plus className="size-4" />
                    Yangi buyurtma
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <Upload className="size-4" />
                    Hujjat yuklash
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageSquare className="size-4" />
                    Aloqaga chiqish (Telegram)
                  </Button>
                </CardContent>
              </Card>

              {/* AI baholash */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                    AI baholash
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  {[
                    { label: "Ishonchlilik", value: 9.4, color: "bg-emerald-600" },
                    { label: "Tezlik", value: 8.1, color: "bg-navy-700" },
                    { label: "Narx", value: 7.6, color: "bg-amber-600" },
                  ].map((m) => {
                    const widthPct = m.value * 10;
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
                            className={cn("h-full rounded-full", m.color)}
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <p className="pt-1 text-[11px] leading-relaxed text-ink-500">
                    Baholash so&apos;nggi 90 kunlik hujjatlar va kirim
                    qoidalariga asoslangan.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
