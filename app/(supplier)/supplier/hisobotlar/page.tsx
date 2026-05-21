import Link from "next/link";
import {
  Calendar,
  Download,
  Sparkles,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getOutgoingInvoices,
  getSupplierStores,
  getSupplierProducts,
} from "@/lib/store";
import { cn, formatSom } from "@/lib/utils";
import type { SupplierProductCategory } from "@/lib/types";

const NOW_MS = new Date("2026-05-21T10:00:00Z").getTime();
const DAY_MS = 86400000;

const periodTabs = ["Bugun", "Bu hafta", "Bu oy", "Bu yil", "Maxsus"];

const aiCostFeatures: { label: string; pct: number; cost: number }[] = [
  { label: "Demand signals (GPT-4o)", pct: 58, cost: 71.9 },
  { label: "Hujjat parse (vision)", pct: 28, cost: 34.7 },
  { label: "AI Insights (GPT-4o-mini)", pct: 14, cost: 17.4 },
];

const CATEGORY_LABEL: Record<SupplierProductCategory, string> = {
  ichimliklar: "Ichimliklar",
  "oziq-ovqat": "Oziq-ovqat",
  sigaret: "Sigaret",
  maishiy: "Maishiy kimyo",
  kosmetika: "Kosmetika",
  boshqa: "Boshqalar",
};

const CATEGORY_COLOR: Record<SupplierProductCategory, string> = {
  ichimliklar: "bg-navy-700",
  "oziq-ovqat": "bg-emerald-600",
  maishiy: "bg-amber-600",
  sigaret: "bg-red-600",
  kosmetika: "bg-emerald-700",
  boshqa: "bg-ink-400",
};

interface DailyBar {
  day: number; // 1..30
  delivered: number;
  paid: number;
  pending: number;
}

