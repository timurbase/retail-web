import {
  Pause,
  Play,
  Sparkles,
  X,
  FileText,
  Download,
  Eye,
  ClipboardList,
} from "lucide-react";

import { Topbar } from "@/components/layout/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { NewCountButton } from "@/components/inventarizatsiya/new-count-button";
import { cn } from "@/lib/utils";

type CountStatus = "completed" | "paused" | "cancelled";

interface PastCount {
  id: string;
  startDate: string;
  endDate: string;
  department: string;
  operator: string;
  scanned: number;
  total: number;
  diff: number; // percent, negative = loss
  status: CountStatus;
}

const PAST_COUNTS: PastCount[] = [
  {
    id: "INV-2026-008",
    startDate: "12.05.2026",
    endDate: "12.05.2026",
    department: "Oziq-ovqat",
    operator: "Aziz Karimov",
    scanned: 124,
    total: 124,
    diff: -0.8,
    status: "completed",
  },
  {
    id: "INV-2026-007",
    startDate: "28.04.2026",
    endDate: "29.04.2026",
    department: "Ichimliklar",
    operator: "Sevara Yusupova",
    scanned: 67,
    total: 67,
    diff: -2.4,
    status: "completed",
  },
  {
    id: "INV-2026-006",
    startDate: "15.04.2026",
    endDate: "15.04.2026",
    department: "Sigaret va aksiz",
    operator: "Rustam Karimov",
    scanned: 32,
    total: 32,
    diff: 0,
    status: "completed",
  },
  {
    id: "INV-2026-005",
    startDate: "01.04.2026",
    endDate: "02.04.2026",
    department: "Maishiy tovarlar",
    operator: "Aziz Karimov + Jasur Toshmatov",
    scanned: 89,
    total: 142,
    diff: 0,
    status: "cancelled",
  },
  {
    id: "INV-2026-004",
    startDate: "20.03.2026",
    endDate: "21.03.2026",
    department: "Sut mahsulotlari",
    operator: "Sevara Yusupova",
    scanned: 43,
    total: 43,
    diff: -1.2,
    status: "completed",
  },
  {
    id: "INV-2026-003",
    startDate: "05.03.2026",
    endDate: "05.03.2026",
    department: "Non va non mahsulotlari",
    operator: "Aziz Karimov",
    scanned: 28,
    total: 28,
    diff: -0.3,
    status: "completed",
  },
  {
    id: "INV-2026-002",
    startDate: "18.02.2026",
    endDate: "19.02.2026",
    department: "To'liq inventarizatsiya",
    operator: "Aziz + Sevara + Jasur",
    scanned: 421,
    total: 437,
    diff: 0,
    status: "paused",
  },
  {
    id: "INV-2026-001",
    startDate: "02.02.2026",
    endDate: "04.02.2026",
    department: "To'liq inventarizatsiya",
    operator: "Aziz Karimov + Sevara Yusupova",
    scanned: 437,
    total: 437,
    diff: -2.1,
    status: "completed",
  },
  {
    id: "INV-2025-024",
    startDate: "28.12.2025",
    endDate: "30.12.2025",
    department: "Yil yakuni — to'liq",
    operator: "Rustam Karimov + Aziz Karimov",
    scanned: 412,
    total: 412,
    diff: -3.4,
    status: "completed",
  },
  {
    id: "INV-2025-023",
    startDate: "14.12.2025",
    endDate: "14.12.2025",
    department: "Ichimliklar",
    operator: "Jasur Toshmatov",
    scanned: 58,
    total: 58,
    diff: -0.5,
    status: "completed",
  },
  {
    id: "INV-2025-022",
    startDate: "01.12.2025",
    endDate: "01.12.2025",
    department: "Sigaret va aksiz",
    operator: "Aziz Karimov",
    scanned: 30,
    total: 30,
    diff: 0,
    status: "completed",
  },
  {
    id: "INV-2025-021",
    startDate: "18.11.2025",
    endDate: "19.11.2025",
    department: "Oziq-ovqat",
    operator: "Sevara Yusupova",
    scanned: 118,
    total: 118,
    diff: -1.8,
    status: "completed",
  },
];

interface ProblemProduct {
  name: string;
  mxik: string;
  avgDiff: string;
}

const PROBLEM_PRODUCTS: ProblemProduct[] = [
  {
    name: "Coca-Cola 0.5L PET",
    mxik: "2202100000",
    avgDiff: "-3.2% (3 hisobotda)",
  },
  {
    name: "Marlboro Red blok",
    mxik: "2402200000",
    avgDiff: "-2.1% (4 hisobotda)",
  },
  {
    name: "Sigir go'shti (premium)",
    mxik: "0201300000",
    avgDiff: "-4.5% (3 hisobotda)",
  },
];

const statusPill: Record<CountStatus, { label: string; className: string; icon: string }> = {
  completed: {
    label: "Yakunlangan",
    className: "bg-emerald-50 text-emerald-700 dark:text-emerald-300 border-emerald-600",
    icon: "✓",
  },
  paused: {
    label: "Pauza qilingan",
    className: "bg-amber-50 text-amber-600 dark:text-amber-300 border-amber-600",
    icon: "⏸",
  },
  cancelled: {
    label: "Bekor qilingan",
    className: "bg-red-50 text-red-700 dark:text-red-300 border-red-600",
    icon: "✕",
  },
};

function StatusPill({ status }: { status: CountStatus }) {
  const cfg = statusPill[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
        cfg.className
      )}
    >
      <span aria-hidden>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function DiffCell({ diff }: { diff: number }) {
  const color =
    diff <= -1
      ? "text-red-700 dark:text-red-300"
      : diff < 0
      ? "text-amber-600 dark:text-amber-300"
      : "text-emerald-700 dark:text-emerald-300";
  const label = diff === 0 ? "0%" : `${diff.toFixed(1)}%`;
  return (
    <span className={cn("font-mono text-[12px] font-semibold tabular-nums", color)}>
      {label}
    </span>
  );
}

