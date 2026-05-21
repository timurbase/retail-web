import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Download,
  Send,
  Phone,
  Building2,
  FileText,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import { Topbar } from "@/components/layout/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { OrderHeaderMenu } from "./header-menu";
import { cn, formatSom } from "@/lib/utils";

type OrderStatus =
  | "sent"
  | "confirmed"
  | "delivering"
  | "delivered"
  | "cancelled";

interface OrderLine {
  name: string;
  mxik: string;
  qty: number;
  unit: string;
  price: number;
}

interface TimelineStep {
  label: string;
  date: string | null;
  by?: string;
  state: "done" | "active" | "pending";
}

interface OrderDetail {
  id: string; // BR-2026-NNNN
  supplier: {
    name: string;
    stir: string;
    phone: string;
    initials: string;
    color: string;
  };
  createdAt: string;
  eta: string;
  status: OrderStatus;
  note: string;
  lines: OrderLine[];
  timeline: TimelineStep[];
  relatedDocNumber?: string;
}

const PRODUCT_POOL: OrderLine[] = [
  { name: "Coca-Cola 0.5L PET", mxik: "2202100000", qty: 50, unit: "dona", price: 7500 },
  { name: "Pepsi 0.5L PET", mxik: "2202100000", qty: 40, unit: "dona", price: 7000 },
  { name: "Mineral suv 1.5L", mxik: "2201100000", qty: 60, unit: "dona", price: 6000 },
  { name: "Imkon sut 1L", mxik: "0401200000", qty: 60, unit: "dona", price: 8500 },
  { name: "Lazzat shokolad 100g", mxik: "1806320000", qty: 50, unit: "dona", price: 8500 },
  { name: "Marlboro Red blok", mxik: "2402200000", qty: 20, unit: "blok", price: 30000 },
  { name: "Choy Lipton 100p", mxik: "0902300000", qty: 40, unit: "dona", price: 18000 },
  { name: "Guruch (premium) 1kg", mxik: "1006300000", qty: 100, unit: "kg", price: 12000 },
  { name: "Oq non 'Gulli'", mxik: "1905900000", qty: 80, unit: "dona", price: 3500 },
  { name: "Kungaboqar yog'i 1L", mxik: "1512190000", qty: 40, unit: "dona", price: 12300 },
];

const SUPPLIERS = [
  { name: "Alpha Distribution OOO", stir: "301234567", phone: "+998 71 200 11 22", initials: "AD", color: "bg-navy-700" },
  { name: "Beta Trade MChJ", stir: "302345678", phone: "+998 71 200 33 44", initials: "BT", color: "bg-emerald-600" },
  { name: "Lazzat OOO", stir: "304567890", phone: "+998 71 200 55 66", initials: "LZ", color: "bg-navy-800" },
  { name: "Nestle Uzbekistan", stir: "305678901", phone: "+998 71 200 77 88", initials: "NE", color: "bg-emerald-700" },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; pill: string; barColor: string }
> = {
  sent: {
    label: "Yuborilgan",
    pill: "border-navy-700 bg-navy-50 text-navy-700 dark:text-navy-300",
    barColor: "border-l-navy-700",
  },
  confirmed: {
    label: "Tasdiqlangan",
    pill: "border-navy-700 bg-navy-50 text-navy-700 dark:text-navy-300",
    barColor: "border-l-navy-700",
  },
  delivering: {
    label: "Yetkazib bermoqda",
    pill: "border-amber-600 bg-amber-50 text-amber-600 dark:text-amber-300",
    barColor: "border-l-amber-600",
  },
  delivered: {
    label: "Yetkazib berilgan",
    pill: "border-emerald-600 bg-emerald-50 text-emerald-700 dark:text-emerald-300",
    barColor: "border-l-emerald-600",
  },
  cancelled: {
    label: "Bekor qilingan",
    pill: "border-ink-400 bg-ink-100 text-ink-500",
    barColor: "border-l-ink-400",
  },
};

// Deterministic pseudo-random for an integer seed
function rand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function parseOrderId(id: string): number | null {
  // Expected BR-2026-NNNN where NNNN in [0001..0015]
  const m = /^BR-2026-(\d{4})$/.exec(id);
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 15) return null;
  return n;
}

