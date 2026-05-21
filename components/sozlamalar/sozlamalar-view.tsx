"use client";

import { useState, useTransition } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@/components/ui/dropdown";
import { Confirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { InviteUserModal } from "@/components/sozlamalar/invite-user-modal";
import { EditUserRoleModal } from "@/components/sozlamalar/edit-user-role-modal";
import {
  Pencil,
  Plus,
  RefreshCw,
  Check,
  Building2,
  Plug,
  ShieldCheck,
  Bot,
  Sheet,
  Brain,
  CreditCard,
  Trash2,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, UserRole } from "@/lib/types";
import {
  deleteUserAction,
  toggleUserStatusAction,
} from "@/lib/actions/users";

type TabId =
  | "korxona"
  | "integratsiyalar"
  | "foydalanuvchilar"
  | "bildirishnomalar"
  | "tarif";

const tabs: { id: TabId; label: string }[] = [
  { id: "korxona", label: "Korxona ma'lumotlari" },
  { id: "integratsiyalar", label: "Integratsiyalar" },
  { id: "foydalanuvchilar", label: "Foydalanuvchilar" },
  { id: "bildirishnomalar", label: "Bildirishnomalar" },
  { id: "tarif", label: "To'lov va tarif" },
];

// Mock current logged-in user (matches store CURRENT_USER)
const CURRENT_USER_ID = "user_aziz";

interface SozlamalarViewProps {
  users: User[];
}

export function SozlamalarView({ users }: SozlamalarViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("korxona");

  return (
    <>
      <Topbar breadcrumb={[{ label: "Sozlamalar" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">
              Sozlamalar
            </h1>
            <p className="mt-1 text-[13px] text-ink-500">
              Hisob, integratsiyalar, foydalanuvchilar, to&apos;lov
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

          {/* Tab content */}
          {activeTab === "korxona" && <KorxonaTab />}
          {activeTab === "integratsiyalar" && <IntegratsiyalarTab />}
          {activeTab === "foydalanuvchilar" && (
            <FoydalanuvchilarTab users={users} />
          )}
          {activeTab === "bildirishnomalar" && <BildirishnomalarTab />}
          {activeTab === "tarif" && <TarifTab />}
        </div>
      </main>
    </>
  );
}

/* ============================
   TAB 1: Korxona
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
    <div className="grid grid-cols-[200px_1fr] gap-4 border-b border-border py-3 last:border-0">
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

function KorxonaTab() {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Korxona ma&apos;lumotlari</CardTitle>
        <Button variant="secondary" size="sm">
          <Pencil className="size-3.5" />
          Tahrirlash
        </Button>
      </CardHeader>
      <CardContent className="py-2">
        <Field
          label="STIR"
          value="301234567"
          mono
          badge={
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-700">
              <Check className="size-3" strokeWidth={2.5} />
              Tasdiqlangan
            </span>
          }
        />
        <Field label="Korxona nomi" value="Karimov MChJ" />
        <Field label="Faoliyat turi" value="Chakana savdo (47.11 — Oziq-ovqat)" />
        <Field
          label="Manzil"
          value="Toshkent shahar, Chilonzor tumani, Bunyodkor ko'chasi 1A"
        />
        <Field label="Direktor" value="Karimov Aziz Salimovich" />
        <Field label="Telefon" value="+998 90 123 45 67" mono />
        <Field label="Email" value="aziz@karimov-mchj.uz" mono />
        <Field label="Veb-sayt" value="karimov-mchj.uz" mono />
      </CardContent>
      <div className="border-t border-border px-5 py-4 flex justify-end">
        <Button>
          <Pencil className="size-4" />
          Tahrirlash
        </Button>
      </div>
    </Card>
  );
}

/* ============================
   TAB 2: Integratsiyalar
   ============================ */

interface Integration {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  active: boolean;
  description: string;
  actions: { label: string; variant?: "primary" | "secondary" | "ghost" | "danger" }[];
}

const integrations: Integration[] = [
  {
    name: "Didox EDO",
    icon: Building2,
    iconColor: "bg-navy-700 text-white",
    active: true,
    description: "Webhook URL: https://api.retailflow.uz/didox/webhook",
    actions: [
      { label: "Sozlash", variant: "secondary" },
      { label: "O'chirish", variant: "ghost" },
    ],
  },
  {
    name: "Soliq.uz MXIK",
    icon: ShieldCheck,
    iconColor: "bg-emerald-600 text-white",
    active: true,
    description: "Oxirgi sync: 21.05.2026 06:00 · 461 800 kod",
    actions: [{ label: "Qo'lda sync", variant: "secondary" }],
  },
  {
    name: "POS tizimi (1C)",
    icon: Plug,
    iconColor: "bg-ink-200 text-ink-700",
    active: false,
    description: "1C bilan 2-tomonlama sinxronizatsiya",
    actions: [{ label: "Ulanish", variant: "primary" }],
  },
  {
    name: "Telegram Bot",
    icon: Bot,
    iconColor: "bg-navy-600 text-white",
    active: true,
    description: "@retailflow_bot · 3 foydalanuvchi ulangan",
    actions: [{ label: "Sozlash", variant: "secondary" }],
  },
  {
    name: "Google Sheets",
    icon: Sheet,
    iconColor: "bg-ink-200 text-ink-700",
    active: false,
    description: "Excel eksportni avto-sync qilish",
    actions: [{ label: "Ulanish", variant: "primary" }],
  },
  {
    name: "OpenAI API",
    icon: Brain,
    iconColor: "bg-emerald-700 text-white",
    active: true,
    description: "Custom key (cost tracking yoqilgan) · GPT-4o + embedding-3-small",
    actions: [{ label: "Almashtirish", variant: "secondary" }],
  },
];

function IntegratsiyalarTab() {
  return (
    <div className="space-y-3">
      {integrations.map((int) => {
        const Icon = int.icon;
        return (
          <Card key={int.name} className="p-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-md",
                  int.iconColor
                )}
              >
                <Icon className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-ink-900">
                    {int.name}
                  </h3>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wide",
                      int.active
                        ? "bg-emerald-50 border-emerald-600 text-emerald-700"
                        : "bg-ink-100 border-ink-300 text-ink-500"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        int.active ? "bg-emerald-600" : "bg-ink-400"
                      )}
                    />
                    {int.active ? "Faol" : "Ulanmagan"}
                  </span>
                </div>
                <div className="mt-1 text-[12px] text-ink-500 font-mono truncate">
                  {int.description}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {int.actions.map((a, i) => (
                  <Button
                    key={i}
                    variant={a.variant ?? "secondary"}
                    size="sm"
                  >
                    {a.label.includes("sync") && <RefreshCw className="size-3.5" />}
                    {a.label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ============================
   TAB 3: Foydalanuvchilar
   ============================ */

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  omborchi: "Omborchi",
  buxgalter: "Buxgalter",
  kassir: "Kassir",
  auditor: "Auditor",
  firma: "Firma operatori",
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-50 border-red-600 text-red-700",
  omborchi: "bg-navy-50 border-navy-700 text-navy-700",
  buxgalter: "bg-emerald-50 border-emerald-600 text-emerald-700",
  kassir: "bg-amber-50 border-amber-600 text-amber-600",
  auditor: "bg-ink-100 border-ink-400 text-ink-700",
  firma: "bg-navy-50 border-navy-700 text-navy-700",
};

const STATUS_STYLES: Record<
  User["status"],
  { dot: string; text: string; label: string; bg: string; border: string }
> = {
  active: {
    dot: "bg-emerald-600",
    text: "text-emerald-700",
    label: "Faol",
    bg: "bg-emerald-50",
    border: "border-emerald-600",
  },
  blocked: {
    dot: "bg-red-600",
    text: "text-red-700",
    label: "Bloklangan",
    bg: "bg-red-50",
    border: "border-red-600",
  },
  pending: {
    dot: "bg-amber-500",
    text: "text-amber-600",
    label: "Kutilmoqda",
    bg: "bg-amber-50",
    border: "border-amber-600",
  },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatLastLogin(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

function FoydalanuvchilarTab({ users }: { users: User[] }) {
  const { success, error, info } = useToast();
  const [, startTransition] = useTransition();

  const [inviteOpen, setInviteOpen] = useState(false);

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    // keep user data briefly so the modal exit animation (if any) doesn't flash empty
    setTimeout(() => setEditUser(null), 150);
  };

  const handleToggleStatus = (user: User) => {
    startTransition(async () => {
      try {
        const res = await toggleUserStatusAction(user.id);
        if (res.ok && res.user) {
          if (res.user.status === "active") {
            success("Foydalanuvchi aktivlashtirildi", user.fullName);
          } else {
            info("Foydalanuvchi bloklandi", user.fullName);
          }
        } else {
          error("Xatolik yuz berdi", "Statusni o'zgartirib bo'lmadi");
        }
      } catch {
        error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
      }
    });
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    setDeletePending(true);
    try {
      const res = await deleteUserAction(deleteUser.id);
      if (res.ok) {
        success("Foydalanuvchi o'chirildi", deleteUser.fullName);
        setDeleteUser(null);
      } else {
        error("Xatolik yuz berdi", "Foydalanuvchini o'chirib bo'lmadi");
      }
    } catch {
      error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Foydalanuvchilar ({users.length})</CardTitle>
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="size-4" />
            Yangi foydalanuvchi
          </Button>
        </CardHeader>

        <div className="grid grid-cols-[1.4fr_1fr_160px_140px_140px_60px] items-center gap-4 border-b border-border bg-ink-100/50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
          <span>F.I.O.</span>
          <span>Telefon</span>
          <span>Rol</span>
          <span>Status</span>
          <span>Oxirgi kirish</span>
          <span></span>
        </div>

        {users.length === 0 && (
          <div className="px-5 py-10 text-center text-[13px] text-ink-500">
            Hozircha foydalanuvchilar yo&apos;q
          </div>
        )}

        {users.map((user) => {
          const statusStyle = STATUS_STYLES[user.status];
          const isCurrentUser = user.id === CURRENT_USER_ID;
          const isBlocked = user.status === "blocked";

          return (
            <div
              key={user.id}
              className="grid grid-cols-[1.4fr_1fr_160px_140px_140px_60px] items-center gap-4 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/40"
            >
              {/* F.I.O. + email */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-700 text-white text-[11px] font-bold">
                  {getInitials(user.fullName)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-ink-900 truncate">
                      {user.fullName}
                    </span>
                    {isCurrentUser && (
                      <span className="shrink-0 rounded-sm bg-navy-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-navy-700">
                        Siz
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-ink-500 truncate font-mono mt-0.5">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="min-w-0">
                <div className="text-[12px] text-ink-700 truncate font-mono">
                  {user.phone}
                </div>
              </div>

              {/* Role */}
              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase",
                  ROLE_COLORS[user.role]
                )}
              >
                {ROLE_LABELS[user.role]}
              </span>

              {/* Status */}
              <span
                className={cn(
                  "inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase",
                  statusStyle.bg,
                  statusStyle.border,
                  statusStyle.text
                )}
              >
                <span className={cn("size-1.5 rounded-full", statusStyle.dot)} />
                {statusStyle.label}
              </span>

              {/* Last login */}
              <span className="font-mono text-[11px] text-ink-500">
                {formatLastLogin(user.lastLogin)}
              </span>

              {/* Actions */}
              <div className="justify-self-end">
                <Dropdown>
                  <DropdownItem
                    icon={<Pencil className="size-3.5" />}
                    onClick={() => openEdit(user)}
                  >
                    Rolni o&apos;zgartirish
                  </DropdownItem>
                  <DropdownItem
                    icon={
                      isBlocked ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Lock className="size-3.5" />
                      )
                    }
                    onClick={() => handleToggleStatus(user)}
                    disabled={user.status === "pending"}
                  >
                    {isBlocked ? "Aktivlashtirish" : "Bloklash"}
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem
                    icon={<Trash2 className="size-3.5" />}
                    variant="danger"
                    onClick={() => setDeleteUser(user)}
                    disabled={isCurrentUser}
                  >
                    O&apos;chirish
                  </DropdownItem>
                </Dropdown>
              </div>
            </div>
          );
        })}
      </Card>

      {/* RBAC accordion summary */}
      <Card>
        <CardHeader>
          <CardTitle>Rol asosida ruxsatlar (RBAC)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[12px]">
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase shrink-0 mt-0.5",
                  ROLE_COLORS.admin
                )}
              >
                Administrator
              </span>
              <span className="text-ink-600">
                To&apos;liq nazorat · sozlamalar · foydalanuvchilar · audit log
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase shrink-0 mt-0.5",
                  ROLE_COLORS.omborchi
                )}
              >
                Omborchi
              </span>
              <span className="text-ink-600">
                Hujjat tasdiqlash · ombor · MXIK tahrir
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase shrink-0 mt-0.5",
                  ROLE_COLORS.buxgalter
                )}
              >
                Buxgalter
              </span>
              <span className="text-ink-600">
                Hisobotlar · eksport · faqat o&apos;qish
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase shrink-0 mt-0.5",
                  ROLE_COLORS.kassir
                )}
              >
                Kassir
              </span>
              <span className="text-ink-600">
                Sotuv · qoldiq ko&apos;rish · narx tahrir
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase shrink-0 mt-0.5",
                  ROLE_COLORS.auditor
                )}
              >
                Auditor
              </span>
              <span className="text-ink-600">
                Faqat o&apos;qish · audit log · hisobot eksport
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase shrink-0 mt-0.5",
                  ROLE_COLORS.firma
                )}
              >
                Firma operatori
              </span>
              <span className="text-ink-600">
                Distribyutor uchun · firma hujjatlari boshqaruvi
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      <EditUserRoleModal
        open={editOpen}
        onClose={closeEdit}
        user={editUser}
      />

      <Confirm
        open={!!deleteUser}
        onClose={() => (deletePending ? undefined : setDeleteUser(null))}
        onConfirm={confirmDelete}
        title="Foydalanuvchini o'chirish?"
        description={
          deleteUser
            ? `"${deleteUser.fullName}" tizimdan butunlay o'chiriladi. Uning auditdagi tarixi saqlanadi.`
            : undefined
        }
        confirmLabel="O'chirish"
        variant="danger"
        loading={deletePending}
      />
    </div>
  );
}

