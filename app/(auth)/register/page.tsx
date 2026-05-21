"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// ===================== TYPES =====================

type EntityKind = "mchj" | "yat" | "jismoniy";

type EntityOption = {
  value: EntityKind;
  title: string;
  short: string;
  description: string;
  stirLength: 9 | 14;
  Icon: typeof Building2;
};

const ENTITY_OPTIONS: EntityOption[] = [
  {
    value: "mchj",
    title: "MChJ / OOO / AJ",
    short: "Yuridik shaxs",
    description: "Mas'uliyati cheklangan jamiyat, ochiq jamiyat va boshqa yuridik shaxslar.",
    stirLength: 9,
    Icon: Building2,
  },
  {
    value: "yat",
    title: "Yakka tartibdagi tadbirkor (YaT)",
    short: "Individual entrepreneur",
    description: "Yakka tartibdagi tadbirkorlik faoliyati bilan shug'ullanuvchilar.",
    stirLength: 14,
    Icon: Briefcase,
  },
  {
    value: "jismoniy",
    title: "Yuridik shaxs tashkil etmagan tadbirkor",
    short: "Jismoniy shaxs",
    description: "Yuridik shaxs tashkil etmagan jismoniy shaxs-tadbirkor.",
    stirLength: 14,
    Icon: User,
  },
];

const VILOYATLAR = [
  "Toshkent shahar",
  "Toshkent viloyat",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Farg'ona",
  "Namangan",
  "Surxondaryo",
  "Qashqadaryo",
  "Jizzax",
  "Sirdaryo",
  "Navoiy",
  "Xorazm",
  "Qoraqalpog'iston",
];

type KorxonaInfo = {
  nomi: string;
  holati: string;
  royxatga: string;
  manzil: string;
  faoliyat: string;
};

type FormData = {
  entityKind: EntityKind | null;
  stir: string;
  korxona: KorxonaInfo | null;
  director: string;
  lavozim: string;
  phone: string;
  email: string;
  viloyat: string;
  tuman: string;
  kocha: string;
};

const INITIAL_FORM: FormData = {
  entityKind: null,
  stir: "",
  korxona: null,
  director: "",
  lavozim: "Direktor",
  phone: "",
  email: "",
  viloyat: "",
  tuman: "",
  kocha: "",
};

// ===================== HELPERS =====================

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

function formatPhone(raw: string): string {
  const d = digitsOnly(raw).slice(0, 9);
  const parts: string[] = [];
  if (d.length > 0) parts.push(d.slice(0, 2));
  if (d.length > 2) parts.push(d.slice(2, 5));
  if (d.length > 5) parts.push(d.slice(5, 7));
  if (d.length > 7) parts.push(d.slice(7, 9));
  return parts.join(" ");
}

const STEPS = [
  { n: 1, title: "Korxona turi" },
  { n: 2, title: "STIR tekshiruvi" },
  { n: 3, title: "Aloqa ma'lumotlari" },
  { n: 4, title: "SMS tasdiqlash" },
];

