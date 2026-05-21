import { Topbar } from "@/components/layout/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Sparkles } from "lucide-react";
import { cn, formatSom } from "@/lib/utils";

// 30 kunlik mock data — sentyabr ish kunlari taqsimoti
const monthlyDocsByDay: { day: number; auto: number; review: number; rejected: number }[] = [
  { day: 1, auto: 8, review: 2, rejected: 0 },
  { day: 2, auto: 11, review: 3, rejected: 1 },
  { day: 3, auto: 13, review: 2, rejected: 0 },
  { day: 4, auto: 9, review: 4, rejected: 1 },
  { day: 5, auto: 15, review: 3, rejected: 0 },
  { day: 6, auto: 6, review: 1, rejected: 0 },
  { day: 7, auto: 2, review: 0, rejected: 0 },
  { day: 8, auto: 10, review: 3, rejected: 1 },
  { day: 9, auto: 14, review: 2, rejected: 0 },
  { day: 10, auto: 12, review: 4, rejected: 2 },
  { day: 11, auto: 17, review: 3, rejected: 1 },
  { day: 12, auto: 13, review: 2, rejected: 0 },
  { day: 13, auto: 7, review: 1, rejected: 0 },
  { day: 14, auto: 3, review: 0, rejected: 0 },
  { day: 15, auto: 14, review: 4, rejected: 1 },
  { day: 16, auto: 19, review: 3, rejected: 0 },
  { day: 17, auto: 16, review: 2, rejected: 1 },
  { day: 18, auto: 11, review: 5, rejected: 2 },
  { day: 19, auto: 18, review: 3, rejected: 1 },
  { day: 20, auto: 8, review: 2, rejected: 0 },
  { day: 21, auto: 4, review: 1, rejected: 0 },
  { day: 22, auto: 15, review: 4, rejected: 1 },
  { day: 23, auto: 17, review: 3, rejected: 0 },
  { day: 24, auto: 20, review: 2, rejected: 1 },
  { day: 25, auto: 13, review: 4, rejected: 0 },
  { day: 26, auto: 16, review: 3, rejected: 1 },
  { day: 27, auto: 9, review: 1, rejected: 0 },
  { day: 28, auto: 3, review: 0, rejected: 0 },
  { day: 29, auto: 12, review: 3, rejected: 1 },
  { day: 30, auto: 11, review: 4, rejected: 0 },
];

const supplierStats: { name: string; amount: number; count: number }[] = [
  { name: "Alpha Distribution OOO", amount: 38450000, count: 47 },
  { name: "Beta Trade MChJ", amount: 27890000, count: 38 },
  { name: "Lazzat OOO", amount: 19420000, count: 29 },
  { name: "Sirdaryo Agro", amount: 16780000, count: 24 },
  { name: "Toshkent Non Zavodi", amount: 14230000, count: 31 },
  { name: "Imkon Sut MChJ", amount: 11890000, count: 26 },
  { name: "Gamma Goods", amount: 9560000, count: 18 },
  { name: "Pepsi UZ", amount: 8420000, count: 15 },
];

const topOperators: { name: string; initials: string; approved: number; accuracy: number; avgTimeSec: number }[] = [
  { name: "Karimov Aziz", initials: "KA", approved: 142, accuracy: 0.94, avgTimeSec: 87 },
  { name: "Sevara Yusupova", initials: "SY", approved: 118, accuracy: 0.91, avgTimeSec: 102 },
  { name: "Bobur Toshev", initials: "BT", approved: 96, accuracy: 0.89, avgTimeSec: 124 },
  { name: "Madina Olimova", initials: "MO", approved: 84, accuracy: 0.92, avgTimeSec: 95 },
  { name: "Jasur Rahimov", initials: "JR", approved: 67, accuracy: 0.86, avgTimeSec: 138 },
];

const categories: { name: string; pct: number; color: string }[] = [
  { name: "Oziq-ovqat", pct: 45, color: "bg-navy-700" },
  { name: "Ichimliklar", pct: 22, color: "bg-emerald-600" },
  { name: "Maishiy kimyo", pct: 18, color: "bg-amber-600" },
  { name: "Tamaki", pct: 9, color: "bg-red-600" },
  { name: "Boshqalar", pct: 6, color: "bg-ink-400" },
];

