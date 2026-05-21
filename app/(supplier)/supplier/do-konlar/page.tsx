import Link from "next/link";
import {
  Plus,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  ChevronDown,
  Pencil,
  Phone,
  Ban,
} from "lucide-react";
import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { getSupplierStores } from "@/lib/store";
import { formatSom, formatDate, cn } from "@/lib/utils";
import type { SupplierStore } from "@/lib/types";

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

// Deterministic active-orders mock count from store id
function activeOrdersOf(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 17 + id.charCodeAt(i)) >>> 0;
  }
  return hash % 7;
}

const STATUS_META: Record<
  SupplierStore["status"],
  { dot: string; label: string; bg: string; text: string; border: string; order: number }
> = {
  active: {
    dot: "🟢",
    label: "Faol",
    bg: "bg-emerald-50",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-600",
    order: 0,
  },
  slow: {
    dot: "🟡",
    label: "Sust",
    bg: "bg-amber-50",
    text: "text-amber-600 dark:text-amber-300",
    border: "border-amber-600",
    order: 1,
  },
  inactive: {
    dot: "🔴",
    label: "Inaktiv",
    bg: "bg-red-50",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-600",
    order: 2,
  },
};

function StoreCard({ store }: { store: SupplierStore }) {
  const status = STATUS_META[store.status];
  const reliabilityPct = (store.reliabilityScore / 10) * 100;
  const TrendIcon =
    store.growthPercent > 0.5
      ? ArrowUpRight
      : store.growthPercent < -0.5
      ? ArrowDownRight
      : Minus;
  const trendColor =
    store.growthPercent > 0.5
      ? "text-emerald-600 dark:text-emerald-400"
      : store.growthPercent < -0.5
      ? "text-red-600 dark:text-red-400"
      : "text-ink-500";
  const activeOrders = activeOrdersOf(store.id);

  return (
    <Card className="flex flex-col p-5 hover:border-border-strong transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              "size-10 shrink-0 grid place-items-center rounded-full text-[12px] font-bold text-white font-mono",
              colorFromId(store.id),
            )}
          >
            {initialsOf(store.name)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-ink-900">
              {store.name}
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-ink-500 truncate">
              STIR {store.stir}
            </div>
            <div className="mt-0.5 text-[11px] text-ink-500 truncate">
              {store.region} · {store.district}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-1 shrink-0">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold whitespace-nowrap",
              status.bg,
              status.text,
              status.border,
            )}
          >
            {status.dot} {status.label}
          </span>
          <Dropdown>
            <DropdownItem icon={<Pencil className="size-3.5" />}>
              Tahrirlash
            </DropdownItem>
            <DropdownItem icon={<Phone className="size-3.5" />}>
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

      {/* Reliability */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-ink-500">
          <span className="uppercase tracking-wider font-mono">Reliability</span>
          <span className="font-mono font-semibold text-ink-900">
            {store.reliabilityScore.toFixed(1)}/10
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full bg-navy-700"
            style={{ width: `${reliabilityPct}%` }}
          />
        </div>
      </div>

      {/* 3-col stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-y border-border py-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">
            Bu oy
          </div>
          <div className="mt-0.5 font-mono text-[12px] font-semibold text-ink-900">
            {formatSom(store.monthlyVolume)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">
            Aktiv b.
          </div>
          <div className="mt-0.5 font-mono text-[12px] font-semibold text-ink-900">
            {activeOrders}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">
            Oxirgi
          </div>
          <div className="mt-0.5 font-mono text-[12px] font-semibold text-ink-900">
            {formatDate(store.lastOrderAt)}
          </div>
        </div>
      </div>

      {/* Growth */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-mono text-[12px] font-semibold",
            trendColor,
          )}
        >
          <TrendIcon className="size-3.5" />
          {store.growthPercent > 0 ? "+" : ""}
          {store.growthPercent.toFixed(1)}%
        </span>
        <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
          o&apos;tgan oyga
        </span>
      </div>

      {/* Footer: outstanding + link */}
      <Link
        href={`/supplier/do-konlar/${store.id}`}
        className="mt-4 -mx-5 -mb-5 flex items-center justify-between border-t border-border px-5 py-3 hover:bg-ink-100/50 rounded-b-md"
      >
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">
            Kutilayotgan to&apos;lov
          </div>
          <div
            className={cn(
              "mt-0.5 font-mono text-[13px] font-semibold",
              store.outstandingBalance > 0
                ? "text-amber-600 dark:text-amber-300"
                : "text-ink-500",
            )}
          >
            {store.outstandingBalance > 0
              ? formatSom(store.outstandingBalance)
              : "Yo'q"}
          </div>
        </div>
        <ChevronRight className="size-4 text-ink-400" />
      </Link>
    </Card>
  );
}