// ===================== PAGE =====================

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  // Step 2: STIR fetch
  const [fetching, setFetching] = useState(false);

  // Step 4: OTP
  const [otp, setOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);

  const activeEntity = ENTITY_OPTIONS.find((o) => o.value === form.entityKind) ?? null;

  // OTP countdown
  useEffect(() => {
    if (step !== 4) return;
    otpRef.current?.focus();
    setResendIn(60);
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(1, (s - 1) as 1 | 2 | 3 | 4) as 1 | 2 | 3 | 4);
  }

  // ===== STEP 1 → 2 =====
  function submitStep1() {
    if (!form.entityKind) {
      setError("Iltimos, korxona turini tanlang.");
      return;
    }
    setError(null);
    // STIR'ni qayta tiklash agar tur o'zgargan bo'lsa
    setForm((f) => ({ ...f, stir: "", korxona: null }));
    setStep(2);
  }

  // ===== STEP 2: STIR fetch =====
  function handleStirFetch() {
    setError(null);
    if (!activeEntity) return;
    const required = activeEntity.stirLength;
    if (form.stir.length !== required) {
      setError(
        `STIR ${required} ta raqamdan iborat bo'lishi kerak. Hozir ${form.stir.length} ta raqam kiritildi.`
      );
      return;
    }
    setFetching(true);
    setForm((f) => ({ ...f, korxona: null }));
    // Mock fetch — 1s
    setTimeout(() => {
      const mockKorxona: KorxonaInfo = {
        nomi: activeEntity.value === "mchj" ? "Karimov MChJ" : "Karimov YaT",
        holati: "Faol",
        royxatga: "2019-03-15",
        manzil: "Toshkent shahar, Chilonzor tumani",
        faoliyat: "Chakana savdo (47.11)",
      };
      setForm((f) => ({ ...f, korxona: mockKorxona }));
      setFetching(false);
    }, 1000);
  }

  function submitStep2() {
    if (!form.korxona) {
      setError("Avval STIR'ni tekshiring.");
      return;
    }
    setError(null);
    setStep(3);
  }

  // ===== STEP 3 → 4 =====
  function submitStep3(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.director.trim()) {
      setError("Direktor F.I.O. kiritilishi shart.");
      return;
    }
    if (!form.lavozim.trim()) {
      setError("Lavozim kiritilishi shart.");
      return;
    }
    if (digitsOnly(form.phone).length !== 9) {
      setError("Telefon raqam to'liq emas. +998 dan keyin 9 ta raqam bo'lishi kerak.");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Email manzil noto'g'ri formatda.");
      return;
    }
    if (!form.viloyat) {
      setError("Viloyatni tanlang.");
      return;
    }
    if (!form.tuman.trim()) {
      setError("Tuman/shahar kiritilishi shart.");
      return;
    }

    setStep(4);
  }

  // ===== STEP 4: Create account =====
  function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      setError("Tasdiqlash kodi 6 ta raqamdan iborat bo'lishi kerak.");
      return;
    }
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    }, 800);
  }

  function handleResend() {
    if (resendIn > 0) return;
    setResendIn(60);
  }

  // ===================== RENDER =====================

  if (success) {
    return (
      <div className="w-full max-w-[560px]">
        <Card className="shadow-md">
          <div className="flex flex-col items-center px-8 py-12 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-emerald-50">
              <CheckCircle2 className="size-8 text-emerald-600" />
            </div>
            <h2 className="mt-5 text-xl font-bold tracking-tight text-ink-900">
              Korxonangiz ro'yxatdan o'tdi!
            </h2>
            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-600">
              {form.korxona?.nomi} muvaffaqiyatli yaratildi. Boshqaruv paneliga o'tilmoqda…
            </p>
            <div className="mt-6 flex items-center gap-2 font-mono text-[12px] text-ink-500">
              <Loader2 className="size-3.5 animate-spin" />
              Yo'naltirilmoqda
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[560px]">
      {/* Progress */}
      <ProgressBar current={step} />

      {/* Heading */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          {step === 1 && "Korxonangiz turini tanlang"}
          {step === 2 && "STIR orqali korxonani tekshiring"}
          {step === 3 && "Aloqa ma'lumotlari"}
          {step === 4 && "Telefon raqamni tasdiqlang"}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
          {step === 1 &&
            "Tarmoqqa ro'yxatdan o'tuvchi yuridik shaxs turi STIR formatini belgilaydi."}
          {step === 2 &&
            "STIR'ni soliq.uz katalogi bo'yicha avtomatik tekshiramiz va korxona ma'lumotlarini olamiz."}
          {step === 3 &&
            "Rasmiy aloqa shaxsi va do'kon manzili. Bu ma'lumotlar Didox hujjatlarida ko'rinadi."}
          {step === 4 && (
            <>
              <span className="font-mono text-ink-900">+998 {formatPhone(form.phone)}</span>{" "}
              raqamiga 6 raqamli kod yuborildi.
            </>
          )}
        </p>
      </div>

      <Card className="shadow-md">
        <div className="p-6">
          {error && (
            <div className="mb-5">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          {step === 1 && (
            <Step1
              selected={form.entityKind}
              onSelect={(v) => update("entityKind", v)}
              onContinue={submitStep1}
            />
          )}

          {step === 2 && activeEntity && (
            <Step2
              entity={activeEntity}
              stir={form.stir}
              onStirChange={(v) =>
                update("stir", digitsOnly(v).slice(0, activeEntity.stirLength))
              }
              korxona={form.korxona}
              fetching={fetching}
              onFetch={handleStirFetch}
              onContinue={submitStep2}
              onBack={goBack}
            />
          )}

          {step === 3 && (
            <Step3
              form={form}
              update={update}
              onSubmit={submitStep3}
              onBack={goBack}
            />
          )}

          {step === 4 && (
            <Step4
              otp={otp}
              setOtp={(v) => setOtp(digitsOnly(v).slice(0, 6))}
              resendIn={resendIn}
              onResend={handleResend}
              creating={creating}
              onSubmit={handleCreate}
              onBack={goBack}
              otpRef={otpRef}
            />
          )}
        </div>
      </Card>

      <p className="mt-6 text-center text-[13px] text-ink-600">
        Hisobingiz bormi?{" "}
        <Link href="/login" className="font-semibold text-navy-700 hover:text-navy-600">
          Kirish →
        </Link>
      </p>
    </div>
  );
}

// ===================== PROGRESS =====================

function ProgressBar({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
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
                    isCurrent ? "text-ink-900" : isDone ? "text-emerald-700" : "text-ink-400"
                  )}
                >
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
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

// ===================== STEP 1 =====================

function Step1({
  selected,
  onSelect,
  onContinue,
}: {
  selected: EntityKind | null;
  onSelect: (v: EntityKind) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {ENTITY_OPTIONS.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                "flex w-full items-start gap-4 rounded-md border p-4 text-left transition-colors",
                active
                  ? "border-navy-700 bg-navy-50 ring-2 ring-navy-700/10"
                  : "border-border bg-surface-card hover:border-border-strong"
              )}
            >
              <div
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-md transition-colors",
                  active ? "bg-navy-700 text-white" : "bg-ink-100 text-ink-600"
                )}
              >
                <opt.Icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink-900">
                    {opt.title}
                  </span>
                  <span className="rounded-sm bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-600">
                    STIR {opt.stirLength}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-600">
                  {opt.description}
                </p>
              </div>
              <div
                className={cn(
                  "mt-1 grid size-5 shrink-0 place-items-center rounded-full border",
                  active ? "border-navy-700 bg-navy-700" : "border-border-strong"
                )}
              >
                {active && <Check className="size-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="primary"
        className="h-11 w-full text-[15px]"
        disabled={!selected}
        onClick={onContinue}
      >
        Davom etish
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

// ===================== STEP 2 =====================

function Step2({
  entity,
  stir,
  onStirChange,
  korxona,
  fetching,
  onFetch,
  onContinue,
  onBack,
}: {
  entity: EntityOption;
  stir: string;
  onStirChange: (v: string) => void;
  korxona: KorxonaInfo | null;
  fetching: boolean;
  onFetch: () => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const canFetch = stir.length === entity.stirLength && !fetching;

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="stir">STIR (soliq to'lovchi raqami)</Label>
        <div className="flex gap-2">
          <Input
            id="stir"
            mono
            inputMode="numeric"
            placeholder={"".padStart(entity.stirLength, "0")}
            value={stir}
            onChange={(e) => onStirChange(e.target.value)}
            maxLength={entity.stirLength}
            className="flex-1 tracking-wider"
            autoFocus
          />
          <Button
            type="button"
            variant="secondary"
            onClick={onFetch}
            disabled={!canFetch}
            className="h-9 shrink-0"
          >
            {fetching ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Tekshirilmoqda…
              </>
            ) : (
              <>
                <Search className="size-4" />
                Soliq.uz dan tekshirish
              </>
            )}
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px]">
          <span className="text-ink-500">
            {entity.short} uchun {entity.stirLength} ta raqam
          </span>
          <span className="font-mono text-ink-500">
            {stir.length}/{entity.stirLength}
          </span>
        </div>
      </div>

      {/* Korxona ma'lumotlari card */}
      {korxona && (
        <div className="overflow-hidden rounded-md border border-emerald-600/40 bg-emerald-50">
          <div className="flex items-center gap-2 border-b border-emerald-600/30 bg-emerald-50 px-4 py-2.5">
            <Sparkles className="size-4 text-emerald-700" />
            <span className="text-[12px] font-semibold uppercase tracking-wider text-emerald-700">
              Soliq.uz dan topildi
            </span>
          </div>
          <div className="space-y-3 p-4">
            <KvRow label="Korxona nomi" value={korxona.nomi} />
            <KvRow
              label="Holati"
              value={
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600 bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-600" />
                  {korxona.holati}
                </span>
              }
            />
            <KvRow label="Ro'yxatga olingan" value={<span className="font-mono">{korxona.royxatga}</span>} />
            <KvRow label="Manzil" value={korxona.manzil} />
            <KvRow label="Faoliyat turi" value={korxona.faoliyat} />
          </div>
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
          variant="primary"
          onClick={onContinue}
          disabled={!korxona}
          className="h-11 px-6 text-[15px]"
        >
          Davom etish
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function KvRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-36 shrink-0 text-[12px] font-medium text-ink-500">{label}</span>
      <span className="flex-1 text-[13px] font-medium text-ink-900">{value}</span>
    </div>
  );
}

// ===================== STEP 3 =====================

function Step3({
  form,
  update,
  onSubmit,
  onBack,
}: {
  form: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {form.korxona && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-ink-100 px-3 py-2.5">
          <div className="grid size-8 place-items-center rounded-md bg-navy-700 text-white">
            <Building2 className="size-4" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-ink-900">{form.korxona.nomi}</div>
            <div className="font-mono text-[11px] text-ink-500">STIR {form.stir}</div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="director">Direktor F.I.O.</Label>
          <Input
            id="director"
            placeholder="Karimov Alisher Botirovich"
            value={form.director}
            onChange={(e) => update("director", e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="lavozim">Lavozim</Label>
          <Input
            id="lavozim"
            placeholder="Direktor"
            value={form.lavozim}
            onChange={(e) => update("lavozim", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefon raqam</Label>
          <div className="flex h-9 w-full overflow-hidden rounded-sm border border-border-strong bg-surface-card focus-within:border-navy-700 focus-within:outline focus-within:outline-2 focus-within:outline-navy-700 focus-within:-outline-offset-1">
            <span className="grid place-items-center border-r border-border-strong bg-ink-100 px-3 font-mono text-sm font-semibold text-ink-700">
              +998
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="XX XXX XX XX"
              value={formatPhone(form.phone)}
              onChange={(e) => update("phone", digitsOnly(e.target.value))}
              className="h-full flex-1 bg-transparent px-3 font-mono text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="email">
            Email <span className="ml-1 font-normal normal-case text-ink-400">— ixtiyoriy</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="info@korxona.uz"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-ink-100/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="size-4 text-navy-700" />
          <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-700">
            Manzil
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="viloyat">Viloyat</Label>
            <select
              id="viloyat"
              value={form.viloyat}
              onChange={(e) => update("viloyat", e.target.value)}
              className="h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900 focus:border-navy-700 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
            >
              <option value="">— Tanlang —</option>
              {VILOYATLAR.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="tuman">Tuman / shahar</Label>
            <Input
              id="tuman"
              placeholder="Chilonzor tumani"
              value={form.tuman}
              onChange={(e) => update("tuman", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="kocha">
              Ko'cha, uy{" "}
              <span className="ml-1 font-normal normal-case text-ink-400">— ixtiyoriy</span>
            </Label>
            <Input
              id="kocha"
              placeholder="Bunyodkor shoh ko'chasi, 45"
              value={form.kocha}
              onChange={(e) => update("kocha", e.target.value)}
            />
          </div>
        </div>
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
        <Button type="submit" variant="primary" className="h-11 px-6 text-[15px]">
          SMS yuborish
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}

// ===================== STEP 4 =====================

function Step4({
  otp,
  setOtp,
  resendIn,
  onResend,
  creating,
  onSubmit,
  onBack,
  otpRef,
}: {
  otp: string;
  setOtp: (v: string) => void;
  resendIn: number;
  onResend: () => void;
  creating: boolean;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
  otpRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="otp">Tasdiqlash kodi</Label>
        <Input
          id="otp"
          ref={otpRef}
          mono
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="• • • • • •"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="h-12 text-center text-lg tracking-[0.4em]"
        />
        <div className="mt-2 flex items-center justify-between text-[12px]">
          <span className="text-ink-500">6 raqamli kodni kiriting</span>
          {resendIn > 0 ? (
            <span className="font-mono text-ink-500">
              Qayta yuborish (00:{String(resendIn).padStart(2, "0")})
            </span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              className="font-semibold text-navy-700 hover:text-navy-600"
            >
              Qayta yuborish
            </button>
          )}
        </div>
      </div>

      <Alert variant="info">
        Hisobni yaratish bilan siz{" "}
        <Link href="/terms" className="font-semibold underline">
          foydalanish shartlari
        </Link>
        ga va{" "}
        <Link href="/privacy" className="font-semibold underline">
          maxfiylik siyosati
        </Link>
        ga rozilik bildirasiz.
      </Alert>

      <Button
        type="submit"
        variant="emerald"
        className="h-11 w-full text-[15px]"
        disabled={otp.length !== 6 || creating}
      >
        {creating ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Hisob yaratilmoqda…
          </>
        ) : (
          <>
            Hisobni yaratish
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center justify-center gap-1.5 text-[13px] font-medium text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="size-3.5" />
        Telefon raqamni o'zgartirish
      </button>
    </form>
  );
}
