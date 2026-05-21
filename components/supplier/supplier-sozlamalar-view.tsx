"use client";

import { useState } from "react";
import {
  Pencil,
  Plus,
  Check,
  Building2,
  Plug,
  ShieldCheck,
  Bot,
  Brain,
  CreditCard,
  Trash2,
  Lock,
  CheckCircle2,
  Warehouse,
  Tag,
  Percent,
  Package,
  Truck,
} from "lucide-react";
import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { cn, formatSom, formatDate } from "@/lib/utils";
import type { SupplierCompany } from "@/lib/types";

type TabId =
  | "korxona"
  | "integratsiyalar"
  | "jamoa"
  | "narxlash"
  | "tarif";

const tabs: { id: TabId; label: string }[] = [
  { id: "korxona", label: "Korxona" },
  { id: "integratsiyalar", label: "Integratsiyalar" },
  { id: "jamoa", label: "Jamoa" },
  { id: "narxlash", label: "Narxlash siyosati" },
  { id: "tarif", label: "Tarif va to'lov" },
];

interface SupplierSozlamalarViewProps {
  company: SupplierCompany;
}

export function SupplierSozlamalarView({
  company,
}: SupplierSozlamalarViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("korxona");

  return (
    <>
      <SupplierTopbar
        breadcrumb={[{ label: "Supplier" }, { label: "Sozlamalar" }]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">
              Sozlamalar
            </h1>
            <p className="mt-1 text-[13px] text-ink-500">
              Korxona, integratsiyalar, jamoa, narxlash, tarif
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
                    : "text-ink-600 hover:bg-ink-100",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "korxona" && <KorxonaTab company={company} />}
          {activeTab === "integratsiyalar" && <IntegratsiyalarTab />}
          {activeTab === "jamoa" && <JamoaTab />}
          {activeTab === "narxlash" && <NarxlashTab />}
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
            mono && "font-mono font-semibold",
          )}
        >
          {value}
        </span>
        {badge}
      </div>
    </div>
  );
}

const BRAND_TYPE_LABEL: Record<SupplierCompany["brandType"], string> = {
  local: "Mahalliy",
  international: "Xalqaro",
  exclusive: "Eksklyuziv",
};

function KorxonaTab({ company }: { company: SupplierCompany }) {
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
          value={company.stir}
          mono
          badge={
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-300">
              <Check className="size-3" strokeWidth={2.5} />
              Tasdiqlangan
            </span>
          }
        />
        <Field label="Korxona nomi" value={company.name} />
        <Field label="Direktor" value={company.director} />
        <Field
          label="Brand turi"
          value={BRAND_TYPE_LABEL[company.brandType]}
          badge={
            company.brandType === "exclusive" ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-600 bg-amber-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-300">
                Eksklyuziv kontrakt
              </span>
            ) : null
          }
        />
        <Field label="HQ region" value={company.region} />
        <Field
          label="Avtopark"
          value={`${company.fleetSize} ta avtomashina`}
          mono
        />
        <Field label="Ombor manzili" value={company.warehouseAddress} />
        <Field label="Yuridik manzil" value={company.address} />
        <Field label="Telefon" value={company.phone} mono />
        <Field label="Email" value={company.email} mono />
        <Field
          label="Tashkil etilgan"
          value={formatDate(company.createdAt)}
          mono
        />
      </CardContent>
      <div className="flex justify-end border-t border-border px-5 py-4">
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

interface SupplierIntegration {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  active: boolean;
  description: string;
  primaryAction: { label: string; variant: "primary" | "secondary" };
  secondaryAction?: { label: string };
}

