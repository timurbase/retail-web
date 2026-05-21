import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  RotateCw,
  Sparkles,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDemandSignals } from "@/lib/store";
import { formatNumber, cn } from "@/lib/utils";
import type { DemandSignal } from "@/lib/types";

// 12 viloyat fixed list — order matches the 4x3 grid
const VILOYATLAR: { name: string; weeklyVolume: number; trend: number }[] = [
  { name: "Toshkent shahar", weeklyVolume: 12480, trend: 18.4 },
  { name: "Toshkent viloyat", weeklyVolume: 8230, trend: 9.2 },
  { name: "Samarqand", weeklyVolume: 5410, trend: 12.7 },
  { name: "Buxoro", weeklyVolume: 4180, trend: -3.4 },
  { name: "Andijon", weeklyVolume: 3920, trend: 14.8 },
  { name: "Farg'ona", weeklyVolume: 3640, trend: 6.5 },
  { name: "Namangan", weeklyVolume: 3210, trend: 4.2 },
  { name: "Surxondaryo", weeklyVolume: 1890, trend: -8.1 },
  { name: "Qashqadaryo", weeklyVolume: 2340, trend: 7.8 },
  { name: "Xorazm", weeklyVolume: 2150, trend: 3.1 },
  { name: "Navoiy", weeklyVolume: 1480, trend: -1.2 },
  { name: "Jizzax", weeklyVolume: 1620, trend: 5.4 },
];

