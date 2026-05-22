import { Topbar } from "@/components/layout/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { mockWeeklyChart } from "@/lib/mock-data";
import {
  documents as documentsApi,
  products as productsApi,
  auth as authApi,
} from "@/lib/api";
import { ApiError } from "@/lib/api";
// TODO(backend): insights endpoint not yet available, using mock
import { getInsights } from "@/lib/store";
import { formatSom } from "@/lib/utils";
import Link from "next/link";

/**
 * First name = first whitespace-delimited token of the full name.
 * Falls back to "Foydalanuvchi" so the greeting is always populated.
 */
function firstNameFrom(fullName: string | undefined | null): string {
  const t = (fullName ?? "").trim();
  if (!t) return "Foydalanuvchi";
  return t.split(/\s+/)[0];
}

export default async function DashboardPage() {
  const today = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Fetch in parallel; degrade gracefully on error.
  let docStats = {
    newToday: 0,
    reviewQueue: 0,
    autoApprovalRate: 0,
    totalRows: 0,
    approvedRows: 0,
  };
  let prodStats = {
    total: 0,
    critical: 0,
    atMin: 0,
    ok: 0,
    withMxik: 0,
    withoutMxik: 0,
  };
  let recentDocs: Awaited<ReturnType<typeof documentsApi.list>>["results"] = [];
  let firstName = "Foydalanuvchi";
  let loadError: string | null = null;

  try {
    const [ds, ps, rd, me] = await Promise.all([
      documentsApi.stats(),
      productsApi.stats(),
      documentsApi.list({ limit: 5 }),
      authApi.me().catch(() => null) as Promise<{
        user?: { full_name?: string };
      } | null>,
    ]);
    docStats = ds;
    prodStats = ps;
    recentDocs = rd.results;
    firstName = firstNameFrom(me?.user?.full_name);
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "Noma'lum xato";
  }

  const insights = getInsights();
  const mxikErrors = prodStats.withoutMxik;

  return (
    <>
      <Topbar breadcrumb={[{ label: "Dashboard" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Welcome row */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Salom, {firstName}{" "}
                <span className="inline-block animate-pulse">👋</span>
              </h1>
              <p className="mt-1 font-mono text-[13px] text-ink-500 capitalize">
                {today}
              </p>
            </div>
            <Button>
              <Plus className="size-4" />
              Hujjat import
            </Button>
          </div>

          {loadError && (
            <Alert variant="error" className="mb-4">
              Yuklashda xatolik: {loadError}
            </Alert>
          )}

          {/* KPI Grid */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <KpiCard
              label="Bugun yangi hujjat"
              value={docStats.newToday}
              trend={{
                value: "Bugungi hujjatlar soni",
                direction: "up",
              }}
            />
            <KpiCard
              label="Review kutmoqda"
              value={docStats.reviewQueue}
              valueClassName="text-amber-600 dark:text-amber-300"
              trend={{ value: "Operator tasdig'i kerak", direction: "warn" }}
            />
            <KpiCard
              label="Avto-aniqlik"
              value={`${Math.round(docStats.autoApprovalRate * 100)}%`}
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{
                value: `${docStats.approvedRows}/${docStats.totalRows} qator`,
                direction: "up",
              }}
            />
            <KpiCard
              label="MXIK xato"
              value={mxikErrors}
              valueClassName="text-red-700 dark:text-red-300"
              trend={{ value: "Kod biriktirilmagan", direction: "warn" }}
            />
          </div>

          {/* Main grid: chart + insights */}
          <div className="grid grid-cols-3 gap-4">
            {/* Weekly chart */}
            <Card className="col-span-2">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Haftalik kirimlar</CardTitle>
                <span className="font-mono text-[11px] text-ink-500">
                  Oxirgi 7 kun
                </span>
              </CardHeader>
              <CardContent>
                <WeeklyChart data={mockWeeklyChart} />
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                  AI Insights
                </CardTitle>
                <Link
                  href="/insights"
                  className="text-[11px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                >
                  Hammasi →
                </Link>
              </CardHeader>
              <CardContent className="space-y-2 p-4">
                {insights.slice(0, 3).map((ins) => (
                  <Alert
                    key={ins.id}
                    variant={
                      ins.severity === "critical"
                        ? "error"
                        : ins.severity === "warning"
                        ? "warning"
                        : "info"
                    }
                    className="text-[13px] py-2.5"
                  >
                    <div className="font-semibold leading-tight">{ins.title}</div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent activity */}
          <Card className="mt-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>So'nggi hujjatlar</CardTitle>
              <Link
                href="/hujjatlar"
                className="text-[11px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
              >
                Hammasi →
              </Link>
            </CardHeader>
            <div>
              {recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/hujjatlar/${doc.id}`}
                  className="flex items-center justify-between border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/50"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[13px] text-ink-500">
                      №{doc.number}
                    </span>
                    <span className="text-sm font-medium text-ink-900">
                      {doc.supplier.name}
                    </span>
                    <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-ink-500">
                      {doc.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[13px] text-ink-700">
                      {formatSom(doc.totalAmount)}
                    </span>
                    {doc.status === "review" && (
                      <span className="rounded-full bg-amber-50 border border-amber-600 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-300">
                        {doc.reviewCount} review
                      </span>
                    )}
                    {doc.status === "approved" && (
                      <span className="rounded-full bg-emerald-50 border border-emerald-600 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                        ✓ Tasdiqlangan
                      </span>
                    )}
                    {doc.status === "pending" && (
                      <span className="rounded-full bg-navy-50 border border-navy-700 px-2 py-0.5 text-[10px] font-mono font-semibold text-navy-700 dark:text-navy-300">
                        Parsing...
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