const SUPPLIER_INTEGRATIONS: SupplierIntegration[] = [
  {
    id: "didox",
    name: "Didox EDO",
    icon: Building2,
    iconColor: "bg-navy-700 text-white",
    active: true,
    description: "Avto-yuborilgan invoice'lar &middot; 200+ hujjat oxirgi 30 kunda",
    primaryAction: { label: "Sozlash", variant: "secondary" },
    secondaryAction: { label: "O'chirish" },
  },
  {
    id: "soliq-mxik",
    name: "Soliq.uz MXIK",
    icon: ShieldCheck,
    iconColor: "bg-emerald-600 text-white",
    active: true,
    description: "Oxirgi sync: 21.05.2026 06:00 &middot; 461 950 kod",
    primaryAction: { label: "Qo'lda sync", variant: "secondary" },
  },
  {
    id: "1c-erp",
    name: "1C ERP",
    icon: Plug,
    iconColor: "bg-ink-200 text-ink-700",
    active: false,
    description: "Ombor + buxgalteriya bilan 2-tomonlama sinxronizatsiya",
    primaryAction: { label: "Ulanish", variant: "primary" },
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    icon: Bot,
    iconColor: "bg-navy-600 text-white",
    active: true,
    description: "@alpha_distrib_bot &middot; 12 sotuv menejeri ulangan",
    primaryAction: { label: "Sozlash", variant: "secondary" },
  },
  {
    id: "wms",
    name: "WMS / Warehouse system",
    icon: Warehouse,
    iconColor: "bg-ink-200 text-ink-700",
    active: false,
    description: "Sergeli ombori uchun mahalliy WMS bilan integratsiya",
    primaryAction: { label: "Ulanish", variant: "primary" },
  },
  {
    id: "openai",
    name: "OpenAI API",
    icon: Brain,
    iconColor: "bg-emerald-700 text-white",
    active: true,
    description:
      "Custom key (cost tracking yoqilgan) &middot; GPT-4o + embedding-3-small",
    primaryAction: { label: "Almashtirish", variant: "secondary" },
  },
];

