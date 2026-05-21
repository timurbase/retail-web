import { Topbar } from "@/components/layout/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ClipboardList,
  Search,
  ChevronDown,
  Sparkles,
  Send,
  Package,
} from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import { formatSom, formatNumber, formatDate, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type StockStatus = "critical" | "at-min" | "ok";

function stockStatusOf(p: Product): StockStatus {
  if (p.currentStock < p.minStock) return "critical";
  if (p.currentStock === p.minStock) return "at-min";
  return "ok";
}

interface ReorderSuggestion {
  qty: number;
  reasoning: string;
}

function suggestReorder(p: Product): ReorderSuggestion {
  // Simple heuristic: bring stock up to ~2x min, rounded to 10.
  const target = Math.max(p.minStock * 2, p.minStock + 10);
  const qty = Math.max(10, Math.ceil((target - p.currentStock) / 10) * 10);
  const reasoning =
    p.currentStock === 0
      ? "Zaxira tugagan — darhol yetkazib berish"
      : `Min ${p.minStock} ${p.unit} ushlash uchun`;
  return { qty, reasoning };
}

const statusPill: Record<
  StockStatus,
  { label: string; className: string }
> = {
  critical: {
    label: "KAM",
    className: "bg-red-50 text-red-700 border-red-600",
  },
  "at-min": {
    label: "LIMITDA",
    className: "bg-amber-50 text-amber-600 border-amber-600",
  },
  ok: {
    label: "YETARLI",
    className: "bg-emerald-50 text-emerald-700 border-emerald-600",
  },
};

function StatusPill({ status }: { status: StockStatus }) {
  const cfg = statusPill[status];
  const dot =
    status === "critical"
      ? "bg-red-600"
      : status === "at-min"
      ? "bg-amber-600"
      : "bg-emerald-600";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
        cfg.className
      )}
    >
      <span className={cn("inline-block size-1.5 rounded-full", dot)} />
      {cfg.label}
    </span>
  );
}

