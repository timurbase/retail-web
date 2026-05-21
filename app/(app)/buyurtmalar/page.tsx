import {
  Download,
  X,
  Truck,
  Sparkles,
  AlertTriangle,
  Eye,
} from "lucide-react";

import { Topbar } from "@/components/layout/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewOrderButton } from "@/components/buyurtmalar/new-order-button";
import { getSuppliers, getProducts } from "@/lib/store";
import { cn, formatSom } from "@/lib/utils";

type OrderStatus =
  | "sent"
  | "confirmed"
  | "delivering"
  | "delivered"
  | "cancelled";

interface OrderLine {
  name: string;
  qty: number;
  unit: string;
  lineTotal: number;
}

interface Order {
  id: string;
  number: string;
  supplier: string;
  createdAt: string;
  eta: string;
  status: OrderStatus;
  lines: OrderLine[];
  extraLines?: number;
  total: number;
  lateDays?: number;
}

const ORDERS: Order[] = [
  {
    id: "1",
    number: "BR-2026-1042",
    supplier: "Alpha Distribution OOO",
    createdAt: "21.05.2026 09:30",
    eta: "23.05.2026",
    status: "confirmed",
    lines: [
      { name: "Coca-Cola 0.5L PET", qty: 50, unit: "dona", lineTotal: 375_000 },
      { name: "Pepsi 0.5L PET", qty: 40, unit: "dona", lineTotal: 280_000 },
      { name: "Fanta 0.5L PET", qty: 30, unit: "dona", lineTotal: 210_000 },
      { name: "Sprite 0.5L PET", qty: 30, unit: "dona", lineTotal: 210_000 },
    ],
    total: 1_075_000,
  },
  {
    id: "2",
    number: "BR-2026-1041",
    supplier: "Mineralka MChJ",
    createdAt: "20.05.2026 16:20",
    eta: "22.05.2026",
    status: "delivering",
    lines: [
      { name: "Mineral suv 0.5L", qty: 100, unit: "dona", lineTotal: 300_000 },
      { name: "Mineral suv 1.5L", qty: 60, unit: "dona", lineTotal: 360_000 },
      { name: "Gazlangan suv 0.5L", qty: 50, unit: "dona", lineTotal: 175_000 },
    ],
    total: 835_000,
  },
  {
    id: "3",
    number: "BR-2026-1040",
    supplier: "Karim Trading MChJ",
    createdAt: "19.05.2026 11:15",
    eta: "20.05.2026",
    status: "delivering",
    lateDays: 1,
    lines: [
      { name: "Marlboro Red blok", qty: 20, unit: "blok", lineTotal: 600_000 },
      { name: "Marlboro Gold blok", qty: 15, unit: "blok", lineTotal: 450_000 },
      { name: "Parliament blok", qty: 10, unit: "blok", lineTotal: 350_000 },
    ],
    total: 1_400_000,
  },
  {
    id: "4",
    number: "BR-2026-1039",
    supplier: "Imkon Sut OOO",
    createdAt: "19.05.2026 08:45",
    eta: "20.05.2026",
    status: "delivered",
    lines: [
      { name: "Imkon sut 1L", qty: 60, unit: "dona", lineTotal: 510_000 },
      { name: "Smetana 400g", qty: 30, unit: "dona", lineTotal: 270_000 },
      { name: "Tvorog 250g", qty: 25, unit: "dona", lineTotal: 175_000 },
    ],
    total: 955_000,
  },
  {
    id: "5",
    number: "BR-2026-1038",
    supplier: "Toshkent Non Kombinati",
    createdAt: "18.05.2026 14:30",
    eta: "19.05.2026",
    status: "delivered",
    lines: [
      { name: "Oq non 'Gulli'", qty: 80, unit: "dona", lineTotal: 280_000 },
      { name: "Bug'doy noni", qty: 60, unit: "dona", lineTotal: 240_000 },
    ],
    total: 520_000,
  },
  {
    id: "6",
    number: "BR-2026-1037",
    supplier: "Beta Trade MChJ",
    createdAt: "18.05.2026 10:00",
    eta: "21.05.2026",
    status: "delivering",
    lines: [
      { name: "Choy 'Lipton' Yellow 100p", qty: 40, unit: "dona", lineTotal: 720_000 },
      { name: "Choy 'Hindiston' 250g", qty: 25, unit: "dona", lineTotal: 300_000 },
      { name: "Qahva Nescafe 200g", qty: 20, unit: "dona", lineTotal: 480_000 },
      { name: "Shakar 1kg", qty: 50, unit: "kg", lineTotal: 425_000 },
    ],
    extraLines: 2,
    total: 2_315_000,
  },
  {
    id: "7",
    number: "BR-2026-1036",
    supplier: "Alpha Distribution OOO",
    createdAt: "17.05.2026 13:20",
    eta: "18.05.2026",
    status: "delivering",
    lateDays: 2,
    lines: [
      { name: "Kungaboqar yog'i 1L", qty: 40, unit: "dona", lineTotal: 492_000 },
      { name: "Paxta yog'i 5L", qty: 20, unit: "dona", lineTotal: 690_000 },
      { name: "Margarin 250g", qty: 30, unit: "dona", lineTotal: 270_000 },
    ],
    total: 1_452_000,
  },
  {
    id: "8",
    number: "BR-2026-1035",
    supplier: "Lazzat OOO",
    createdAt: "17.05.2026 09:10",
    eta: "19.05.2026",
    status: "delivered",
    lines: [
      { name: "Lazzat shokolad 100g", qty: 50, unit: "dona", lineTotal: 425_000 },
      { name: "Snickers 50g", qty: 100, unit: "dona", lineTotal: 350_000 },
      { name: "Twix 50g", qty: 80, unit: "dona", lineTotal: 280_000 },
    ],
    total: 1_055_000,
  },
  {
    id: "9",
    number: "BR-2026-1034",
    supplier: "Eski Shahar Don MChJ",
    createdAt: "16.05.2026 15:45",
    eta: "18.05.2026",
    status: "delivered",
    lines: [
      { name: "Guruch (premium) 1kg", qty: 100, unit: "kg", lineTotal: 1_200_000 },
      { name: "Guruch (oddiy) 1kg", qty: 80, unit: "kg", lineTotal: 720_000 },
      { name: "Mosh 1kg", qty: 40, unit: "kg", lineTotal: 360_000 },
    ],
    total: 2_280_000,
  },
  {
    id: "10",
    number: "BR-2026-1033",
    supplier: "Gamma Goods",
    createdAt: "16.05.2026 11:30",
    eta: "18.05.2026",
    status: "cancelled",
    lines: [
      { name: "Sovun 'Safroguard' 90g", qty: 100, unit: "dona", lineTotal: 350_000 },
      { name: "Shampun 'Head & Shoulders' 400ml", qty: 30, unit: "dona", lineTotal: 540_000 },
    ],
    total: 890_000,
  },
  {
    id: "11",
    number: "BR-2026-1032",
    supplier: "Nestle Uzbekistan",
    createdAt: "15.05.2026 10:00",
    eta: "17.05.2026",
    status: "delivered",
    lines: [
      { name: "Nescafe Gold 100g", qty: 30, unit: "dona", lineTotal: 540_000 },
      { name: "Maggi bulyon", qty: 100, unit: "dona", lineTotal: 200_000 },
      { name: "Nesquik 250g", qty: 25, unit: "dona", lineTotal: 425_000 },
    ],
    total: 1_165_000,
  },
  {
    id: "12",
    number: "BR-2026-1031",
    supplier: "Tabiat MChJ",
    createdAt: "15.05.2026 09:15",
    eta: "16.05.2026",
    status: "delivered",
    lines: [
      { name: "Olma (mahalliy) 1kg", qty: 50, unit: "kg", lineTotal: 250_000 },
      { name: "Banan 1kg", qty: 30, unit: "kg", lineTotal: 270_000 },
      { name: "Apelsin 1kg", qty: 40, unit: "kg", lineTotal: 320_000 },
    ],
    total: 840_000,
  },
  {
    id: "13",
    number: "BR-2026-1030",
    supplier: "Coca-Cola Bottlers",
    createdAt: "14.05.2026 14:00",
    eta: "16.05.2026",
    status: "delivered",
    lines: [
      { name: "Coca-Cola 1.5L PET", qty: 60, unit: "dona", lineTotal: 720_000 },
      { name: "Sprite 1.5L PET", qty: 40, unit: "dona", lineTotal: 440_000 },
      { name: "Fanta 1.5L PET", qty: 40, unit: "dona", lineTotal: 440_000 },
    ],
    total: 1_600_000,
  },
  {
    id: "14",
    number: "BR-2026-1029",
    supplier: "Yangi Hayot Distribution",
    createdAt: "14.05.2026 11:20",
    eta: "16.05.2026",
    status: "sent",
    lines: [
      { name: "Konserva 'Bonduelle' 400g", qty: 50, unit: "dona", lineTotal: 750_000 },
      { name: "Pomidor pyuresi 500g", qty: 40, unit: "dona", lineTotal: 480_000 },
    ],
    total: 1_230_000,
  },
  {
    id: "15",
    number: "BR-2026-1028",
    supplier: "Marvelous Distribution",
    createdAt: "13.05.2026 16:00",
    eta: "15.05.2026",
    status: "confirmed",
    lines: [
      { name: "Kola Light 0.5L", qty: 40, unit: "dona", lineTotal: 320_000 },
      { name: "Energetik 'Red Bull'", qty: 30, unit: "dona", lineTotal: 450_000 },
      { name: "Sok 'Vimm-Bill-Dann' 1L", qty: 25, unit: "dona", lineTotal: 300_000 },
    ],
    total: 1_070_000,
  },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; pillClass: string; tabKey: string }