export default function SupplierStoresPage() {
  const stores = getSupplierStores();

  // KPI calcs
  const total = stores.length;
  const active = stores.filter((s) => s.status === "active").length;
  const slow = stores.filter((s) => s.status === "slow").length;
  const inactive = stores.filter((s) => s.status === "inactive").length;
  const totalMonthly = stores.reduce((sum, s) => sum + s.monthlyVolume, 0);
  const avgReliability =
    stores.reduce((sum, s) => sum + s.reliabilityScore, 0) / Math.max(1, total);

  // Sort: active → slow → inactive (then volume desc within group)
  const sorted = [...stores].sort((a, b) => {
    const da = STATUS_META[a.status].order;
    const db = STATUS_META[b.status].order;
    if (da !== db) return da - db;
    return b.monthlyVolume - a.monthlyVolume;
  });

  // Unique regions count
  const regionCount = new Set(stores.map((s) => s.region)).size;

  return (
    <>
      <SupplierTopbar
        breadcrumb={[
          { label: "Supplier" },
          { label: "Do'konlar" },
        ]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header row */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Do&apos;konlar tarmog&apos;i
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Sizning xaridorlar — {total} ta do&apos;kon, {regionCount} viloyat
              </p>
            </div>
            <Button>
              <Plus className="size-4" />
              Do&apos;kon taklif qilish
            </Button>
          </div>

          {/* KPI */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Jami do'konlar"
              value={total}
              trend={{ value: `+2 oxirgi 30 kun`, direction: "up" }}
            />
            <KpiCard
              label="Bu oy aylanma"
              value={formatSom(totalMonthly)}
              trend={{ value: "+8% o'tgan oyga", direction: "up" }}
            />
            <KpiCard
              label="O'rtacha reliability"
              value={`${avgReliability.toFixed(1)}/10`}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: "+0.2 bu hafta", direction: "up" }}
            />
            <KpiCard
              label="Bu hafta aktiv"
              value={active}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: "+3 bu hafta", direction: "up" }}
            />
          </div>

          {/* Warning about inactive */}
          {inactive > 0 && (
            <Alert variant="warning" className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold leading-tight">
                    {inactive} ta do&apos;kon 14+ kun buyurtma yo&apos;q
                  </div>
                  <div className="mt-0.5 text-[12px]">
                    Eslatma jo&apos;nating yoki aloqaga chiqing
                  </div>
                </div>
                <a
                  href="#inactive-section"
                  className="text-[12px] font-medium underline-offset-2 hover:underline"
                >
                  Ko&apos;rib chiqish →
                </a>
              </div>
            </Alert>
          )}

          {/* Filter bar (visual) */}
          <Card className="mb-6 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Do'kon, STIR yoki direktor bo'yicha qidirish..."
                  className="h-9 w-full rounded-sm border border-border bg-surface pl-9 pr-3 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
                />
              </div>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-surface-card px-3 text-[13px] text-ink-700 hover:bg-ink-100">
                Status: Hammasi ({total})
                <ChevronDown className="size-3.5 text-ink-500" />
              </button>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-surface-card px-3 text-[13px] text-ink-700 hover:bg-ink-100">
                Viloyat: Hammasi
                <ChevronDown className="size-3.5 text-ink-500" />
              </button>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-surface-card px-3 text-[13px] text-ink-700 hover:bg-ink-100">
                Tartib: So&apos;nggi buyurtma
                <ChevronDown className="size-3.5 text-ink-500" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5">
              <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mr-1">
                Tezkor:
              </span>
              <span className="rounded-full bg-navy-700 px-2 py-0.5 text-[11px] font-mono text-white">
                Hammasi {total}
              </span>
              <span className="rounded-full border border-emerald-600 bg-emerald-50 px-2 py-0.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                Faol {active}
              </span>
              <span className="rounded-full border border-amber-600 bg-amber-50 px-2 py-0.5 text-[11px] font-mono text-amber-600 dark:text-amber-300">
                Sust {slow}
              </span>
              <span className="rounded-full border border-red-600 bg-red-50 px-2 py-0.5 text-[11px] font-mono text-red-700 dark:text-red-300">
                Inaktiv {inactive}
              </span>
            </div>
          </Card>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((s, i) => {
              // Mark the first inactive card with the anchor for scroll-to
              const isFirstInactive =
                s.status === "inactive" &&
                sorted.findIndex((x) => x.status === "inactive") === i;
              return (
                <div
                  key={s.id}
                  id={isFirstInactive ? "inactive-section" : undefined}
                  className="scroll-mt-6"
                >
                  <StoreCard store={s} />
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
