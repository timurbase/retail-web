import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { getAuditLog } from "@/lib/store";
import type { AuditAction, AuditEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const actionStyles: Record<AuditAction, string> = {
  create: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
  approve: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
  update: "bg-amber-50 border-amber-600 text-amber-600 dark:text-amber-300",
  reject: "bg-red-50 border-red-600 text-red-700 dark:text-red-300",
  delete: "bg-red-50 border-red-600 text-red-700 dark:text-red-300",
  view: "bg-ink-100 border-ink-400 text-ink-600",
  auth: "bg-navy-50 border-navy-700 text-navy-700 dark:text-navy-300",
  system: "bg-ink-100 border-ink-400 text-ink-600",
};

const actionLabels: Record<AuditAction, string> = {
  create: "Yaratdi",
  approve: "Tasdiqladi",
  update: "Tahrir qildi",
  reject: "Rad etdi",
  delete: "O'chirdi",
  view: "Ko'rdi",
  auth: "Auth",
  system: "Tizim",
};

const actionVerbs: Record<AuditAction, string> = {
  create: "yaratdi",
  approve: "tasdiqladi",
  update: "tahrir qildi",
  reject: "rad etdi",
  delete: "o'chirdi",
  view: "ko'rdi",
  auth: "tizimga kirdi",
  system: "tizim amali",
};

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  omborchi: "Omborchi",
  buxgalter: "Buxgalter",
  kassir: "Kassir",
  auditor: "Auditor",
  firma: "Firma operatori",
};

const objectTypeLabels: Record<AuditEntry["objectType"], string> = {
  document: "Hujjat",
  row: "Hujjat qatori",
  product: "Mahsulot",
  supplier: "Yetkazib beruvchi",
  user: "Foydalanuvchi",
  insight: "AI tavsiya",
  integration: "Integratsiya",
  auth: "Autentifikatsiya",
  system: "Tizim",
  company: "Kompaniya",
  store: "Do'kon",
  invoice: "Hujjat (sotuv)",
  payment: "To'lov",
  order: "Buyurtma",
  route: "Yetkazib berish marshruti",
};

