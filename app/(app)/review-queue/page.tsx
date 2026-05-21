import { Topbar } from "@/components/layout/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ReviewQueueView } from "@/components/review-queue/review-queue-view";
import { getDocuments } from "@/lib/store";

export default function ReviewQueuePage() {
  const documents = getDocuments();

  // Count for KPIs (server-side, before passing to client)
  let total = 0;
  let newCount = 0;
  let ambiguousCount = 0;
  for (const doc of documents) {
    for (const row of doc.rows) {
      if (row.status === "new") {
        total++;
        newCount++;
      } else if (row.status === "ambiguous") {
        total++;
        ambiguousCount++;
      }
    }
  }

  return (
    <>
      <Topbar breadcrumb={[{ label: "Review Queue" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Review Queue
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Operator tasdig&apos;ini kutayotgan yozuvlar
              </p>
            </div>
            <div className="font-mono text-[11px] text-ink-500 text-right leading-relaxed">
              <span className="rounded-sm border border-border bg-surface-card px-1.5 py-0.5">
                ↑↓
              </span>{" "}
              navigate <span className="text-ink-300">·</span>{" "}
              <span className="rounded-sm border border-border bg-surface-card px-1.5 py-0.5">
                Space
              </span>{" "}
              tasdiqlash <span className="text-ink-300">·</span>{" "}
              <span className="rounded-sm border border-border bg-surface-card px-1.5 py-0.5">
                S
              </span>{" "}
              skip
            </div>
          </div>

          {/* KPIs */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <KpiCard
              label="Jami kutmoqda"
              value={total}
              valueClassName="text-amber-600"
              trend={{
                value: "Operator tasdig'i kerak",
                direction: "warn",
              }}
            />
            <KpiCard
              label="Yangi mahsulot"
              value={newCount}
              valueClassName="text-amber-600"
              trend={{ value: "Katalogga qo'shish", direction: "warn" }}
            />
            <KpiCard
              label="MXIK aniq emas"
              value={ambiguousCount}
              valueClassName="text-red-700"
              trend={{ value: "Variant tanlash kerak", direction: "warn" }}
            />
          </div>

          {/* Filters + cards + bulk action (client) */}
          <ReviewQueueView documents={documents} />
        </div>
      </main>
    </>
  );
}
