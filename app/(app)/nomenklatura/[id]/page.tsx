import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Sparkles,
  PackagePlus,
  ClipboardCheck,
  AlertTriangle,
  ShoppingCart,
  Download,
  Copy,
  Trash2,
  Check,
} from "lucide-react";

import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
} from "@/components/ui/dropdown";
import {
  products as productsApi,
  documents as documentsApi,
  suppliers as suppliersApi,
  ApiError,
} from "@/lib/api";
import { formatSom, formatDate, formatNumber, cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Deterministic pseudo-random based on id — so the chart is stable between renders
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

function StatLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
      {children}
    </div>
  );
}

function StatValue({
  children,
  mono = true,
  className,
}: {
  children: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-1 text-[14px] font-semibold text-ink-900",
        mono && "font-mono",
        className
      )}
    >
      {children}
    </div>
  );
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  let product: Awaited<ReturnType<typeof productsApi.get>>;
  try {
    product = await productsApi.get(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (!product) notFound();

  const rng = seedFrom(product.id);

  // Stock state
  const belowMin = product.currentStock < product.minStock;
  const atMin = product.currentStock === product.minStock;
  const stockColor = belowMin
    ? "text-red-700 dark:text-red-300"
    : atMin
    ? "text-amber-600 dark:text-amber-300"
    : "text-ink-900";

  // 30-day price history points (mock, deterministic per product)
  const priceHistory = Array.from({ length: 30 }, (_, i) => {
    const wave = Math.sin(i / 4) * 0.05;
    const noise = (rng() - 0.5) * 0.08;
    return Math.round(product.avgPrice * (1 + wave + noise));
  });
  const minPrice = Math.min(...priceHistory);
  const maxPrice = Math.max(...priceHistory);
  const priceRange = Math.max(1, maxPrice - minPrice);

  const chartWidth = 600;
  const chartHeight = 160;
  const padTop = 12;
  const padBottom = 24;
  const padLeft = 8;
  const padRight = 8;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const pricePoints = priceHistory
    .map((p, i) => {
      const x = padLeft + (i / (priceHistory.length - 1)) * innerW;
      const y = padTop + (1 - (p - minPrice) / priceRange) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Build receipt history: filter docs that contain this product
  let allDocs: Awaited<ReturnType<typeof documentsApi.list>>["results"] = [];
  let supplierPool: Awaited<ReturnType<typeof suppliersApi.list>>["results"] = [];
  try {
    const [dRes, sRes] = await Promise.all([
      documentsApi.list(),
      suppliersApi.list({ limit: 8 }),
    ]);
    allDocs = dRes.results;
    supplierPool = sRes.results;
  } catch {
    // Non-fatal: detail page still renders product info; receipts will be empty.
  }
  const realReceipts = allDocs
    .flatMap((doc) =>
      (doc.rows ?? [])
        .filter((row) => row.mappedProductId === product.id)
        .map((row) => ({
          docId: doc.id,
          docNumber: doc.number,
          supplierId: doc.supplier.id,
          supplierName: doc.supplier.name,
          date: doc.date,
          quantity: row.quantity,
          unit: row.unit,
          price: row.price,
          total: row.total,
        }))
    )
    .slice(0, 8);

  // Top up to 6-8 with deterministic mock receipts if needed
  const mockReceiptCount = Math.max(0, 7 - realReceipts.length);
  const mockReceipts = Array.from({ length: mockReceiptCount }, (_, i) => {
    const supplierIdx = Math.floor(rng() * supplierPool.length);
    const supplier = supplierPool[supplierIdx];
    const daysAgo = 5 + i * 4 + Math.floor(rng() * 3);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const qty = Math.round(5 + rng() * 20);
    const priceVar = product.avgPrice * (0.92 + rng() * 0.16);
    const price = Math.round(priceVar / 100) * 100;
    return {
      docId: null as string | null,
      docNumber: `${12300 + Math.floor(rng() * 50)}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      date: d.toISOString(),
      quantity: qty,
      unit: product.unit,
      price,
      total: qty * price,
    };
  });
  const receipts = [...realReceipts, ...mockReceipts];

  // Top suppliers — pick 3 distinct from supplier pool deterministically
  const topSuppliers = [
    supplierPool[0],
    supplierPool[3] ?? supplierPool[1],
    supplierPool[6] ?? supplierPool[2],
  ]
    .filter(Boolean)
    .map((s, i) => ({
      supplier: s,
      price: Math.round(product.avgPrice * (0.95 + i * 0.04)),
      count: 18 - i * 5,
    }));

  // Sales mock — deterministic
  const sales30 = 200 + Math.floor(rng() * 100);
  const avgDaily = (sales30 / 30).toFixed(1);
  const peakDay = Math.round(sales30 / 30 + 6);
  const lowDay = Math.max(1, Math.round(sales30 / 30 - 5));
  const turnoverDays = Math.max(
    3,
    Math.round((product.currentStock / Math.max(1, sales30 / 30)) * 1.5)
  );

  // Last received fallback
  const lastReceived = product.lastReceivedAt
    ? formatDate(product.lastReceivedAt)
    : "—";

  // Mock "created at"
  const createdMock = "15.01.2026";

  // Product emoji (very small heuristic for nice visual)
  const emojiMap: Record<string, string> = {
    p_meat_premium: "🥩",
    p_coca_05: "🥤",
    p_milk_imkon: "🥛",
    p_bread_gulli: "🍞",
  };
  const emoji = emojiMap[product.id] ?? "📦";

  // MXIK validated heuristic
  const mxikValid = product.mxik && product.mxik.length === 10;

  // Days until stockout
  const daysUntilOut = Math.max(
    0,
    Math.round(product.currentStock / Math.max(0.5, sales30 / 30))
  );

  return (
    <>
      <Topbar
        breadcrumb={[
          { label: "Nomenklatura", href: "/nomenklatura" },
          { label: product.name },
        ]}
      />

      <main className="flex-1 overflow-y-auto bg-surface">
        {/* Page header */}
        <div className="border-b border-border bg-surface-card px-8 py-6">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/nomenklatura"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-500 hover:text-navy-700 dark:text-navy-300"
            >
              <ArrowLeft className="size-3.5" />
              Orqaga
            </Link>

            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="flex items-center gap-3 text-[28px] font-bold tracking-tight text-ink-900">
                  <span aria-hidden className="text-[32px] leading-none">
                    {emoji}
                  </span>
                  <span className="truncate">{product.name}</span>
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
                  <span className="inline-flex items-center gap-1 font-mono">
                    MXIK
                    <span className="text-ink-900 font-semibold">
                      {product.mxik}
                    </span>
                    {mxikValid && (
                      <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-emerald-600 text-white text-[8px] font-bold">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="text-ink-300">·</span>
                  <span>
                    Birlik:{" "}
                    <span className="font-mono text-ink-700">
                      {product.unit}
                    </span>
                  </span>
                  <span className="text-ink-300">·</span>
                  <span className="font-mono text-[11px] text-ink-400">
                    {product.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary">
                  <Pencil className="size-4" />
                  Tahrirlash
                </Button>
                <Dropdown>
                  <DropdownItem icon={<Download className="size-3.5" />}>
                    Tarixini eksport
                  </DropdownItem>
                  <DropdownItem icon={<Copy className="size-3.5" />}>
                    Dublikat bilan birlashtirish
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem
                    variant="danger"
                    icon={<Trash2 className="size-3.5" />}
                  >
                    O&apos;chirish
                  </DropdownItem>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-8 py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LEFT (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Asosiy ma'lumotlar */}
              <Card>
                <CardHeader>
                  <CardTitle>Asosiy ma&apos;lumotlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
                    <div>
                      <StatLabel>MXIK</StatLabel>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="font-mono text-[14px] font-semibold text-ink-900">
                          {product.mxik}
                        </span>
                        {mxikValid && (
                          <span className="inline-flex size-4 items-center justify-center rounded-full bg-emerald-600 text-white">
                            <Check className="size-2.5" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <StatLabel>Birlik</StatLabel>
                      <StatValue mono={false}>{product.unit}</StatValue>
                    </div>

                    <div>
                      <StatLabel>O&apos;rtacha narx</StatLabel>
                      <StatValue>{formatSom(product.avgPrice)}</StatValue>
                    </div>

                    <div>
                      <StatLabel>Hozirgi qoldiq</StatLabel>
                      <div
                        className={cn(
                          "mt-1 font-mono text-[24px] font-bold leading-none tracking-tight",
                          stockColor
                        )}
                      >
                        {formatNumber(product.currentStock)}{" "}
                        <span className="text-[13px] font-medium text-ink-500">
                          {product.unit}
                        </span>
                      </div>
                      {belowMin && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 dark:text-red-300">
                          <AlertTriangle className="size-3" />
                          Limitdan past
                        </div>
                      )}
                      {atMin && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-300">
                          <AlertTriangle className="size-3" />
                          Limitda
                        </div>
                      )}
                    </div>

                    <div>
                      <StatLabel>Minimal limit</StatLabel>
                      <div className="mt-1 font-mono text-[14px] font-medium text-ink-500">
                        {formatNumber(product.minStock)} {product.unit}
                      </div>
                    </div>

                    <div>
                      <StatLabel>Oxirgi kirim</StatLabel>
                      <StatValue>{lastReceived}</StatValue>
                    </div>

                    <div>
                      <StatLabel>Yaratilgan</StatLabel>
                      <StatValue>{createdMock}</StatValue>
                    </div>

                    <div>
                      <StatLabel>Kategoriya</StatLabel>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-full border border-navy-700 bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-700 dark:text-navy-300">
                          Oziq-ovqat
                        </span>
                      </div>
                    </div>

                    <div>
                      <StatLabel>Aylanma tezligi</StatLabel>
                      <StatValue>{turnoverDays} kun</StatValue>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Narx tarixi */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Narx tarixi</CardTitle>
                  <span className="font-mono text-[11px] text-ink-500">
                    so&apos;nggi 30 kun
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex items-end gap-6">
                    <div>
                      <StatLabel>Hozirgi</StatLabel>
                      <div className="mt-1 font-mono text-[20px] font-bold text-ink-900">
                        {formatSom(priceHistory[priceHistory.length - 1])}
                      </div>
                    </div>
                    <div>
                      <StatLabel>Eng past</StatLabel>
                      <div className="mt-1 font-mono text-[13px] font-medium text-emerald-700 dark:text-emerald-300">
                        {formatSom(minPrice)}
                      </div>
                    </div>
                    <div>
                      <StatLabel>Eng yuqori</StatLabel>
                      <div className="mt-1 font-mono text-[13px] font-medium text-red-700 dark:text-red-300">
                        {formatSom(maxPrice)}
                      </div>
                    </div>
                  </div>

                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Narx tarixi grafigi"
                  >
                    {/* Grid */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                      const y = padTop + p * innerH;
                      return (
                        <line
                          key={p}
                          x1={padLeft}
                          y1={y}
                          x2={chartWidth - padRight}
                          y2={y}
                          stroke="#E2E8F0"
                          strokeWidth="1"
                        />
                      );
                    })}
                    {/* Area fill */}
                    <polygon
                      points={`${padLeft},${chartHeight - padBottom} ${pricePoints} ${
                        chartWidth - padRight
                      },${chartHeight - padBottom}`}
                      fill="#0B3D91"
                      fillOpacity="0.06"
                    />
                    {/* Line */}
                    <polyline
                      points={pricePoints}
                      fill="none"
                      stroke="#0B3D91"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {/* Last point dot */}
                    {(() => {
                      const last = priceHistory[priceHistory.length - 1];
                      const x = padLeft + innerW;
                      const y = padTop + (1 - (last - minPrice) / priceRange) * innerH;
                      return (
                        <circle
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill="#059669"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                      );
                    })()}
                    {/* X-axis labels */}
                    <text
                      x={padLeft}
                      y={chartHeight - 6}
                      fill="#94A3B8"
                      fontSize="10"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      -30 kun
                    </text>
                    <text
                      x={chartWidth - padRight}
                      y={chartHeight - 6}
                      fill="#94A3B8"
                      fontSize="10"
                      fontFamily="IBM Plex Mono, monospace"
                      textAnchor="end"
                    >
                      bugun
                    </text>
                  </svg>
                </CardContent>
              </Card>

              {/* Kirim tarixi */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Kirim tarixi</CardTitle>
                  <span className="font-mono text-[11px] text-ink-500">
                    {receipts.length} ta yozuv
                  </span>
                </CardHeader>
                <div className="grid grid-cols-[100px_1fr_90px_120px_130px_90px] items-center gap-3 border-b border-border bg-ink-100/50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                  <span>Sana</span>
                  <span>Yetkazib beruvchi</span>
                  <span className="text-right">Miqdor</span>
                  <span className="text-right">Narx</span>
                  <span className="text-right">Summa</span>
                  <span className="text-right">Hujjat №</span>
                </div>
                {receipts.map((r, i) => (
                  <div
                    key={`${r.docNumber}-${i}`}
                    className="grid grid-cols-[100px_1fr_90px_120px_130px_90px] items-center gap-3 border-b border-border px-5 py-2.5 last:border-0 hover:bg-ink-100/40"
                  >
                    <span className="font-mono text-[12px] text-ink-700">
                      {formatDate(r.date)}
                    </span>
                    <Link
                      href={`/yetkazib-beruvchilar/${r.supplierId}`}
                      className="truncate text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                    >
                      {r.supplierName}
                    </Link>
                    <span className="text-right font-mono text-[12px] text-ink-900">
                      {formatNumber(r.quantity)} {r.unit}
                    </span>
                    <span className="text-right font-mono text-[12px] text-ink-700">
                      {formatSom(r.price)}
                    </span>
                    <span className="text-right font-mono text-[12px] font-semibold text-ink-900">
                      {formatSom(r.total)}
                    </span>
                    <span className="text-right">
                      {r.docId ? (
                        <Link
                          href={`/hujjatlar/${r.docId}`}
                          className="font-mono text-[12px] text-navy-700 dark:text-navy-300 hover:underline"
                        >
                          №{r.docNumber}
                        </Link>
                      ) : (
                        <span className="font-mono text-[12px] text-ink-400">
                          №{r.docNumber}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </Card>

              {/* Sotuv tahlili */}
              <Card>
                <CardHeader>
                  <CardTitle>Sotuv tahlili</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
                    <div>
                      <StatLabel>So&apos;nggi 30 kun sotuv</StatLabel>
                      <div className="mt-1 font-mono text-[24px] font-bold leading-none tracking-tight text-ink-900">
                        {formatNumber(sales30)}{" "}
                        <span className="text-[13px] font-medium text-ink-500">
                          {product.unit}
                        </span>
                      </div>
                    </div>
                    <div>
                      <StatLabel>Kunlik o&apos;rtacha</StatLabel>
                      <div className="mt-1 font-mono text-[18px] font-semibold text-ink-900">
                        {avgDaily}{" "}
                        <span className="text-[12px] font-medium text-ink-500">
                          {product.unit}/kun
                        </span>
                      </div>
                    </div>
                    <div>
                      <StatLabel>Aylanma tezligi</StatLabel>
                      <div className="mt-1 font-mono text-[18px] font-semibold text-ink-900">
                        {turnoverDays} kun
                      </div>
                      <div className="mt-1 text-[11px] text-ink-500">
                        Mahsulot to&apos;liq sotilish vaqti
                      </div>
                    </div>
                    <div>
                      <StatLabel>Eng yuqori kun</StatLabel>
                      <div className="mt-1 text-[13px] font-medium text-ink-900">
                        Juma —{" "}
                        <span className="font-mono">
                          {formatNumber(peakDay)} {product.unit}
                        </span>
                      </div>
                    </div>
                    <div>
                      <StatLabel>Eng past kun</StatLabel>
                      <div className="mt-1 text-[13px] font-medium text-ink-900">
                        Yakshanba —{" "}
                        <span className="font-mono">
                          {formatNumber(lowDay)} {product.unit}
                        </span>
                      </div>
                    </div>
                    <div>
                      <StatLabel>Tugashi (prognoz)</StatLabel>
                      <div
                        className={cn(
                          "mt-1 font-mono text-[18px] font-semibold",
                          daysUntilOut <= 5
                            ? "text-red-700 dark:text-red-300"
                            : daysUntilOut <= 10
                            ? "text-amber-600 dark:text-amber-300"
                            : "text-ink-900"
                        )}
                      >
                        {daysUntilOut} kun
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT (1/3) */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              {/* Tezkor amallar */}
              <Card>
                <CardHeader>
                  <CardTitle>Tezkor amallar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="emerald" className="w-full justify-start">
                    <ShoppingCart className="size-4" />
                    Buyurtma berish (40 dona Alpha&apos;ga)
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <PackagePlus className="size-4" />
                    Kirim qo&apos;shish
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <ClipboardCheck className="size-4" />
                    Inventarizatsiya
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <AlertTriangle className="size-4" />
                    Limit o&apos;zgartirish
                  </Button>
                </CardContent>
              </Card>

              {/* AI tahlil */}
              <Card className="border-emerald-600/30 bg-emerald-50/40">
                <CardContent>
                  <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="size-3.5" />
                    AI bashorat
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink-700">
                    Hozirgi sotuv sur&apos;atida bu mahsulot{" "}
                    <strong className="font-mono text-ink-900">
                      {daysUntilOut} kunda
                    </strong>{" "}
                    tugashi mumkin.{" "}
                    <strong className="font-mono text-ink-900">40-50 dona</strong>{" "}
                    buyurtma berishni tavsiya etamiz.
                  </p>
                  <button className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-600 dark:text-emerald-400 hover:underline">
                    Buyurtmani avto-yaratish →
                  </button>
                </CardContent>
              </Card>

              {/* Asosiy yetkazib beruvchilar */}
              <Card>
                <CardHeader>
                  <CardTitle>Asosiy yetkazib beruvchilar</CardTitle>
                </CardHeader>
                <div>
                  {topSuppliers.map(({ supplier, price, count }, i) => {
                    const inits = supplier.name
                      .replace(/\b(OOO|MChJ|MCHJ|LLC|OOO|JSC)\b/g, "")
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <Link
                        key={supplier.id}
                        href={`/yetkazib-beruvchilar/${supplier.id}`}
                        className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/40"
                      >
                        <div
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white",
                            i === 0
                              ? "bg-navy-700"
                              : i === 1
                              ? "bg-emerald-600"
                              : "bg-ink-600"
                          )}
                        >
                          {inits}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-ink-900">
                            {supplier.name}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-ink-500">
                            {formatSom(price)} · {count} kirim
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
