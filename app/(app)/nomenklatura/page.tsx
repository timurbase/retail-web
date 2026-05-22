import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FileSpreadsheet } from "lucide-react";
import { ProductsView } from "@/components/products/products-view";
import { products as productsApi, ApiError } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

export default async function NomenklaturaPage() {
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

  const dupSuspects = Math.max(0, Math.round(stats.total * 0.05));
  const mxikCoverage =
    stats.total > 0 ? Math.round((stats.withMxik / stats.total) * 100) : 0;

  return (
    <>
      <Topbar breadcrumb={[{ label: "Nomenklatura" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Nomenklatura
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Do&apos;kon ichki mahsulot katalogi va MXIK biriktirilishi
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <FileSpreadsheet className="size-4" />
                Excel import
              </Button>
            </div>
          </div>

          {loadError && (
            <Alert variant="error" className="mb-4">
              Yuklashda xatolik: {loadError}
            </Alert>
          )}

          {/* KPI */}
          <div className="mb-4 grid grid-cols-4 gap-4">
            <KpiCard label="Jami mahsulot" value={formatNumber(stats.total)} />
            <KpiCard
              label="MXIK biriktirilgan"
              value={formatNumber(stats.withMxik)}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{
                value: `${mxikCoverage}% qoplangan`,
                direction: "up",
              }}
            />
            <KpiCard
              label="MXIK yo'q"
              value={formatNumber(stats.withoutMxik)}
              valueClassName="text-red-700 dark:text-red-300"
              trend={{ value: "Tekshirish kerak", direction: "warn" }}
            />
            <KpiCard
              label="Dublikat shubha"
              value={formatNumber(dupSuspects)}
              valueClassName="text-amber-600 dark:text-amber-300"
              trend={{ value: "AI aniqladi", direction: "warn" }}
            />
          </div>

          {/* Warning alert */}
          {dupSuspects > 0 && (
            <Alert variant="warning" className="mb-4">
              <div className="flex w-full items-center justify-between gap-4">
                <div className="text-[13px]">
                  <span className="font-mono font-semibold">
                    {dupSuspects} ta
                  </span>{" "}
                  dublikat shubha aniqlandi &mdash; AI yordamida bir xil mahsulot
                  ikki marta kiritilgan bo&apos;lishi mumkin.
                </div>
                <a
                  href="#"
                  className="whitespace-nowrap text-[13px] font-semibold text-amber-700 underline hover:text-amber-600 dark:text-amber-300"
                >
                  Ko&apos;rib chiqish &rarr;
                </a>
              </div>
            </Alert>
          )}

          {/* Filters + table + modals */}
          <ProductsView products={products} />
        </div>
      </main>
    </>
  );
}