export default function OmborPage() {
  const products = mockProducts;
  const critical = products.filter((p) => stockStatusOf(p) === "critical");
  const atMin = products.filter((p) => stockStatusOf(p) === "at-min");
  const ok = products.filter((p) => stockStatusOf(p) === "ok");
  const needsReorder = [...critical, ...atMin];

  return (
    <>
      <Topbar breadcrumb={[{ label: "Ombor" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Ombor qoldiqlari
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Real vaqt qoldiq holati va minimal limit nazorati
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <ClipboardList className="size-4" />
                Inventarizatsiya boshlash
              </Button>
              <Button>
                <Plus className="size-4" />
                Yangi mahsulot
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <KpiCard
              label="Jami mahsulot"
              value={products.length}
              trend={{ value: "Katalog hajmi", direction: "up" }}
            />
            <KpiCard
              label="Kritik darajada"
              value={critical.length}
              valueClassName="text-red-700"
              trend={{
                value: "Darhol e'tibor kerak",
                direction: "warn",
              }}
            />
            <KpiCard
              label="Minimum limitda"
              value={atMin.length}
              valueClassName="text-amber-600"
              trend={{ value: "Buyurtma rejalash", direction: "warn" }}
            />
            <KpiCard
              label="Yetarli zaxira"
              value={ok.length}
              valueClassName="text-emerald-600"
              trend={{ value: "Limit ustida", direction: "up" }}
            />
          </div>

          {/* Section 1: Critical */}
          {needsReorder.length > 0 && (
            <section className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-block size-2.5 rounded-full bg-red-600" />
                <h2 className="text-[15px] font-semibold text-ink-900">
                  Kritik darajada
                </h2>
                <span className="font-mono text-[12px] text-ink-500">
                  ({needsReorder.length} ta)
                </span>
              </div>

              <Alert variant="error" className="mb-3 text-[13px]">
                <div className="font-semibold leading-tight">
                  {needsReorder.length} ta mahsulot minimal limitdan kam
                </div>
                <div className="mt-0.5 text-[12px] opacity-80">
                  AI tavsiyalari tayyor — buyurtmalarni yuborish mumkin.
                </div>
              </Alert>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-ink-100">
                      <tr className="border-b border-border">
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                          Mahsulot
                        </th>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                          MXIK
                        </th>
                        <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                          Qoldiq
                        </th>
                        <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                          Min
                        </th>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                          Status
                        </th>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                          Tavsiya
                        </th>
                        <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                          Amal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {needsReorder.map((p) => {
                        const status = stockStatusOf(p);
                        const sug = suggestReorder(p);
                        const qtyColor =
                          status === "critical"
                            ? "text-red-700"
                            : "text-amber-600";
                        return (
                          <tr
                            key={p.id}
                            className="border-b border-border last:border-0 hover:bg-ink-100/50"
                          >
                            <td className="px-4 py-3">
                              <div className="text-[13px] font-medium text-ink-900">
                                {p.name}
                              </div>
                              <div className="mt-0.5 font-mono text-[11px] text-ink-500">
                                {p.unit}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-[12px] text-ink-500">
                              {p.mxik}
                            </td>
                            <td
                              className={cn(
                                "px-4 py-3 text-right font-mono text-[15px] font-bold tabular-nums",
                                qtyColor
                              )}
                            >
                              {formatNumber(p.currentStock)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-400 tabular-nums">
                              {formatNumber(p.minStock)}
                            </td>
                            <td className="px-4 py-3">
                              <StatusPill status={status} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-start gap-1.5 text-[12px] text-ink-700">
                                <Sparkles className="mt-0.5 size-3 shrink-0 text-emerald-600" />
                                <div>
                                  <span className="font-semibold">
                                    {formatNumber(sug.qty)} {p.unit}
                                  </span>{" "}
                                  buyurtma berish
                                  <div className="text-[11px] text-ink-500">
                                    {sug.reasoning}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="emerald" size="sm">
                                <Package className="size-3.5" />
                                Buyurtma
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="mt-3 flex justify-end">
                <Button>
                  <Send className="size-4" />
                  Hammasiga buyurtma yuborish (Alpha Distribution&apos;ga)
                </Button>
              </div>
            </section>
          )}

          {/* Section 2: All products */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-block size-2.5 rounded-full bg-navy-700" />
                <h2 className="text-[15px] font-semibold text-ink-900">
                  Barcha mahsulotlar
                </h2>
                <span className="font-mono text-[12px] text-ink-500">
                  ({products.length} ta)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-400 pointer-events-none" />
                  <input
                    type="search"
                    placeholder="Mahsulot yoki MXIK qidirish..."
                    className="h-8 w-64 rounded-sm border border-border bg-surface-card pl-8 pr-3 text-[12px] text-ink-700 placeholder:text-ink-400 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-surface-card px-3 text-[12px] font-medium text-ink-700 hover:bg-ink-100"
                >
                  Saralash: Nomi
                  <ChevronDown className="size-3.5 text-ink-400" />
                </button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <CardHeader className="flex items-center justify-between py-3">
                <CardTitle className="text-[13px]">
                  Katalog ({formatNumber(products.length)} mahsulot)
                </CardTitle>
                <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider">
                  So&apos;nggi yangilanish bugun
                </span>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ink-100">
                    <tr className="border-b border-border">
                      <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Mahsulot
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        MXIK
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Birlik
                      </th>
                      <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Qoldiq
                      </th>
                      <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Min
                      </th>
                      <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        O&apos;rt narx
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Oxirgi kirim
                      </th>
                      <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        ⋯
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const status = stockStatusOf(p);
                      const qtyColor =
                        status === "critical"
                          ? "text-red-700 font-bold"
                          : status === "at-min"
                          ? "text-amber-600 font-semibold"
                          : "text-ink-900";
                      return (
                        <tr
                          key={p.id}
                          className="border-b border-border last:border-0 hover:bg-ink-100/50"
                        >
                          <td className="px-4 py-3">
                            <div className="text-[13px] font-medium text-ink-900">
                              {p.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[12px] text-ink-500">
                            {p.mxik}
                          </td>
                          <td className="px-4 py-3 font-mono text-[12px] text-ink-700">
                            {p.unit}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3 text-right font-mono text-[13px] tabular-nums",
                              qtyColor
                            )}
                          >
                            {formatNumber(p.currentStock)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-400 tabular-nums">
                            {formatNumber(p.minStock)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-700 tabular-nums">
                            {formatSom(p.avgPrice)}
                          </td>
                          <td className="px-4 py-3 font-mono text-[12px] text-ink-500">
                            {p.lastReceivedAt
                              ? formatDate(p.lastReceivedAt)
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              className="inline-flex size-7 items-center justify-center rounded-sm text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                              aria-label="Boshqa amallar"
                            >
                              ⋯
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
