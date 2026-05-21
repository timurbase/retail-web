"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Pencil,
  Camera,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Laptop,
  AlertTriangle,
  LogOut,
  Check,
  Monitor,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { useTheme } from "@/components/theme/theme-provider";

type TabId = "shaxsiy" | "xavfsizlik" | "sessiyalar" | "korinish";

const tabs: { id: TabId; label: string }[] = [
  { id: "shaxsiy", label: "Shaxsiy ma'lumotlar" },
  { id: "xavfsizlik", label: "Xavfsizlik" },
  { id: "sessiyalar", label: "Sessiyalar" },
  { id: "korinish", label: "Tashqi ko'rinish" },
];

const ROLE_LABEL: Record<User["role"], string> = {
  admin: "Administrator",
  omborchi: "Omborchi",
  buxgalter: "Buxgalter",
  kassir: "Kassir",
  auditor: "Auditor",
  firma: "Firma operatori",
  supplier_admin: "Ta'minotchi admin",
  supplier_sales: "Ta'minotchi sotuv",
  supplier_logistics: "Logistika",
  supplier_buxgalter: "Ta'minotchi buxgalter",
  soliq_inspector: "Soliq inspektori",
  soliq_admin: "Soliq admini",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()} ${hh}:${min}`;
}

function formatPhone(p: string): string {
  // +998901234567 -> +998 90 123 45 67
  const m = p.match(/^\+?(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/);
  if (!m) return p;
  return `+${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}`;
}

interface ProfilViewProps {
  user: User;
}

export function ProfilView({ user }: ProfilViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("shaxsiy");

  return (
    <>
      <Topbar breadcrumb={[{ label: "Profil" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">
              Profil va sozlamalar
            </h1>
            <p className="mt-1 text-[13px] text-ink-500">
              Shaxsiy ma&apos;lumotlar, parol, til va xavfsizlik
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap items-center gap-1 rounded-md border border-border bg-surface-card p-1 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-sm px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-navy-700 text-white"
                    : "text-ink-600 hover:bg-ink-100"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "shaxsiy" && <ShaxsiyTab user={user} />}
          {activeTab === "xavfsizlik" && <XavfsizlikTab />}
          {activeTab === "sessiyalar" && <SessiyalarTab />}
          {activeTab === "korinish" && <KorinishTab />}
        </div>
      </main>
    </>
  );
}

/* ============================
   TAB 1: Shaxsiy ma'lumotlar
   ============================ */

function Field({
  label,
  value,
  mono,
  badge,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b border-border py-3 last:border-0">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 pt-0.5">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-[14px] text-ink-900",
            mono && "font-mono font-semibold"
          )}
        >
          {value}
        </span>
        {badge}
      </div>
    </div>
  );
}

function ShaxsiyTab({ user }: { user: User }) {
  const { info } = useToast();

  return (
    <div className="space-y-4">
      {/* Avatar card */}
      <Card>
        <CardContent className="flex items-center gap-5">
          <div className="grid size-20 shrink-0 place-items-center rounded-full bg-emerald-600 text-white text-2xl font-bold">
            {getInitials(user.fullName)}
          </div>
          <div className="flex-1">
            <div className="text-[18px] font-semibold text-ink-900">
              {user.fullName}
            </div>
            <div className="mt-0.5 text-[13px] text-ink-500 font-mono">
              {user.email}
            </div>
            <button
              onClick={() =>
                info(
                  "Tez orada",
                  "Avatar yuklash funksiyasi keyingi versiyada"
                )
              }
              className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
            >
              <Camera className="size-3.5" />
              Suratni o&apos;zgartirish
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Read-only fields */}
      <Card>
        <CardHeader>
          <CardTitle>Hisob ma&apos;lumotlari</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <Field label="F.I.O." value={user.fullName} />
          <Field
            label="Lavozim"
            value=""
            badge={
              <span className="inline-flex items-center rounded-full border border-navy-700 bg-navy-50 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-navy-700 dark:text-navy-300">
                {ROLE_LABEL[user.role]}
              </span>
            }
          />
          <Field label="Email" value={user.email} mono />
          <Field label="Telefon" value={formatPhone(user.phone)} mono />
          <Field
            label="Hisob yaratilgan"
            value={formatDate(user.createdAt)}
            mono
          />
          <Field
            label="Oxirgi kirish"
            value={user.lastLogin ? formatDateTime(user.lastLogin) : "—"}
            mono
          />
        </CardContent>
        <div className="flex justify-end border-t border-border px-5 py-4">
          <Button
            onClick={() =>
              info(
                "Tez orada",
                "Profil tahrirlash modali keyingi versiyada"
              )
            }
          >
            <Pencil className="size-4" />
            Tahrirlash
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ============================
   TAB 2: Xavfsizlik
   ============================ */

function Switch({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-emerald-600" : "bg-ink-300"
      )}
      role="switch"
      aria-checked={on}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full bg-white transition-transform shadow-sm",
          on ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

interface ActiveDevice {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current?: boolean;
  suspicious?: boolean;
  icon: typeof Laptop;
}

const activeDevices: ActiveDevice[] = [
  {
    id: "dev_1",
    device: "MacBook Pro",
    browser: "Safari 18",
    location: "Toshkent",
    lastActive: "Faol",
    current: true,
    icon: Laptop,
  },
  {
    id: "dev_2",
    device: "iPhone 15",
    browser: "iOS ilova",
    location: "Toshkent",
    lastActive: "2 soat oldin",
    icon: Smartphone,
  },
  {
    id: "dev_3",
    device: "Windows PC",
    browser: "Chrome 134",
    location: "Samarqand",
    lastActive: "3 kun oldin",
    suspicious: true,
    icon: Monitor,
  },
];

function XavfsizlikTab() {
  const { info, warning } = useToast();
  const [twoFa, setTwoFa] = useState(true);

  return (
    <div className="space-y-4">
      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-navy-700 dark:text-navy-300" />
            Parol
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-ink-700">
              Parolingiz mustahkam va shaxsiy bo&apos;lishi kerak
            </div>
            <div className="mt-1 font-mono text-[11px] text-ink-500">
              Oxirgi o&apos;zgartirilgan: 21 kun oldin
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              info(
                "Tez orada",
                "Parolni o'zgartirish modali keyingi versiyada"
              )
            }
          >
            Parolni o&apos;zgartirish
          </Button>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            Ikki bosqichli autentifikatsiya (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "mt-1 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase",
                twoFa
                  ? "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300"
                  : "bg-ink-100 border-ink-300 text-ink-500"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  twoFa ? "bg-emerald-600" : "bg-ink-400"
                )}
              />
              {twoFa ? "Faol" : "O'chirilgan"}
            </span>
            <div>
              <div className="text-[13px] font-medium text-ink-700">
                Har kirishda SMS-kod
              </div>
              <div className="mt-0.5 text-[12px] text-ink-500">
                Telefoningizga 6 raqamli tasdiqlash kodi yuboriladi
              </div>
            </div>
          </div>
          <Switch
            on={twoFa}
            onToggle={() => {
              setTwoFa(!twoFa);
              if (twoFa) {
                warning(
                  "2FA o'chirildi",
                  "Hisobingiz endi kamroq himoyalangan"
                );
              } else {
                info("2FA yoqildi", "Keyingi kirishda SMS-kod so'raladi");
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Active devices */}
      <Card>
        <CardHeader>
          <CardTitle>Aktiv qurilmalar</CardTitle>
        </CardHeader>
        <div>
          {activeDevices.map((dev) => {
            const Icon = dev.icon;
            return (
              <div
                key={dev.id}
                className="flex items-center gap-4 border-b border-border px-5 py-3 last:border-0"
              >
                <div
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-md",
                    dev.suspicious
                      ? "bg-amber-50 text-amber-600 dark:text-amber-300"
                      : "bg-ink-100 text-ink-700"
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900">
                      {dev.device}
                    </span>
                    {dev.current && (
                      <span className="rounded-full bg-emerald-50 border border-emerald-600 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                        Joriy
                      </span>
                    )}
                    {dev.suspicious && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-600 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-amber-600 dark:text-amber-300">
                        <AlertTriangle className="size-2.5" />
                        Shubhali
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-ink-500">
                    {dev.browser} · {dev.location} · {dev.lastActive}
                  </div>
                </div>
                {!dev.current && (
                  <button
                    onClick={() =>
                      info(
                        "Qurilmadan chiqarildi",
                        `${dev.device} — sessiyasi to'xtatildi`
                      )
                    }
                    className="grid size-8 place-items-center rounded-sm text-ink-500 hover:bg-red-50 hover:text-red-700 dark:text-red-300"
                    aria-label="Chiqish"
                  >
                    <LogOut className="size-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-end border-t border-border px-5 py-4">
          <Button
            variant="danger"
            onClick={() =>
              warning(
                "Boshqa qurilmalardan chiqildi",
                "2 ta sessiya to'xtatildi"
              )
            }
          >
            <LogOut className="size-4" />
            Barcha boshqa qurilmalardan chiqish
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ============================
   TAB 3: Sessiyalar
   ============================ */

