import Link from "next/link";
import {
  Plus,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supplierPortal, ApiError } from "@/lib/api";
import type {
  OutgoingInvoice,
  SupplierCompany,
  SupplierStore,
  SupplierProduct,
  DemandSignal,
  DeliveryRoute,
} from "@/lib/types";
import { formatSom, formatNumber, cn } from "@/lib/utils";

// Deterministic avatar bg from id
const AVATAR_PALETTE = [
  "bg-navy-700",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-red-600",
  "bg-navy-600",
  "bg-emerald-700",
  "bg-navy-800",
  "bg-amber-400",
];

function colorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function timeOnly(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Build deterministic 30-day series from invoices already in store
function buildDailySeries(invoices: OutgoingInvoice[]) {
  const now = new Date("2026-05-21T10:00:00Z").getTime();
  const DAY = 86400000;
  const bins: { dayIndex: number; total: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    bins.push({ dayIndex: i, total: 0 });
  }
  for (const inv of invoices) {
    const t = new Date(inv.sentAt).getTime();
    const diff = Math.floor((now - t) / DAY);
    if (diff >= 0 && diff < 30) {
      const target = bins.find((b) => b.dayIndex === diff);
      if (target) target.total += inv.totalAmount;
    }
  }
  return bins.reverse(); // oldest → newest left to right
}

interface DashboardKpi {
  activeStores: number;
  totalStores: number;
  todayInvoices: number;
  outstandingPayments: number;
  monthlyRevenue: number;
}

const EMPTY_KPI: DashboardKpi = {
  activeStores: 0,
  totalStores: 0,
  todayInvoices: 0,
  outstandingPayments: 0,
  monthlyRevenue: 0,
};

export default async function SupplierDashboardPage() {
  let company: SupplierCompany | null = null;
  let kpi: DashboardKpi = EMPTY_KPI;
  let stores: SupplierStore[] = [];
  let invoices: OutgoingInvoice[] = [];
  let demand: DemandSignal[] = [];
  let products: SupplierProduct[] = [];
  let routes: DeliveryRoute[] = [];
  let loadError: string | null = null;

  try {
    const [
      companyRes,
      kpiRes,
      storesRes,
      invoicesRes,
      demandRes,
      productsRes,
      routesRes,
    ] = await Promise.all([
      supplierPortal.company.get(),
      supplierPortal.kpi.dashboard(),
      supplierPortal.stores.list({ limit: 8 }),
      supplierPortal.invoices.list({ limit: 5 }),
      supplierPortal.demandSignals.list({ limit: 6 }),
      supplierPortal.products.list({ limit: 8 }),
      supplierPortal.routes.list({ limit: 5 }),
    ]);
    company = companyRes;
    kpi = kpiRes;
    stores = storesRes.results;
    invoices = invoicesRes.results;
    demand = demandRes.results;
    products = productsRes.results;
    routes = routesRes.results;
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "Ma'lumotlarni yuklab bo'lmadi";
  }

  const today = new Date("2026-05-21T10:00:00Z").toLocaleDateString("uz-UZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // 30-day chart data
  const series = buildDailySeries(invoices);
  const maxBar = Math.max(1, ...series.map((s) => s.total));
  const totalRevenue30 = series.reduce((s, b) => s + b.total, 0);
  const avgDaily = totalRevenue30 / 30;
  const peak = series.reduce((a, b) => (b.total > a.total ? b : a), series[0]);

  // Alerts data
  const overdueStoresCount = stores.filter(
    (s) => s.status === "inactive" || s.outstandingBalance > 8_000_000,
  ).length;
  const slowStoresCount = stores.filter((s) => s.status === "slow").length;
  const risingDemand = demand.filter((d) => d.hotness === "rising").length;

  // Top 8 stores by monthly volume
  const topStores = [...stores]
    .sort((a, b) => b.monthlyVolume - a.monthlyVolume)
    .slice(0, 8);
  const topStoreMax = topStores[0]?.monthlyVolume ?? 1;

  // Top 8 products by monthly sales
  const topProducts = [...products]
    .sort((a, b) => b.monthlySales - a.monthlySales)
    .slice(0, 8);
  const topProductMax = topProducts[0]?.monthlySales ?? 1;

  // Today's routes — show 5
  const activeRoutes = routes.slice(0, 5);

  return (
    <>
      <SupplierTopbar breadcrumb={[{ label: "Dashboard" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {loadError && (
            <Alert variant="error" className="mb-4">
              {loadError}
            </Alert>
          )}
          {/* Welcome row */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Salom, {company?.name ?? "Ta'minotchi"}{" "}
                <span className="inline-block animate-pulse">👋</span>
              </h1>
              <p className="mt-1 font-mono text-[13px] text-ink-500 capitalize">
                {today}
                <span className="mx-2 text-ink-300">·</span>
                <span className="text-ink-700">
                  Bugun: {routes.length} ta marshrut, {kpi.activeStores} do&apos;kon aktiv
                </span>
              </p>
            </div>
            <Link href="/supplier/hujjatlar/yangi">
              <Button>
                <Plus className="size-4" />
                Yangi hujjat
              </Button>
            </Link>
          </div>

          {/* KPI Grid */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Faol do'konlar"
              value={`${kpi.activeStores} / ${kpi.totalStores}`}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: "+3 bu hafta", direction: "up" }}
            />
            <KpiCard
              label="Bugun yuborilgan"
              value={kpi.todayInvoices}
            />
            <KpiCard
              label="Kutilayotgan to'lov"
              value={formatSom(kpi.outstandingPayments)}
              valueClassName="text-amber-600 dark:text-amber-300"
              trend={{
                value: `${overdueStoresCount} ta kechikkan to'lov`,
                direction: "warn",
              }}
            />
            <KpiCard
              label="Bu oy aylanma"
              value={formatSom(kpi.monthlyRevenue)}
              trend={{ value: "+12% o'tgan oyga", direction: "up" }}
            />
          </div>

          {/* Main grid: chart + alerts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Daily chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Haftalik aylanma</CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-sm border border-border bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold text-ink-500">
                    OXIRGI 30 KUN
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex h-44 items-end gap-1 px-1 pt-2">
                  {series.map((b, i) => {
                    const heightPct = (b.total / maxBar) * 100;
                    const isPeak = b === peak && b.total > 0;
                    return (
                      <div
                        key={i}
                        className="flex flex-1 flex-col items-stretch"
                        title={`${b.total > 0 ? formatSom(b.total) : "—"}`}
                      >
                        <div className="flex h-full w-full items-end">
                          <div
                            className={cn(
                              "w-full rounded-t-[2px] transition-all",
                              isPeak ? "bg-emerald-600" : "bg-navy-700/85",
                            )}
                            style={{ height: `${Math.max(2, heightPct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-[11px]">
                  <div>
                    <div className="text-ink-500 uppercase tracking-wider font-mono text-[10px]">
                      Jami
                    </div>
                    <div className="mt-0.5 font-mono font-semibold text-ink-900">
                      {formatSom(totalRevenue30)}
                    </div>
                  </div>
                  <div>
                    <div className="text-ink-500 uppercase tracking-wider font-mono text-[10px]">
                      O&apos;rtacha / kun
                    </div>
                    <div className="mt-0.5 font-mono font-semibold text-ink-900">
                      {formatSom(Math.round(avgDaily))}
                    </div>
                  </div>
                  <div>
                    <div className="text-ink-500 uppercase tracking-wider font-mono text-[10px]">
                      Eng yuqori kun
                    </div>
                    <div className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatSom(peak.total)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Diqqat talab qiladi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 p-4">
                <Alert variant="error" className="text-[13px] py-2.5">
                  <div className="font-semibold leading-tight">
                    {overdueStoresCount} ta do&apos;kon 30+ kun kechikkan to&apos;lov
                  </div>
                  <Link
                    href="/supplier/to-lovlar"
                    className="mt-1 inline-flex items-center gap-0.5 text-[12px] font-medium underline-offset-2 hover:underline"
                  >
                    Ko&apos;rib chiqish
                    <ChevronRight className="size-3" />
                  </Link>
                </Alert>
                <Alert variant="warning" className="text-[13px] py-2.5">
                  <div className="font-semibold leading-tight">
                    {slowStoresCount} ta do&apos;kon 7-14 kun buyurtma yo&apos;q
                  </div>
                  <Link
                    href="/supplier/do-konlar?filter=slow"
                    className="mt-1 inline-flex items-center gap-0.5 text-[12px] font-medium underline-offset-2 hover:underline"
                  >
                    Ko&apos;rib chiqish
                    <ChevronRight className="size-3" />
                  </Link>
                </Alert>
                <Alert variant="info" className="text-[13px] py-2.5">
                  <div className="font-semibold leading-tight">
                    {risingDemand} ta yangi talab signali
                  </div>
                  <Link
                    href="/supplier/talab"
                    className="mt-1 inline-flex items-center gap-0.5 text-[12px] font-medium underline-offset-2 hover:underline"
                  >
                    Ko&apos;rib chiqish
                    <ChevronRight className="size-3" />
                  </Link>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Top stores + Top products */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Top stores */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Top 8 do&apos;konlar (bu oy)</CardTitle>
                <Link
                  href="/supplier/do-konlar"
                  className="text-[11px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                >
                  Hammasi →
                </Link>
              </CardHeader>
              <div>
                {topStores.map((s) => {
                  const widthPct = (s.monthlyVolume / topStoreMax) * 100;
                  return (
                    <Link
                      key={s.id}
                      href={`/supplier/do-konlar/${s.id}`}
                      className="flex items-center gap-3 border-b border-border px-5 py-2.5 last:border-0 hover:bg-ink-100/50"
                    >
                      <div
                        className={cn(
                          "size-8 shrink-0 grid place-items-center rounded-full text-[11px] font-bold text-white font-mono",
                          colorFromId(s.id),
                        )}
                      >
                        {initialsOf(s.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-medium text-ink-900">
                            {s.name}
                          </span>
                          <span className="shrink-0 font-mono text-[12px] font-semibold text-ink-900">
                            {formatSom(s.monthlyVolume)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                            <div
                              className="h-full bg-navy-700"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-ink-500 shrink-0">
                            {s.region}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>

            {/* Top products */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Eng faol mahsulotlar</CardTitle>
                <Link
                  href="/supplier/mahsulotlar"
                  className="text-[11px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                >
                  Hammasi →
                </Link>
              </CardHeader>
              <div>
                {topProducts.map((p) => {
                  const widthPct = (p.monthlySales / topProductMax) * 100;
                  const TrendIcon =
                    p.trendPercent > 0.5
                      ? ArrowUpRight
                      : p.trendPercent < -0.5
                      ? ArrowDownRight
                      : Minus;
                  const trendColor =
                    p.trendPercent > 0.5
                      ? "text-emerald-600 dark:text-emerald-400"
                      : p.trendPercent < -0.5
                      ? "text-red-600 dark:text-red-400"
                      : "text-ink-500";
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 border-b border-border px-5 py-2.5 last:border-0 hover:bg-ink-100/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-medium text-ink-900">
                            {p.name}
                          </span>
                          <span className="shrink-0 font-mono text-[12px] font-semibold text-ink-900">
                            {formatNumber(p.monthlySales)} {p.unit}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                            <div
                              className="h-full bg-navy-700"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center gap-0.5 font-mono text-[10px] font-semibold",
                              trendColor,
                            )}
                          >
                            <TrendIcon className="size-3" />
                            {p.trendPercent > 0 ? "+" : ""}
                            {p.trendPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Today's routes */}
          <Card className="mt-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Bugungi marshrutlar</CardTitle>
              <Link
                href="/supplier/logistika"
                className="text-[11px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
              >
                Hammasini ko&apos;rish →
              </Link>
            </CardHeader>
            <div>
              {activeRoutes.map((r) => {
                const delivered = r.stops.filter(
                  (s) => s.status === "delivered",
                ).length;
                const total = r.stops.length;
                const pct = total > 0 ? (delivered / total) * 100 : 0;
                return (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "size-8 shrink-0 grid place-items-center rounded-full text-[11px] font-bold text-white font-mono",
                          colorFromId(r.driverName),
                        )}
                      >
                        {initialsOf(r.driverName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-ink-900 truncate">
                          {r.driverName}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-ink-500">
                          {r.vehiclePlate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono text-[11px] text-ink-500 uppercase tracking-wider">
                          Yetkazildi
                        </div>
                        <div className="font-mono text-[13px] font-semibold text-ink-900">
                          {delivered} / {total}
                        </div>
                      </div>
                      <div className="hidden sm:block w-28">
                        <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
                          <div
                            className={cn(
                              "h-full",
                              pct === 100 ? "bg-emerald-600" : "bg-navy-700",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[11px] text-ink-500 uppercase tracking-wider">
                          ETA
                        </div>
                        <div className="font-mono text-[13px] font-semibold text-ink-900">
                          {timeOnly(r.estimatedCompletion)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
