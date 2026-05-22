import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Alert } from "@/components/ui/alert";
import { OrderCard } from "@/components/supplier/order-card";
import { supplierPortal, ApiError } from "@/lib/api";
import type { IncomingOrder } from "@/lib/types";

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

// Fixed reference now
const NOW_ISO = "2026-05-21T10:00:00Z";
const NOW_MS = new Date(NOW_ISO).getTime();

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  accepted: 1,
  fulfilled: 2,
  rejected: 3,
};

export default async function SupplierBuyurtmalarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  let orders: IncomingOrder[] = [];
  let loadError: string | null = null;
  try {
    const res = await supplierPortal.orders.list({
      status: pickString(params, "status"),
      search: pickString(params, "q") ?? pickString(params, "search"),
    });
    orders = res.results;
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "Buyurtmalarni yuklab bo'lmadi";
  }

  const pending = orders.filter((o) => o.status === "pending");
  const accepted = orders.filter((o) => o.status === "accepted");
  const rejected = orders.filter((o) => o.status === "rejected");
  const fulfilled = orders.filter((o) => o.status === "fulfilled");

  // "Bugun qabul qilindi" — accepted today
  const today = NOW_ISO.slice(0, 10);
  const todayAccepted = accepted.filter((o) =>
    o.requestedAt.startsWith(today),
  ).length;

  // Sort: pending first by date desc, then accepted by date desc, then others
  const sorted = [...orders].sort((a, b) => {
    const da = STATUS_ORDER[a.status] ?? 9;
    const db = STATUS_ORDER[b.status] ?? 9;
    if (da !== db) return da - db;
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
  });

  // Oldest pending — for warning alert
  const oldestPending = pending.reduce<typeof pending[number] | null>(
    (a, b) =>
      a && new Date(a.requestedAt).getTime() <= new Date(b.requestedAt).getTime()
        ? a
        : b,
    null,
  );
  let oldestText = "—";
  if (oldestPending) {
    const diffH = Math.floor(
      (NOW_MS - new Date(oldestPending.requestedAt).getTime()) / 3600000,
    );
    oldestText = diffH < 1 ? "30 daq oldin" : `${diffH} soat oldin`;
  }

  return (
    <>
      <SupplierTopbar
        breadcrumb={[{ label: "Supplier" }, { label: "Buyurtmalar" }]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {loadError && (
            <Alert variant="error" className="mb-4">
              {loadError}
            </Alert>
          )}
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">
              Kelgan buyurtmalar
            </h1>
            <p className="mt-1 text-[13px] text-ink-500">
              Do&apos;konlardan kelgan buyurtmalar &mdash; tasdiqlash kutmoqda
            </p>
          </div>

          {/* KPI */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Kutilmoqda"
              value={pending.length}
              valueClassName="text-amber-600 dark:text-amber-300"
              trend={{
                value: pending.length > 0 ? "Diqqat talab" : "Hammasi ko'rib chiqildi",
                direction: pending.length > 0 ? "warn" : "up",
              }}
            />
            <KpiCard
              label="Bugun qabul qilindi"
              value={todayAccepted}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: `${accepted.length} ta jami`, direction: "up" }}
            />
            <KpiCard
              label="Bekor qilingan"
              value={rejected.length}
              valueClassName={rejected.length > 0 ? "text-red-600 dark:text-red-400" : ""}
              trend={{
                value: rejected.length > 0 ? "Sabablarni ko'ring" : "Hammasi yaxshi",
                direction: rejected.length > 0 ? "down" : "up",
              }}
            />
            <KpiCard
              label="O'rt. tasdiqlash vaqti"
              value="8 daq"
              trend={{ value: "Yaxshi natija", direction: "up" }}
            />
          </div>

          {/* Warning alert */}
          {pending.length > 0 && (
            <Alert variant="warning" className="mb-6">
              <div className="font-semibold">
                {pending.length} ta buyurtma tasdiqlash kutmoqda
              </div>
              <div className="mt-0.5 text-[12px]">
                Eng eskisi {oldestText}
                {fulfilled.length > 0 && (
                  <span className="ml-2 opacity-80">
                    &middot; {fulfilled.length} ta yopilgan
                  </span>
                )}
              </div>
            </Alert>
          )}

          {/* Orders list */}
          <div className="flex flex-col gap-3">
            {sorted.map((o) => (
              <OrderCard key={o.id} order={o} nowMs={NOW_MS} />
            ))}
            {sorted.length === 0 && (
              <div className="rounded-md border border-dashed border-border bg-ink-100/40 px-5 py-12 text-center text-[13px] text-ink-500">
                Hozircha buyurtmalar yo&apos;q
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