interface SessionEntry {
  timestamp: string;
  ip: string;
  device: string;
  location: string;
  status: "success" | "new-device" | "failed";
}

const sessionLog: SessionEntry[] = [
  {
    timestamp: "21.05.2026 08:30",
    ip: "192.168.1.45",
    device: "MacBook · Safari",
    location: "Toshkent",
    status: "success",
  },
  {
    timestamp: "20.05.2026 18:45",
    ip: "192.168.1.45",
    device: "iPhone 15 · iOS",
    location: "Toshkent",
    status: "success",
  },
  {
    timestamp: "20.05.2026 06:12",
    ip: "91.203.45.67",
    device: "Chrome · Windows",
    location: "Samarqand",
    status: "new-device",
  },
  {
    timestamp: "19.05.2026 22:08",
    ip: "192.168.1.45",
    device: "iPhone 15 · iOS",
    location: "Toshkent",
    status: "success",
  },
  {
    timestamp: "19.05.2026 09:14",
    ip: "192.168.1.45",
    device: "MacBook · Safari",
    location: "Toshkent",
    status: "success",
  },
  {
    timestamp: "18.05.2026 17:32",
    ip: "192.168.1.45",
    device: "MacBook · Safari",
    location: "Toshkent",
    status: "success",
  },
  {
    timestamp: "18.05.2026 07:51",
    ip: "192.168.1.45",
    device: "iPhone 15 · iOS",
    location: "Toshkent",
    status: "success",
  },
  {
    timestamp: "17.05.2026 21:03",
    ip: "94.158.22.18",
    device: "Chrome · Windows",
    location: "Samarqand",
    status: "failed",
  },
  {
    timestamp: "17.05.2026 09:42",
    ip: "192.168.1.45",
    device: "MacBook · Safari",
    location: "Toshkent",
    status: "success",
  },
  {
    timestamp: "16.05.2026 12:18",
    ip: "192.168.1.45",
    device: "MacBook · Safari",
    location: "Toshkent",
    status: "success",
  },
];