function generateOrder(id: string, n: number): OrderDetail {
  const r = rand(n * 9973 + 7);

  const supplier = SUPPLIERS[n % SUPPLIERS.length];

  // Status spread across the 15 IDs
  const statusList: OrderStatus[] = [
    "delivering",
    "confirmed",
    "delivering",
    "delivered",
    "delivered",
    "delivering",
    "delivered",
    "delivered",
    "sent",
    "cancelled",
    "delivered",
    "delivered",
    "confirmed",
    "delivering",
    "delivered",
  ];
  const status = statusList[n - 1];

  // Dates anchored around 21.05.2026
  const dayOffset = n - 1;
  const createdDay = String(21 - Math.floor(dayOffset / 2)).padStart(2, "0");
  const etaDay = String(23 - Math.floor(dayOffset / 3)).padStart(2, "0");
  const hh = String(8 + Math.floor(r() * 9)).padStart(2, "0");
  const mm = String(Math.floor(r() * 60)).padStart(2, "0");
  const createdAt = `${createdDay}.05.2026 ${hh}:${mm}`;
  const eta = `${etaDay}.05.2026`;

  // 3..6 lines from pool
  const lineCount = 3 + Math.floor(r() * 4);
  const startIdx = Math.floor(r() * PRODUCT_POOL.length);
  const lines: OrderLine[] = [];
  for (let i = 0; i < lineCount; i++) {
    const base = PRODUCT_POOL[(startIdx + i) % PRODUCT_POOL.length];
    const qtyMul = 0.7 + r() * 1.4;
    lines.push({ ...base, qty: Math.max(1, Math.round(base.qty * qtyMul)) });
  }

  const timeline: TimelineStep[] = [
    {
      label: "Buyurtma yuborildi",
      date: `${createdAt} · Aziz Karimov`,
      state: "done",
    },
    {
      label: "Tasdiqlandi",
      date: status === "sent" ? null : `${createdDay}.05.2026 11:20 · ${supplier.name}`,
      state: status === "sent" ? "pending" : "done",
    },
    {
      label: "Tayyorlanmoqda",
      date:
        status === "sent" || status === "confirmed"
          ? null
          : `${String(Number(createdDay) + 1).padStart(2, "0")}.05.2026 08:00`,
      state:
        status === "sent"
          ? "pending"
          : status === "confirmed"
          ? "active"
          : "done",
    },
    {
      label: "Yetkazib bermoqda",
      date:
        status === "delivering"
          ? `${String(Number(createdDay) + 1).padStart(2, "0")}.05.2026 15:00`
          : status === "delivered"
          ? `${String(Number(createdDay) + 1).padStart(2, "0")}.05.2026 15:00`
          : null,
      state:
        status === "delivering"
          ? "active"
          : status === "delivered"
          ? "done"
          : "pending",
    },
    {
      label: "Yetkazib berildi",
      date:
        status === "delivered"
          ? `${eta} 14:30 · Operator: Aziz Karimov`
          : `Kutilgan ${eta}`,
      state: status === "delivered" ? "done" : "pending",
    },
  ];

  if (status === "cancelled") {
    timeline.forEach((t, idx) => {
      if (idx > 1) {
        t.state = "pending";
        t.date = "Bekor qilingan";
      }
    });
  }

  const notes = [
    "Yetkazib beruvchi: tongdan keyin chiqamiz, do'kon ortidagi kichik darvozadan kirsangiz tushiramiz.",
    "Buyurtma 23.05 ertasiga qoldirildi — yetkazib beruvchi tomonidan tasdiqlangan.",
    "Marlboro turlari uchun aktsiz markalari to'liq tekshirilgan, hammasi mavjud.",
    "Soviq zanjir saqlash kerak: yetkazilgan zahoti omborga olib o'tilsin.",
  ];
  const note = notes[n % notes.length];

  return {
    id,
    supplier,
    createdAt,
    eta,
    status,
    note,
    lines,
    timeline,
    relatedDocNumber: status === "delivered" ? `${12340 + n}` : undefined,
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const parsed = parseOrderId(id);
  if (parsed === null) notFound();

  const order = generateOrder(id, parsed);
  const total = order.lines.reduce((s, l) => s + l.qty * l.price, 0);
  const status = STATUS_CONFIG[order.status];

  return (
    <>
      <Topbar
        breadcrumb={[
          { label: "Buyurtmalar", href: "/buyurtmalar" },
          { label: `Buyurtma ${order.id}` },
        ]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div
            className={cn(
              "mb-6 flex flex-wrap items-start justify-between gap-4 border-l-4 rounded-md border border-border bg-surface-card p-5",
              status.barColor
            )}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider",
                    status.pill
                  )}
                >
                  {order.status === "delivering" && <Truck className="size-3.5 animate-pulse" />}
                  {order.status === "delivered" && <CheckCircle2 className="size-3.5" />}
                  {status.label}
                </span>
                <span className="font-mono text-[12px] text-ink-500">{order.id}</span>
              </div>
              <h1 className="mt-2 text-[24px] font-bold tracking-tight text-ink-900">
                Buyurtma {order.id} —{" "}
                <span className="text-ink-700">{order.supplier.name}</span>
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-500">
                <span className="font-mono">Yaratilgan: {order.createdAt}</span>
                <span className="text-ink-300">·</span>
                <span className="font-mono">ETA: {order.eta}</span>
                <span className="text-ink-300">·</span>
                <span>
                  Jami:{" "}
                  <strong className="font-mono text-ink-900">{formatSom(total)}</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="md">
                <Download className="size-4" />
                PDF yuklab olish
              </Button>
              <OrderHeaderMenu orderId={order.id} cancellable={order.status !== "delivered" && order.status !== "cancelled"} />
            </div>
          </div>

          {/* KPI strip */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard label="Mahsulotlar" value={order.lines.length} />
            <KpiCard label="Jami summa" value={formatSom(total)} valueClassName="text-navy-700 dark:text-navy-300" />
            <KpiCard label="Yetkazib berish" value={order.eta} valueClassName="text-ink-900 font-mono" />
            <KpiCard label="Holati" value={status.label} valueClassName={
              order.status === "delivered"
                ? "text-emerald-700 dark:text-emerald-300"
                : order.status === "delivering"
                ? "text-amber-600 dark:text-amber-300"
                : order.status === "cancelled"
                ? "text-ink-500"
                : "text-navy-700 dark:text-navy-300"
            } />
          </div>

          {/* Main grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* LEFT 2/3 */}
            <div className="space-y-4 lg:col-span-2">
              {/* Products */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="size-4 text-navy-700 dark:text-navy-300" />
                    Mahsulotlar ({order.lines.length})
                  </CardTitle>
                  <span className="font-mono text-[11px] text-ink-500">
                    Jami: <strong className="text-ink-900">{formatSom(total)}</strong>
                  </span>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-ink-100/40 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        <th className="w-10 px-4 py-2 text-left">№</th>
                        <th className="px-3 py-2 text-left">Mahsulot</th>
                        <th className="px-3 py-2 text-right">Miqdor</th>
                        <th className="px-3 py-2 text-right">Narx</th>
                        <th className="px-4 py-2 text-right">Summa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.lines.map((l, i) => (
                        <tr
                          key={i}
                          className="border-b border-border last:border-0 hover:bg-ink-100/30"
                        >
                          <td className="px-4 py-3 font-mono text-[12px] text-ink-500">
                            {i + 1}
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium text-ink-900">{l.name}</div>
                            <div className="font-mono text-[11px] text-ink-500">
                              MXIK {l.mxik}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right font-mono tabular-nums text-ink-700">
                            {l.qty} {l.unit}
                          </td>
                          <td className="px-3 py-3 text-right font-mono tabular-nums text-ink-700">
                            {formatSom(l.price)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-ink-900">
                            {formatSom(l.qty * l.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border bg-ink-100/40">
                        <td colSpan={4} className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                          Jami
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[15px] font-bold tabular-nums text-ink-900">
                          {formatSom(total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="size-4 text-navy-700 dark:text-navy-300" />
                    Yetkazib berish kuzatuvi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="relative space-y-5 border-l-2 border-border pl-6">
                    {order.timeline.map((step, i) => (
                      <li key={i} className="relative">
                        <span
                          className={cn(
                            "absolute -left-[33px] grid size-6 place-items-center rounded-full border-2",
                            step.state === "done" &&
                              "border-emerald-600 bg-emerald-600 text-white",
                            step.state === "active" &&
                              "border-amber-600 bg-amber-50 text-amber-600 dark:text-amber-300 animate-pulse",
                            step.state === "pending" &&
                              "border-border bg-surface-card text-ink-400"
                          )}
                        >
                          {step.state === "done" ? (
                            <CheckCircle2 className="size-3" />
                          ) : step.state === "active" ? (
                            <Clock className="size-3" />
                          ) : (
                            <span className="size-1.5 rounded-full bg-ink-300" />
                          )}
                        </span>
                        <div
                          className={cn(
                            "text-[14px] font-semibold",
                            step.state === "pending" ? "text-ink-500" : "text-ink-900"
                          )}
                        >
                          {step.label}
                        </div>
                        {step.date && (
                          <div className="mt-0.5 font-mono text-[12px] text-ink-500">
                            {step.date}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Note */}
              <Card>
                <CardHeader>
                  <CardTitle>Eslatma</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[14px] leading-relaxed text-ink-700">{order.note}</p>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT 1/3 */}
            <div className="space-y-4">
              {/* Supplier */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="size-4 text-navy-700 dark:text-navy-300" />
                    Yetkazib beruvchi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-full font-mono text-[14px] font-bold text-white",
                        order.supplier.color
                      )}
                    >
                      {order.supplier.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-ink-900">
                        {order.supplier.name}
                      </div>
                      <div className="font-mono text-[11px] text-ink-500">
                        STIR: {order.supplier.stir}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-ink-100/30 px-3 py-2">
                    <Phone className="size-3.5 text-ink-500" />
                    <span className="font-mono text-[12px] text-ink-700">
                      {order.supplier.phone}
                    </span>
                  </div>
                  <Button variant="secondary" className="w-full">
                    <Send className="size-4" />
                    Aloqaga chiqish
                  </Button>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="size-4 text-navy-700 dark:text-navy-300" />
                    Hujjatlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a
                    href="#"
                    className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2.5 text-[13px] hover:border-navy-700"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="size-3.5 text-ink-500" />
                      <span className="font-medium text-ink-900">
                        Faktura PDF
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-ink-500">
                      {order.id}.pdf
                    </span>
                  </a>
                  <a
                    href="https://didox.uz"
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2.5 text-[13px] hover:border-navy-700"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="size-3.5 text-ink-500" />
                      <span className="font-medium text-ink-900">EHF · Didox</span>
                    </span>
                    <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                      Ko&apos;rish
                    </span>
                  </a>
                </CardContent>
              </Card>

              {/* Related docs */}
              <Card>
                <CardHeader>
                  <CardTitle>Bog&apos;liq hujjatlar</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.relatedDocNumber ? (
                    <Link
                      href={`/hujjatlar/doc_${order.relatedDocNumber}`}
                      className="block rounded-md border border-emerald-600 bg-emerald-50 px-3 py-2.5 text-[13px] transition-colors hover:bg-emerald-100/50"
                    >
                      <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                        Kirim hujjati №{order.relatedDocNumber}
                      </div>
                      <div className="mt-0.5 text-[12px] text-ink-600">
                        Bu buyurtma yetkazib berilganda yaratilgan
                      </div>
                    </Link>
                  ) : (
                    <div className="rounded-md border border-dashed border-border bg-surface px-3 py-3 text-[12px] text-ink-500">
                      Bu buyurtmadan kirim hujjati hali yaratilmagan — yetkazilganda avtomatik tushadi.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom alert */}
          {order.status === "delivering" || order.status === "confirmed" ? (
            <div className="mt-6">
              <Alert variant="info">
                <div className="font-semibold">BullMQ rejalashtirilgan job</div>
                <div className="mt-0.5 text-[13px]">
                  Bu buyurtma{" "}
                  <span className="font-mono">{order.eta} 09:00</span> da yetkazib berishi rejalashtirilgan. Yetkazilganda kirim hujjati avtomatik yaratiladi.
                </div>
              </Alert>
            </div>
          ) : order.status === "delivered" ? (
            <div className="mt-6">
              <Alert variant="success">
                <div className="font-semibold">Buyurtma yopildi</div>
                <div className="mt-0.5 text-[13px]">
                  Yetkazib berildi va kirim hujjati yaratildi · ombor qoldiqlari yangilandi.
                </div>
              </Alert>
            </div>
          ) : order.status === "cancelled" ? (
            <div className="mt-6">
              <Alert variant="warning">
                <div className="font-semibold">Buyurtma bekor qilingan</div>
                <div className="mt-0.5 text-[13px]">
                  Bu buyurtma yetkazib beruvchi yoki sotuvchi tomonidan bekor qilindi.
                </div>
              </Alert>
            </div>
          ) : (
            <div className="mt-6">
              <Alert variant="info">
                <div className="font-semibold flex items-center gap-2">
                  <Sparkles className="size-3.5" />
                  Tasdig&apos;ini kutmoqdamiz
                </div>
                <div className="mt-0.5 text-[13px]">
                  Yetkazib beruvchi tasdig&apos;idan keyin tayyorlash bosqichiga o&apos;tadi.
                </div>
              </Alert>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