function objectHref(entry: AuditEntry): string | null {
  switch (entry.objectType) {
    case "document":
      return `/hujjatlar/${entry.objectId}`;
    case "product":
      return `/nomenklatura/${entry.objectId}`;
    case "supplier":
      return `/yetkazib-beruvchilar/${entry.objectId}`;
    case "user":
      return `/sozlamalar`;
    case "insight":
      return `/insights`;
    case "row":
      // row IDs are scoped to a doc; without doc id, fall back to docs list
      return null;
    default:
      return null;
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}:${ss}`;
}

export default async function AuditEntryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const all = getAuditLog(500);
  const entry = all.find((e) => e.id === id);
  if (!entry) notFound();

  const actionStyle = actionStyles[entry.action];
  const actionLabel = actionLabels[entry.action];
  const verb = actionVerbs[entry.action];
  const roleLabel = roleLabels[entry.user.role] ?? entry.user.role;
  const objectTypeLabel = objectTypeLabels[entry.objectType];
  const href = objectHref(entry);

  // Related entries — same objectId, excluding self
  const related = all
    .filter((e) => e.objectId === entry.objectId && e.id !== entry.id)
    .slice(0, 5);

  // Build deterministic JSON view (so order is stable)
  const jsonObj = {
    id: entry.id,
    storeId: entry.storeId,
    timestamp: entry.timestamp,
    user: entry.user,
    action: entry.action,
    objectType: entry.objectType,
    objectId: entry.objectId,
    objectLabel: entry.objectLabel ?? null,
    details: entry.details ?? null,
    ip: entry.ip,
  };
  const jsonStr = JSON.stringify(jsonObj, null, 2);

  return (
    <>
      <Topbar
        breadcrumb={[
          { label: "Audit log", href: "/audit-log" },
          { label: `Entry ${entry.id.slice(-8)}` },
        ]}
      />

      <main className="flex-1 overflow-y-auto bg-surface">
        {/* Page header */}
        <div className="border-b border-border bg-surface-card px-8 py-6">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/audit-log"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-500 hover:text-navy-700 dark:text-navy-300"
            >
              <ArrowLeft className="size-3.5" />
              Audit log&apos;ga qaytish
            </Link>

            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wide",
                      actionStyle
                    )}
                  >
                    {actionLabel}
                  </span>
                  <span className="font-mono text-[11px] text-ink-400">
                    {entry.id}
                  </span>
                </div>
                <h1 className="mt-2 text-[24px] font-bold tracking-tight text-ink-900">
                  {entry.user.name}{" "}
                  <span className="font-medium text-ink-600">
                    {verb}: {entry.objectLabel ?? objectTypeLabel}
                  </span>
                </h1>
                <div className="mt-1.5 font-mono text-[12px] text-ink-500">
                  {formatTimestamp(entry.timestamp)} ·{" "}
                  <span className="text-ink-400">{entry.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-3xl px-8 py-8 space-y-6">
          {/* Yozuv tafsiloti */}
          <Card>
            <CardHeader>
              <CardTitle>Yozuv tafsiloti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    ID
                  </div>
                  <div className="mt-1 font-mono text-[13px] font-semibold text-ink-900 break-all">
                    {entry.id}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Vaqt
                  </div>
                  <div className="mt-1 font-mono text-[13px] font-semibold text-ink-900">
                    {formatTimestamp(entry.timestamp)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Foydalanuvchi
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white",
                        entry.user.role === "admin"
                          ? "bg-navy-700"
                          : entry.user.role === "auditor"
                          ? "bg-emerald-600"
                          : "bg-ink-600"
                      )}
                    >
                      {initials(entry.user.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-ink-900">
                        {entry.user.name}
                      </div>
                      <div className="mt-0.5">
                        <span className="inline-flex items-center rounded-full border border-border bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-700">
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    IP manzil
                  </div>
                  <div className="mt-1 font-mono text-[13px] font-semibold text-ink-900">
                    {entry.ip}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Amal
                  </div>
                  <div className="mt-1.5">
                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wide",
                        actionStyle
                      )}
                    >
                      {actionLabel}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Obyekt turi
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-ink-900">
                    {objectTypeLabel}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Obyekt ID
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold text-ink-900 break-all">
                      {entry.objectId}
                    </span>
                    {href && (
                      <Link
                        href={href}
                        className="shrink-0 text-[11px] font-semibold text-navy-700 dark:text-navy-300 hover:underline"
                      >
                        Ko&apos;rish →
                      </Link>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Obyekt nomi
                  </div>
                  <div className="mt-1 text-[13px] font-medium text-ink-700">
                    {entry.objectLabel ?? (
                      <span className="text-ink-400">—</span>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Tafsilot
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-700">
                    {entry.details ?? (
                      <span className="text-ink-400">
                        Qo&apos;shimcha tafsilot yo&apos;q
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Texnik ma'lumot — collapsible */}
          <Card>
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 border-b border-border group-open:border-border [&::-webkit-details-marker]:hidden">
                <span className="text-[15px] font-semibold text-ink-900">
                  Texnik ma&apos;lumot (JSON)
                </span>
                <span className="font-mono text-[11px] text-ink-500 group-open:hidden">
                  Ko&apos;rish ▾
                </span>
                <span className="hidden font-mono text-[11px] text-ink-500 group-open:inline">
                  Yopish ▴
                </span>
              </summary>
              <div className="bg-ink-100 p-4">
                <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-ink-900">
                  {jsonStr}
                </pre>
              </div>
            </details>
          </Card>

          {/* Bog'liq yozuvlar */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Bog&apos;liq yozuvlar</CardTitle>
              <span className="font-mono text-[11px] text-ink-500">
                {related.length === 0
                  ? "—"
                  : `${related.length} ta · shu obyektga oid`}
              </span>
            </CardHeader>
            {related.length === 0 ? (
              <div className="px-5 py-6 text-center text-[13px] text-ink-500">
                Bu obyekt uchun boshqa audit yozuvi topilmadi.
              </div>
            ) : (
              <div>
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/audit-log/${r.id}`}
                    className="grid grid-cols-[130px_100px_1fr] items-center gap-3 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/40"
                  >
                    <span className="font-mono text-[12px] text-ink-600">
                      {formatTimestamp(r.timestamp)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wide",
                        actionStyles[r.action]
                      )}
                    >
                      {actionLabels[r.action]}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-ink-900 truncate">
                        {r.user.name} ·{" "}
                        <span className="text-ink-600">
                          {r.details ?? r.objectLabel ?? "—"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Immutability alert */}
          <Alert variant="info">
            <div className="flex items-start gap-2">
              <Lock className="size-3.5 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">
                  Bu yozuv immutable — o&apos;chirib bo&apos;lmaydi va
                  o&apos;zgartirib bo&apos;lmaydi.
                </div>
                <div className="mt-0.5 text-[12px] opacity-80">
                  PostgreSQL append-only trigger orqali himoyalangan. Soliq
                  tekshiruvi uchun tayyor.
                </div>
              </div>
            </div>
          </Alert>
        </div>
      </main>
    </>
  );
}