> = {
  sent: {
    label: "Yuborilgan",
    pillClass: "border-l-navy-700 bg-navy-50 text-navy-700 dark:text-navy-300 border-navy-700",
    tabKey: "sent",
  },
  confirmed: {
    label: "Tasdiqlangan",
    pillClass: "border-l-navy-700 bg-navy-50 text-navy-700 dark:text-navy-300 border-navy-700",
    tabKey: "confirmed",
  },
  delivering: {
    label: "Yetkazib bermoqda",
    pillClass: "border-l-amber-600 bg-amber-50 text-amber-600 dark:text-amber-300 border-amber-600",
    tabKey: "delivering",
  },
  delivered: {
    label: "Yetkazib berilgan",
    pillClass: "border-l-emerald-600 bg-emerald-50 text-emerald-700 dark:text-emerald-300 border-emerald-600",
    tabKey: "delivered",
  },
  cancelled: {
    label: "Bekor qilingan",
    pillClass: "border-l-ink-400 bg-ink-100 text-ink-500 border-ink-400",
    tabKey: "cancelled",
  },
};

function StatusPill({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  const isDelivering = status === "delivering";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-l-4 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
        cfg.pillClass
      )}
    >
      {isDelivering && (
        <Truck className="size-3 animate-pulse" strokeWidth={2.5} />
      )}
      {cfg.label}
    </span>
  );
}