const STATUS_BADGE: Record<
  SessionEntry["status"],
  { label: string; classes: string }
> = {
  success: {
    label: "✓ Muvaffaqiyatli",
    classes: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
  },
  "new-device": {
    label: "⚠ Yangi qurilma",
    classes: "bg-amber-50 border-amber-600 text-amber-600 dark:text-amber-300",
  },
  failed: {
    label: "✕ Muvaffaqiyatsiz",
    classes: "bg-red-50 border-red-600 text-red-700 dark:text-red-300",
  },
};

function SessiyalarTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>So&apos;nggi kirishlar</CardTitle>
      </CardHeader>

      <div className="grid grid-cols-[1.2fr_1fr_1.2fr_1fr_1.2fr] gap-4 border-b border-border bg-ink-100/50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        <span>Vaqt</span>
        <span>IP</span>
        <span>Qurilma</span>
        <span>Manzil</span>
        <span>Status</span>
      </div>

      {sessionLog.map((entry, i) => {
        const badge = STATUS_BADGE[entry.status];
        return (
          <div
            key={i}
            className="grid grid-cols-[1.2fr_1fr_1.2fr_1fr_1.2fr] items-center gap-4 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/40"
          >
            <span className="font-mono text-[12px] text-ink-700">
              {entry.timestamp}
            </span>
            <span className="font-mono text-[12px] text-ink-600">
              {entry.ip}
            </span>
            <span className="text-[13px] text-ink-700">{entry.device}</span>
            <span className="text-[13px] text-ink-600">{entry.location}</span>
            <span
              className={cn(
                "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold",
                badge.classes
              )}
            >
              {badge.label}
            </span>
          </div>
        );
      })}
    </Card>
  );
}