/* ============================
   TAB 4: Bildirishnomalar
   ============================ */

interface ToggleItem {
  label: string;
  defaultOn: boolean;
}

interface NotificationGroup {
  title: string;
  subtitle?: string;
  items: ToggleItem[];
}

const notificationGroups: NotificationGroup[] = [
  {
    title: "Email orqali",
    subtitle: "aziz@karimov-mchj.uz",
    items: [
      { label: "Yangi hujjat keldi", defaultOn: true },
      { label: "Kritik qoldiq alert", defaultOn: true },
      { label: "Kunlik xulosa (har kuni 18:00)", defaultOn: false },
      { label: "Haftalik hisobot (har dushanba 09:00)", defaultOn: false },
    ],
  },
  {
    title: "SMS orqali",
    subtitle: "+998 90 123 45 67",
    items: [
      { label: "Kritik qoldiq alert (faqat ish vaqtida)", defaultOn: true },
      { label: "MXIK xato (review kutmoqda)", defaultOn: false },
    ],
  },
  {
    title: "Push (mobile)",
    subtitle: "iOS · Android",
    items: [{ label: "Barcha bildirishnomalar", defaultOn: true }],
  },
  {
    title: "Telegram Bot",
    subtitle: "@retailflow_bot",
    items: [
      { label: "Yangi hujjat", defaultOn: true },
      { label: "AI Insights kunlik xulosa (09:00)", defaultOn: true },
    ],
  },
];

