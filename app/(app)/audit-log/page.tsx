import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  Search,
  Download,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { audit as auditApi, ApiError } from "@/lib/api";
import type { AuditAction, AuditEntry as ApiAuditEntry } from "@/lib/types";

type ActionType = "create" | "approve" | "edit" | "delete" | "view" | "auth";

interface AuditRow {
  id: string;
  ts: string; // formatted DD.MM.YYYY HH:MM:SS
  userName: string;
  userInitials: string;
  userRole: string;
  action: ActionType;
  actionLabel: string;
  objectLabel: string;
  detail: string;
  ip: string;
}

const actionStyles: Record<ActionType, string> = {
  create: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
  approve: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
  edit: "bg-amber-50 border-amber-600 text-amber-600 dark:text-amber-300",
  delete: "bg-red-50 border-red-600 text-red-700 dark:text-red-300",
  view: "bg-ink-100 border-ink-400 text-ink-600",
  auth: "bg-navy-50 border-navy-700 text-navy-700 dark:text-navy-300",
};

const actionToType: Record<AuditAction, ActionType> = {
  create: "create",
  approve: "approve",
  update: "edit",
  reject: "delete",
  delete: "delete",
  view: "view",
  auth: "auth",
  system: "view",
};

const actionToLabel: Record<AuditAction, string> = {
  create: "Yaratdi",
  approve: "Tasdiqladi",
  update: "Tahrir qildi",
  reject: "Rad etdi",
  delete: "O'chirdi",
  view: "Ko'rdi",
  auth: "Kirdi",
  system: "Tizim",
};

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  omborchi: "Omborchi",
  buxgalter: "Buxgalter",
  kassir: "Kassir",
  auditor: "Auditor",
  firma: "Firma operatori",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatTs(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}:${ss}`;
}

function adapt(entry: ApiAuditEntry): AuditRow {
  return {
    id: entry.id,
    ts: formatTs(entry.timestamp),
    userName: entry.user.name,
    userInitials: initialsOf(entry.user.name),
    userRole: roleLabels[entry.user.role] ?? entry.user.role,
    action: actionToType[entry.action] ?? "view",
    actionLabel: actionToLabel[entry.action] ?? entry.action,
    objectLabel: entry.objectLabel ?? entry.objectType,
    detail: entry.details ?? "—",
    ip: entry.ip,
  };
}


function FilterDropdown({ label }: { label: string }) {
  return (
    <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border-strong bg-surface-card px-3 text-[13px] text-ink-700 hover:bg-ink-100">
      {label}
      <ChevronDown className="size-3.5 text-ink-500" />
    </button>
  );
}

export default async function AuditLogPage() {
  let entries: AuditRow[] = [];
  let total = 0;
  let loadError: string | null = null;
  try {
    const res = await auditApi.list({ limit: 100 });
    entries = res.results.map(adapt);
    total = res.count;
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "Noma'lum xato";
  }

  return (
    <>
      <Topbar breadcrumb={[{ label: "Audit log" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Audit log
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Barcha harakatlar tarixi (append-only · Soliq tekshiruvi uchun tayyor)
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <Download className="size-4" />
                Eksport (CSV/JSON)
              </Button>
              <Button variant="secondary">
                <SlidersHorizontal className="size-4" />
                Murakkab qidiruv
              </Button>
            </div>
          </div>

          {loadError && (
            <Alert variant="error" className="mb-4">
              Yuklashda xatolik: {loadError}
            </Alert>
          )}

          {/* Immutability alert */}
          <Alert variant="info" className="mb-4">
            <span className="font-medium">
              Audit log immutable — yozuvlarni o&apos;zgartirish yoki o&apos;chirish mumkin emas.
            </span>
            <span className="ml-1 text-[12px] opacity-80">
              PostgreSQL append-only trigger orqali himoyalangan.
            </span>
          </Alert>

          {/* Filter bar */}
          <Card className="mb-4 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Foydalanuvchi, obyekt yoki IP..."
                  className="h-9 w-full rounded-sm border border-border-strong bg-surface-card pl-9 pr-3 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
                />
              </div>
              <FilterDropdown label="Foydalanuvchi: Hammasi" />
              <FilterDropdown label="Amal turi: Hammasi" />
              <FilterDropdown label="Davr: Bugun" />
              <FilterDropdown label="Status: Hammasi" />
              <Button variant="ghost" size="sm">
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            </div>
          </Card>

          {/* Audit table */}
          <Card>
            <div className="grid grid-cols-[170px_180px_120px_220px_1fr_120px] items-center gap-3 border-b border-border bg-ink-100/50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              <span>Vaqt</span>
              <span>Foydalanuvchi</span>
              <span>Amal</span>
              <span>Obyekt</span>
              <span>Tafsilot</span>
              <span>IP</span>
            </div>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-[170px_180px_120px_220px_1fr_120px] items-center gap-3 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/40"
              >
                {/* Time */}
                <span className="font-mono text-[12px] text-ink-600">
                  {entry.ts}
                </span>

                {/* User */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white",
                      entry.userRole === "Avto"
                        ? "bg-emerald-600"
                        : entry.userRole === "Administrator"
                        ? "bg-navy-700"
                        : "bg-ink-600"
                    )}
                  >
                    {entry.userInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-ink-900 truncate leading-tight">
                      {entry.userName}
                    </div>
                    <div className="text-[10px] text-ink-500 leading-tight mt-0.5">
                      {entry.userRole}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wide",
                    actionStyles[entry.action]
                  )}
                >
                  {entry.actionLabel}
                </span>

                {/* Object */}
                <span className="text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline cursor-pointer truncate">
                  {entry.objectLabel}
                </span>

                {/* Detail */}
                <span className="text-[12px] text-ink-600 truncate">
                  {entry.detail}
                </span>

                {/* IP */}
                <span className="font-mono text-[11px] text-ink-500">
                  {entry.ip}
                </span>
              </div>
            ))}
          </Card>

          {/* Pagination (live from API count) */}
          {(() => {
            const pageSize = 100;
            const pageCount = Math.max(1, Math.ceil(total / pageSize));
            if (pageCount <= 1) return null;
            // Compact numbering: first 3, ellipsis, last. Current page is
            // always page 1 today — proper page navigation lands later.
            const visible: number[] = [1];
            if (pageCount >= 2) visible.push(2);
            if (pageCount >= 3) visible.push(3);
            const showEllipsis = pageCount > 4;
            const last = pageCount > 3 ? pageCount : null;
            return (
              <div className="mt-4 flex items-center justify-between text-[13px] text-ink-600">
                <span className="font-mono">
                  1-{entries.length} /{" "}
                  <span className="font-semibold text-ink-900">
                    {total.toLocaleString("uz-UZ")}
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="secondary" size="sm" disabled>
                    <ChevronLeft className="size-3.5" />
                    Oldingi
                  </Button>
                  <div className="flex items-center gap-0.5 px-2 font-mono">
                    {visible.map((p) => (
                      <span
                        key={p}
                        className={
                          p === 1
                            ? "grid size-7 place-items-center rounded-sm bg-navy-700 text-white text-[12px] font-semibold"
                            : "grid size-7 place-items-center rounded-sm text-ink-600 hover:bg-ink-100 text-[12px]"
                        }
                      >
                        {p}
                      </span>
                    ))}
                    {showEllipsis && (
                      <span className="px-1 text-ink-400">...</span>
                    )}
                    {last && last !== visible[visible.length - 1] && (
                      <span className="grid size-7 place-items-center rounded-sm text-ink-600 hover:bg-ink-100 text-[12px]">
                        {last}
                      </span>
                    )}
                  </div>
                  <Button variant="secondary" size="sm" disabled={pageCount === 1}>
                    Keyingi
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      </main>
    </>
  );
}
