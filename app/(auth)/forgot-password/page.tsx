"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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

type Step = 1 | 2 | 3;

type FormState = {
  phone: string;
  otp: string;
  password: string;
  confirm: string;
};

const INITIAL: FormState = {
  phone: "",
  otp: "",
  password: "",
  confirm: "",
};

// ===================== PAGE =====================

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const otpRef = useRef<HTMLInputElement>(null);
  const pwdRef = useRef<HTMLInputElement>(null);

  // Autofocus + resend countdown on step 2
  useEffect(() => {
    if (step === 2) {
      otpRef.current?.focus();
      setResendIn(60);
    }
    if (step === 3) {
      pwdRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const phoneDigits = digitsOnly(form.phone);
  const phoneValid = phoneDigits.length === 9;
  const otpValid = form.otp.length === 6;

  const pwdLenOk = form.password.length >= 8;
  const pwdHasLetter = /[A-Za-zА-Яа-яЎўҚқҒғҲҳ]/.test(form.password);
  const pwdHasDigit = /\d/.test(form.password);
  const pwdComplexOk = pwdHasLetter && pwdHasDigit;
  const pwdMatches = form.password.length > 0 && form.password === form.confirm;
  const pwdValid = pwdLenOk && pwdComplexOk && pwdMatches;

  // ===== Step 1 → 2 =====
  function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!phoneValid) {
      setError("Telefon raqam to'liq emas. +998 dan keyin 9 ta raqam bo'lishi kerak.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 600);
  }

  // ===== Step 2 → 3 =====
  function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!otpValid) {
      setError("Tasdiqlash kodi 6 ta raqamdan iborat bo'lishi kerak.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 700);
  }

  function handleResend() {
    if (resendIn > 0) return;
    setResendIn(60);
    setError(null);
  }

  // ===== Step 3 → success =====
  function handleSetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pwdLenOk) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (!pwdComplexOk) {
      setError("Parol kamida bitta harf va bitta raqam bo'lishi kerak.");
      return;
    }
    if (!pwdMatches) {
      setError("Parollar mos kelmaydi.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    }, 700);
  }

  function goBack() {
    setError(null);
    if (step === 2) {
      setStep(1);
      update("otp", "");
    } else if (step === 3) {
      setStep(2);
      update("password", "");
      update("confirm", "");
    }
  }

  // ===================== SUCCESS SCREEN =====================

  if (success) {
    return (
      <div className="w-full max-w-[440px]">
        <Card className="shadow-md">
          <div className="flex flex-col items-center px-8 py-12 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-emerald-50">
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-5 text-xl font-bold tracking-tight text-ink-900">
              Parol muvaffaqiyatli o&apos;rnatildi
            </h2>
            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-600">
              Kirish sahifasiga o&apos;tilmoqda…
            </p>
            <div className="mt-6 flex items-center gap-2 font-mono text-[12px] text-ink-500">
              <Loader2 className="size-3.5 animate-spin" />
              Yo&apos;naltirilmoqda
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ===================== RENDER =====================

  return (
    <div className="w-full max-w-[440px]">
      {/* Progress dots */}
      <DotsProgress current={step} />

      {/* Heading above card */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          {step === 1 && "Parolni tiklash"}
          {step === 2 && "Tasdiqlash kodi"}
          {step === 3 && "Yangi parol o'rnatish"}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
          {step === 1 &&
            "Korxona STIR'i bilan bog'langan telefon raqamni kiriting — biz SMS orqali tasdiqlash kodini yuboramiz."}
          {step === 2 && (
            <>
              <span className="font-mono text-ink-900">+998 {formatPhone(form.phone)}</span>{" "}
              raqamiga 6 raqamli kod yuborildi.
            </>
          )}
          {step === 3 &&
            "Kuchli parolni tanlang — kamida 8 ta belgi, harf va raqam."}
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
            <form onSubmit={handleSendCode} className="space-y-5">
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
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-[12px] text-ink-500">
                  STIR ro&apos;yxatdan o&apos;tgan korxonangizning rasmiy raqami.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="h-11 w-full text-[15px]"
                disabled={!phoneValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Yuborilmoqda…
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    SMS yuborish
                  </>
                )}
              </Button>

              <div className="space-y-2 rounded-md border border-border bg-ink-100/50 px-4 py-3 text-center">
                <p className="text-[12px] leading-relaxed text-ink-600">
                  Telefoningizni eslay olmayapsizmi?{" "}
                  <Link
                    href="/yordam"
                    className="font-semibold text-navy-700 dark:text-navy-300 hover:text-navy-600 dark:text-navy-400"
                  >
                    Yordamga murojaat qiling
                  </Link>
                </p>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
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
                  value={form.otp}
                  onChange={(e) => update("otp", digitsOnly(e.target.value).slice(0, 6))}
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
                      onClick={handleResend}
                      className="font-semibold text-navy-700 dark:text-navy-300 hover:text-navy-600 dark:text-navy-400"
                    >
                      Qayta yuborish
                    </button>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="h-11 w-full text-[15px]"
                disabled={!otpValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Tekshirilmoqda…
                  </>
                ) : (
                  <>
                    <KeyRound className="size-4" />
                    Tasdiqlash
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={goBack}
                className="flex w-full items-center justify-center gap-1.5 text-[13px] font-medium text-ink-600 hover:text-ink-900"
              >
                <ArrowLeft className="size-3.5" />
                Telefon raqamni o&apos;zgartirish
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSetPassword} className="space-y-5">
              <div>
                <Label htmlFor="password">Yangi parol</Label>
                <div className="relative">
                  <Input
                    id="password"
                    ref={pwdRef}
                    type={showPwd ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Kamida 8 ta belgi"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-sm text-ink-400 hover:text-ink-700"
                    aria-label={showPwd ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  >
                    {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <Requirement ok={pwdLenOk} text="Kamida 8 ta belgi" />
                    <Requirement
                      ok={pwdComplexOk}
                      text="Kamida bitta harf va bitta raqam"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirm">Parolni tasdiqlash</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Parolni qayta kiriting"
                    value={form.confirm}
                    onChange={(e) => update("confirm", e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-sm text-ink-400 hover:text-ink-700"
                    aria-label={
                      showConfirm ? "Parolni yashirish" : "Parolni ko'rsatish"
                    }
                  >
                    {showConfirm ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {form.confirm.length > 0 && !pwdMatches && (
                  <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">
                    Parollar mos kelmaydi
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="emerald"
                className="h-11 w-full text-[15px]"
                disabled={!pwdValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saqlanmoqda…
                  </>
                ) : (
                  <>
                    <Lock className="size-4" />
                    Parolni o&apos;rnatish
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={goBack}
                className="flex w-full items-center justify-center gap-1.5 text-[13px] font-medium text-ink-600 hover:text-ink-900"
              >
                <ArrowLeft className="size-3.5" />
                Orqaga
              </button>
            </form>
          )}
        </div>
      </Card>

      <p className="mt-6 text-center text-[13px] text-ink-600">
        Hisobingizga kirish mumkinmi?{" "}
        <Link href="/login" className="font-semibold text-navy-700 dark:text-navy-300 hover:text-navy-600 dark:text-navy-400">
          Kirish →
        </Link>
      </p>
    </div>
  );
}

// ===================== PROGRESS DOTS =====================

function DotsProgress({ current }: { current: Step }) {
  const steps: Step[] = [1, 2, 3];
  return (
    <div className="mb-7">
      <div className="mx-auto flex max-w-[280px] items-center gap-2">
        {steps.map((n, i) => {
          const isDone = n < current;
          const isCurrent = n === current;
          return (
            <div key={n} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border font-mono text-[11px] font-semibold transition-colors",
                  isDone && "border-emerald-600 bg-emerald-600 text-white",
                  isCurrent && "border-navy-700 bg-navy-700 text-white",
                  !isDone && !isCurrent && "border-ink-300 bg-surface-card text-ink-400"
                )}
              >
                {isDone ? <Check className="size-3.5" /> : n}
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

function Requirement({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-[11px]",
        ok ? "text-emerald-700 dark:text-emerald-300" : "text-ink-500"
      )}
    >
      <span
        className={cn(
          "grid size-3.5 place-items-center rounded-full border",
          ok ? "border-emerald-600 bg-emerald-600" : "border-ink-300"
        )}
      >
        {ok && <Check className="size-2.5 text-white" />}
      </span>
      {text}
    </div>
  );
}