export default function SupplierHisobotlarPage() {
  const invoices = getOutgoingInvoices();
  const stores = getSupplierStores();
  const products = getSupplierProducts();

  // 30-day stacked chart
  const bins: DailyBar[] = [];
  for (let i = 29; i >= 0; i--) {
    bins.push({ day: 30 - i, delivered: 0, paid: 0, pending: 0 });
  }
  for (const inv of invoices) {
    const t = new Date(inv.sentAt).getTime();
    const diff = Math.floor((NOW_MS - t) / DAY_MS);
    if (diff < 0 || diff >= 30) continue;
    const idx = 29 - diff;
    if (inv.status === "paid") bins[idx].paid += inv.totalAmount;
    else if (
      inv.status === "delivered" ||
      inv.status === "delivering" ||
      inv.status === "preparing"
    )
      bins[idx].delivered += inv.totalAmount;
    else bins[idx].pending += inv.totalAmount;
  }
  const maxBar = Math.max(
    1,
    ...bins.map((b) => b.delivered + b.paid + b.pending),
  );

  // KPI period: bu oy (last 30 days)
  const monthCutoff = NOW_MS - 30 * DAY_MS;
  const monthInvoices = invoices.filter(
    (inv) => new Date(inv.sentAt).getTime() >= monthCutoff,
  );
  const monthRevenue = monthInvoices
    .filter((inv) => inv.status === "delivered" || inv.status === "paid")
    .reduce((s, inv) => s + inv.totalAmount, 0);

  // Top viloyatlar by monthly volume
  const regionMap = new Map<string, number>();
  for (const s of stores) {
    regionMap.set(s.region, (regionMap.get(s.region) ?? 0) + s.monthlyVolume);
  }
  const regionList = [...regionMap.entries()].sort((a, b) => b[1] - a[1]);
  const regionMax = regionList[0]?.[1] ?? 1;

  // Customer segmentation (VIP > 50M, mid 10-50M, small < 10M)
  const vip = stores.filter((s) => s.monthlyVolume > 50_000_000).length;
  const mid = stores.filter(
    (s) => s.monthlyVolume <= 50_000_000 && s.monthlyVolume >= 10_000_000,
  ).length;
  const small = stores.filter((s) => s.monthlyVolume < 10_000_000).length;
  const segTotal = Math.max(1, vip + mid + small);
  const vipPct = (vip / segTotal) * 100;
  const midPct = (mid / segTotal) * 100;
  // Conic gradient ranges
  const seg1End = vipPct;
  const seg2End = vipPct + midPct;

  // Top stores LTV
  const topStores = [...stores]
    .sort((a, b) => b.totalLifetimeVolume - a.totalLifetimeVolume)
    .slice(0, 10);

  // Product categories by monthly sales
  const catMap = new Map<SupplierProductCategory, number>();
  for (const p of products) {
    catMap.set(p.category, (catMap.get(p.category) ?? 0) + p.monthlySales * p.basePrice);
  }
  const catTotal = Math.max(1, [...catMap.values()].reduce((a, b) => a + b, 0));
  const categories: { name: string; pct: number; color: string }[] = [];
  for (const [k, v] of catMap.entries()) {
    categories.push({
      name: CATEGORY_LABEL[k],
      pct: Math.round((v / catTotal) * 100),
      color: CATEGORY_COLOR[k],
    });
  }
  categories.sort((a, b) => b.pct - a.pct);

  // Lost customers — 3+ months no order
  const lostCutoff = NOW_MS - 90 * DAY_MS;
  const lost = stores.filter(
    (s) => new Date(s.lastOrderAt).getTime() < lostCutoff,
  );

  // New customers — joined in last 30 days
  const newCustomers = stores.filter(
    (s) => new Date(s.joinedAt).getTime() >= monthCutoff,
  ).length;

  const totalAiCost = aiCostFeatures.reduce((a, f) => a + f.cost, 0);

  return (
    <>
      <SupplierTopbar
        breadcrumb={[{ label: "Supplier" }, { label: "Hisobotlar" }]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Hisobotlar
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Sotuv, mijoz va profit analizi
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <Calendar className="size-4" />
                Davr: Bu oy
              </Button>
              <Button variant="secondary">
                <Download className="size-4" />
                Excel eksport
              </Button>
            </div>
          </div>

          {/* Period tabs */}
          <div className="mb-6 flex items-center gap-1 rounded-md border border-border bg-surface-card p-1 w-fit">
            {periodTabs.map((tab) => (
              <button
                key={tab}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-[13px] font-medium transition-colors",
                  tab === "Bu oy"
                    ? "bg-navy-700 text-white"
                    : "text-ink-600 hover:bg-ink-100",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* KPI */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Hujjatlar"
              value={monthInvoices.length}
              trend={{ value: "+12% o'tgan oyga", direction: "up" }}
            />
            <KpiCard
              label="Aylanma"
              value={formatSom(monthRevenue)}
              trend={{ value: "+18% o'tgan oyga", direction: "up" }}
            />
            <KpiCard
              label="Profit margin"
              value="23.4%"
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: "+2.1% o'tgan oyga", direction: "up" }}
            />
            <KpiCard
              label="Yangi mijozlar"
              value={`+${newCustomers}`}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: "Bu oy", direction: "up" }}
            />
          </div>

          {/* 30-day stacked bar */}
          <Card className="mb-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>30-kun aylanma</CardTitle>
              <div className="flex items-center gap-4 text-[11px] font-mono text-ink-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-sm bg-emerald-600" />
                  To&apos;langan
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-sm bg-navy-700" />
                  Yetkazib berilgan
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-sm bg-amber-600" />
                  Kutilmoqda
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex h-56 items-end gap-1.5">
                {bins.map((b, i) => {
                  const sum = b.delivered + b.paid + b.pending;
                  const hPct = (sum / maxBar) * 100;
                  const paidPct = sum === 0 ? 0 : (b.paid / sum) * 100;
                  const delivPct = sum === 0 ? 0 : (b.delivered / sum) * 100;
                  return (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-1.5"
                      title={`${b.day}-kun: ${formatSom(sum)}`}
                    >
                      <div className="flex h-full w-full items-end">
                        <div
                          className="flex w-full flex-col overflow-hidden rounded-t-[2px]"
                          style={{ height: `${Math.max(2, hPct)}%` }}
                        >
                          {b.pending > 0 && (
                            <div
                              className="w-full bg-amber-600"
                              style={{ height: `${100 - paidPct - delivPct}%` }}
                            />
                          )}
                          {b.delivered > 0 && (
                            <div
                              className="w-full bg-navy-700"
                              style={{ height: `${delivPct}%` }}
                            />
                          )}
                          <div
                            className="w-full bg-emerald-600"
                            style={{ height: `${paidPct}%` }}
                          />
                        </div>
                      </div>
                      <div className="font-mono text-[9px] text-ink-400">
                        {b.day}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Row: regions + donut */}
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top viloyatlar (oylik)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {regionList.map(([region, vol]) => {
                  const widthPct = (vol / regionMax) * 100;
                  const count = stores.filter((s) => s.region === region).length;
                  return (
                    <div key={region}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
                        <span className="font-medium text-ink-900 truncate">
                          {region}
                        </span>
                        <div className="flex items-center gap-3 shrink-0 font-mono text-ink-700">
                          <span>{formatSom(vol)}</span>
                          <span className="text-ink-400 text-[11px]">
                            {count} do&apos;kon
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className="h-full bg-navy-700 rounded-full"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mijoz segmentatsiyasi</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div
                  className="relative grid size-44 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--color-emerald-600) 0% ${seg1End.toFixed(
                      1,
                    )}%, var(--color-navy-700) ${seg1End.toFixed(
                      1,
                    )}% ${seg2End.toFixed(1)}%, var(--color-ink-400) ${seg2End.toFixed(
                      1,
                    )}% 100%)`,
                  }}
                >
                  <div className="absolute inset-3 rounded-full bg-surface-card grid place-items-center">
                    <div className="text-center">
                      <div className="font-mono text-2xl font-bold text-ink-900 leading-none">
                        {stores.length}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
                        do&apos;kon
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 w-full space-y-2 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink-600">
                      <span className="size-2 rounded-full bg-emerald-600" />
                      VIP (&gt;50M/oy)
                    </span>
                    <span className="font-mono font-semibold text-ink-900">
                      {vip}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink-600">
                      <span className="size-2 rounded-full bg-navy-700" />
                      O&apos;rta (10-50M)
                    </span>
                    <span className="font-mono font-semibold text-ink-900">
                      {mid}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink-600">
                      <span className="size-2 rounded-full bg-ink-400" />
                      Kichik (&lt;10M)
                    </span>
                    <span className="font-mono font-semibold text-ink-900">
                      {small}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top do'konlar (LTV) */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Top do&apos;konlar (LTV)</CardTitle>
            </CardHeader>
            <div>
              <div className="grid grid-cols-[40px_1.6fr_140px_120px_120px] items-center gap-3 border-b border-border bg-ink-100/40 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                <span>#</span>
                <span>Do&apos;kon</span>
                <span className="text-right">LTV</span>
                <span className="text-right">Reliability</span>
                <span className="text-right">Oxirgi buyurtma</span>
              </div>
              {topStores.map((s, i) => (
                <Link
                  key={s.id}
                  href={`/supplier/do-konlar/${s.id}`}
                  className="grid grid-cols-[40px_1.6fr_140px_120px_120px] items-center gap-3 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/40"
                >
                  <span className="font-mono text-[12px] font-bold text-ink-500">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-ink-900 truncate">
                      {s.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-ink-500 truncate">
                      {s.region} &middot; {s.district}
                    </div>
                  </div>
                  <span className="text-right font-mono text-[13px] font-semibold text-ink-900">
                    {formatSom(s.totalLifetimeVolume)}
                  </span>
                  <span
                    className={cn(
                      "text-right font-mono text-[13px] font-semibold",
                      s.reliabilityScore >= 9
                        ? "text-emerald-600 dark:text-emerald-400"
                        : s.reliabilityScore >= 7.5
                        ? "text-amber-600 dark:text-amber-300"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {s.reliabilityScore.toFixed(1)}/10
                  </span>
                  <span className="text-right font-mono text-[11px] text-ink-500">
                    {new Date(s.lastOrderAt).toISOString().slice(0, 10)}
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Product categories + Lost customers */}
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Mahsulot kategoriya</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-3 w-full rounded-full overflow-hidden flex">
                  {categories.map((c) => (
                    <div
                      key={c.name}
                      className={c.color}
                      style={{ width: `${c.pct}%` }}
                      title={`${c.name}: ${c.pct}%`}
                    />
                  ))}
                </div>
                <div className="mt-4 space-y-2.5">
                  {categories.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center justify-between text-[13px]"
                    >
                      <span className="flex items-center gap-2 text-ink-700">
                        <span className={cn("size-2.5 rounded-sm", c.color)} />
                        {c.name}
                      </span>
                      <span className="font-mono font-semibold text-ink-900">
                        {c.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-600">
              <CardHeader className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-700 dark:text-red-300" />
                <CardTitle>Lost customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 text-[13px] text-ink-700">
                  <span className="font-mono font-bold text-red-700 dark:text-red-300 text-[18px]">
                    {lost.length} ta
                  </span>{" "}
                  do&apos;kon 3+ oy buyurtma yo&apos;q
                </div>
                <div className="space-y-2">
                  {lost.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-2 rounded-sm border border-border bg-ink-100/30 px-2.5 py-1.5"
                    >
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-ink-900 truncate">
                          {s.name}
                        </div>
                        <div className="font-mono text-[10px] text-ink-500">
                          {s.region}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Phone className="size-3" />
                      </Button>
                    </div>
                  ))}
                  {lost.length === 0 && (
                    <div className="rounded-md border border-dashed border-border bg-emerald-50/40 px-3 py-4 text-center text-[12px] text-emerald-700 dark:text-emerald-300">
                      Yo&apos;qotilgan mijoz yo&apos;q
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI cost tracking */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                AI cost tracking
              </CardTitle>
              <span className="font-mono text-[11px] text-ink-500">Bu oy</span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    Jami xarajat
                  </div>
                  <div className="mt-2 font-mono text-3xl font-bold text-ink-900">
                    ${totalAiCost.toFixed(2)}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-ink-500">
                    ~{formatSom(Math.round(totalAiCost * 12700))}
                  </div>
                </div>
                <div className="sm:col-span-2 space-y-3">
                  {aiCostFeatures.map((f) => (
                    <div key={f.label}>
                      <div className="mb-1 flex items-center justify-between text-[12px]">
                        <span className="text-ink-700">{f.label}</span>
                        <span className="font-mono font-semibold text-ink-900">
                          ${f.cost.toFixed(2)}{" "}
                          <span className="text-ink-400">({f.pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${f.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
