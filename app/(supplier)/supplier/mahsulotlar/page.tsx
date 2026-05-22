import {
  Plus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Pencil,
  Tag,
  Boxes,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
} from "@/components/ui/dropdown";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { supplierPortal, ApiError } from "@/lib/api";
import type { SupplierProduct, SupplierProductCategory } from "@/lib/types";
import { formatSom, formatNumber, cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function pickString(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = params[key];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

const categoryLabel: Record<SupplierProductCategory, string> = {
  ichimliklar: "Ichimliklar",
  "oziq-ovqat": "Oziq-ovqat",
  sigaret: "Sigaret",
  maishiy: "Maishiy",
  kosmetika: "Kosmetika",
  boshqa: "Boshqa",
};

const categoryStyles: Record<SupplierProductCategory, string> = {
  ichimliklar: "border-navy-700 bg-navy-50 text-navy-700 dark:text-navy-300",
  "oziq-ovqat":
    "border-emerald-600 bg-emerald-50 text-emerald-700 dark:text-emerald-300",
  sigaret: "border-ink-400 bg-ink-100 text-ink-700",
  maishiy: "border-amber-600 bg-amber-50 text-amber-600 dark:text-amber-300",
  kosmetika: "border-red-600 bg-red-50 text-red-700 dark:text-red-300",
  boshqa: "border-ink-300 bg-surface text-ink-600",
};

const CATEGORY_ORDER: SupplierProductCategory[] = [
  "ichimliklar",
  "oziq-ovqat",
  "sigaret",
  "maishiy",
  "kosmetika",
  "boshqa",
];

export default async function ProductCatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  let products: SupplierProduct[] = [];
  let loadError: string | null = null;
  try {
    const res = await supplierPortal.products.list({
      category: pickString(params, "category"),
      search: pickString(params, "q") ?? pickString(params, "search"),
    });
    products = res.results;
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "Mahsulotlarni yuklab bo'lmadi";
  }

  // Category counts
  const categoryCount: Record<string, number> = {};
  for (const p of products) {
    categoryCount[p.category] = (categoryCount[p.category] ?? 0) + 1;
  }

  // KPIs
  const totalSku = products.length;
  const monthlySalesTotal = products.reduce((s, p) => s + p.monthlySales, 0);
  const avgPrice =
    products.length > 0
      ? Math.round(products.reduce((s, p) => s + p.basePrice, 0) / products.length)
      : 0;

  return (
    <>
      <SupplierTopbar breadcrumb={[{ label: "Mahsulot katalog" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {loadError && (
            <Alert variant="error" className="mb-4">
              {loadError}
            </Alert>
          )}
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Mahsulot katalog
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Alpha Distribution sotuvga taklif qiladigan mahsulotlar —{" "}
                <span className="font-mono font-semibold text-ink-700">
                  {totalSku} ta SKU
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <Tag className="size-4" />
                Toplu narx yangilash
              </Button>
              <Button>
                <Plus className="size-4" />
                Yangi mahsulot
              </Button>
            </div>
          </div>

          {/* KPI */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Jami SKU" value={formatNumber(totalSku)} />
            <KpiCard
              label="Bu oy sotilgan"
              value={formatNumber(monthlySalesTotal)}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: "+8% o'tgan oyga", direction: "up" }}
            />
            <KpiCard label="O'rtacha narx" value={formatSom(avgPrice)} />
            <KpiCard
              label="Aksiya bilan"
              value="8 ta"
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: "Faol promo", direction: "up" }}
            />
          </div>

          {/* Category chips */}
          <Card className="mb-4 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className="rounded-full bg-navy-700 px-3 py-1 text-[12px] font-medium text-white"
              >
                Hammasi{" "}
                <span className="font-mono text-[10px] text-white/80">
                  ({totalSku})
                </span>
              </button>
              {CATEGORY_ORDER.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="rounded-full border border-border bg-surface-card px-3 py-1 text-[12px] font-medium text-ink-600 hover:bg-ink-100"
                >
                  {categoryLabel[cat]}{" "}
                  <span className="font-mono text-[10px] text-ink-400">
                    ({categoryCount[cat] ?? 0})
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-ink-100/40 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    <th className="px-5 py-2.5 text-left">Mahsulot</th>
                    <th className="px-3 py-2.5 text-left">MXIK</th>
                    <th className="px-3 py-2.5 text-left">Kategoriya</th>
                    <th className="px-3 py-2.5 text-left">Birlik</th>
                    <th className="px-3 py-2.5 text-right">Stok</th>
                    <th className="px-3 py-2.5 text-right">Bu oy sotuv</th>
                    <th className="px-3 py-2.5 text-right">Narx</th>
                    <th className="px-3 py-2.5 text-right">Trend</th>
                    <th className="px-3 py-2.5 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
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
                    const stockColor =
                      p.stock < 100
                        ? "text-red-700 dark:text-red-300"
                        : p.stock < 500
                          ? "text-amber-600 dark:text-amber-300"
                          : "text-ink-900";
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-border transition-colors last:border-0 hover:bg-ink-100/50"
                      >
                        {/* Mahsulot */}
                        <td className="px-5 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-ink-900">
                                {p.name}
                              </div>
                              <div className="mt-0.5 font-mono text-[10px] text-ink-400">
                                {p.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* MXIK */}
                        <td className="px-3 py-3">
                          <span className="font-mono text-[12px] font-semibold text-ink-700">
                            {p.mxik}
                          </span>
                        </td>
                        {/* Kategoriya */}
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              categoryStyles[p.category],
                            )}
                          >
                            {categoryLabel[p.category]}
                          </span>
                        </td>
                        {/* Birlik */}
                        <td className="px-3 py-3">
                          <span className="font-mono text-[12px] text-ink-600">
                            {p.unit}
                          </span>
                        </td>
                        {/* Stok */}
                        <td className="px-3 py-3 text-right">
                          <span
                            className={cn(
                              "font-mono text-[13px] font-semibold tabular-nums",
                              stockColor,
                            )}
                          >
                            {formatNumber(p.stock)}
                          </span>
                        </td>
                        {/* Bu oy sotuv */}
                        <td className="px-3 py-3 text-right">
                          <span className="font-mono text-[12px] tabular-nums text-ink-700">
                            {formatNumber(p.monthlySales)}
                          </span>
                        </td>
                        {/* Narx */}
                        <td className="px-3 py-3 text-right">
                          <span className="font-mono text-[12px] font-semibold tabular-nums text-ink-900">
                            {formatSom(p.basePrice)}
                          </span>
                        </td>
                        {/* Trend */}
                        <td className="px-3 py-3 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold tabular-nums",
                              trendColor,
                            )}
                          >
                            <TrendIcon className="size-3" />
                            {p.trendPercent > 0 ? "+" : ""}
                            {p.trendPercent.toFixed(1)}%
                          </span>
                        </td>
                        {/* Amal */}
                        <td className="px-3 py-3 text-right">
                          <div className="flex justify-end">
                            <Dropdown>
                              <DropdownItem icon={<Pencil className="size-3.5" />}>
                                Tahrirlash
                              </DropdownItem>
                              <DropdownItem icon={<Tag className="size-3.5" />}>
                                Narxni yangilash
                              </DropdownItem>
                              <DropdownItem icon={<Boxes className="size-3.5" />}>
                                Stokni yangilash
                              </DropdownItem>
                              <DropdownItem icon={<TrendingUp className="size-3.5" />}>
                                Trend tahlili
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="font-mono text-[12px] text-ink-500">
                <span className="font-semibold text-ink-700">1–{totalSku}</span>{" "}
                / {totalSku} mahsulot
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-sm border border-border text-ink-400 hover:bg-ink-100 disabled:opacity-40"
                  disabled
                  aria-label="Oldingi"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-sm bg-navy-700 font-mono text-[12px] font-semibold text-white"
                >
                  1
                </button>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-sm border border-border text-ink-400 hover:bg-ink-100 disabled:opacity-40"
                  disabled
                  aria-label="Keyingi"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
