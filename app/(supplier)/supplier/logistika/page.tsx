import {
  Plus,
  Truck,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  Activity,
} from "lucide-react";
import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supplierPortal, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { DeliveryRoute } from "@/lib/types";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

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

interface RouteStat {
  delivered: number;
  total: number;
  progressPct: number;
  isCompleted: boolean;
}

function getStats(r: DeliveryRoute): RouteStat {
  const total = r.stops.length;
  const delivered = r.stops.filter((s) => s.status === "delivered").length;
  const progressPct = total > 0 ? (delivered / total) * 100 : 0;
  const isCompleted = delivered === total;
  return { delivered, total, progressPct, isCompleted };
}

function RouteCard({ route, collapsed }: { route: DeliveryRoute; collapsed?: boolean }) {
  const { delivered, total, progressPct, isCompleted } = getStats(route);

  if (collapsed) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "size-9 shrink-0 grid place-items-center rounded-full text-[11px] font-bold text-white font-mono",
              colorFromId(route.driverName),
            )}
          >
            {initialsOf(route.driverName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-ink-900 truncate">
              {route.driverName}
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-ink-500">
              {route.vehiclePlate} &middot; {total} stop
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-3" />
            Yetkazib berildi
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "size-10 shrink-0 grid place-items-center rounded-full text-[12px] font-bold text-white font-mono",
              colorFromId(route.driverName),
            )}
          >
            {initialsOf(route.driverName)}
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-ink-900 truncate">
              {route.driverName}
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-ink-500">
              {route.vehiclePlate}
            </div>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase",
            isCompleted
              ? "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300"
              : "bg-navy-50 border-navy-700 text-navy-700 dark:text-navy-300",
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="size-3" />
          ) : (
            <Truck className="size-3 animate-pulse" />
          )}
          {isCompleted ? "Yetkazib berildi" : "Yo'lda"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-ink-500">
          <span>
            <span className="font-mono font-semibold text-ink-900">
              {delivered}
            </span>{" "}
            / {total} stopdan bajarildi
          </span>
          <span className="font-mono">
            {isCompleted ? "Tugatildi" : `ETA ${timeOnly(route.estimatedCompletion)}`}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
          <div
            className={cn(
              "h-full transition-all",
              isCompleted ? "bg-emerald-600" : "bg-navy-700",
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Stops timeline */}
      <div className="mt-4 border-t border-border pt-3">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500 mb-2">
          Stop&apos;lar
        </div>
        <div className="space-y-2">
          {route.stops.map((s, i) => {
            const isCurrent =
              s.status === "pending" &&
              route.stops.slice(0, i).every((x) => x.status === "delivered");
            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full",
                    s.status === "delivered"
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-navy-700 text-white"
                      : "bg-ink-100 text-ink-500",
                  )}
                >
                  {s.status === "delivered" ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : isCurrent ? (
                    <Truck className="size-3.5" />
                  ) : (
                    <Clock className="size-3.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "text-[12px] truncate",
                      s.status === "delivered"
                        ? "text-ink-500 line-through"
                        : "text-ink-900 font-medium",
                    )}
                  >
                    {s.storeName}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-ink-500">
                  {timeOnly(s.eta)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button variant="secondary" size="sm">
          <MapPin className="size-3.5" />
          Live track
        </Button>
        <Button variant="ghost" size="sm">
          <Phone className="size-3.5" />
          Aloqaga chiqish
        </Button>
      </div>
    </Card>
  );
}

export default async function SupplierLogistikaPage({ searchParams }: PageProps) {
  // TODO: backend RoutesListParams lacks status/search; surface as no-op for now.
  await searchParams;
  let routes: DeliveryRoute[] = [];
  let loadError: string | null = null;
  try {
    const res = await supplierPortal.routes.list({ limit: 100 });
    routes = res.results;
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "Marshrutlarni yuklab bo'lmadi";
  }

  // KPI
  const total = routes.length;
  const completed = routes.filter((r) => getStats(r).isCompleted).length;
  const active = total - completed;

  // Active = not yet fully delivered
  const activeRoutes = routes.filter((r) => !getStats(r).isCompleted);
  const completedRoutes = routes.filter((r) => getStats(r).isCompleted);

  return (
    <>
      <SupplierTopbar
        breadcrumb={[{ label: "Supplier" }, { label: "Logistika" }]}
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
                Logistika
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Bugungi marshrutlar va yetkazib berish kuzatuvi
              </p>
            </div>
            <Button>
              <Plus className="size-4" />
              Yangi marshrut
            </Button>
          </div>

          {/* KPI */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Bugun marshrut"
              value={total}
              trend={{ value: "8 driver ishda", direction: "up" }}
            />
            <KpiCard
              label="Yetkazib berildi"
              value={completed}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: `${total > 0 ? Math.round((completed / total) * 100) : 0}% bajarildi`, direction: "up" }}
            />
            <KpiCard
              label="Yo'lda"
              value={active}
              valueClassName="text-navy-700 dark:text-navy-300"
              trend={{ value: "Real-time tracking", direction: "up" }}
            />
            <KpiCard
              label="O'rtacha vaqt"
              value="1.4 kun"
              trend={{ value: "-0.2 o'tgan haftaga", direction: "up" }}
            />
          </div>

          {/* Map placeholder */}
          <Card className="mb-6 overflow-hidden">
            <div
              className="relative grid h-64 place-items-center"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--color-navy-50) 70%, transparent), color-mix(in oklab, var(--color-emerald-50) 50%, transparent))",
              }}
            >
              {/* Grid pattern */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, color-mix(in oklab, var(--color-ink-300) 50%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-ink-300) 50%, transparent) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              {/* Mock pins */}
              {[
                { top: "18%", left: "22%", active: true },
                { top: "30%", left: "55%", active: true },
                { top: "45%", left: "38%", active: false },
                { top: "55%", left: "70%", active: true },
                { top: "62%", left: "18%", active: false },
                { top: "72%", left: "48%", active: true },
                { top: "28%", left: "78%", active: false },
                { top: "80%", left: "82%", active: true },
              ].map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-lg",
                    p.active ? "bg-emerald-600" : "bg-ink-400",
                  )}
                  style={{ top: p.top, left: p.left }}
                >
                  <Truck className="size-4" />
                </div>
              ))}
              {/* Center label */}
              <div className="relative z-10 rounded-md border border-border bg-surface-card/95 px-4 py-2.5 text-center shadow-md backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-ink-900">
                  <MapPin className="size-4 text-emerald-700 dark:text-emerald-300" />
                  Yandex Xarita integratsiyasi tez orada
                </div>
                <div className="mt-1 font-mono text-[11px] text-ink-500">
                  {active} ta truck yo&apos;lda &middot; {completed} ta yetkazib berildi
                </div>
              </div>
            </div>
          </Card>

          {/* Active routes */}
          <section className="mb-6">
            <div className="mb-3 flex items-end justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-7 place-items-center rounded-sm bg-navy-50 text-navy-700 dark:text-navy-300">
                  <Activity className="size-4" />
                </div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
                  Faol marshrutlar
                  <span className="ml-2 font-mono text-[12px] font-medium text-ink-500">
                    ({activeRoutes.length} ta)
                  </span>
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-500">
                Real-time
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {activeRoutes.map((r) => (
                <RouteCard key={r.id} route={r} />
              ))}
              {activeRoutes.length === 0 && (
                <div className="col-span-full rounded-md border border-dashed border-border bg-emerald-50/60 px-5 py-8 text-center text-[13px] text-emerald-700 dark:text-emerald-300">
                  Barcha marshrutlar yopildi &mdash; ajoyib ish!
                </div>
              )}
            </div>
          </section>

          {/* Completed routes — compact */}
          {completedRoutes.length > 0 && (
            <section>
              <div className="mb-3 flex items-end justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-7 place-items-center rounded-sm bg-emerald-50 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
                    Bugun yetkazib berildi
                    <span className="ml-2 font-mono text-[12px] font-medium text-ink-500">
                      ({completedRoutes.length} ta)
                    </span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {completedRoutes.map((r) => (
                  <RouteCard key={r.id} route={r} collapsed />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