/* ============================
   TAB 4: Tashqi ko'rinish
   ============================ */

type ThemeId = "light" | "dark" | "system";
type Lang = "uz" | "ru" | "en";

const themeOptions: { id: ThemeId; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Yorug'", icon: Sun },
  { id: "dark", label: "Qorong'i", icon: Moon },
  { id: "system", label: "Tizim", icon: Monitor },
];

const langOptions: { id: Lang; label: string; sub: string }[] = [
  { id: "uz", label: "O'zbek", sub: "lotin" },
  { id: "ru", label: "Русский", sub: "kirill" },
  { id: "en", label: "English", sub: "latin" },
];

function KorinishTab() {
  const { success } = useToast();
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState<Lang>("uz");
  const [tz, setTz] = useState("Asia/Tashkent");
  const [dateFmt, setDateFmt] = useState("dd.mm.yyyy");

  return (
    <div className="space-y-4">
      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Mavzu (Theme)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  type="button"
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-md border p-4 transition-colors",
                    active
                      ? "border-navy-700 bg-navy-50"
                      : "border-border bg-surface-card hover:bg-ink-100"
                  )}
                >
                  <div
                    className={cn(
                      "grid size-10 place-items-center rounded-md",
                      active
                        ? "bg-navy-700 text-white"
                        : "bg-ink-100 text-ink-600"
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span
                    className={cn(
                      "text-[13px] font-medium",
                      active ? "text-navy-700 dark:text-navy-300" : "text-ink-700"
                    )}
                  >
                    {opt.label}
                  </span>
                  {active && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-navy-700 dark:text-navy-300">
                      <Check className="size-3" strokeWidth={2.5} />
                      Tanlangan
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle>Til (Language)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {langOptions.map((opt) => {
              const active = lang === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setLang(opt.id)}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-4 py-3 text-left transition-colors",
                    active
                      ? "border-navy-700 bg-navy-50"
                      : "border-border bg-surface-card hover:bg-ink-100"
                  )}
                >
                  <div>
                    <div
                      className={cn(
                        "text-[14px] font-semibold",
                        active ? "text-navy-700 dark:text-navy-300" : "text-ink-900"
                      )}
                    >
                      {opt.label}
                    </div>
                    <div className="mt-0.5 text-[11px] text-ink-500">
                      {opt.sub}
                    </div>
                  </div>
                  {active && (
                    <Check
                      className="size-4 text-navy-700 dark:text-navy-300"
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timezone + date format */}
      <Card>
        <CardHeader>
          <CardTitle>Vaqt va sana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="tz"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-700"
            >
              Vaqt zonasi
            </label>
            <select
              id="tz"
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              className="h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
            >
              <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
              <option value="Asia/Samarkand">Asia/Samarkand (UTC+5)</option>
              <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
              <option value="UTC">UTC (UTC+0)</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="dateFmt"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-700"
            >
              Sana formati
            </label>
            <select
              id="dateFmt"
              value={dateFmt}
              onChange={(e) => setDateFmt(e.target.value)}
              className="h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 font-mono text-sm text-ink-900 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
            >
              <option value="dd.mm.yyyy">DD.MM.YYYY (21.05.2026)</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD (2026-05-21)</option>
            </select>
          </div>
        </CardContent>
        <div className="flex justify-end border-t border-border px-5 py-4">
          <Button
            onClick={() =>
              success(
                "Sozlamalar saqlandi",
                "Tashqi ko'rinish yangilandi"
              )
            }
          >
            Saqlash
          </Button>
        </div>
      </Card>
    </div>
  );
}