export default function InventarizatsiyaPage() {
  return (
    <>
      <Topbar breadcrumb={[{ label: "Inventarizatsiya" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Inventarizatsiya
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Davriy ombor hisobi va tafovutlar nazorati
              </p>
            </div>
            <NewCountButton />
          </div>

          {/* KPIs */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <KpiCard
              label="Bu yil inventarizatsiya"
              value="8"
              trend={{ value: "Reja: 12 / yil", direction: "up" }}
            />
            <KpiCard
              label="Oxirgi inventarizatsiya"
              value="12.05.2026"
              trend={{ value: "9 kun oldin", direction: "warn" }}
            />
            <KpiCard
              label="O'rtacha tafovut"
              value="2.3%"
              valueClassName="text-emerald-600 dark:text-emerald-400"
              trend={{ value: "O'tgan yildan -0.4%", direction: "down" }}
            />
            <KpiCard
              label="Yo'qotilgan summa (yil)"
              value="245,000"
              valueClassName="text-amber-600 dark:text-amber-300"
              trend={{ value: "so'm · 5 ta hisobot", direction: "warn" }}
            />
          </div>

          {/* Active processes */}
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="relative inline-flex">
                <span className="size-2.5 rounded-full bg-amber-600" />
                <span className="absolute inset-0 size-2.5 rounded-full bg-amber-600 animate-ping opacity-60" />
              </span>
              <h2 className="text-[15px] font-semibold text-ink-900">
                Aktiv jarayonlar
              </h2>
              <span className="font-mono text-[12px] text-ink-500">(1 ta)</span>
            </div>

            <Card className="overflow-hidden border-l-4 border-l-amber-600">
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-ink-900">
                      Joriy inventarizatsiya — Oziq-ovqat bo&apos;limi
                    </h3>
                    <p className="mt-1 font-mono text-[12px] text-ink-500">
                      Boshlandi: 21.05.2026 09:00 · Skanlandi: 47 / 124 ta mahsulot (38%)
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-600 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-300">
                    <span className="size-1.5 rounded-full bg-amber-600 animate-pulse" />
                    Davom etmoqda
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px] text-ink-500">
                    <span>Jarayon</span>
                    <span className="tabular-nums">47 / 124</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-navy-700 transition-all duration-500"
                      style={{ width: "38%" }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="text-[12px] text-ink-600">
                    <span className="font-semibold text-ink-700">Operatorlar:</span>{" "}
                    Aziz Karimov + Sevara Yusupova
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm">
                      <Play className="size-3.5" />
                      Davom etish
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Pause className="size-3.5" />
                      Pauza
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-700 dark:text-red-300 hover:bg-red-50"
                    >
                      <X className="size-3.5" />
                      Bekor qilish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* History */}
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-block size-2.5 rounded-full bg-navy-700" />
              <h2 className="text-[15px] font-semibold text-ink-900">Tarixi</h2>
              <span className="font-mono text-[12px] text-ink-500">
                ({PAST_COUNTS.length} ta)
              </span>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ink-100">
                    <tr className="border-b border-border">
                      <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Sana boshi
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Tugashi
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Bo&apos;lim
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Operator
                      </th>
                      <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Skanned / Total
                      </th>
                      <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Tafovut
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Status
                      </th>
                      <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                        Amal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAST_COUNTS.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-border last:border-0 hover:bg-ink-100/50"
                      >
                        <td className="px-4 py-3 font-mono text-[12px] text-ink-700">
                          {c.startDate}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-ink-500">
                          {c.endDate}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[13px] font-medium text-ink-900">
                            {c.department}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-ink-400">
                            {c.id}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-ink-700">
                          {c.operator}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] tabular-nums text-ink-700">
                          {c.scanned} / {c.total}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DiffCell diff={c.diff} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill status={c.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end">
                            <Dropdown>
                              <DropdownItem icon={<Eye className="size-3.5" />}>
                                Hisobotni ko&apos;rish
                              </DropdownItem>
                              <DropdownItem icon={<Download className="size-3.5" />}>
                                PDF eksport
                              </DropdownItem>
                              <DropdownDivider />
                              <DropdownItem icon={<FileText className="size-3.5" />}>
                                Tafovutlarni ko&apos;rish
                              </DropdownItem>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* AI recommendations */}
          <section>
            <Card className="border-l-4 border-l-emerald-600 bg-emerald-50/40">
              <CardHeader className="border-b-emerald-200/60">
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                  AI tavsiya
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-[13px] leading-relaxed text-ink-700">
                  Oxirgi 3 oyda <strong className="font-semibold">5 ta mahsulotda</strong>{" "}
                  doimiy tafovut aniqlandi. Bu mahsulotlar uchun chastotali hisob
                  (haftalik yoki ikki haftalik) tavsiya etiladi — yo&apos;qotishlarni
                  erta aniqlash uchun.
                </p>

                <div className="rounded-md border border-border bg-surface-card">
                  {PROBLEM_PRODUCTS.map((p, i) => (
                    <div
                      key={p.mxik}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3",
                        i !== PROBLEM_PRODUCTS.length - 1 &&
                          "border-b border-border"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-ink-900">
                          {p.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3">
                          <span className="font-mono text-[11px] text-ink-500">
                            MXIK {p.mxik}
                          </span>
                          <span className="font-mono text-[11px] text-red-700 dark:text-red-300">
                            {p.avgDiff}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                      >
                        <ClipboardList className="size-3.5" />
                        Reja yaratish
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
