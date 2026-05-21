import type { Metadata } from "next";
import { CheckCircle2, Clock, ArrowUpRight } from "lucide-react";
import { StatusSubscribeForm } from "./subscribe-form";

export const metadata: Metadata = {
  title: "Tizim holati · RetailFlow AI",
  description:
    "RetailFlow AI tizim holati — real vaqt monitoring, oxirgi 90 kun uptime, SLA 99.5%.",
};

type ServiceStatus = "operational" | "degraded" | "outage";

interface Service {
  name: string;
  tech: string;
  status: ServiceStatus;
  detail?: string;
  lastIncident: string;
}

const SERVICES: Service[] = [
  {
    name: "Web ilova",
    tech: "retailflow.uz",
    status: "operational",
    lastIncident: "12 kun oldin",
  },
  {
    name: "API",
    tech: "api.retailflow.uz",
    status: "operational",
    lastIncident: "18 kun oldin",
  },
  {
    name: "Database",
    tech: "PostgreSQL · primary + replica",
    status: "operational",
    lastIncident: "47 kun oldin",
  },
  {
    name: "AI Pipeline",
    tech: "GPT-4o · pgvector",
    status: "operational",
    lastIncident: "5 kun oldin",
  },
  {
    name: "Didox webhook",
    tech: "didox.uz EDO receiver",
    status: "degraded",
    detail: "Javob vaqti 50ms → 220ms",
    lastIncident: "hozir",
  },
  {
    name: "Soliq.uz sync",
    tech: "tasnif.soliq.uz · MXIK",
    status: "operational",
    lastIncident: "31 kun oldin",
  },
  {
    name: "Mobile push",
    tech: "Expo · APNs/FCM",
    status: "operational",
    lastIncident: "9 kun oldin",
  },
  {
    name: "Email",
    tech: "AWS SES · eu-central-1",
    status: "operational",
    lastIncident: "22 kun oldin",
  },
];

const INCIDENTS = [
  {
    date: "18.05.2026",
    duration: "18 daq",
    service: "Didox webhook",
    summary: "Webhook receiver memory leak — auto-restart bilan tiklandi",
    status: "Hal qilingan" as const,
  },
  {
    date: "09.05.2026",
    duration: "42 daq",
    service: "AI Pipeline",
    summary: "GPT-4o API rate-limit oshib ketdi — queue backlog 3 daqiqa",
    status: "Hal qilingan" as const,
  },
  {
    date: "27.04.2026",
    duration: "8 daq",
    service: "Web ilova",
    summary: "Vercel deploy regression — avtomatik rollback bajarildi",
    status: "Hal qilingan" as const,
  },
  {
    date: "11.04.2026",
    duration: "1 soat 12 daq",
    service: "Database",
    summary: "Primary failover — read-replica'ga o'tdi, 0 ma'lumot yo'qotildi",
    status: "Hal qilingan" as const,
  },
  {
    date: "02.03.2026",
    duration: "3 soat",
    service: "Soliq.uz sync",
    summary: "tasnif.soliq.uz tomonidan API ishlamadi — manual refresh qilindi",
    status: "Hal qilingan" as const,
  },
];

// Deterministic 90-day uptime — seeded by index
function uptimeBars(): { date: string; status: "ok" | "degraded" | "outage" }[] {
  const today = new Date("2026-05-21T00:00:00Z");
  // Specific degraded days (indices from "today" going back) + 1 outage
  const degradedSet = new Set([4, 12, 33, 58, 81]);
  const outageSet = new Set([70]);
  return Array.from({ length: 90 }).map((_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (89 - i));
    const status: "ok" | "degraded" | "outage" = outageSet.has(89 - i)
      ? "outage"
      : degradedSet.has(89 - i)
      ? "degraded"
      : "ok";
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    return { date: `${dd}.${mm}.${d.getUTCFullYear()}`, status };
  });
}

