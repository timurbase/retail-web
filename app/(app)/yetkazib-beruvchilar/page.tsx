import { Topbar } from "@/components/layout/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SuppliersView } from "@/components/suppliers/suppliers-view";
import { getSuppliers } from "@/lib/store";
import { formatNumber } from "@/lib/utils";

export default function YetkazibBeruvchilarPage() {
  const suppliers = getSuppliers();

  const total = suppliers.length;
  const verifiedCount = suppliers.filter((s) => s.verified).length;
  const unverified = total - verifiedCount;
  const verifiedRate = total > 0 ? verifiedCount / total : 0;
  // Demo "active in last 30 days" — use verified as proxy
  const activeLast30 = verifiedCount;

  return (
    <>
      <Topbar breadcrumb={[{ label: "Yetkazib beruvchilar" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Yetkazib beruvchilar
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Firma va distribyutorlar ro&apos;yxati, ishonchlilik bahosi
              </p>
            </div>
          </div>

          {/* KPI */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Jami yetkazib beruvchi"
              value={formatNumber(total)}
            />
            <KpiCard
              label="Aktiv (oxirgi 30 kun)"
              value={formatNumber(activeLast30)}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{
                value: `${total > 0 ? Math.round((activeLast30 / total) * 100) : 0}% baza`,
                direction: "up",
              }}
            />
            <KpiCard
              label="STIR tasdiqlanmagan"
              value={formatNumber(unverified)}
              valueClassName={
                unverified > 0 ? "text-amber-600 dark:text-amber-300" : "text-emerald-600 dark:text-emerald-400"
              }
              trend={
                unverified > 0
                  ? { value: "Tekshirish kerak", direction: "warn" }
                  : { value: "Hammasi tasdiqlangan", direction: "up" }
              }
            />
            <KpiCard
              label="Tasdiqlangan ulushi"
              value={`${Math.round(verifiedRate * 100)}%`}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: "Soliq.uz bo'yicha", direction: "up" }}
            />
          </div>

          {/* Client view: toolbar, grid, modals */}
          <SuppliersView suppliers={suppliers} />
        </div>
      </main>
    </>
  );
}
