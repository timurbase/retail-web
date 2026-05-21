import { Topbar } from "@/components/layout/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lock,
  X,
  BarChart3,
  Plus,
  Filter,
  ArrowDownAZ,
  Map,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Play,
  Heart,
  Tag,
  Shield,
  LineChart,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";
import {
  mockDistributorStores,
  mockDistributorKpi,
} from "@/lib/mock-data";
import { formatNumber, cn } from "@/lib/utils";
import type { DistributorStore } from "@/lib/mock-data";

// ---------- status pill ----------

const statusStyles: Record<
  DistributorStore["status"],
  { dot: string; label: string; text: string }
> = {
  active: { dot: "bg-emerald-500", label: "Faol", text: "text-emerald-700 dark:text-emerald-300" },
  slow: { dot: "bg-amber-500", label: "Sust", text: "text-amber-600 dark:text-amber-300" },
  inactive: {
    dot: "bg-red-500",
    label: "14 kun buyurtma yo'q",
    text: "text-red-700 dark:text-red-300",
  },
};

function StatusPill({ status }: { status: DistributorStore["status"] }) {
  const s = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
        s.text
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

// ---------- store card ----------

function StoreCard({ store }: { store: DistributorStore }) {
  const isUp = store.trend >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const revenueM = (store.weekRevenue / 1_000_000).toFixed(1);
  return (
    <div className="group flex cursor-pointer flex-col rounded-md border border-border bg-surface-card p-3.5 transition-shadow hover:shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-2.5">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-700 font-mono text-[13px] font-bold text-white">
          {store.initial}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-[13px] font-semibold leading-tight text-ink-900">
            {store.name}
          </h4>
          <p className="mt-0.5 truncate font-mono text-[11px] text-ink-500">
            {store.district}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <StatusPill status={store.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-2.5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Bugun
          </div>
          <div className="mt-0.5 font-mono text-[13px] font-semibold text-ink-900">
            {store.todayDocs} hujjat
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Hafta
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-mono text-[13px] font-semibold text-ink-900">
              {revenueM}M
            </span>
            <span
              className={cn(
                "flex items-center gap-0.5 font-mono text-[10px] font-semibold",
                isUp ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
              )}
            >
              <TrendIcon className="size-2.5" />
              {isUp ? "+" : ""}
              {Math.round(store.trend * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- coming-soon feature row ----------

interface ComingSoonFeature {
  icon: typeof Sparkles;
  title: string;
  description: string;
  badge: string;
}

const comingSoon: ComingSoonFeature[] = [
  {
    icon: LineChart,
    title: "Real-time talab grafikasi",
    description: "Tarmoq bo'ylab har soatda yangilanadigan talab xaritasi.",
    badge: "2026 Q3",
  },
  {
    icon: Tag,
    title: "Narx sinxronlash",
    description: "Bir bosishda barcha do'konlarda narxlarni yangilang.",
    badge: "2026 Q3",
  },
  {
    icon: Shield,
    title: "Multi-tenant RBAC",
    description: "Har do'kon uchun roziq va rol asosida ruxsatlar.",
    badge: "2026 Q3",
  },
  {
    icon: Sparkles,
    title: "Smart restock orders",
    description: "AI tarmoq bo'yicha avtomatik buyurtma reja tuzadi.",
    badge: "2026 Q4",
  },
  {
    icon: Heart,
    title: "Loyalty programs",
    description: "Markazlashgan sadoqat dasturi — barcha do'konlarda.",
    badge: "2026 Q4",
  },
  {
    icon: BarChart3,
    title: "Predictive analytics",
    description: "Hudud bo'yicha 30 kunlik talab prognozi (pgvector).",
    badge: "2027 Q1",
  },
];

// ---------- page ----------

export default function DistributorPage() {
  const activeStores = mockDistributorStores.filter((s) => s.status === "active").length;
  const slowStores = mockDistributorStores.filter((s) => s.status === "slow").length;
  const inactiveStores = mockDistributorStores.filter((s) => s.status === "inactive").length;

  return (
    <>
      <Topbar breadcrumb={[{ label: "AI" }, { label: "Distribyutor portal" }]} />

      {/* DEMO banner */}
      <div className="flex items-center justify-between gap-4 border-b border-navy-900/50 bg-navy-800 px-8 py-2.5 text-white">
        <div className="flex items-center gap-2.5">
          <Lock className="size-3.5 text-amber-400" />
          <span className="text-[13px]">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-400">
              DEMO
            </span>
            <span className="mx-2 text-white/30">·</span>
            Distribyutor portal hali ishlab chiqilmoqda. Birinchi versiya{" "}
            <span className="font-mono font-semibold">2026-Q3</span> da.{" "}
            <button className="ml-1 underline underline-offset-2 hover:text-emerald-400">
              Erta kirish ro'yxatiga qo'shilish →
            </button>
          </span>
        </div>
        <button
          className="rounded-sm p-1 text-white/60 hover:bg-white/10 hover:text-white"
          aria-label="Yopish"
        >
          <X className="size-4" />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* H1 + actions */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                  Distribyutor portal
                </h1>
                <span className="rounded-full border border-amber-600 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">
                  Mock UI
                </span>
              </div>
              <p className="mt-1 text-[13px] text-ink-500">
                Sizning{" "}
                <span className="font-mono font-medium text-ink-700">47 ta</span>{" "}
                do'kon tarmog'ingiz — bir interfeysda. (Keyingi sprint)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="md">
                <BarChart3 className="size-4" />
                Hisobotlar
              </Button>
              <Button variant="primary" size="md">
                <Plus className="size-4" />
                Do'kon qo'shish
              </Button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <KpiCard
              label="Faol do'konlar"
              value={`${mockDistributorKpi.activeStores} / ${mockDistributorKpi.totalStores}`}
              valueClassName="text-emerald-700 dark:text-emerald-300"
              trend={{
                value: `${activeStores} faol · ${slowStores} sust · ${inactiveStores} jim`,
                direction: "up",
              }}
            />
            <KpiCard
              label="Bugun hujjatlar"
              value={mockDistributorKpi.todayDocs}
              trend={{ value: "+12% kechagiga", direction: "up" }}
            />
            <KpiCard
              label="Haftalik tushum"
              value={`${mockDistributorKpi.weekRevenue} so'm`}
              trend={{ value: "+18.4% bu hafta", direction: "up" }}
            />
            <KpiCard
              label="O'rtacha buyurtma"
              value={`${mockDistributorKpi.avgOrder} so'm`}
              trend={{ value: "+4% oxirgi 30 kun", direction: "up" }}
            />
          </div>

          {/* 2-column main grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* LEFT — Stores grid (2/3) */}
            <div className="col-span-2">
              <Card>
                <CardHeader className="flex items-center justify-between gap-3">
                  <CardTitle>Do'konlar tarmog'i</CardTitle>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface-card px-2.5 py-1 text-[12px] font-medium text-ink-700 hover:bg-ink-100">
                      <Filter className="size-3" />
                      Hammasi
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface-card px-2.5 py-1 font-mono text-[12px] font-medium text-ink-700 hover:bg-ink-100">
                      <ArrowDownAZ className="size-3" />
                      Tushum ↓
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface-card px-2.5 py-1 text-[12px] font-medium text-ink-700 hover:bg-ink-100">
                      <Map className="size-3" />
                      Xarita
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {mockDistributorStores.map((store) => (
                      <StoreCard key={store.id} store={store} />
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-mono text-[11px] text-ink-500">
                      Ko'rsatilmoqda: 12 / {mockDistributorKpi.activeStores} ta
                    </span>
                    <button className="flex items-center gap-1 text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline">
                      Hammasini ko'rish
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT — insights column (1/3) */}
            <div className="col-span-1 space-y-4">
              {/* Bu hafta o'sish */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5">
                    <TrendingUp className="size-4 text-emerald-700 dark:text-emerald-300" />
                    Bu hafta o'sish
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-3xl font-bold leading-none tracking-tight text-emerald-700 dark:text-emerald-300">
                    +12.4%
                  </div>
                  <p className="mt-2 text-[12px] text-ink-500">
                    Tarmoq aylanmasi · {mockDistributorKpi.activeStores} do'kon
                  </p>
                  {/* sparkline-ish bars */}
                  <div className="mt-3 flex items-end gap-1 h-10">
                    {[3, 5, 4, 7, 6, 8, 12].map((v, i) => (
                      <div
                        key={i}
                        style={{ height: `${(v / 12) * 100}%` }}
                        className={cn(
                          "flex-1 rounded-t-sm",
                          i === 6 ? "bg-emerald-600" : "bg-emerald-600/30"
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* E'tibor talab qiladi */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-300" />
                    E'tibor talab qiladi
                  </CardTitle>
                </CardHeader>
                <div>
                  <div className="border-l-4 border-red-600 px-4 py-2.5">
                    <p className="text-[12px] font-semibold leading-tight text-ink-900">
                      Karimov MChJ
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-500">
                      14 kun hujjat yo'q
                    </p>
                    <button className="mt-1 text-[11px] font-medium text-navy-700 dark:text-navy-300 hover:underline">
                      Aloqaga chiqing →
                    </button>
                  </div>
                  <div className="border-l-4 border-amber-600 px-4 py-2.5 border-t border-t-border">
                    <p className="text-[12px] font-semibold leading-tight text-ink-900">
                      Lazzat Market
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-500">
                      Narx tahrir kerak — 12 ta SKU
                    </p>
                    <button className="mt-1 text-[11px] font-medium text-navy-700 dark:text-navy-300 hover:underline">
                      Ko'rib chiqish →
                    </button>
                  </div>
                  <div className="border-l-4 border-navy-700 px-4 py-2.5 border-t border-t-border">
                    <p className="text-[12px] font-semibold leading-tight text-ink-900">
                      Yangi Bozor
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-500">
                      Kredit limit 80M so'm gacha oshirildi
                    </p>
                    <button className="mt-1 text-[11px] font-medium text-navy-700 dark:text-navy-300 hover:underline">
                      Tasdiqlash →
                    </button>
                  </div>
                </div>
              </Card>

              {/* AI tavsiyalar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5">
                    <Sparkles className="size-4 text-emerald-700 dark:text-emerald-300" />
                    AI tavsiyalar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-sm border border-emerald-600/30 bg-emerald-50 px-3 py-2">
                    <p className="text-[12px] leading-snug text-emerald-700 dark:text-emerald-300">
                      <span className="font-semibold">Mineral suv</span> talab{" "}
                      <span className="font-mono font-semibold">+23%</span> oshmoqda
                      — Toshkent viloyatida.
                    </p>
                  </div>
                  <div className="rounded-sm border border-amber-600/30 bg-amber-50 px-3 py-2">
                    <p className="text-[12px] leading-snug text-amber-600 dark:text-amber-300">
                      <span className="font-semibold">Coca-Cola Zero</span>{" "}
                      <span className="font-mono font-semibold">5 ta</span> do'konda
                      yo'q — yetkazib bering.
                    </p>
                  </div>
                  <button className="flex w-full items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2 text-left transition-colors hover:bg-ink-100">
                    <div className="grid size-7 shrink-0 place-items-center rounded-full bg-navy-700 text-white">
                      <Play className="size-3 fill-current" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold leading-tight text-ink-900">
                        Demo video
                      </p>
                      <p className="font-mono text-[11px] text-ink-500">
                        Tarmoq portal — 2:30
                      </p>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coming Soon roadmap */}
          <section className="mt-8">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <RefreshCcw className="size-4 text-navy-700 dark:text-navy-300" />
                  Yo'l xaritasi — keyingi sprintlar
                </CardTitle>
                <span className="font-mono text-[11px] text-ink-500">
                  6 ta funksiya · 2026-Q3 dan boshlab
                </span>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {comingSoon.map((f) => {
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.title}
                        className="relative flex gap-3 rounded-md border border-dashed border-border bg-surface p-4 opacity-80"
                      >
                        <div className="grid size-8 shrink-0 place-items-center rounded-sm bg-navy-700/10 text-navy-700 dark:text-navy-300">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-[13px] font-semibold leading-tight text-ink-900">
                              {f.title}
                            </h4>
                            <span className="shrink-0 rounded-full bg-navy-700 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                              Beta
                            </span>
                          </div>
                          <p className="mt-1 text-[12px] leading-snug text-ink-500">
                            {f.description}
                          </p>
                          <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                            {f.badge}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