function IntegratsiyalarTab() {
  return (
    <div className="space-y-3">
      {SUPPLIER_INTEGRATIONS.map((int) => {
        const Icon = int.icon;
        return (
          <Card key={int.id} className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-md",
                  int.iconColor,
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
                        ? "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300"
                        : "bg-ink-100 border-ink-300 text-ink-500",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        int.active ? "bg-emerald-600" : "bg-ink-400",
                      )}
                    />
                    {int.active ? "Faol" : "Ulanmagan"}
                  </span>
                </div>
                <div
                  className="mt-1 text-[12px] text-ink-500 font-mono truncate"
                  dangerouslySetInnerHTML={{ __html: int.description }}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant={int.primaryAction.variant} size="sm">
                  {int.primaryAction.label}
                </Button>
                {int.secondaryAction && (
                  <Button variant="ghost" size="sm">
                    {int.secondaryAction.label}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ============================
   TAB 3: Jamoa
   ============================ */

interface TeamMember {
  id: string;
  fullName: string;
  initials: string;
  role: string;
  roleColor: string;
  status: "active" | "blocked" | "pending";
  lastLogin: string;
  email: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "t1",
    fullName: "Asror Tursunov",
    initials: "AT",
    role: "Administrator",
    roleColor: "bg-red-50 border-red-600 text-red-700 dark:text-red-300",
    status: "active",
    lastLogin: "21.05.2026 09:15",
    email: "asror@alpha-distribution.uz",
  },
  {
    id: "t2",
    fullName: "Karim Akmalov",
    initials: "KA",
    role: "Sotuv menejeri",
    roleColor:
      "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
    status: "active",
    lastLogin: "21.05.2026 08:42",
    email: "karim@alpha-distribution.uz",
  },
  {
    id: "t3",
    fullName: "Dilshod Tursunov",
    initials: "DT",
    role: "Logistika menejeri",
    roleColor: "bg-amber-50 border-amber-600 text-amber-600 dark:text-amber-300",
    status: "active",
    lastLogin: "21.05.2026 07:30",
    email: "dilshod@alpha-distribution.uz",
  },
  {
    id: "t4",
    fullName: "Sevara Yusupova",
    initials: "SY",
    role: "Buxgalter",
    roleColor: "bg-navy-50 border-navy-700 text-navy-700 dark:text-navy-300",
    status: "active",
    lastLogin: "20.05.2026 18:22",
    email: "sevara@alpha-distribution.uz",
  },
  {
    id: "t5",
    fullName: "Bobur Saidov",
    initials: "BS",
    role: "Sotuv rep (Toshkent)",
    roleColor:
      "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
    status: "active",
    lastLogin: "21.05.2026 09:48",
    email: "bobur@alpha-distribution.uz",
  },
  {
    id: "t6",
    fullName: "Jasur Rahmonov",
    initials: "JR",
    role: "Sotuv rep (Samarqand)",
    roleColor:
      "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
    status: "active",
    lastLogin: "21.05.2026 08:10",
    email: "jasur@alpha-distribution.uz",
  },
  {
    id: "t7",
    fullName: "Madina Olimova",
    initials: "MO",
    role: "Sotuv rep (Buxoro)",
    roleColor:
      "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
    status: "pending",
    lastLogin: "—",
    email: "madina@alpha-distribution.uz",
  },
  {
    id: "t8",
    fullName: "Otabek Mahmudov",
    initials: "OM",
    role: "Sotuv rep (Farg'ona)",
    roleColor:
      "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
    status: "blocked",
    lastLogin: "18.04.2026 14:30",
    email: "otabek@alpha-distribution.uz",
  },
];

const STATUS_META: Record<
  TeamMember["status"],
  { dot: string; text: string; label: string; bg: string; border: string }
> = {
  active: {
    dot: "bg-emerald-600",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "Faol",
    bg: "bg-emerald-50",
    border: "border-emerald-600",
  },
  blocked: {
    dot: "bg-red-600",
    text: "text-red-700 dark:text-red-300",
    label: "Bloklangan",
    bg: "bg-red-50",
    border: "border-red-600",
  },
  pending: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-300",
    label: "Taklif yuborilgan",
    bg: "bg-amber-50",
    border: "border-amber-600",
  },
};

function JamoaTab() {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Jamoa ({TEAM_MEMBERS.length})</CardTitle>
        <Button>
          <Plus className="size-4" />
          Yangi xodim
        </Button>
      </CardHeader>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[1.4fr_1.2fr_180px_140px_140px_60px] items-center gap-4 border-b border-border bg-ink-100/40 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
            <span>F.I.O.</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Status</span>
            <span>Oxirgi kirish</span>
            <span></span>
          </div>
          {TEAM_MEMBERS.map((m) => {
            const st = STATUS_META[m.status];
            return (
              <div
                key={m.id}
                className="grid grid-cols-[1.4fr_1.2fr_180px_140px_140px_60px] items-center gap-4 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-700 text-white text-[11px] font-bold">
                    {m.initials}
                  </div>
                  <span className="text-sm font-semibold text-ink-900 truncate">
                    {m.fullName}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-ink-500 truncate">
                  {m.email}
                </span>
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase",
                    m.roleColor,
                  )}
                >
                  {m.role}
                </span>
                <span
                  className={cn(
                    "inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase",
                    st.bg,
                    st.border,
                    st.text,
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", st.dot)} />
                  {st.label}
                </span>
                <span className="font-mono text-[11px] text-ink-500">
                  {m.lastLogin}
                </span>
                <div className="justify-self-end">
                  <Dropdown>
                    <DropdownItem icon={<Pencil className="size-3.5" />}>
                      Rolni o&apos;zgartirish
                    </DropdownItem>
                    <DropdownItem
                      icon={
                        m.status === "blocked" ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <Lock className="size-3.5" />
                        )
                      }
                    >
                      {m.status === "blocked" ? "Aktivlashtirish" : "Bloklash"}
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem
                      icon={<Trash2 className="size-3.5" />}
                      variant="danger"
                    >
                      O&apos;chirish
                    </DropdownItem>
                  </Dropdown>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

/* ============================
   TAB 4: Narxlash siyosati
   ============================ */

interface PricingRule {
  id: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  active: boolean;
}

const PRICING_RULES: PricingRule[] = [
  {
    id: "vip",
    title: "VIP mijozlar uchun 8% chegirma",
    body: "Oylik aylanmasi 50M+ so'mdan oshgan do'konlarga avtomatik qo'llanadi",
    icon: Percent,
    color: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
    active: true,
  },
  {
    id: "new",
    title: "Yangi mahsulot 5% promotion",
    body: "Katalogga qo'shilgan dastlabki 30 kun ichida barcha do'konlarga 5% chegirma",
    icon: Tag,
    color: "bg-navy-50 border-navy-700 text-navy-700 dark:text-navy-300",
    active: true,
  },
  {
    id: "bulk",
    title: "Bulk discount: 1000+ unit 3% qo'shimcha",
    body: "Bitta hujjatda 1000+ dona buyurtma berilsa, qo'shimcha 3% chegirma",
    icon: Package,
    color: "bg-amber-50 border-amber-600 text-amber-600 dark:text-amber-300",
    active: true,
  },
  {
    id: "region",
    title: "Yangi region uchun bepul yetkazib berish",
    body: "Surxondaryo, Qoraqalpog'iston bo'yicha yangi mijozlarga 3 oy bepul logistika",
    icon: Truck,
    color: "bg-ink-100 border-ink-400 text-ink-700",
    active: false,
  },
];

function NarxlashTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Narxlash qoidalari ({PRICING_RULES.length})</CardTitle>
          <Button>
            <Plus className="size-4" />
            Yangi qoida
          </Button>
        </CardHeader>
        <div>
          {PRICING_RULES.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                className="flex items-start gap-4 border-b border-border px-5 py-4 last:border-0 hover:bg-ink-100/40"
              >
                <div
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-md border",
                    r.color,
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[14px] font-semibold text-ink-900">
                      {r.title}
                    </h4>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase",
                        r.active
                          ? "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300"
                          : "bg-ink-100 border-ink-300 text-ink-500",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          r.active ? "bg-emerald-600" : "bg-ink-400",
                        )}
                      />
                      {r.active ? "Faol" : "O'chiq"}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-ink-600">{r.body}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm">
                    <Pencil className="size-3.5" />
                    Tahrirlash
                  </Button>
                  <Dropdown>
                    <DropdownItem icon={<Trash2 className="size-3.5" />} variant="danger">
                      O&apos;chirish
                    </DropdownItem>
                  </Dropdown>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ============================
   TAB 5: Tarif va to'lov
   ============================ */

const BILLING_HISTORY = [
  {
    id: "b1",
    period: "Aprel 2026",
    amount: 2_500_000,
    paidAt: "01.05.2026",
    status: "paid",
  },
  {
    id: "b2",
    period: "Mart 2026",
    amount: 2_500_000,
    paidAt: "02.04.2026",
    status: "paid",
  },
  {
    id: "b3",
    period: "Fevral 2026",
    amount: 2_500_000,
    paidAt: "01.03.2026",
    status: "paid",
  },
  {
    id: "b4",
    period: "Yanvar 2026",
    amount: 2_500_000,
    paidAt: "31.01.2026",
    status: "paid",
  },
];

function TarifTab() {
  return (
    <div className="space-y-4">
      {/* Current plan summary */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-50 border border-emerald-600 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                Joriy tarif
              </span>
              <h3 className="text-2xl font-bold text-ink-900">Pro Distributor</h3>
            </div>
            <p className="mt-2 text-[13px] text-ink-500">
              Keyingi to&apos;lov:{" "}
              <span className="font-mono font-semibold text-ink-900">
                15.06.2026
              </span>{" "}
              &middot; 25 kun qoldi
            </p>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              Oylik to&apos;lov
            </div>
            <div className="mt-1 font-mono text-3xl font-bold text-ink-900">
              {formatSom(2_500_000)}
            </div>
            <div className="mt-1 font-mono text-[11px] text-ink-500">
              ~$197 / oy
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan features */}
      <Card>
        <CardHeader>
          <CardTitle>Tarif imkoniyatlari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Cheksiz do'konlar (hozir 47)",
              "Cheksiz hujjatlar",
              "Real-time talab signali",
              "AI Insights (har soat)",
              "20 jamoa a'zosi",
              "Priority yordam (1 soat)",
              "Custom narxlash qoidalari",
              "1C/ERP integratsiya",
              "Multi-region tracking",
            ].map((f) => (
              <div
                key={f}
                className="flex items-start gap-2 text-[13px] text-ink-700"
              >
                <Check
                  className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                  strokeWidth={2.5}
                />
                {f}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle>To&apos;lov usuli</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-navy-700 text-white">
              <CreditCard className="size-5" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-ink-900">
                Humo Card &middot;&middot;&middot;&middot; 4892
              </div>
              <div className="font-mono text-[11px] text-ink-500">
                Avto-to&apos;lov yoqilgan &middot; har oy 1-sanasi
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            <Pencil className="size-3.5" />
            O&apos;zgartirish
          </Button>
        </CardContent>
      </Card>

      {/* Invoice history */}
      <Card>
        <CardHeader>
          <CardTitle>Hisob-faktura tarixi</CardTitle>
        </CardHeader>
        <div>
          <div className="grid grid-cols-[1fr_140px_140px_120px] items-center gap-4 border-b border-border bg-ink-100/40 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
            <span>Davr</span>
            <span className="text-right">Summa</span>
            <span>To&apos;lov sanasi</span>
            <span>Status</span>
          </div>
          {BILLING_HISTORY.map((b) => (
            <div
              key={b.id}
              className="grid grid-cols-[1fr_140px_140px_120px] items-center gap-4 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/40"
            >
              <span className="text-[13px] font-medium text-ink-900">
                {b.period}
              </span>
              <span className="text-right font-mono text-[13px] font-semibold text-ink-900">
                {formatSom(b.amount)}
              </span>
              <span className="font-mono text-[12px] text-ink-600">
                {b.paidAt}
              </span>
              <span className="inline-flex w-fit items-center gap-1 rounded-full border border-emerald-600 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                <Check className="size-3" />
                To&apos;langan
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
