"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bot,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  History,
  Lock,
  Mail,
  Pencil,
  Plus,
  Send,
  SkipForward,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { inviteTeamAction } from "@/lib/actions/auth";

// ===================== TYPES =====================

type Step = 1 | 2 | 3 | 4 | 5;

type ProductMethod = "excel" | "didox" | "later" | null;

type IntegrationId = "didox" | "mxik" | "pos" | "telegram" | "sheets";

type Integration = {
  id: IntegrationId;
  title: string;
  description: string;
  defaultChecked: boolean;
  locked?: boolean;
  Icon: typeof FileText;
};

const INTEGRATIONS: Integration[] = [
  {
    id: "didox",
    title: "Didox EDO",
    description: "Hujjatlarni avtomatik qabul qilish",
    defaultChecked: true,
    Icon: FileText,
  },
  {
    id: "mxik",
    title: "Soliq.uz MXIK",
    description: "Real-time kod tekshirish",
    defaultChecked: true,
    locked: true,
    Icon: BadgeCheck,
  },
  {
    id: "pos",
    title: "POS / 1C",
    description: "Sotuv ma'lumotlarini sinxronlash",
    defaultChecked: false,
    Icon: Boxes,
  },
  {
    id: "telegram",
    title: "Telegram Bot",
    description: "Bildirishnomalar va tezkor amallar",
    defaultChecked: false,
    Icon: Bot,
  },
  {
    id: "sheets",
    title: "Google Sheets",
    description: "Excel eksportni avto-sync",
    defaultChecked: false,
    Icon: FileSpreadsheet,
  },
];

type InviteRow = {
  email: string;
  role: string;
};

const ROLES = [
  "Omborchi",
  "Kassir",
  "Firma operatori",
  "Buxgalter",
  "Rahbar",
  "Auditor",
];

type FormState = {
  productMethod: ProductMethod;
  integrations: Record<IntegrationId, boolean>;
  invites: InviteRow[];
};

const INITIAL_FORM: FormState = {
  productMethod: null,
  integrations: INTEGRATIONS.reduce(
    (acc, i) => ({ ...acc, [i.id]: i.defaultChecked }),
    {} as Record<IntegrationId, boolean>
  ),
  invites: [{ email: "", role: ROLES[0] }],
};

const STORAGE_KEY_STEP = "retailflow.onboarding.step";
const STORAGE_KEY_FORM = "retailflow.onboarding.form";

const STEPS_META = [
  { n: 1, title: "Korxona" },
  { n: 2, title: "Mahsulotlar" },
  { n: 3, title: "Integratsiyalar" },
  { n: 4, title: "Jamoa" },
  { n: 5, title: "Tayyor" },
];

const KORXONA_MOCK = {
  nomi: "Karimov MChJ",
  stir: "301234567",
  manzil: "Toshkent shahar, Chilonzor tumani",
  faoliyat: "Chakana savdo (47.11)",
};

const CURRENT_USER_EMAIL = "alisher@karimov.uz";

// ===================== PAGE =====================