function Switch({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
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

function BildirishnomalarTab() {
  return (
    <div className="space-y-4">
      {notificationGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <div>
              <CardTitle>{group.title}</CardTitle>
              {group.subtitle && (
                <p className="mt-1 font-mono text-[11px] text-ink-500">
                  {group.subtitle}
                </p>
              )}
            </div>
          </CardHeader>
          <div>
            {group.items.map((item, i) => (
              <label
                key={i}
                className="flex items-center justify-between border-b border-border px-5 py-3 last:border-0 cursor-pointer hover:bg-ink-100/40"
              >
                <span className="text-[13px] text-ink-700">{item.label}</span>
                <Switch defaultOn={item.defaultOn} />
              </label>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ============================
   TAB 5: To'lov va tarif
   ============================ */

interface Plan {
  name: string;
  price: string;
  priceNote?: string;
  features: string[];
  cta: string;
  ctaVariant: "primary" | "secondary" | "emerald";
  current?: boolean;
}

const plans: Plan[] = [
  {
    name: "Beta",
    price: "Bepul",
    priceNote: "2026-11-21 gacha",
    features: ["Cheksiz hujjat", "5 foydalanuvchi", "AI Insights kunlik", "Email yordam"],
    cta: "Joriy tarif",
    ctaVariant: "secondary",
    current: true,
  },
  {
    name: "Pro",
    price: "299 000 so'm",
    priceNote: "har oyda",
    features: [
      "Cheksiz hujjat",
      "15 foydalanuvchi",
      "AI Insights real-time",
      "Priority yordam (4 soat)",
      "1C integratsiya",
    ],
    cta: "Yangilash",
    ctaVariant: "primary",
  },
  {
    name: "Enterprise",
    price: "Maxsus",
    priceNote: "shartnoma asosida",
    features: [
      "Cheksiz foydalanuvchi",
      "Multi-tenant (distribyutor)",
      "Custom AI model",
      "Dedicated support manager",
      "SLA 99.9%",
    ],
    cta: "Bog'laning",
    ctaVariant: "secondary",
  },
];

function TarifTab() {
  return (
    <div className="space-y-4">
      {/* Current plan summary */}
      <Card>
        <CardContent className="flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-50 border border-emerald-600 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-emerald-700">
                Joriy tarif
              </span>
              <h3 className="text-2xl font-bold text-ink-900">Beta (Bepul)</h3>
            </div>
            <p className="mt-2 text-[13px] text-ink-500">
              Beta tugashi:{" "}
              <span className="font-mono font-semibold text-ink-900">
                2026-11-21
              </span>{" "}
              · 6 oydan keyin
            </p>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              Hozirgi foydalanish
            </div>
            <div className="mt-1 font-mono text-[13px] text-ink-900">
              <span className="font-bold">47</span> hujjat / cheksiz
            </div>
            <div className="font-mono text-[13px] text-ink-900">
              <span className="font-bold">3</span> foydalanuvchi / 5
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan cards */}
      <div className="grid grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "flex flex-col p-5",
              plan.current && "border-emerald-600 border-2"
            )}
          >
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink-900">{plan.name}</h3>
                {plan.current && (
                  <span className="rounded-full bg-emerald-50 border border-emerald-600 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-700 uppercase">
                    Joriy
                  </span>
                )}
              </div>
              <div className="mt-2 font-mono text-2xl font-bold text-ink-900">
                {plan.price}
              </div>
              {plan.priceNote && (
                <div className="mt-1 text-[12px] text-ink-500">
                  {plan.priceNote}
                </div>
              )}
            </div>
            <ul className="flex-1 space-y-2 mb-5">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-[13px] text-ink-700"
                >
                  <Check
                    className="size-4 text-emerald-600 shrink-0 mt-0.5"
                    strokeWidth={2.5}
                  />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.ctaVariant === "emerald" ? "emerald" : plan.ctaVariant}
              disabled={plan.current}
              className="w-full"
            >
              {plan.cta}
            </Button>
          </Card>
        ))}
      </div>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle>To&apos;lov usuli</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[13px] text-ink-500">
            <div className="grid size-10 place-items-center rounded-md bg-ink-100 text-ink-400">
              <CreditCard className="size-5" />
            </div>
            <span>Belgilanmagan — Beta bosqichida to&apos;lov shart emas</span>
          </div>
          <Button variant="secondary">
            <Plus className="size-4" />
            Karta qo&apos;shish
          </Button>
        </CardContent>
      </Card>

      {/* Invoice history */}
      <Card>
        <CardHeader>
          <CardTitle>Hisob-faktura tarixi</CardTitle>
        </CardHeader>
        <CardContent className="py-10 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-ink-100 text-ink-400 mb-3">
            <CreditCard className="size-6" />
          </div>
          <div className="text-[14px] font-medium text-ink-700">
            Beta bosqichida to&apos;lovlar yo&apos;q
          </div>
          <div className="mt-1 text-[12px] text-ink-500">
            Pro yoki Enterprise tarifga o&apos;tganingizdan keyin bu yerda ko&apos;rinadi
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