const aiCostFeatures: { label: string; pct: number; cost: number }[] = [
  { label: "Hujjat parse (GPT-4o)", pct: 67, cost: 31.4 },
  { label: "MXIK suggest (embedding)", pct: 22, cost: 10.3 },
  { label: "AI helper (GPT-4o-mini)", pct: 11, cost: 5.2 },
];

const periodTabs = ["Bugun", "Bu hafta", "Bu oy", "Bu yil", "Maxsus"];

export default function HisobotlarPage() {
  const maxDocs = Math.max(...monthlyDocsByDay.map((d) => d.auto + d.review + d.rejected));
  const maxSupplier = Math.max(...supplierStats.map((s) => s.amount));
  const totalAiCost = aiCostFeatures.reduce((acc, f) => acc + f.cost, 0);

  return (
    <>
      <Topbar breadcrumb={[{ label: "Hisobotlar" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Hisobotlar
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Tovar aylanmasi, AI samaradorligi va operator faoliyati
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <Calendar className="size-4" />
                Davr: Bu oy
              </Button>
              <Button variant="secondary">
                <Download className="size-4" />
                Excel eksport
              </Button>
            </div>
          </div>

          {/* Period tabs */}
          <div className="mb-6 flex items-center gap-1 rounded-md border border-border bg-surface-card p-1 w-fit">
            {periodTabs.map((tab) => (
              <button
                key={tab}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-[13px] font-medium transition-colors",
                  tab === "Bu oy"
                    ? "bg-navy-700 text-white"
                    : "text-ink-600 hover:bg-ink-100"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* KPI strip */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <KpiCard
              label="Hujjatlar"
              value="284"
              trend={{ value: "+12% o'tgan oyga", direction: "up" }}
            />
            <KpiCard
              label="Aniqlik"
              value="87.4%"
              valueClassName="text-emerald-600"
              trend={{ value: "+4% o'tgan oyga", direction: "up" }}
            />
            <KpiCard
              label="MXIK xatolar"
              value="23"
              valueClassName="text-red-700"
              trend={{ value: "-8 o'tgan oyga", direction: "down" }}
            />
            <KpiCard
              label="Jami summa"
              value="147M so'm"
              trend={{ value: "+18% o'tgan oyga", direction: "up" }}
            />
          </div>

          {/* Card 1: Monthly bar chart — full width */}
          <Card className="mb-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Kirim hujjatlari grafigi</CardTitle>
              <div className="flex items-center gap-4 text-[11px] font-mono text-ink-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-sm bg-navy-700" />
                  Avto-tasdiq
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-sm bg-amber-600" />
                  Operator review
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-sm bg-red-600" />
                  Rad etilgan
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex h-56 items-end gap-1.5">
                {monthlyDocsByDay.map((d) => {
                  const total = d.auto + d.review + d.rejected;
                  const heightPct = (total / maxDocs) * 100;
                  const autoPct = total === 0 ? 0 : (d.auto / total) * 100;
                  const reviewPct = total === 0 ? 0 : (d.review / total) * 100;
                  return (
                    <div
                      key={d.day}
                      className="flex flex-1 flex-col items-center gap-1.5"
                      title={`${d.day}-kun: ${total} hujjat`}
                    >
                      <div className="flex h-full w-full items-end">
                        <div
                          className="w-full rounded-t-[2px] overflow-hidden flex flex-col"
                          style={{ height: `${heightPct}%` }}
                        >
                          {d.rejected > 0 && (
                            <div
                              className="w-full bg-red-600"
                              style={{ height: `${100 - autoPct - reviewPct}%` }}
                            />
                          )}
                          {d.review > 0 && (
                            <div
                              className="w-full bg-amber-600"
                              style={{ height: `${reviewPct}%` }}
                            />
                          )}
                          <div
                            className="w-full bg-navy-700"
                            style={{ height: `${autoPct}%` }}
                          />
                        </div>
                      </div>
                      <div className="font-mono text-[9px] text-ink-400">
                        {d.day}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Row: suppliers (2/3) + MXIK accuracy donut (1/3) */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            {/* Card 2: Suppliers */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Yetkazib beruvchilar bo&apos;yicha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplierStats.map((s) => {
                  const widthPct = (s.amount / maxSupplier) * 100;
                  return (
                    <div key={s.name}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
                        <span className="font-medium text-ink-900 truncate">
                          {s.name}
                        </span>
                        <div className="flex items-center gap-3 shrink-0 font-mono text-ink-700">
                          <span>{formatSom(s.amount)}</span>
                          <span className="text-ink-400 text-[11px]">
                            {s.count} hujjat
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className="h-full bg-navy-700 rounded-full"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Card 3: MXIK donut */}
            <Card>
              <CardHeader>
                <CardTitle>MXIK aniqlik</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div
                  className="relative grid size-44 place-items-center rounded-full"
                  style={{
                    background:
                      "conic-gradient(var(--color-emerald-600) 0% 87%, var(--color-red-600) 87% 100%)",
                  }}
                >
                  <div className="absolute inset-3 rounded-full bg-surface-card grid place-items-center">
                    <div className="text-center">
                      <div className="font-mono text-3xl font-bold text-emerald-700 leading-none">
                        87%
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
                        aniqlik
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 w-full space-y-2 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink-600">
                      <span className="size-2 rounded-full bg-emerald-600" />
                      Avtomatik
                    </span>
                    <span className="font-mono font-semibold text-ink-900">247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink-600">
                      <span className="size-2 rounded-full bg-amber-600" />
                      Tahrirlangan
                    </span>
                    <span className="font-mono font-semibold text-ink-900">32</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink-600">
                      <span className="size-2 rounded-full bg-red-600" />
                      Xato
                    </span>
                    <span className="font-mono font-semibold text-ink-900">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row: operators + categories */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            {/* Card 4: Top operators */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Top operatorlar</CardTitle>
              </CardHeader>
              <div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                  <span>F.I.O.</span>
                  <span className="text-right">Tasdiqlangan</span>
                  <span className="text-right">Avto-aniqlik</span>
                  <span className="text-right">O&apos;rt. vaqt</span>
                </div>
                {topOperators.map((op) => (
                  <div
                    key={op.name}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-700 text-white text-[11px] font-bold">
                        {op.initials}
                      </div>
                      <span className="text-sm font-medium text-ink-900 truncate">
                        {op.name}
                      </span>
                    </div>
                    <span className="font-mono text-[13px] font-semibold text-ink-900 text-right w-24">
                      {op.approved}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[13px] font-semibold text-right w-24",
                        op.accuracy >= 0.9 ? "text-emerald-600" : "text-amber-600"
                      )}
                    >
                      {Math.round(op.accuracy * 100)}%
                    </span>
                    <span className="font-mono text-[13px] text-ink-600 text-right w-20">
                      {op.avgTimeSec}s
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Card 5: Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Mahsulot kategoriyalari</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Stacked horizontal bar */}
                <div className="h-3 w-full rounded-full overflow-hidden flex">
                  {categories.map((c) => (
                    <div
                      key={c.name}
                      className={c.color}
                      style={{ width: `${c.pct}%` }}
                      title={`${c.name}: ${c.pct}%`}
                    />
                  ))}
                </div>
                <div className="mt-4 space-y-2.5">
                  {categories.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center justify-between text-[13px]"
                    >
                      <span className="flex items-center gap-2 text-ink-700">
                        <span className={cn("size-2.5 rounded-sm", c.color)} />
                        {c.name}
                      </span>
                      <span className="font-mono font-semibold text-ink-900">
                        {c.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card 6: AI cost tracking */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-600" />
                AI xarajat tracking
              </CardTitle>
              <span className="font-mono text-[11px] text-ink-500">
                Bu oy
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    Jami xarajat
                  </div>
                  <div className="mt-2 font-mono text-3xl font-bold text-ink-900">
                    ${totalAiCost.toFixed(2)}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-ink-500">
                    ~{formatSom(Math.round(totalAiCost * 12700))}
                  </div>
                </div>
                <div className="col-span-2 space-y-3">
                  {aiCostFeatures.map((f) => (
                    <div key={f.label}>
                      <div className="mb-1 flex items-center justify-between text-[12px]">
                        <span className="text-ink-700">{f.label}</span>
                        <span className="font-mono font-semibold text-ink-900">
                          ${f.cost.toFixed(2)}{" "}
                          <span className="text-ink-400">({f.pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${f.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