export default function OnboardingPage() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [hydrated, setHydrated] = useState(false);
  const [inviting, startInviting] = useTransition();

  // Load from localStorage
  useEffect(() => {
    try {
      const rawStep = localStorage.getItem(STORAGE_KEY_STEP);
      const rawForm = localStorage.getItem(STORAGE_KEY_FORM);
      if (rawStep) {
        const n = parseInt(rawStep, 10);
        if (n >= 1 && n <= 5) setStep(n as Step);
      }
      if (rawForm) {
        const parsed = JSON.parse(rawForm) as Partial<FormState>;
        setForm((f) => ({
          ...f,
          ...parsed,
          integrations: {
            ...f.integrations,
            ...(parsed.integrations ?? {}),
          },
          invites:
            parsed.invites && parsed.invites.length > 0
              ? parsed.invites
              : f.invites,
        }));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_STEP, String(step));
      localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(form));
    } catch {
      // ignore
    }
  }, [step, form, hydrated]);

  function goNext() {
    setStep((s) => (Math.min(5, s + 1) as Step));
  }
  function goBack() {
    setStep((s) => (Math.max(1, s - 1) as Step));
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // ===== STEP 2 helpers =====
  function selectMethod(m: NonNullable<ProductMethod>) {
    update("productMethod", m);
  }

  // ===== STEP 3 helpers =====
  function toggleIntegration(id: IntegrationId) {
    const meta = INTEGRATIONS.find((i) => i.id === id);
    if (meta?.locked) return;
    setForm((f) => ({
      ...f,
      integrations: { ...f.integrations, [id]: !f.integrations[id] },
    }));
  }

  // ===== STEP 4 helpers =====
  function addInvite() {
    if (form.invites.length >= 3) return;
    setForm((f) => ({
      ...f,
      invites: [...f.invites, { email: "", role: ROLES[0] }],
    }));
  }
  function removeInvite(idx: number) {
    setForm((f) => ({
      ...f,
      invites: f.invites.filter((_, i) => i !== idx),
    }));
  }
  function updateInvite(idx: number, patch: Partial<InviteRow>) {
    setForm((f) => ({
      ...f,
      invites: f.invites.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    }));
  }

  // ===== Finish =====
  function finish() {
    try {
      localStorage.removeItem(STORAGE_KEY_STEP);
      localStorage.removeItem(STORAGE_KEY_FORM);
    } catch {
      // ignore
    }
    router.push("/dashboard");
  }

  // ===================== RENDER =====================

  return (
    <div className="w-full max-w-2xl">
      {/* Heading */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          Xush kelibsiz, {KORXONA_MOCK.nomi}! <span aria-hidden>👋</span>
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
          Tizimni ishga tushirish uchun 5 ta tezkor qadam
        </p>
      </div>

      {/* Progress */}
      <ProgressBar current={step} />

      <Card className="shadow-md">
        <div className="p-6 sm:p-8">
          {step === 1 && (
            <Step1Confirm
              onContinue={goNext}
              onEdit={() => toast.info("Tahrirlash imkoniyati", "Bu funksiya tez orada qo'shiladi.")}
            />
          )}

          {step === 2 && (
            <Step2Products
              method={form.productMethod}
              onSelect={selectMethod}
              onContinue={goNext}
              onBack={goBack}
              onSkip={() => {
                update("productMethod", "later");
                goNext();
              }}
            />
          )}

          {step === 3 && (
            <Step3Integrations
              values={form.integrations}
              onToggle={toggleIntegration}
              onContinue={goNext}
              onBack={goBack}
              onSkip={goNext}
            />
          )}

          {step === 4 && (
            <Step4Team
              invites={form.invites}
              inviting={inviting}
              onAdd={addInvite}
              onRemove={removeInvite}
              onUpdate={updateInvite}
              onContinue={(e) => {
                e.preventDefault();
                const cleaned = form.invites
                  .filter((row) => row.email.trim().length > 0)
                  .map((row) => ({
                    // Form field is `email`; backend takes `phone`. If the
                    // value looks like a phone (mostly digits), use it as the
                    // phone, else pass it through as email and let the server
                    // action's normaliser try to coerce it.
                    phone: /^[+\d\s\-()]+$/.test(row.email) ? row.email : "",
                    email: /^[+\d\s\-()]+$/.test(row.email) ? undefined : row.email,
                    role: row.role,
                  }))
                  .filter((r) => r.phone || r.email);
                if (cleaned.length === 0) {
                  goNext();
                  return;
                }
                startInviting(async () => {
                  const res = await inviteTeamAction(
                    cleaned.map((r) => ({
                      phone: r.phone || "",
                      email: r.email,
                      role: r.role,
                    })),
                  );
                  if (!res.ok) {
                    toast.error("Takliflarni yuborib bo'lmadi", res.error);
                    return;
                  }
                  if (res.failed.length > 0) {
                    toast.warning(
                      `${res.succeeded} ta yuborildi, ${res.failed.length} ta xato`,
                      res.failed.map((f) => `${f.phone}: ${f.error}`).join("\n"),
                    );
                  } else if (res.succeeded > 0) {
                    toast.success(
                      `${res.succeeded} ta taklif yuborildi`,
                      "A'zolar SMS orqali bog'lanish kodi oladi.",
                    );
                  }
                  goNext();
                });
              }}
              onBack={goBack}
              onSkip={goNext}
            />
          )}

          {step === 5 && <Step5Done onFinish={finish} />}
        </div>
      </Card>

      {step < 5 && (
        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-wider text-ink-500">
          Qadam {step} / 5
        </p>
      )}
    </div>
  );
}

// ===================== PROGRESS BAR =====================

function ProgressBar({ current }: { current: Step }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2">
        {STEPS_META.map((s, i) => {
          const isDone = s.n < current;
          const isCurrent = s.n === current;
          return (
            <div key={s.n} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "grid size-7 place-items-center rounded-full border font-mono text-[11px] font-semibold transition-colors",
                    isDone && "border-emerald-600 bg-emerald-600 text-white",
                    isCurrent && "border-navy-700 bg-navy-700 text-white",
                    !isDone && !isCurrent && "border-ink-300 bg-surface-card text-ink-400"
                  )}
                >
                  {isDone ? <Check className="size-3.5" /> : s.n}
                </div>
                <span
                  className={cn(
                    "hidden text-[12px] font-semibold sm:inline",
                    isCurrent ? "text-ink-900" : isDone ? "text-emerald-700 dark:text-emerald-300" : "text-ink-400"
                  )}
                >
                  {s.title}
                </span>
              </div>
              {i < STEPS_META.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 transition-colors",
                    isDone ? "bg-emerald-600" : "bg-ink-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== STEP 1: Confirm =====================

function Step1Confirm({
  onContinue,
  onEdit,
}: {
  onContinue: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold tracking-tight text-ink-900">
          Hisob ma&apos;lumotlarini tasdiqlang
        </h2>
        <p className="mt-1 text-[13px] text-ink-600">
          Soliq.uz dan olingan ma&apos;lumotlar to&apos;g&apos;rimi?
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-emerald-600/40 bg-emerald-50">
        <div className="flex items-center gap-2 border-b border-emerald-600/30 px-4 py-2.5">
          <Sparkles className="size-4 text-emerald-700 dark:text-emerald-300" />
          <span className="text-[12px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Soliq.uz dan tasdiqlangan
          </span>
        </div>
        <div className="space-y-3 bg-surface-card p-4">
          <KvRow
            label="Korxona"
            value={
              <span className="inline-flex items-center gap-2">
                <Building2 className="size-3.5 text-navy-700 dark:text-navy-300" />
                {KORXONA_MOCK.nomi}
              </span>
            }
          />
          <KvRow
            label="STIR"
            value={
              <span className="inline-flex items-center gap-2">
                <span className="font-mono">{KORXONA_MOCK.stir}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <Check className="size-2.5" />
                  Tasdiqlangan
                </span>
              </span>
            }
          />
          <KvRow label="Manzil" value={KORXONA_MOCK.manzil} />
          <KvRow label="Faoliyat" value={KORXONA_MOCK.faoliyat} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={onEdit}
          className="h-9 px-3 text-[13px]"
        >
          <Pencil className="size-3.5" />
          Tahrirlash
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          className="h-11 px-6 text-[15px]"
        >
          Ha, davom etish
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function KvRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-28 shrink-0 text-[12px] font-medium text-ink-500">{label}</span>
      <span className="flex-1 text-[13px] font-medium text-ink-900">{value}</span>
    </div>
  );
}

// ===================== STEP 2: Products =====================

function Step2Products({
  method,
  onSelect,
  onContinue,
  onBack,
  onSkip,
}: {
  method: ProductMethod;
  onSelect: (m: NonNullable<ProductMethod>) => void;
  onContinue: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const options = [
    {
      id: "excel" as const,
      title: "Excel import",
      description: "Mavjud mahsulot ro'yxatingizni yuklang",
      recommended: true,
      successText: "Excel import tanlandi — keyingi qadamda fayl yuklaysiz",
      Icon: FileSpreadsheet,
    },
    {
      id: "didox" as const,
      title: "Didox tarixidan olish",
      description: "Oxirgi 30 kun hujjatlardan avtomatik chiqaramiz",
      recommended: false,
      successText: "Didox tarixidan chiqaramiz — keyingi qadamda hujjatlar tahlili boshlanadi",
      Icon: History,
    },
    {
      id: "later" as const,
      title: "Keyinroq",
      description: "Hozir o'tkazib yuborish, keyinroq qo'shaman",
      recommended: false,
      successText: "Yaxshi, mahsulotlarni keyinroq qo'shasiz",
      Icon: SkipForward,
    },
  ];

  const chosen = options.find((o) => o.id === method);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold tracking-tight text-ink-900">
          Birinchi mahsulotlarni qo&apos;shing
        </h2>
        <p className="mt-1 text-[13px] text-ink-600">3 ta usuldan birini tanlang</p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const active = method === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={cn(
                "flex w-full items-start gap-4 rounded-md border p-4 text-left transition-colors",
                active
                  ? opt.id === "excel"
                    ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/10"
                    : "border-navy-700 bg-navy-50 ring-2 ring-navy-700/10"
                  : "border-border bg-surface-card hover:border-border-strong"
              )}
            >
              <div
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-md transition-colors",
                  active
                    ? opt.id === "excel"
                      ? "bg-emerald-600 text-white"
                      : "bg-navy-700 text-white"
                    : "bg-ink-100 text-ink-600"
                )}
              >
                <opt.Icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink-900">
                    {opt.title}
                  </span>
                  {opt.recommended && (
                    <span className="rounded-sm bg-emerald-600 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
                      Tavsiya
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-600">
                  {opt.description}
                </p>
              </div>
              <div
                className={cn(
                  "mt-1 grid size-5 shrink-0 place-items-center rounded-full border",
                  active
                    ? opt.id === "excel"
                      ? "border-emerald-600 bg-emerald-600"
                      : "border-navy-700 bg-navy-700"
                    : "border-border-strong"
                )}
              >
                {active && <Check className="size-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className="flex items-start gap-2 rounded-md border-l-4 border-l-emerald-600 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
          <span className="text-[13px] font-medium text-emerald-700 dark:text-emerald-300">
            {chosen.successText}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-3.5" />
          Orqaga
        </button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          className="h-9 px-3 text-[13px]"
        >
          O&apos;tkazib yuborish
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          disabled={!method}
          className="h-11 px-6 text-[15px]"
        >
          Davom etish
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ===================== STEP 3: Integrations =====================

function Step3Integrations({
  values,
  onToggle,
  onContinue,
  onBack,
  onSkip,
}: {
  values: Record<IntegrationId, boolean>;
  onToggle: (id: IntegrationId) => void;
  onContinue: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold tracking-tight text-ink-900">
          Tizimingiz bilan ulashing
        </h2>
        <p className="mt-1 text-[13px] text-ink-600">
          Integratsiyalarni hozir sozlang yoki keyinroq sozlamalardan qo&apos;shing.
        </p>
      </div>

      <div className="space-y-2">
        {INTEGRATIONS.map((it) => {
          const checked = values[it.id];
          const locked = it.locked;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onToggle(it.id)}
              disabled={locked}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors",
                checked
                  ? "border-navy-700 bg-navy-50"
                  : "border-border bg-surface-card hover:border-border-strong",
                locked && "cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-md transition-colors",
                  checked ? "bg-navy-700 text-white" : "bg-ink-100 text-ink-600"
                )}
              >
                <it.Icon className="size-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-ink-900">
                    {it.title}
                  </span>
                  {locked && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-600">
                      <Lock className="size-2.5" />
                      Majburiy
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] text-ink-600">{it.description}</p>
              </div>
              <div
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-sm border transition-colors",
                  checked
                    ? "border-navy-700 bg-navy-700"
                    : "border-border-strong bg-surface-card"
                )}
              >
                {checked && <Check className="size-3.5 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-3.5" />
          Orqaga
        </button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          className="h-9 px-3 text-[13px]"
        >
          O&apos;tkazib yuborish
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          className="h-11 px-6 text-[15px]"
        >
          Davom etish
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ===================== STEP 4: Team =====================

function Step4Team({
  invites,
  inviting,
  onAdd,
  onRemove,
  onUpdate,
  onContinue,
  onBack,
  onSkip,
}: {
  invites: InviteRow[];
  inviting: boolean;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, patch: Partial<InviteRow>) => void;
  onContinue: (e: FormEvent) => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const canAdd = invites.length < 3;
  return (
    <form onSubmit={onContinue} className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold tracking-tight text-ink-900">
          Birgalikda ishlash uchun jamoangizni taklif qiling
        </h2>
        <p className="mt-1 text-[13px] text-ink-600">
          Keyinroq ham qo&apos;shishingiz mumkin
        </p>
      </div>

      {/* Current user row — read only */}
      <div className="flex items-center gap-3 rounded-md border border-border bg-ink-100/50 px-3 py-2.5">
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-navy-700 text-white">
          <Users className="size-4" />
        </div>
        <div className="flex-1 leading-tight">
          <div className="font-mono text-[12px] text-ink-700">{CURRENT_USER_EMAIL}</div>
          <div className="text-[11px] text-ink-500">
            Siz <span className="mx-1">·</span> Administrator
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          <Check className="size-2.5" />
          Faol
        </span>
      </div>

      {/* Invite rows */}
      <div className="space-y-3">
        <Label>Yangi a&apos;zolarni taklif qiling</Label>
        {invites.map((row, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_180px_auto] gap-2">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
              <Input
                type="email"
                placeholder="hodim@korxona.uz"
                value={row.email}
                onChange={(e) => onUpdate(idx, { email: e.target.value })}
                className="pl-9"
              />
            </div>
            <select
              value={row.role}
              onChange={(e) => onUpdate(idx, { role: e.target.value })}
              className="h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900 focus:border-navy-700 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              disabled={invites.length === 1}
              className="grid size-9 place-items-center rounded-sm border border-border-strong bg-surface-card text-ink-500 transition-colors hover:border-red-600 hover:bg-red-50 hover:text-red-600 dark:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:bg-surface-card disabled:hover:text-ink-500"
              aria-label="Olib tashlash"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}

        <Button
          type="button"
          variant="ghost"
          onClick={onAdd}
          disabled={!canAdd}
          className="h-9 px-3 text-[13px]"
        >
          <Plus className="size-3.5" />
          Qo&apos;shimcha qo&apos;shish
          {!canAdd && (
            <span className="ml-1 font-mono text-[10px] text-ink-400">— maks 3</span>
          )}
        </Button>

        <p className="text-[11px] text-ink-500">
          Onboarding paytida maks 3 ta taklif. Qolganlarini{" "}
          <span className="font-mono">/sozlamalar/foydalanuvchilar</span> dan qo&apos;shing.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-3.5" />
          Orqaga
        </button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          className="h-9 px-3 text-[13px]"
        >
          Hozircha o&apos;tkazib yuborish
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="h-11 px-6 text-[15px]"
          disabled={inviting}
        >
          <Send className="size-4" />
          {inviting ? "Yuborilmoqda…" : "Davom etish"}
        </Button>
      </div>
    </form>
  );
}

// ===================== STEP 5: Done =====================

function Step5Done({ onFinish }: { onFinish: () => void }) {
  const tiles = [
    {
      emoji: "📄",
      title: "Birinchi hujjatni qabul qiling",
      description: "Didox dan kelgan hujjatlarni AI parslab beradi.",
      cta: "Demo hujjatni ko'rish",
      href: "/hujjatlar",
    },
    {
      emoji: "🤖",
      title: "AI Insights'ni sozlang",
      description: "Sotuv tendensiyalari va MXIK noaniqliklari.",
      cta: "Insights ko'rish",
      href: "/insights",
    },
    {
      emoji: "📦",
      title: "Ombor qoldiqlarini tekshiring",
      description: "Real-time qoldiq nazorati va hisobotlar.",
      cta: "Ombor'ga o'tish",
      href: "/ombor",
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col items-center text-center">
        <div className="grid size-16 place-items-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-9 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink-900">
          Tabriklaymiz! <span aria-hidden>🎉</span>
        </h2>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-600">
          RetailFlow AI ishga tushdi. Quyidagi birinchi qadamlardan biri bilan boshlang.
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-navy-700 dark:text-navy-300" />
          <span className="text-[12px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
            Birinchi qadamlar
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {tiles.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group flex flex-col rounded-md border border-border bg-surface-card p-4 transition-colors hover:border-navy-700 hover:bg-navy-50"
            >
              <div className="text-2xl" aria-hidden>
                {t.emoji}
              </div>
              <div className="mt-2 text-[13px] font-semibold text-ink-900">
                {t.title}
              </div>
              <div className="mt-1 flex-1 text-[12px] leading-relaxed text-ink-600">
                {t.description}
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-navy-700 dark:text-navy-300 group-hover:text-navy-600 dark:text-navy-400">
                {t.cta}
                <ChevronRight className="size-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={onFinish}
        className="h-12 w-full text-[15px]"
      >
        Dashboard&apos;ga o&apos;tish
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