function trendColor(t: number) {
  if (t >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (t >= 0) return "text-emerald-600/80 dark:text-emerald-400/80";
  if (t > -5) return "text-amber-600 dark:text-amber-300";
  return "text-red-600 dark:text-red-400";
}

// Map activity to color band for viloyat card backgrounds
function viloyatBg(weekly: number, max: number): string {
  const ratio = weekly / max;
  if (ratio > 0.75) return "bg-emerald-50 border-emerald-600";
  if (ratio > 0.45) return "bg-emerald-50/60 border-emerald-600/60";
  if (ratio > 0.2) return "bg-navy-50 border-navy-700/30";
  return "bg-ink-100 border-border";
}

function SignalCard({ signal, kind }: { signal: DemandSignal; kind: "rise" | "fall" }) {
  const isRise = kind === "rise";
  const sign = signal.trendPercent > 0 ? "+" : "";
  const predDelta = signal.predictedNextWeek - signal.weeklyVolume;
  const predSign = predDelta > 0 ? "+" : "";
  const predPct = signal.weeklyVolume > 0
    ? Math.round((predDelta / signal.weeklyVolume) * 100)
    : 0;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-ink-900 leading-tight truncate">
            {signal.productName}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-600">
              <MapPin className="size-3" />
              {signal.region}
              {signal.district ? ` · ${signal.district}` : ""}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 inline-flex items-center gap-0.5 rounded-sm px-2 py-1 font-mono text-[13px] font-bold",
            isRise
              ? "bg-emerald-50 text-emerald-700 dark:text-emerald-300"
              : "bg-red-50 text-red-700 dark:text-red-300"
          )}
        >
          {isRise ? (
            <TrendingUp className="size-3.5" />
          ) : (
            <TrendingDown className="size-3.5" />
          )}
          {sign}
          {signal.trendPercent.toFixed(1)}%
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Haftalik volume
          </div>
          <div className="mt-0.5 font-mono text-[14px] font-semibold text-ink-900">
            {formatNumber(signal.weeklyVolume)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Kelasi hafta
          </div>
          <div
            className={cn(
              "mt-0.5 font-mono text-[13px] font-semibold",
              isRise ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {predSign}
            {predPct}% kutilmoqda
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function SupplierTalabPage() {
  const signals = getDemandSignals();

  // KPI calcs
  const sorted = [...signals].sort((a, b) => b.trendPercent - a.trendPercent);
  const topRise = sorted[0];
  const topFall = sorted[sorted.length - 1];
  const avgTrend =
    signals.reduce((s, x) => s + x.trendPercent, 0) / Math.max(1, signals.length);

  const rising = signals.filter((s) => s.hotness === "rising");
  const falling = signals.filter((s) => s.hotness === "falling");
  const stable = signals.filter((s) => s.hotness === "stable");

  const maxViloyatVol = Math.max(...VILOYATLAR.map((v) => v.weeklyVolume));

  // Next-7-day forecast table — pick top 10 by abs trend
  const forecast = [...signals]
    .sort((a, b) => Math.abs(b.trendPercent) - Math.abs(a.trendPercent))
    .slice(0, 10);

  return (
    <>
      <SupplierTopbar
        breadcrumb={[{ label: "Supplier" }, { label: "Talab" }]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Talab tahlili
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Real-time mahsulot talabi viloyatlar va tumanlar bo&apos;yicha
              </p>
            </div>
            <Button variant="secondary">
              <RotateCw className="size-4" />
              Yangilash
            </Button>
          </div>

          {/* KPI */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Eng yuqori o'sish"
              value={
                topRise
                  ? `+${topRise.trendPercent.toFixed(1)}%`
                  : "—"
              }
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{
                value: topRise ? topRise.productName.replace(/^[^\sA-Za-z]+\s*/, "").slice(0, 22) : "—",
                direction: "up",
              }}
            />
            <KpiCard
              label="Eng yuqori tushish"
              value={
                topFall ? `${topFall.trendPercent.toFixed(1)}%` : "—"
              }
              valueClassName="text-red-600 dark:text-red-400"
              trend={{
                value: topFall ? topFall.productName.replace(/^[^\sA-Za-z]+\s*/, "").slice(0, 22) : "—",
                direction: "down",
              }}
            />
            <KpiCard
              label="O'rtacha o'sish"
              value={`${avgTrend >= 0 ? "+" : ""}${avgTrend.toFixed(1)}%`}
              valueClassName={avgTrend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}
              trend={{ value: `${signals.length} signal`, direction: avgTrend >= 0 ? "up" : "down" }}
            />
            <KpiCard
              label="Bashorat aniqligi"
              value="92%"
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: "Oxirgi 30 kun", direction: "up" }}
            />
          </div>

          {/* Heatmap mock — 4x3 viloyat grid */}
          <Card className="mb-6">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Eng faol mintaqalar</CardTitle>
              <div className="flex items-center gap-3 font-mono text-[10px] text-ink-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-sm bg-emerald-50 border border-emerald-600" />
                  Yuqori
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-sm bg-navy-50 border border-navy-700/30" />
                  O&apos;rta
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-sm bg-ink-100 border border-border" />
                  Past
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {VILOYATLAR.map((v) => {
                  const sign = v.trend > 0 ? "+" : "";
                  return (
                    <div
                      key={v.name}
                      className={cn(
                        "rounded-md border p-3 transition-colors hover:border-border-strong",
                        viloyatBg(v.weeklyVolume, maxViloyatVol)
                      )}
                    >
                      <div className="text-[12px] font-semibold text-ink-900 leading-tight">
                        {v.name}
                      </div>
                      <div className="mt-2 font-mono text-[18px] font-bold leading-none text-ink-900">
                        {formatNumber(v.weeklyVolume)}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-ink-500 uppercase tracking-wider">
                        haftalik volume
                      </div>
                      <div
                        className={cn(
                          "mt-2 inline-flex items-center gap-0.5 font-mono text-[13px] font-bold",
                          trendColor(v.trend)
                        )}
                      >
                        {v.trend > 0 ? (
                          <TrendingUp className="size-3.5" />
                        ) : (
                          <TrendingDown className="size-3.5" />
                        )}
                        {sign}
                        {v.trend.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Rising demand */}
          <section className="mb-6">
            <div className="mb-3 flex items-end justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-7 place-items-center rounded-sm bg-emerald-50 text-emerald-700 dark:text-emerald-300">
                  <TrendingUp className="size-4" />
                </div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
                  Yuqori talabli mahsulotlar
                  <span className="ml-2 font-mono text-[12px] font-medium text-ink-500">
                    ({rising.length} ta)
                  </span>
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-500">
                Rising · trend &ge; +8%
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {rising.map((s) => (
                <SignalCard key={s.id} signal={s} kind="rise" />
              ))}
              {rising.length === 0 && (
                <div className="col-span-full rounded-md border border-dashed border-border bg-ink-100/40 px-5 py-8 text-center text-[13px] text-ink-500">
                  Bu hafta o&apos;suvchi signal yo&apos;q
                </div>
              )}
            </div>

            {rising.length > 0 && (
              <Card className="mt-3 border-l-4 border-l-emerald-600 bg-emerald-50/60">
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 size-4 text-emerald-700 dark:text-emerald-300" />
                    <div>
                      <div className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-300">
                        AI tavsiya
                      </div>
                      <div className="mt-0.5 text-[13px] text-ink-700">
                        {rising.length} mahsulot zaxirasini ko&apos;paytirishni
                        tavsiya etamiz — kelasi hafta talab oshadi
                      </div>
                    </div>
                  </div>
                  <Button variant="emerald" size="sm">
                    Reja ko&apos;rish
                    <ArrowRight className="size-3.5" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Falling demand */}
          <section className="mb-6">
            <div className="mb-3 flex items-end justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-7 place-items-center rounded-sm bg-red-50 text-red-700 dark:text-red-300">
                  <TrendingDown className="size-4" />
                </div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
                  Pasayuvchi talab
                  <span className="ml-2 font-mono text-[12px] font-medium text-ink-500">
                    ({falling.length} ta)
                  </span>
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-500">
                Falling · trend &le; &minus;5%
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {falling.map((s) => (
                <SignalCard key={s.id} signal={s} kind="fall" />
              ))}
              {falling.length === 0 && (
                <div className="col-span-full rounded-md border border-dashed border-border bg-ink-100/40 px-5 py-8 text-center text-[13px] text-ink-500">
                  Bu hafta pasayuvchi signal yo&apos;q
                </div>
              )}
            </div>

            {falling.length > 0 && (
              <Card className="mt-3 border-l-4 border-l-red-600 bg-red-50/60">
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 size-4 text-red-700 dark:text-red-300" />
                    <div>
                      <div className="text-[13px] font-semibold text-red-700 dark:text-red-300">
                        AI tavsiya
                      </div>
                      <div className="mt-0.5 text-[13px] text-ink-700">
                        Bu mahsulotlar ortiqcha zaxirada — promotion qilishni
                        o&apos;ylab ko&apos;ring
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    Promo yaratish
                    <ArrowRight className="size-3.5" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          {/* 7-day forecast table */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Kelasi 7 kun bashorat</CardTitle>
              <span className="font-mono text-[11px] text-ink-500">
                Top {forecast.length} signal · {stable.length} ta barqaror
              </span>
            </CardHeader>
            <div>
              <div className="grid grid-cols-[1.6fr_140px_140px_1fr] items-center gap-3 border-b border-border bg-ink-100/40 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                <span>Mahsulot</span>
                <span className="text-right">Hozir / hafta</span>
                <span className="text-right">Bashorat</span>
                <span>Amal</span>
              </div>
              {forecast.map((s) => {
                const sign = s.trendPercent > 0 ? "+" : "";
                const isRise = s.hotness === "rising";
                return (
                  <div
                    key={s.id}
                    className="grid grid-cols-[1.6fr_140px_140px_1fr] items-center gap-3 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/40"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-ink-900 truncate">
                        {s.productName}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-ink-500 truncate">
                        {s.region}
                        {s.district ? ` · ${s.district}` : ""}
                      </div>
                    </div>
                    <span className="text-right font-mono text-[13px] font-semibold text-ink-900">
                      {formatNumber(s.weeklyVolume)}
                    </span>
                    <span
                      className={cn(
                        "text-right font-mono text-[13px] font-semibold",
                        trendColor(s.trendPercent)
                      )}
                    >
                      {formatNumber(s.predictedNextWeek)}{" "}
                      <span className="ml-1 text-[11px]">
                        ({sign}
                        {s.trendPercent.toFixed(1)}%)
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      {isRise ? (
                        <Link
                          href="/supplier/mahsulotlar"
                          className="inline-flex items-center gap-1 rounded-sm bg-emerald-50 px-2 py-1 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                        >
                          Zaxira oshirish
                          <ArrowRight className="size-3" />
                        </Link>
                      ) : s.hotness === "falling" ? (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-red-50 px-2 py-1 text-[12px] font-medium text-red-700 dark:text-red-300">
                          Promo qilish
                          <ArrowRight className="size-3" />
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-ink-500">
                          Barqaror
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
