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
  Globe2,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// ===================== TYPES =====================

type RegisterRole = "store" | "supplier" | "soliq";

type EntityKind =
  | "mchj"
  | "yat"
  | "jismoniy"
  // Supplier-specific entity options
  | "local"
  | "international"
  | "exclusive";

type EntityOption = {
  value: EntityKind;
  title: string;
  short: string;
  description: string;
  stirLength: 9 | 14;
  Icon: typeof Building2;
};

const STORE_ENTITY_OPTIONS: EntityOption[] = [
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

const SUPPLIER_ENTITY_OPTIONS: EntityOption[] = [
  {
    value: "local",
    title: "Mahalliy distribyutor",
    short: "Local distributor",
    description: "O'zbekiston bo'ylab mahalliy mahsulotlarni tarqatuvchi distribyutor.",
    stirLength: 9,
    Icon: Truck,
  },
  {
    value: "international",
    title: "Xalqaro brend vakili",
    short: "International brand",
    description: "Xalqaro brendlarning O'zbekistondagi rasmiy vakili (Coca-Cola, Pepsi, Nestle).",
    stirLength: 9,
    Icon: Globe2,
  },
  {
    value: "exclusive",
    title: "Eksklyuziv distribyutor",
    short: "Exclusive distributor",
    description: "Ma'lum bir hudud yoki brand uchun eksklyuziv huquqlarga ega distribyutor.",
    stirLength: 9,
    Icon: ShieldCheck,
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
  // Supplier-specific
  hududlar: string[];
  fleetSize: string;
  warehouseAddress: string;
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
  hududlar: [],
  fleetSize: "",
  warehouseAddress: "",
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

const STORE_STEPS = [
  { n: 1, title: "Korxona turi" },
  { n: 2, title: "STIR tekshiruvi" },
  { n: 3, title: "Aloqa ma'lumotlari" },
  { n: 4, title: "SMS tasdiqlash" },
];

const SUPPLIER_STEPS = [
  { n: 1, title: "Brand turi" },
  { n: 2, title: "STIR tekshiruvi" },
  { n: 3, title: "Logistika" },
  { n: 4, title: "SMS tasdiqlash" },
];

// ===================== PAGE =====================

export default function RegisterPage() {
  const router = useRouter();
  const [registerRole, setRegisterRole] = useState<RegisterRole | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  // Step 2: STIR fetch
  const [fetching, setFetching] = useState(false);

  // Soliq taklif kodi
  const [soliqCode, setSoliqCode] = useState("");
  const [soliqValidating, setSoliqValidating] = useState(false);

  // Step 4: OTP
  const [otp, setOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);

  const activeOptions =
    registerRole === "supplier" ? SUPPLIER_ENTITY_OPTIONS : STORE_ENTITY_OPTIONS;
  const activeSteps = registerRole === "supplier" ? SUPPLIER_STEPS : STORE_STEPS;
  const activeEntity = activeOptions.find((o) => o.value === form.entityKind) ?? null;

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
      let nomi = "Karimov MChJ";
      let faoliyat = "Chakana savdo (47.11)";
      if (registerRole === "supplier") {
        if (activeEntity.value === "international") {
          nomi = "Coca-Cola Bottlers Uzbekistan";
          faoliyat = "Ulgurji savdo (46.39) — ichimliklar";
        } else if (activeEntity.value === "exclusive") {
          nomi = "Alpha Distribution OOO";
          faoliyat = "Ulgurji savdo (46.34) — eksklyuziv distribyutsiya";
        } else {
          nomi = "Mahalliy Savdo MChJ";
          faoliyat = "Ulgurji savdo (46.90)";
        }
      } else if (activeEntity.value !== "mchj") {
        nomi = "Karimov YaT";
      }
      const mockKorxona: KorxonaInfo = {
        nomi,
        holati: "Faol",
        royxatga: "2019-03-15",
        manzil: "Toshkent shahar, Chilonzor tumani",
        faoliyat,
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
    if (digitsOnly(form.phone).length !== 9) {
      setError("Telefon raqam to'liq emas. +998 dan keyin 9 ta raqam bo'lishi kerak.");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Email manzil noto'g'ri formatda.");
      return;
    }

    if (registerRole === "supplier") {
      if (form.hududlar.length === 0) {
        setError("Kamida bitta etkazib berish hududini tanlang.");
        return;
      }
      const fleet = parseInt(form.fleetSize || "0", 10);
      if (!fleet || fleet < 1) {
        setError("Avto-park o'lchami kamida 1 ta avtomobil bo'lishi kerak.");
        return;
      }
      if (!form.warehouseAddress.trim()) {
        setError("Ombor manzilini kiriting.");
        return;
      }
    } else {
      if (!form.lavozim.trim()) {
        setError("Lavozim kiritilishi shart.");
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
      const redirectPath =
        registerRole === "supplier" ? "/supplier/dashboard" : "/onboarding";
      setTimeout(() => router.push(redirectPath), 1500);
    }, 800);
  }

  // ===== Soliq code validation =====
  function handleSoliqValidate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (soliqCode.trim().length < 6) {
      setError("Taklif kodi kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    setSoliqValidating(true);
    setTimeout(() => {
      setSoliqValidating(false);
      // Mock: kod "SOLIQ-DEMO" yoki "INVITE-2026" success — boshqalari xatolik
      if (
        soliqCode.trim().toUpperCase() === "SOLIQ-DEMO" ||
        soliqCode.trim().toUpperCase() === "INVITE-2026"
      ) {
        setSuccess(true);
        setTimeout(() => router.push("/soliq/dashboard"), 1200);
      } else {
        setError("Noto'g'ri taklif kodi. Kodingizni qayta tekshiring.");
      }
    }, 1000);
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
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-5 text-xl font-bold tracking-tight text-ink-900">
              {registerRole === "supplier"
                ? "Ta'minotchi hisobingiz tayyor!"
                : registerRole === "soliq"
                ? "Soliq xodimi hisobi tasdiqlandi!"
                : "Korxonangiz ro'yxatdan o'tdi!"}
            </h2>
            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-600">
              {registerRole === "soliq"
                ? "Soliq paneliga o'tilmoqda…"
                : `${form.korxona?.nomi ?? "Hisob"} muvaffaqiyatli yaratildi. Boshqaruv paneliga o'tilmoqda…`}
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

  // STEP 0: role selection
  if (registerRole === null) {
    return (
      <div className="w-full max-w-[560px]">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Qaysi rolda ro&apos;yxatdan o&apos;tasiz?
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
            RetailFlow AI uchta sub-platforma uchun bitta tizimda ishlaydi.
            Rolingizga qarab keyingi qadamlar farqlanadi.
          </p>
        </div>
        <Card className="shadow-md">
          <div className="space-y-3 p-6">
            <RoleCard
              icon={Store}
              title="Chakana savdo do'koni"
              description="Hujjat qabul qilish, MXIK validatsiya, ombor boshqaruvi"
              onClick={() => setRegisterRole("store")}
            />
            <RoleCard
              icon={Truck}
              title="Ulgurji ta'minotchi"
              description="50-500 do'koniga sotuv, talab analitikasi, logistika"
              onClick={() => setRegisterRole("supplier")}
            />
            <RoleCard
              icon={ShieldCheck}
              title="Soliq xodimi (cheklangan)"
              description="Faqat taklif orqali — taklif kodi kerak bo'ladi"
              onClick={() => setRegisterRole("soliq")}
            />
          </div>
        </Card>
        <p className="mt-6 text-center text-[13px] text-ink-600">
          Hisobingiz bormi?{" "}
          <Link
            href="/login"
            className="font-semibold text-navy-700 dark:text-navy-300 hover:text-navy-600 dark:text-navy-400"
          >
            Kirish →
          </Link>
        </p>
      </div>
    );
  }

  // SOLIQ flow: simple invite code form
  if (registerRole === "soliq") {
    return (
      <div className="w-full max-w-[480px]">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Soliq taklif kodini kiriting
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
            Soliq xodimlari faqat administrator tomonidan yuborilgan taklif kodi
            orqali ro&apos;yxatdan o&apos;tishi mumkin.
          </p>
        </div>
        <Card className="shadow-md">
          <div className="p-6">
            {error && (
              <div className="mb-5">
                <Alert variant="error">{error}</Alert>
              </div>
            )}
            <form onSubmit={handleSoliqValidate} className="space-y-5">
              <div>
                <Label htmlFor="soliq-code">Taklif kodi</Label>
                <Input
                  id="soliq-code"
                  mono
                  placeholder="SOLIQ-XXXX-XXXX"
                  value={soliqCode}
                  onChange={(e) => setSoliqCode(e.target.value.toUpperCase())}
                  autoFocus
                />
                <p className="mt-2 text-[12px] text-ink-500">
                  Demo kod: <span className="font-mono">SOLIQ-DEMO</span> yoki{" "}
                  <span className="font-mono">INVITE-2026</span>
                </p>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="h-11 w-full text-[15px]"
                disabled={soliqValidating || !soliqCode.trim()}
              >
                {soliqValidating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Tekshirilmoqda…
                  </>
                ) : (
                  <>
                    Tasdiqlash
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setRegisterRole(null);
                  setError(null);
                  setSoliqCode("");
                }}
                className="flex w-full items-center justify-center gap-1.5 text-[13px] font-medium text-ink-600 hover:text-ink-900"
              >
                <ArrowLeft className="size-3.5" />
                Rol tanlashga qaytish
              </button>
            </form>
          </div>
        </Card>
        <p className="mt-6 text-center text-[13px] text-ink-600">
          Hisobingiz bormi?{" "}
          <Link
            href="/login"
            className="font-semibold text-navy-700 dark:text-navy-300 hover:text-navy-600 dark:text-navy-400"
          >
            Kirish →
          </Link>
        </p>
      </div>
    );
  }

  // STORE / SUPPLIER flow — 4-step wizard
  return (
    <div className="w-full max-w-[560px]">
      {/* Progress */}
      <ProgressBar current={step} steps={activeSteps} />

      {/* Heading */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          {step === 1 &&
            (registerRole === "supplier"
              ? "Brand turini tanlang"
              : "Korxonangiz turini tanlang")}
          {step === 2 && "STIR orqali korxonani tekshiring"}
          {step === 3 &&
            (registerRole === "supplier" ? "Logistika ma'lumotlari" : "Aloqa ma'lumotlari")}
          {step === 4 && "Telefon raqamni tasdiqlang"}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
          {step === 1 &&
            (registerRole === "supplier"
              ? "Sizning distribyutsiya modelingiz keyingi qadamlardagi sozlamalarni belgilaydi."
              : "Tarmoqqa ro'yxatdan o'tuvchi yuridik shaxs turi STIR formatini belgilaydi.")}
          {step === 2 &&
            "STIR'ni soliq.uz katalogi bo'yicha avtomatik tekshiramiz va korxona ma'lumotlarini olamiz."}
          {step === 3 &&
            (registerRole === "supplier"
              ? "Etkazib berish hududlari, avto-park o'lchami va ombor manzili."
              : "Rasmiy aloqa shaxsi va do'kon manzili. Bu ma'lumotlar Didox hujjatlarida ko'rinadi.")}
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
              options={activeOptions}
              selected={form.entityKind}
              onSelect={(v) => update("entityKind", v)}
              onContinue={submitStep1}
              onChangeRole={() => {
                setRegisterRole(null);
                setStep(1);
                setForm(INITIAL_FORM);
                setError(null);
              }}
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

          {step === 3 && registerRole === "supplier" && (
            <Step3Supplier
              form={form}
              update={update}
              onSubmit={submitStep3}
              onBack={goBack}
            />
          )}

          {step === 3 && registerRole === "store" && (
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
        <Link href="/login" className="font-semibold text-navy-700 dark:text-navy-300 hover:text-navy-600 dark:text-navy-400">
          Kirish →
        </Link>
      </p>
    </div>
  );
}

// ===================== ROLE CARD =====================

function RoleCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof Store;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-md border border-border bg-surface-card p-4 text-left transition-colors hover:border-navy-700 hover:bg-navy-50"
    >
      <div className="grid size-11 shrink-0 place-items-center rounded-md bg-ink-100 text-ink-700 transition-colors group-hover:bg-navy-700 group-hover:text-white">
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        <div className="text-[14px] font-semibold text-ink-900">{title}</div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-600">{description}</p>
      </div>
      <ArrowRight className="size-4 text-ink-400 transition-colors group-hover:text-navy-700 dark:text-navy-300" />
    </button>
  );
}

// ===================== PROGRESS =====================

function ProgressBar({
  current,
  steps,
}: {
  current: 1 | 2 | 3 | 4;
  steps: { n: number; title: string }[];
}) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
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
              {i < steps.length - 1 && (
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
  options,
  selected,
  onSelect,
  onContinue,
  onChangeRole,
}: {
  options: EntityOption[];
  selected: EntityKind | null;
  onSelect: (v: EntityKind) => void;
  onContinue: () => void;
  onChangeRole?: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {options.map((opt) => {
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

      {onChangeRole && (
        <button
          type="button"
          onClick={onChangeRole}
          className="flex w-full items-center justify-center gap-1.5 text-[13px] font-medium text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-3.5" />
          Boshqa rolni tanlash
        </button>
      )}
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
            <Sparkles className="size-4 text-emerald-700 dark:text-emerald-300" />
            <span className="text-[12px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Soliq.uz dan topildi
            </span>
          </div>
          <div className="space-y-3 p-4">
            <KvRow label="Korxona nomi" value={korxona.nomi} />
            <KvRow
              label="Holati"
              value={
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600 bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
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
          <MapPin className="size-4 text-navy-700 dark:text-navy-300" />
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

// ===================== STEP 3 (SUPPLIER) =====================

function Step3Supplier({
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
  function toggleHudud(v: string) {
    if (form.hududlar.includes(v)) {
      update(
        "hududlar",
        form.hududlar.filter((x) => x !== v),
      );
    } else {
      update("hududlar", [...form.hududlar, v]);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {form.korxona && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-ink-100 px-3 py-2.5">
          <div className="grid size-8 place-items-center rounded-md bg-navy-700 text-white">
            <Truck className="size-4" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-ink-900">
              {form.korxona.nomi}
            </div>
            <div className="font-mono text-[11px] text-ink-500">STIR {form.stir}</div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="director">Direktor F.I.O.</Label>
          <Input
            id="director"
            placeholder="Tursunov Asror Bahodirovich"
            value={form.director}
            onChange={(e) => update("director", e.target.value)}
            autoFocus
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

        <div>
          <Label htmlFor="email">
            Email{" "}
            <span className="ml-1 font-normal normal-case text-ink-400">— ixtiyoriy</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="info@alpha-distribution.uz"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>

      {/* Logistika ma'lumotlari */}
      <div className="rounded-md border border-border bg-ink-100/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Truck className="size-4 text-navy-700 dark:text-navy-300" />
          <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-700">
            Logistika
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Etkazib berish hududlari</Label>
            <div className="flex flex-wrap gap-1.5">
              {VILOYATLAR.map((v) => {
                const active = form.hududlar.includes(v);
                return (
                  <button
                    type="button"
                    key={v}
                    onClick={() => toggleHudud(v)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                      active
                        ? "border-navy-700 bg-navy-700 text-white"
                        : "border-border-strong bg-surface-card text-ink-700 hover:border-navy-700",
                    )}
                  >
                    {active && <Check className="mr-1 inline size-3" />}
                    {v}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[12px] text-ink-500">
              Kamida bitta hudud tanlang. Tanlandi:{" "}
              <span className="font-mono">{form.hududlar.length}</span> ta
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fleet">Avto-park o&apos;lchami</Label>
              <Input
                id="fleet"
                mono
                inputMode="numeric"
                placeholder="23"
                value={form.fleetSize}
                onChange={(e) => update("fleetSize", digitsOnly(e.target.value).slice(0, 4))}
              />
              <p className="mt-1 text-[12px] text-ink-500">Etkazib beruvchi avtomobillar soni</p>
            </div>

            <div>
              <Label htmlFor="warehouse">Ombor manzili</Label>
              <Input
                id="warehouse"
                placeholder="Toshkent, Sergeli, Sanoat ko'cha 5"
                value={form.warehouseAddress}
                onChange={(e) => update("warehouseAddress", e.target.value)}
              />
            </div>
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
              className="font-semibold text-navy-700 dark:text-navy-300 hover:text-navy-600 dark:text-navy-400"
            >
              Qayta yuborish
            </button>
          )}
        </div>
      </div>

      <Alert variant="info">
        Hisobni yaratish bilan siz{" "}
        <Link href="/shartlar" className="font-semibold underline">
          foydalanish shartlari
        </Link>
        ga va{" "}
        <Link href="/maxfiylik" className="font-semibold underline">
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
