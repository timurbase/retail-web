export default function Loading() {
  return (
    <>
      {/* Top loading bar — animated gradient navy → emerald → navy */}
      <div
        className="fixed left-0 right-0 top-0 z-50 h-0.5 animate-pulse bg-gradient-to-r from-navy-700 via-emerald-500 to-navy-700"
        aria-hidden
      />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Page header skeleton */}
          <div className="mb-8 space-y-3">
            <div className="h-7 w-56 animate-pulse rounded-md bg-ink-100" />
            <div className="h-4 w-80 animate-pulse rounded-md bg-ink-100" />
          </div>

          {/* 4 KPI card skeletons */}
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            aria-busy="true"
            aria-label="Yuklanmoqda"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <KpiSkeleton key={i} />
            ))}
          </div>

          {/* Chart + sidebar list */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Chart area */}
            <div className="rounded-md border border-border bg-surface-card p-6 lg:col-span-2">
              <div className="mb-1 h-4 w-40 animate-pulse rounded-md bg-ink-100" />
              <div className="mb-6 h-3 w-56 animate-pulse rounded-md bg-ink-100" />
              <div className="h-64 animate-pulse rounded-md bg-ink-100" />
            </div>

            {/* Sidebar list */}
            <div className="rounded-md border border-border bg-surface-card p-6">
              <div className="mb-5 h-4 w-32 animate-pulse rounded-md bg-ink-100" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ListRowSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-md border border-border bg-surface-card p-5">
      <div className="h-3 w-24 animate-pulse rounded-md bg-ink-100" />
      <div className="mt-4 h-8 w-32 animate-pulse rounded-md bg-ink-100" />
      <div className="mt-3 h-3 w-20 animate-pulse rounded-md bg-ink-100" />
    </div>
  );
}

function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="size-9 shrink-0 animate-pulse rounded-md bg-ink-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 animate-pulse rounded-md bg-ink-100" />
        <div className="h-3 w-1/2 animate-pulse rounded-md bg-ink-100" />
      </div>
    </div>
  );
}