const TABS = [
  { key: "all", label: "Hammasi" },
  { key: "sent", label: "Yuborilgan" },
  { key: "confirmed", label: "Tasdiqlangan" },
  { key: "delivering", label: "Yetkazib bermoqda" },
  { key: "delivered", label: "Yetkazib berilgan" },
  { key: "cancelled", label: "Bekor qilingan" },
];

export default function BuyurtmalarPage() {
  const activeCount = ORDERS.filter(
    (o) =>
      o.status === "sent" ||
      o.status === "confirmed" ||
      o.status === "delivering"
  ).length;
  const lateCount = ORDERS.filter((o) => o.lateDays && o.lateDays > 0).length;

  const suppliers = getSuppliers();
  const products = getProducts();

  return (
    <>
      <Topbar breadcrumb={[{ label: "Buyurtmalar" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Buyurtmalar
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Yetkazib beruvchilarga yuborilgan buyurtmalar
              </p>
            </div>
            <NewOrderButton suppliers={suppliers} products={products} />
          </div>

          {/* KPIs */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <KpiCard
              label="Aktiv buyurtmalar"
              value={activeCount}
              trend={{ value: "Yetkazib berilishi kutilmoqda", direction: "warn" }}
            />
            <KpiCard
              label="Bu hafta yuborilgan"
              value="12"
              trend={{ value: "+3 o'tgan haftaga", direction: "up" }}
            />
            <KpiCard
              label="Kechikkan"
              value={lateCount}
              valueClassName="text-red-700 dark:text-red-300"
              trend={{ value: "Yetkazib beruvchi bilan aloqa", direction: "warn" }}
            />
            <KpiCard
              label="Bu oy summa"
              value="8.4M"
              trend={{ value: "so'm · +12% o'tgan oydan", direction: "up" }}
            />
          </div>

          {/* Filter tabs */}
          <div className="mb-5 flex items-center gap-1 overflow-x-auto border-b border-border">
            {TABS.map((t, i) => (
              <button
                key={t.key}
                type="button"
                className={cn(
                  "shrink-0 border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
                  i === 0
                    ? "border-navy-700 text-navy-700 dark:text-navy-300"
                    : "border-transparent text-ink-500 hover:text-ink-900"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Orders list */}
          <div className="space-y-3">
            {ORDERS.map((o) => {
              const isLate = o.lateDays && o.lateDays > 0;
              const isCancelled = o.status === "cancelled";
              return (
                <Card
                  key={o.id}
                  className={cn(
                    "overflow-hidden transition-shadow hover:shadow-md",
                    isLate && "border-l-4 border-l-red-600"
                  )}
                >
                  <CardContent className="space-y-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[14px] font-semibold text-ink-900">
                            Buyurtma #{o.number}
                          </span>
                          <StatusPill status={o.status} />
                          {isLate && (
                            <span className="inline-flex items-center gap-1 rounded-sm border border-red-600 bg-red-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-300">
                              <AlertTriangle className="size-3" />
                              {o.lateDays} kun kechikdi
                            </span>
                          )}
                        </div>
                        <p
                          className={cn(
                            "mt-1 text-[13px] text-ink-600",
                            isCancelled && "text-ink-400 line-through"
                          )}
                        >
                          <span className="font-medium">{o.supplier}</span>
                          <span className="mx-1.5 text-ink-300">·</span>
                          <span className="font-mono text-[12px] text-ink-500">
                            {o.createdAt}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Product lines */}
                    <div className="rounded-md border border-border bg-ink-100/30">
                      {o.lines.map((line, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 last:border-0"
                        >
                          <span className="min-w-0 truncate text-[13px] text-ink-700">
                            {line.name}
                            <span className="ml-1 font-mono text-[11px] text-ink-500">
                              × {line.qty} {line.unit}
                            </span>
                          </span>
                          <span className="shrink-0 font-mono text-[12px] tabular-nums text-ink-700">
                            {formatSom(line.lineTotal)}
                          </span>
                        </div>
                      ))}
                      {o.extraLines && o.extraLines > 0 && (
                        <div className="border-t border-border px-3 py-1.5 text-center font-mono text-[11px] text-ink-500">
                          + {o.extraLines} ta yana
                        </div>
                      )}
                    </div>

                    {/* Bottom row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                            Jami summa
                          </div>
                          <div className="font-mono text-[16px] font-bold tabular-nums text-ink-900">
                            {formatSom(o.total)}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[11px]",
                            isLate
                              ? "border-red-600 bg-red-50 text-red-700 dark:text-red-300"
                              : "border-border bg-surface-card text-ink-600"
                          )}
                        >
                          Kutilgan:{" "}
                          <span className="font-semibold">{o.eta}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm">
                          <Eye className="size-3.5" />
                          Tafsilot
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="size-3.5" />
                          PDF
                        </Button>
                        {!isCancelled && o.status !== "delivered" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-700 dark:text-red-300 hover:bg-red-50"
                          >
                            <X className="size-3.5" />
                            Bekor qilish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* AI recommendation */}
          <section className="mt-8">
            <Card className="border-l-4 border-l-emerald-600 bg-emerald-50/40">
              <CardContent className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-300">
                      AI tavsiya
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                      Yetkazib beruvchi tahlili
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-700">
                    Pepsi 0.5L suvni{" "}
                    <strong className="font-semibold">Beta Trade&apos;dan</strong>{" "}
                    oling — 12% arzon va 1 kun tezroq yetkazib beradi.
                    Joriy yetkazib beruvchi (Alpha) oxirgi 3 buyurtmadan 2 tasini
                    kechiktirdi.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button variant="emerald" size="sm">
                      Beta Trade&apos;ga buyurtma
                    </Button>
                    <Button variant="ghost" size="sm">
                      Batafsil tahlil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
