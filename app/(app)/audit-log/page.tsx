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

type ActionType = "create" | "approve" | "edit" | "delete" | "view" | "auth";

interface AuditEntry {
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

const auditEntries: AuditEntry[] = [
  {
    id: "ae_001",
    ts: "21.05.2026 14:32:18",
    userName: "Aziz K.",
    userInitials: "AK",
    userRole: "Omborchi",
    action: "approve",
    actionLabel: "Tasdiqladi",
    objectLabel: "Hujjat №12345",
    detail: "8 ta mahsulot tasdiqlandi · 4 567 800 so'm",
    ip: "192.168.1.45",
  },
  {
    id: "ae_002",
    ts: "21.05.2026 14:30:42",
    userName: "Aziz K.",
    userInitials: "AK",
    userRole: "Omborchi",
    action: "edit",
    actionLabel: "Tahrir qildi",
    objectLabel: "Hujjat №12345 — row_3",
    detail: "MXIK 0902200000 → 0902100000 ga o'zgartirildi",
    ip: "192.168.1.45",
  },
  {
    id: "ae_003",
    ts: "21.05.2026 14:28:55",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "approve",
    actionLabel: "Avto-tasdiq",
    objectLabel: "Hujjat №12346",
    detail: "23 ta mahsulot avto-tasdiqlandi (confidence ≥0.95)",
    ip: "—",
  },
  {
    id: "ae_004",
    ts: "21.05.2026 14:15:03",
    userName: "Sevara Y.",
    userInitials: "SY",
    userRole: "Buxgalter",
    action: "view",
    actionLabel: "Ko'rdi",
    objectLabel: "Hisobot: Bu oy",
    detail: "Excel eksport qilindi (284 hujjat)",
    ip: "10.0.12.88",
  },
  {
    id: "ae_005",
    ts: "21.05.2026 13:58:17",
    userName: "Bobur T.",
    userInitials: "BT",
    userRole: "Kassir",
    action: "edit",
    actionLabel: "Tahrir qildi",
    objectLabel: "Mahsulot: Coca-Cola 0.5L",
    detail: "Min qoldiq 20 → 30 ga o'zgartirildi",
    ip: "192.168.1.52",
  },
  {
    id: "ae_006",
    ts: "21.05.2026 13:42:00",
    userName: "Admin",
    userInitials: "AD",
    userRole: "Administrator",
    action: "create",
    actionLabel: "Yaratdi",
    objectLabel: "Yetkazib beruvchi: Lazzat OOO",
    detail: "STIR 305678910 · Toshkent shahar",
    ip: "192.168.1.10",
  },
  {
    id: "ae_007",
    ts: "21.05.2026 13:30:21",
    userName: "Admin",
    userInitials: "AD",
    userRole: "Administrator",
    action: "edit",
    actionLabel: "Yangiladi",
    objectLabel: "Foydalanuvchi: Sevara Y.",
    detail: "Rol 'view' → 'edit' huquq berildi",
    ip: "192.168.1.10",
  },
  {
    id: "ae_008",
    ts: "21.05.2026 12:48:44",
    userName: "Aziz K.",
    userInitials: "AK",
    userRole: "Omborchi",
    action: "approve",
    actionLabel: "Tasdiqladi",
    objectLabel: "Hujjat №12342",
    detail: "12 ta mahsulot · 2 845 000 so'm",
    ip: "192.168.1.45",
  },
  {
    id: "ae_009",
    ts: "21.05.2026 12:22:11",
    userName: "Aziz K.",
    userInitials: "AK",
    userRole: "Omborchi",
    action: "edit",
    actionLabel: "Tahrir qildi",
    objectLabel: "Hujjat №12342 — row_5",
    detail: "Mahsulot nomi 'Non gulli' → 'Non gulli (oddiy)'",
    ip: "192.168.1.45",
  },
  {
    id: "ae_010",
    ts: "21.05.2026 11:58:30",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "create",
    actionLabel: "Yaratildi",
    objectLabel: "Hujjat №12347 (Didox)",
    detail: "Avtomatik import Didox webhook orqali",
    ip: "—",
  },
  {
    id: "ae_011",
    ts: "21.05.2026 11:45:09",
    userName: "Madina O.",
    userInitials: "MO",
    userRole: "Auditor",
    action: "view",
    actionLabel: "Ko'rdi",
    objectLabel: "Audit log",
    detail: "Davr: 14.05.2026 - 21.05.2026 · 1 247 yozuv",
    ip: "10.0.12.99",
  },
  {
    id: "ae_012",
    ts: "21.05.2026 11:20:55",
    userName: "Aziz K.",
    userInitials: "AK",
    userRole: "Omborchi",
    action: "approve",
    actionLabel: "Tasdiqladi",
    objectLabel: "Hujjat №12338",
    detail: "5 ta mahsulot · 1 245 600 so'm",
    ip: "192.168.1.45",
  },
  {
    id: "ae_013",
    ts: "21.05.2026 10:55:18",
    userName: "Jasur R.",
    userInitials: "JR",
    userRole: "Kassir",
    action: "edit",
    actionLabel: "Tahrir qildi",
    objectLabel: "Mahsulot: Sut 1L Imkon",
    detail: "Narx 8 200 → 8 500 so'm",
    ip: "192.168.1.61",
  },
  {
    id: "ae_014",
    ts: "21.05.2026 10:42:03",
    userName: "Aziz K.",
    userInitials: "AK",
    userRole: "Omborchi",
    action: "auth",
    actionLabel: "Kirdi",
    objectLabel: "Tizimga kirish",
    detail: "SMS OTP orqali (+998 90 123 45 67)",
    ip: "192.168.1.45",
  },
  {
    id: "ae_015",
    ts: "21.05.2026 10:15:42",
    userName: "Admin",
    userInitials: "AD",
    userRole: "Administrator",
    action: "edit",
    actionLabel: "Yangiladi",
    objectLabel: "Sozlamalar: MXIK threshold",
    detail: "Confidence 0.80 → 0.85 ga o'zgartirildi",
    ip: "192.168.1.10",
  },
  {
    id: "ae_016",
    ts: "21.05.2026 09:48:21",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "create",
    actionLabel: "Yaratildi",
    objectLabel: "AI Insight: Coca-Cola low-stock",
    detail: "Critical · Qoldiq 3 dona · 50 dona buyurtma tavsiya",
    ip: "—",
  },
  {
    id: "ae_017",
    ts: "21.05.2026 09:30:15",
    userName: "Sevara Y.",
    userInitials: "SY",
    userRole: "Buxgalter",
    action: "auth",
    actionLabel: "Kirdi",
    objectLabel: "Tizimga kirish",
    detail: "Email + parol orqali",
    ip: "10.0.12.88",
  },
  {
    id: "ae_018",
    ts: "21.05.2026 09:15:48",
    userName: "Bobur T.",
    userInitials: "BT",
    userRole: "Kassir",
    action: "delete",
    actionLabel: "O'chirdi",
    objectLabel: "Hujjat №12340 (dublikat)",
    detail: "Sabab: №12339 bilan bir xil hash",
    ip: "192.168.1.52",
  },
  {
    id: "ae_019",
    ts: "21.05.2026 08:55:30",
    userName: "Aziz K.",
    userInitials: "AK",
    userRole: "Omborchi",
    action: "approve",
    actionLabel: "Tasdiqladi",
    objectLabel: "Hujjat №12337",
    detail: "18 ta mahsulot · 6 230 400 so'm",
    ip: "192.168.1.45",
  },
  {
    id: "ae_020",
    ts: "21.05.2026 08:42:12",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "create",
    actionLabel: "Yaratildi",
    objectLabel: "Hujjat №12345 (Didox)",
    detail: "Alpha Distribution OOO · STIR 301234567",
    ip: "—",
  },
  {
    id: "ae_021",
    ts: "21.05.2026 08:30:00",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "edit",
    actionLabel: "Sync",
    objectLabel: "MXIK katalog (Soliq.uz)",
    detail: "461 800 kod yangilandi · 47 yangi qo'shildi",
    ip: "—",
  },
  {
    id: "ae_022",
    ts: "20.05.2026 18:22:55",
    userName: "Admin",
    userInitials: "AD",
    userRole: "Administrator",
    action: "create",
    actionLabel: "Yaratdi",
    objectLabel: "Foydalanuvchi: Madina O.",
    detail: "Rol: Auditor · Email: madina@karimov-mchj.uz",
    ip: "192.168.1.10",
  },
  {
    id: "ae_023",
    ts: "20.05.2026 17:48:30",
    userName: "Aziz K.",
    userInitials: "AK",
    userRole: "Omborchi",
    action: "auth",
    actionLabel: "Chiqdi",
    objectLabel: "Tizimdan chiqish",
    detail: "Sessiya yopildi (manual)",
    ip: "192.168.1.45",
  },
  {
    id: "ae_024",
    ts: "20.05.2026 16:30:11",
    userName: "Aziz K.",
    userInitials: "AK",
    userRole: "Omborchi",
    action: "approve",
    actionLabel: "Tasdiqladi",
    objectLabel: "Hujjat №12335",
    detail: "9 ta mahsulot · 3 120 500 so'm",
    ip: "192.168.1.45",
  },
  {
    id: "ae_025",
    ts: "20.05.2026 15:42:08",
    userName: "Sevara Y.",
    userInitials: "SY",
    userRole: "Buxgalter",
    action: "view",
    actionLabel: "Ko'rdi",
    objectLabel: "Hisobot: Bu hafta",
    detail: "PDF eksport qilindi (45 sahifa)",
    ip: "10.0.12.88",
  },
  {
    id: "ae_026",
    ts: "20.05.2026 14:55:22",
    userName: "Bobur T.",
    userInitials: "BT",
    userRole: "Kassir",
    action: "edit",
    actionLabel: "Tahrir qildi",
    objectLabel: "Mahsulot: Non gulli",
    detail: "Min qoldiq 25 → 30 ga o'zgartirildi",
    ip: "192.168.1.52",
  },
  {
    id: "ae_027",
    ts: "20.05.2026 14:12:40",
    userName: "Admin",
    userInitials: "AD",
    userRole: "Administrator",
    action: "edit",
    actionLabel: "Yangiladi",
    objectLabel: "Integratsiya: Telegram Bot",
    detail: "Webhook URL yangilandi · 3 ta foydalanuvchi qo'shildi",
    ip: "192.168.1.10",
  },
  {
    id: "ae_028",
    ts: "20.05.2026 13:30:18",
    userName: "Jasur R.",
    userInitials: "JR",
    userRole: "Kassir",
    action: "auth",
    actionLabel: "Kirdi",
    objectLabel: "Tizimga kirish",
    detail: "SMS OTP orqali",
    ip: "192.168.1.61",
  },
  {
    id: "ae_029",
    ts: "20.05.2026 12:48:55",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "approve",
    actionLabel: "Avto-tasdiq",
    objectLabel: "Hujjat №12334",
    detail: "15 ta mahsulot avto-tasdiqlandi (confidence ≥0.95)",
    ip: "—",
  },
  {
    id: "ae_030",
    ts: "20.05.2026 11:20:03",
    userName: "Aziz K.",
    userInitials: "AK",
    userRole: "Omborchi",
    action: "auth",
    actionLabel: "Kirdi",
    objectLabel: "Tizimga kirish",
    detail: "SMS OTP orqali (+998 90 123 45 67)",
    ip: "192.168.1.45",
  },
];

function FilterDropdown({ label }: { label: string }) {
  return (
    <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border-strong bg-surface-card px-3 text-[13px] text-ink-700 hover:bg-ink-100">
      {label}
      <ChevronDown className="size-3.5 text-ink-500" />
    </button>
  );
}

export default function AuditLogPage() {
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
            {auditEntries.map((entry) => (
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

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-[13px] text-ink-600">
            <span className="font-mono">
              1-30 / <span className="font-semibold text-ink-900">1 847</span>
            </span>
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" disabled>
                <ChevronLeft className="size-3.5" />
                Oldingi
              </Button>
              <div className="flex items-center gap-0.5 px-2 font-mono">
                <span className="grid size-7 place-items-center rounded-sm bg-navy-700 text-white text-[12px] font-semibold">
                  1
                </span>
                <button className="grid size-7 place-items-center rounded-sm text-ink-600 hover:bg-ink-100 text-[12px]">
                  2
                </button>
                <button className="grid size-7 place-items-center rounded-sm text-ink-600 hover:bg-ink-100 text-[12px]">
                  3
                </button>
                <span className="px-1 text-ink-400">...</span>
                <button className="grid size-7 place-items-center rounded-sm text-ink-600 hover:bg-ink-100 text-[12px]">
                  62
                </button>
              </div>
              <Button variant="secondary" size="sm">
                Keyingi
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
