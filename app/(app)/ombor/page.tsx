import { Topbar } from "@/components/layout/topbar";
import { Alert } from "@/components/ui/alert";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { OmborView } from "@/components/ombor/ombor-view";
import { products as productsApi, ApiError } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

export default async function OmborPage() {
  let products: Awaited<ReturnType<typeof productsApi.list>>["results"] = [];
  let stats = {
    total: 0,
    critical: 0,
    atMin: 0,
    ok: 0,
    withMxik: 0,
    withoutMxik: 0,
  };
  let loadError: string | null = null;

  try {
    const [pRes, sRes] = await Promise.all([
      productsApi.list(),
      productsApi.stats(),
    ]);
    products = pRes.results;
    stats = sRes;
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "Noma'lum xato";
  }

  return (
    <>
      <Topbar breadcrumb={[{ label: "Ombor" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {loadError && (
            <Alert variant="error" className="mb-4">
              Yuklashda xatolik: {loadError}
            </Alert>
          )}

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
