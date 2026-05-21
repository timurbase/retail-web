import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
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

interface SupplierAuditEntry {
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

// 30 mock entries — supplier objectTypes (invoice/payment/store/order/route/integration)
const auditEntries: SupplierAuditEntry[] = [
  {
    id: "se_001",
    ts: "21.05.2026 09:48:22",
    userName: "Karim A.",
    userInitials: "KA",
    userRole: "Sotuv menejeri",
    action: "create",
    actionLabel: "Yaratdi",
    objectLabel: "Hujjat AD-2026-0200",
    detail: "Lazzat Market &middot; 12 mahsulot &middot; 8 450 000 so'm",
    ip: "10.0.45.12",
  },
  {
    id: "se_002",
    ts: "21.05.2026 09:42:08",
    userName: "Asror T.",
    userInitials: "AT",
    userRole: "Administrator",
    action: "approve",
    actionLabel: "Tasdiqladi",
    objectLabel: "Buyurtma ORD-2026-0024",
    detail: "Karimov MChJ buyurtmasi tasdiqlandi &middot; 5 mahsulot",
    ip: "10.0.45.10",
  },
  {
    id: "se_003",
    ts: "21.05.2026 09:31:55",
    userName: "Sevara Y.",
    userInitials: "SY",
    userRole: "Buxgalter",
    action: "edit",
    actionLabel: "To'lov belgiladi",
    objectLabel: "To'lov AD-2026-0185",
    detail: "Click orqali to'landi &middot; 4 250 000 so'm",
    ip: "10.0.45.22",
  },
  {
    id: "se_004",
    ts: "21.05.2026 09:15:42",
    userName: "Dilshod T.",
    userInitials: "DT",
    userRole: "Logistika menejeri",
    action: "create",
    actionLabel: "Marshrut yaratdi",
    objectLabel: "Marshrut route_009",
    detail: "Toshmatov Otabek &middot; 6 stop &middot; ETA 18:30",
    ip: "10.0.45.18",
  },
  {
    id: "se_005",
    ts: "21.05.2026 09:02:11",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "create",
    actionLabel: "AI Insight",
    objectLabel: "Churn alert: Karimov MChJ",
    detail: "18 kun buyurtma yo'q &middot; reliability 9.2",
    ip: "—",
  },
  {
    id: "se_006",
    ts: "21.05.2026 08:48:33",
    userName: "Karim A.",
    userInitials: "KA",
    userRole: "Sotuv menejeri",
    action: "create",
    actionLabel: "Yaratdi",
    objectLabel: "Hujjat AD-2026-0199",
    detail: "Samarqand Markaziy &middot; 8 mahsulot &middot; 5 120 000 so'm",
    ip: "10.0.45.12",
  },
  {
    id: "se_007",
    ts: "21.05.2026 08:30:00",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "edit",
    actionLabel: "Sync",
    objectLabel: "MXIK katalog (Soliq.uz)",
    detail: "461 950 kod yangilandi &middot; 150 yangi qo'shildi",
    ip: "—",
  },
  {
    id: "se_008",
    ts: "21.05.2026 08:22:17",
    userName: "Asror T.",
    userInitials: "AT",
    userRole: "Administrator",
    action: "edit",
    actionLabel: "Limit oshirdi",
    objectLabel: "Do'kon: Lazzat Market",
    detail: "Kredit limit 25M -> 35M so'm",
    ip: "10.0.45.10",
  },
  {
    id: "se_009",
    ts: "21.05.2026 08:15:42",
    userName: "Bobur S.",
    userInitials: "BS",
    userRole: "Sotuv rep",
    action: "create",
    actionLabel: "Buyurtma qabul",
    objectLabel: "Buyurtma ORD-2026-0023",
    detail: "Chilonzor Market &middot; 7 mahsulot",
    ip: "10.0.45.31",
  },
  {
    id: "se_010",
    ts: "21.05.2026 07:55:08",
    userName: "Karim A.",
    userInitials: "KA",
    userRole: "Sotuv menejeri",
    action: "auth",
    actionLabel: "Kirdi",
    objectLabel: "Tizimga kirish",
    detail: "SMS OTP orqali (+998 90 234 56 78)",
    ip: "10.0.45.12",
  },
  {
    id: "se_011",
    ts: "21.05.2026 07:42:15",
    userName: "Dilshod T.",
    userInitials: "DT",
    userRole: "Logistika menejeri",
    action: "edit",
    actionLabel: "Stop yetkazildi",
    objectLabel: "Marshrut route_007 / stop 3",
    detail: "Yangi Bozor &middot; 09:42 da yetkazib berildi",
    ip: "10.0.45.18",
  },
  {
    id: "se_012",
    ts: "21.05.2026 07:15:48",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "create",
    actionLabel: "Eslatma yubordi",
    objectLabel: "To'lov AD-2026-0142",
    detail: "30 kun kechikkan &middot; SMS jo'natildi (+998 90 555 11 22)",
    ip: "—",
  },
  {
    id: "se_013",
    ts: "20.05.2026 18:22:55",
    userName: "Asror T.",
    userInitials: "AT",
    userRole: "Administrator",
    action: "create",
    actionLabel: "Yaratdi",
    objectLabel: "Do'kon: Nukus Halol",
    detail: "Yangi do'kon taklifi &middot; STIR 305612478",
    ip: "10.0.45.10",
  },
  {
    id: "se_014",
    ts: "20.05.2026 17:48:30",
    userName: "Sevara Y.",
    userInitials: "SY",
    userRole: "Buxgalter",
    action: "view",
    actionLabel: "Ko'rdi",
    objectLabel: "Hisobot: Bu oy",
    detail: "Excel eksport qilindi (200 hujjat)",
    ip: "10.0.45.22",
  },
  {
    id: "se_015",
    ts: "20.05.2026 16:30:11",
    userName: "Jasur R.",
    userInitials: "JR",
    userRole: "Sotuv rep",
    action: "create",
    actionLabel: "Yaratdi",
    objectLabel: "Hujjat AD-2026-0198",
    detail: "Registon Market &middot; 14 mahsulot &middot; 12 480 000 so'm",
    ip: "10.0.45.33",
  },
  {
    id: "se_016",
    ts: "20.05.2026 15:42:08",
    userName: "Asror T.",
    userInitials: "AT",
    userRole: "Administrator",
    action: "edit",
    actionLabel: "Integratsiya yangiladi",
    objectLabel: "Telegram Bot",
    detail: "12 ta sotuv menejeri ulandi",
    ip: "10.0.45.10",
  },
  {
    id: "se_017",
    ts: "20.05.2026 14:55:22",
    userName: "Dilshod T.",
    userInitials: "DT",
    userRole: "Logistika menejeri",
    action: "edit",
    actionLabel: "Marshrut tugadi",
    objectLabel: "Marshrut route_006",
    detail: "5 ta stop &middot; jami 1 kun 4 soat",
    ip: "10.0.45.18",
  },
  {
    id: "se_018",
    ts: "20.05.2026 14:12:40",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "approve",
    actionLabel: "Avto-yetkazib berildi",
    objectLabel: "Hujjat AD-2026-0192",
    detail: "Driver mobile app orqali tasdiqlandi",
    ip: "—",
  },
  {
    id: "se_019",
    ts: "20.05.2026 13:30:18",
    userName: "Karim A.",
    userInitials: "KA",
    userRole: "Sotuv menejeri",
    action: "delete",
    actionLabel: "Bekor qildi",
    objectLabel: "Buyurtma ORD-2026-0019",
    detail: "Sabab: do'kon takroriy yubordi",
    ip: "10.0.45.12",
  },
  {
    id: "se_020",
    ts: "20.05.2026 12:48:55",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "create",
    actionLabel: "Talab signali",
    objectLabel: "Demand: Mineral suv 0.5L",
    detail: "Toshkent shahar +34% trend &middot; rising",
    ip: "—",
  },
  {
    id: "se_021",
    ts: "20.05.2026 11:20:03",
    userName: "Bobur S.",
    userInitials: "BS",
    userRole: "Sotuv rep",
    action: "auth",
    actionLabel: "Kirdi",
    objectLabel: "Tizimga kirish",
    detail: "Mobile app orqali (iOS)",
    ip: "10.0.45.31",
  },
  {
    id: "se_022",
    ts: "20.05.2026 10:55:42",
    userName: "Sevara Y.",
    userInitials: "SY",
    userRole: "Buxgalter",
    action: "edit",
    actionLabel: "To'lov belgiladi",
    objectLabel: "To'lov AD-2026-0178",
    detail: "Bank o'tkazma &middot; 6 800 000 so'm",
    ip: "10.0.45.22",
  },
  {
    id: "se_023",
    ts: "20.05.2026 10:22:18",
    userName: "Asror T.",
    userInitials: "AT",
    userRole: "Administrator",
    action: "edit",
    actionLabel: "Narxlash qoidasi",
    objectLabel: "VIP chegirma siyosati",
    detail: "Chegirma 5% -> 8% ga oshirildi",
    ip: "10.0.45.10",
  },
  {
    id: "se_024",
    ts: "20.05.2026 09:48:30",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "create",
    actionLabel: "Didox webhook",
    objectLabel: "Hujjat AD-2026-0190",
    detail: "Yangi Bozor MChJ &middot; auto-import",
    ip: "—",
  },
  {
    id: "se_025",
    ts: "19.05.2026 18:30:00",
    userName: "Otabek M.",
    userInitials: "OM",
    userRole: "Sotuv rep",
    action: "auth",
    actionLabel: "Bloklandi",
    objectLabel: "Tizimga kirish",
    detail: "3 marta noto'g'ri parol &middot; security policy",
    ip: "10.0.45.55",
  },
  {
    id: "se_026",
    ts: "19.05.2026 17:22:08",
    userName: "Dilshod T.",
    userInitials: "DT",
    userRole: "Logistika menejeri",
    action: "create",
    actionLabel: "Driver qo'shdi",
    objectLabel: "Driver: Mahmudov Vohid",
    detail: "Avtomashina 03TA 451 GG &middot; 4-marshrut",
    ip: "10.0.45.18",
  },
  {
    id: "se_027",
    ts: "19.05.2026 16:45:33",
    userName: "Karim A.",
    userInitials: "KA",
    userRole: "Sotuv menejeri",
    action: "edit",
    actionLabel: "Tahrirladi",
    objectLabel: "Hujjat AD-2026-0186",
    detail: "Mineral suv 1.5L &middot; quantity 50 -> 80",
    ip: "10.0.45.12",
  },
  {
    id: "se_028",
    ts: "19.05.2026 15:10:18",
    userName: "Tizim",
    userInitials: "AI",
    userRole: "Avto",
    action: "create",
    actionLabel: "AI Insight",
    objectLabel: "Growth: Lazzat Market",
    detail: "Reliability 9.6 &middot; kredit limit oshirish tavsiyasi",
    ip: "—",
  },
  {
    id: "se_029",
    ts: "19.05.2026 14:22:08",
    userName: "Asror T.",
    userInitials: "AT",
    userRole: "Administrator",
    action: "create",
    actionLabel: "Yaratdi",
    objectLabel: "Foydalanuvchi: Madina O.",
    detail: "Rol: Sotuv rep (Buxoro) &middot; taklif yuborildi",
    ip: "10.0.45.10",
  },
  {
    id: "se_030",
    ts: "19.05.2026 13:48:42",
    userName: "Asror T.",
    userInitials: "AT",
    userRole: "Administrator",
    action: "auth",
    actionLabel: "Kirdi",
    objectLabel: "Tizimga kirish",
    detail: "SMS OTP orqali (+998 78 555 11 00)",
    ip: "10.0.45.10",
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

export default function SupplierAuditLogPage() {
  return (
    <>
      <SupplierTopbar
        breadcrumb={[{ label: "Supplier" }, { label: "Audit log" }]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Audit log (Supplier)
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Tarmoq amallarining to&apos;liq tarixi
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
              Audit log immutable &mdash; yozuvlarni o&apos;zgartirish yoki
              o&apos;chirish mumkin emas.
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
                  placeholder="Foydalanuvchi, hujjat, do'kon yoki IP..."
                  className="h-9 w-full rounded-sm border border-border-strong bg-surface-card pl-9 pr-3 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
                />
              </div>
              <FilterDropdown label="Foydalanuvchi: Hammasi" />
              <FilterDropdown label="Obyekt turi: Hammasi" />
              <FilterDropdown label="Amal: Hammasi" />
              <FilterDropdown label="Davr: Bu hafta" />
              <Button variant="ghost" size="sm">
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5">
              <span className="font-mono text-[10px] text-ink-500 uppercase tracking-wider mr-1">
                Obyekt:
              </span>
              {[
                { label: "Hammasi", count: 30, active: true },
                { label: "Hujjat", count: 8 },
                { label: "To'lov", count: 4 },
                { label: "Buyurtma", count: 5 },
                { label: "Do'kon", count: 3 },
                { label: "Marshrut", count: 4 },
                { label: "Foydalanuvchi", count: 3 },
                { label: "Integratsiya", count: 3 },
              ].map((f) => (
                <span
                  key={f.label}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px] font-mono",
                    f.active
                      ? "bg-navy-700 text-white border-navy-700"
                      : "bg-surface-card text-ink-600 border-border",
                  )}
                >
                  {f.label} {f.count}
                </span>
              ))}
            </div>
          </Card>

          {/* Audit table */}
          <Card>
            <div className="overflow-x-auto">
              <div className="min-w-[1100px]">
                <div className="grid grid-cols-[170px_180px_140px_220px_1fr_120px] items-center gap-3 border-b border-border bg-ink-100/50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
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
                    className="grid grid-cols-[170px_180px_140px_220px_1fr_120px] items-center gap-3 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/40"
                  >
                    <span className="font-mono text-[12px] text-ink-600">
                      {entry.ts}
                    </span>

                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white",
                          entry.userRole === "Avto"
                            ? "bg-emerald-600"
                            : entry.userRole === "Administrator"
                            ? "bg-navy-700"
                            : "bg-ink-600",
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

                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wide",
                        actionStyles[entry.action],
                      )}
                    >
                      {entry.actionLabel}
                    </span>

                    <span className="text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline cursor-pointer truncate">
                      {entry.objectLabel}
                    </span>

                    <span
                      className="text-[12px] text-ink-600 truncate"
                      dangerouslySetInnerHTML={{ __html: entry.detail }}
                    />

                    <span className="font-mono text-[11px] text-ink-500">
                      {entry.ip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-[13px] text-ink-600">
            <span className="font-mono">
              1-30 / <span className="font-semibold text-ink-900">2 145</span>
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
                  72
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