const STATUS_PILL: Record<ServiceStatus, { label: string; cls: string; dot: string }> = {
  operational: {
    label: "Normal",
    cls: "border-emerald-600 bg-emerald-50 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-600",
  },
  degraded: {
    label: "Sekinroq",
    cls: "border-amber-600 bg-amber-50 text-amber-600 dark:text-amber-300",
    dot: "bg-amber-600",
  },
  outage: {
    label: "Uzilish",
    cls: "border-red-600 bg-red-50 text-red-700 dark:text-red-300",
    dot: "bg-red-600",
  },
};

export default function StatusPage() {
  const bars = uptimeBars();
  const okDays = bars.filter((b) => b.status === "ok").length;
  const degradedDays = bars.filter((b) => b.status === "degraded").length;
  const outageDays = bars.filter((b) => b.status === "outage").length;
  const hasDegraded = SERVICES.some((s) => s.status === "degraded");
  const hasOutage = SERVICES.some((s) => s.status === "outage");
  const allGreen = !hasDegraded && !hasOutage;

  return (
    <>
      {/* ===== HEADER ===== */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
            Tizim holati
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            Tizim holati
          </h1>
          <p className="mt-3 text-[16px] text-ink-600">
            Real vaqt monitoring · Oxirgi 90 kun · SLA: <span className="font-mono">99.5%</span> uptime
          </p>
        </div>
      </section>

      {/* ===== TOP BANNER ===== */}
      <section className="border-b border-border bg-surface py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div
            className={
              allGreen
                ? "rounded-xl border-l-4 border border-emerald-600 border-l-emerald-600 bg-emerald-50 p-6 sm:p-8"
                : hasOutage
                ? "rounded-xl border-l-4 border border-red-600 border-l-red-600 bg-red-50 p-6 sm:p-8"
                : "rounded-xl border-l-4 border border-amber-600 border-l-amber-600 bg-amber-50 p-6 sm:p-8"
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={
                    "grid size-12 shrink-0 place-items-center rounded-full " +
                    (allGreen
                      ? "bg-emerald-600 text-white"
                      : hasOutage
                      ? "bg-red-600 text-white"
                      : "bg-amber-600 text-white")
                  }
                >
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <div
                    className={
                      "text-[20px] font-bold " +
                      (allGreen
                        ? "text-emerald-700 dark:text-emerald-300"
                        : hasOutage
                        ? "text-red-700 dark:text-red-300"
                        : "text-amber-700")
                    }
                  >
                    {allGreen
                      ? "Barcha tizimlar normal ishlamoqda"
                      : hasOutage
                      ? "Ba'zi servislarda uzilish bor"
                      : "Bir servis sekinroq ishlamoqda"}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-600">
                    <Clock className="size-3.5" />
                    Oxirgi tekshiruv: hozir · Keyingi avtomatik tekshiruv: 30 soniyadan keyin
                  </div>
                </div>
              </div>

              {/* Uptime number */}
              <div className="text-right">
                <div className="font-mono text-4xl font-bold tracking-tight text-ink-900">
                  99.97%
                </div>
                <div className="mt-1 flex items-center justify-end gap-1.5 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <ArrowUpRight className="size-3.5" />
                  +0.02% bu hafta
                </div>
                <div className="font-mono text-[11px] text-ink-500">oxirgi 90 kun</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES GRID ===== */}
      <section className="border-b border-border bg-surface-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
                Servislar
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">
                Joriy holat
              </h2>
            </div>
            <span className="font-mono text-[11px] text-ink-500">
              {SERVICES.length} ta servis · auto-check 30s
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
            {SERVICES.map((s) => {
              const pill = STATUS_PILL[s.status];
              return (
                <div
                  key={s.name}
                  className="flex items-start justify-between gap-4 rounded-md border border-border bg-surface p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          "size-2 shrink-0 rounded-full " +
                          pill.dot +
                          (s.status !== "operational" ? " animate-pulse" : "")
                        }
                      />
                      <div className="text-[15px] font-semibold text-ink-900">{s.name}</div>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-ink-500">{s.tech}</div>
                    {s.detail && (
                      <div className="mt-1.5 font-mono text-[11px] text-amber-700">
                        {s.detail}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={
                        "rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider " +
                        pill.cls
                      }
                    >
                      {pill.label}
                    </span>
                    <span className="font-mono text-[10px] text-ink-400">
                      {s.lastIncident}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 90-DAY UPTIME ===== */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-md border border-border bg-surface-card p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
                  Tarix
                </div>
                <h2 className="mt-1 text-[20px] font-bold tracking-tight text-ink-900">
                  Oxirgi 90 kun uptime
                </h2>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-ink-600">
                <LegendItem color="bg-emerald-500" label="Normal" />
                <LegendItem color="bg-amber-500" label="Sekinroq" />
                <LegendItem color="bg-red-600" label="Uzilish" />
              </div>
            </div>

            {/* Bars */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-end gap-[2px]">
                {bars.map((b, i) => {
                  const color =
                    b.status === "ok"
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : b.status === "degraded"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-red-600 hover:bg-red-700";
                  const label =
                    b.status === "ok"
                      ? "Normal"
                      : b.status === "degraded"
                      ? "Sekinroq"
                      : "Uzilish";
                  return (
                    <div
                      key={i}
                      title={`${b.date} · ${label}`}
                      className={`h-10 w-[3px] rounded-[1px] transition-colors ${color}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[12px] text-ink-600">
              <span>90 kun oldin</span>
              <span>Bugun</span>
            </div>

            <div className="mt-5 rounded-md bg-ink-100/40 px-4 py-3 text-[13px] text-ink-700">
              Joriy mavzu:{" "}
              <strong className="font-mono text-ink-900">{okDays} / 90</strong> kun to&apos;liq normal ·{" "}
              <strong className="font-mono text-amber-700">{degradedDays}</strong> kun degraded ·{" "}
              <strong className="font-mono text-red-700 dark:text-red-300">{outageDays}</strong> kun qisman uzilish
            </div>
          </div>
        </div>
      </section>

      {/* ===== INCIDENT HISTORY ===== */}
      <section className="border-b border-border bg-surface-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-6">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
              Incident tarixi
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">
              Oxirgi 5 ta hodisa
            </h2>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <div className="hidden grid-cols-[110px_100px_160px_1fr_140px] gap-3 border-b border-border bg-ink-100/60 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500 md:grid">
              <span>Sana</span>
              <span>Davom</span>
              <span>Servis</span>
              <span>Xulosa</span>
              <span>Status</span>
            </div>
            {INCIDENTS.map((it, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-1.5 border-b border-border bg-surface-card px-4 py-3 last:border-0 md:grid-cols-[110px_100px_160px_1fr_140px] md:items-center md:gap-3"
              >
                <span className="font-mono text-[12px] text-ink-900">{it.date}</span>
                <span className="font-mono text-[12px] text-ink-600">{it.duration}</span>
                <span className="text-[13px] font-semibold text-ink-900">{it.service}</span>
                <span className="text-[13px] text-ink-700">{it.summary}</span>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-600 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-3" />
                  {it.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUBSCRIBE ===== */}
      <section className="bg-surface py-14">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-xl border border-border bg-surface-card p-8 text-center">
            <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
              Obuna
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink-900">
              Yangilanishlar haqida xabar olishni xohlaysizmi?
            </h2>
            <p className="mt-2 text-[14px] text-ink-600">
              Faqat incident ochilganda va hal qilinganda email yuboriladi. Spam yo&apos;q.
            </p>
            <div className="mt-6">
              <StatusSubscribeForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2.5 rounded-sm ${color}`} />
      {label}
    </span>
  );
}
