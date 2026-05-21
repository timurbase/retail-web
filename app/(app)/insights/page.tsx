import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RotateCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { mockWeeklyTrends } from "@/lib/mock-data";
import { getInsights } from "@/lib/store";
import { formatNumber, cn } from "@/lib/utils";
import { InsightsView } from "@/components/insights/insights-view";

function WeeklyTrendChart() {
  const data = mockWeeklyTrends.dailyRevenue;
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex h-32 items-end gap-3">
      {data.map((d) => {
        const h = (d.value / max) * 100;
        return (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className={cn(
                "font-mono text-[10px] font-semibold",
                d.today ? "text-emerald-700 dark:text-emerald-300" : "text-ink-500"
              )}
            >
              {d.value.toFixed(1)}M
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                style={{ height: `${h}%` }}
                className={cn(
                  "w-full rounded-t-sm",
                  d.today ? "bg-emerald-600" : "bg-navy-700"
                )}
              />
            </div>
            <span
              className={cn(
                "font-mono text-[11px]",
                d.today ? "font-semibold text-emerald-700 dark:text-emerald-300" : "text-ink-500"
              )}
            >
              {d.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function InsightsPage() {
  const insights = getInsights();

  return (
    <>
      <Topbar breadcrumb={[{ label: "AI" }, { label: "Insights" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* H1 + actions */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                AI Insights
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Kunlik AI tahlil va proaktiv tavsiyalar &mdash; bugun{" "}
                <span className="font-mono font-medium text-ink-700">09:00</span>{" "}
                da yangilandi
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <RotateCw className="size-3.5" />
                Yangilash
              </Button>
              <Link
                href="/sozlamalar"
                className="rounded-sm px-3 py-2 text-[13px] font-medium text-navy-700 dark:text-navy-300 hover:bg-navy-50"
              >
                Sozlamalar
              </Link>
            </div>
          </div>

          {/* Interactive insights (client) */}
          <InsightsView insights={insights} />

          {/* SECTION 5 — Haftalik tendentsiyalar (static, no actions) */}
          <section className="mb-4">
            <div className="mb-3 flex items-end justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-7 place-items-center rounded-sm bg-emerald-50 text-emerald-700 dark:text-emerald-300">
                  <BarChart3 className="size-4" />
                </div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
                  Haftalik tendentsiyalar
                  <span className="ml-2 font-mono text-[12px] font-medium text-ink-500">
                    (
                    {mockWeeklyTrends.topSellers.length +
                      mockWeeklyTrends.decliners.length}{" "}
                    ta)
                  </span>
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-500">
                So&apos;nggi 7 kun
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Chart card */}
              <Card className="col-span-1">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Kunlik tushum</CardTitle>
                  <span className="font-mono text-[11px] text-ink-500">
                    mln so&apos;m
                  </span>
                </CardHeader>
                <CardContent>
                  <WeeklyTrendChart />
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[12px] text-ink-500">
                      Haftalik o&apos;sish
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[13px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <TrendingUp className="size-3.5" />
                      +18.4%
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Top sotilgan */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-1.5">
                    <TrendingUp className="size-4 text-emerald-700 dark:text-emerald-300" />
                    Top sotilgan tovarlar
                  </CardTitle>
                </CardHeader>
                <div>
                  {mockWeeklyTrends.topSellers.map((p, i) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between border-b border-border px-5 py-2.5 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-5 place-items-center rounded-sm bg-emerald-50 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          {i + 1}
                        </span>
                        <span className="text-[13px] font-medium text-ink-900">
                          {p.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[12px] text-ink-600">
                          {formatNumber(p.qty)}
                        </span>
                        <span className="flex items-center gap-0.5 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          <TrendingUp className="size-3" />+
                          {Math.round(p.trend * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pasayayotgan */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-1.5">
                    <TrendingDown className="size-4 text-red-600 dark:text-red-400" />
                    Sotuv pasayayotgan
                  </CardTitle>
                </CardHeader>
                <div>
                  {mockWeeklyTrends.decliners.map((p, i) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between border-b border-border px-5 py-2.5 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-5 place-items-center rounded-sm bg-red-50 font-mono text-[10px] font-bold text-red-700 dark:text-red-300">
                          {i + 1}
                        </span>
                        <span className="text-[13px] font-medium text-ink-900">
                          {p.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[12px] text-ink-600">
                          {formatNumber(p.qty)}
                        </span>
                        <span className="flex items-center gap-0.5 font-mono text-[11px] font-semibold text-red-700 dark:text-red-300">
                          <TrendingDown className="size-3" />
                          {Math.round(p.trend * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="px-5 py-3">
                    <Link
                      href="/hisobotlar"
                      className="flex items-center gap-1 text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                    >
                      To&apos;liq hisobot
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
