import { Topbar } from "@/components/layout/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { OmborView } from "@/components/ombor/ombor-view";
import { getProducts, getProductStats } from "@/lib/store";
import { formatNumber } from "@/lib/utils";

export default function OmborPage() {
  const products = getProducts();
  const stats = getProductStats();

  return (
    <>
      <Topbar breadcrumb={[{ label: "Ombor" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* KPIs */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <KpiCard
              label="Jami mahsulot"
              value={formatNumber(stats.total)}
              trend={{ value: "Katalog hajmi", direction: "up" }}
            />
            <KpiCard
              label="Kritik darajada"
              value={formatNumber(stats.critical)}
              valueClassName="text-red-700 dark:text-red-300"
              trend={{ value: "Darhol e'tibor kerak", direction: "warn" }}
            />
            <KpiCard
              label="Minimum limitda"
              value={formatNumber(stats.atMin)}
              valueClassName="text-amber-600 dark:text-amber-300"
              trend={{ value: "Buyurtma rejalash", direction: "warn" }}
            />
            <KpiCard
              label="Yetarli zaxira"
              value={formatNumber(stats.ok)}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: "Limit ustida", direction: "up" }}
            />
          </div>

          <OmborView products={products} />
        </div>
      </main>
    </>
  );
}
