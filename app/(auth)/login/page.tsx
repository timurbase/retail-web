"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Loader2,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import {
  sendOtpAction,
  verifyOtpAction,
  selectStoreAction,
  selectSupplierAction,
  type Membership,
} from "@/lib/actions/auth";

type Step = "phone" | "otp";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 5));
  if (digits.length > 5) parts.push(digits.slice(5, 7));
  if (digits.length > 7) parts.push(digits.slice(7, 9));
  return parts.join(" ");
}

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

function membershipPortal(m: Membership): "store" | "supplier" | "soliq" | undefined {
  if (m.portal) return m.portal;
  if (m.supplier || m.tenant_id || m.tenantId) return "supplier";
  if (m.store || m.store_id || m.storeId) return "store";
  return undefined;
}

function membershipId(m: Membership): string | undefined {
  return (
    m.store_id ??
    m.storeId ??
    m.store?.id ??
    m.tenant_id ??
    m.tenantId ??
    m.supplier?.id ??
    (m.id as string | undefined)
  );
}

function mapErrorCode(code: string | undefined, fallback: string): string {
  switch (code) {
    case "no_user":
      return "Bu telefon ro'yxatdan o'tmagan. Avval ro'yxatdan o'ting.";
    case "invalid":
      return "Kod noto'g'ri yoki muddati o'tgan";
    case "too_many_attempts":
      return "Juda ko'p urinish. Yangi kod so'rang.";
    default:
      return fallback;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { info } = useToast();
  const [step, setStep] = useState<Step>("phone");
  const [role, setRole] = useState<Role>("store");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [resendIn, setResendIn] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "otp") {
      otpInputRef.current?.focus();
      setResendIn(60);
    }
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const phoneDigits = digitsOnly(phone);
  const phoneValid = phoneDigits.length === 9;
  const otpValid = otp.length === 6;

  function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!phoneValid) {
      setError("Telefon raqam to'liq emas. +998 dan keyin 9 ta raqam bo'lishi kerak.");
      return;
    }
    startTransition(async () => {
      const res = await sendOtpAction(phoneDigits, "login");
      if (!res.ok) {
        setError(mapErrorCode(res.code, res.error));
        return;
      }
      setStep("otp");
    });
  }

  function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!otpValid) {
      setError("Tasdiqlash kodi 6 ta raqamdan iborat bo'lishi kerak.");
      return;
    }
    startTransition(async () => {
      const res = await verifyOtpAction(phoneDigits, otp, "login");
      if (!res.ok) {
        setError(mapErrorCode(res.code, res.error));
        return;
      }

      const memberships = res.memberships ?? [];
      if (memberships.length === 0) {
        setError(
          "Bu telefon hech qaysi portalga biriktirilmagan. Ro'yxatdan o'ting.",
        );
        return;
      }

      // Filter memberships by the chosen role (the segmented control).
      const filtered =
        role === "soliq"
          ? memberships.filter((m) => membershipPortal(m) === "soliq")
          : memberships.filter((m) => membershipPortal(m) === role);

      if (filtered.length === 0) {
        const roleLabel =
          role === "store"
            ? "Korxona"
            : role === "supplier"
              ? "Ta'minotchi"
              : "Soliq";
        setError(
          `${roleLabel} portali uchun ushbu telefonda hisob topilmadi. Boshqa rol tanlang yoki ro'yxatdan o'ting.`,
        );
        return;
      }

      if (filtered.length === 1) {
        const m = filtered[0];
        const portal = membershipPortal(m);
        const id = membershipId(m);
        if (!id) {
          setError("Hisob ma'lumotlari to'liq emas. Yordamga murojaat qiling.");
          return;
        }
        const selectRes =
          portal === "supplier"
            ? await selectSupplierAction(id)
            : await selectStoreAction(id);
        if (!selectRes.ok) {
          setError(selectRes.error);
          return;
        }
        router.push(portal === "supplier" ? "/supplier/dashboard" : "/dashboard");
        return;
      }

      // Multiple memberships for the chosen portal → let the user pick.
      router.push("/select-portal");
    });
  }

  function handleResend() {
    if (resendIn > 0) return;
    setResendIn(60);
    setError(null);
    startTransition(async () => {
      const res = await sendOtpAction(phoneDigits, "login");
      if (!res.ok) setError(mapErrorCode(res.code, res.error));
    });
  }

  function handleBackToPhone() {
    setStep("phone");
    setOtp("");
    setError(null);
  }

  function handleEimzo() {
    info(
      "E-IMZO integratsiyasi tayyorlanmoqda",
      "Yangilanish haqida xabar olish uchun email manzilingizni qoldiring.",
    );
  }

  return (
    <div className="w-full max-w-[440px]">
      {/* Heading above card — gives premium spacing */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          {step === "phone" ? "Hisobingizga kiring" : "SMS tasdiqlash"}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
          {step === "phone"
            ? "Korxona STIR'i bilan bog'langan telefon raqamga SMS yuboramiz."
            : (
              <>
                <span className="font-mono text-ink-900">+998 {formatPhone(phone)}</span>{" "}
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

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              {/* Role selector — segmented control */}
              <div>
                <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-surface-card p-1">
                  <button
                    type="button"
                    onClick={() => setRole("store")}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-sm px-2 py-2 text-[12px] font-medium transition-colors",
                      role === "store"
                        ? "bg-navy-700 text-white"
                        : "text-ink-600 hover:bg-ink-100",
                    )}
                  >
                    <Store className="size-4" />
                    Korxona
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("supplier")}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-sm px-2 py-2 text-[12px] font-medium transition-colors",
                      role === "supplier"
                        ? "bg-navy-700 text-white"
                        : "text-ink-600 hover:bg-ink-100",
                    )}
                  >
                    <Truck className="size-4" />
                    Ta&apos;minotchi
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("soliq")}
                    disabled
                    title="Faqat taklif orqali"
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-sm px-2 py-2 text-[12px] font-medium transition-colors",
                      "text-ink-600 disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    <ShieldCheck className="size-4" />
                    Soliq
                  </button>
                </div>
                <div className="mt-2 text-center text-[11px] text-ink-500">
                  {role === "store" && "Chakana savdo do'koni, MChJ yoki YaT"}
                  {role === "supplier" && "Ulgurji distribyutor / brand vakili"}
                  {role === "soliq" && "Faqat taklif orqali (taklif kodi kerak)"}
                </div>
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
                    value={formatPhone(phone)}
                    onChange={(e) => setPhone(digitsOnly(e.target.value))}
                    className="h-full flex-1 bg-transparent px-3 font-mono text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-[12px] text-ink-500">
                  STIR ro'yxatdan o'tgan korxonangizning rasmiy raqami.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="h-11 w-full text-[15px]"
                disabled={!phoneValid || pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Yuborilmoqda…
                  </>
                ) : (
                  <>
                    SMS yuborish
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-[13px] font-medium text-navy-700 dark:text-navy-300 hover:text-navy-600 dark:text-navy-400 hover:underline"
                >
                  Parolni unutdingizmi?
                </Link>
              </div>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface-card px-3 font-mono text-[11px] uppercase tracking-wider text-ink-500">
                    yoki
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleEimzo}
                className="h-11 w-full text-[14px]"
              >
                <ShieldCheck className="size-4 text-navy-700 dark:text-navy-300" />
                E-IMZO bilan kirish
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <Label htmlFor="otp">Tasdiqlash kodi</Label>
                <Input
                  id="otp"
                  ref={otpInputRef}
                  mono
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="• • • • • •"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(digitsOnly(e.target.value).slice(0, 6))}
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
                disabled={!otpValid || pending}
              >
                {pending ? (
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
                onClick={handleBackToPhone}
                className="flex w-full items-center justify-center gap-1.5 text-[13px] font-medium text-ink-600 hover:text-ink-900"
              >
                <ArrowLeft className="size-3.5" />
                Telefon raqamni o'zgartirish
              </button>
            </form>
          )}
        </div>
      </Card>

      <p className="mt-6 text-center text-[13px] text-ink-600">
        Hisob yo'qmi?{" "}
        <Link
          href="/register"
          className="font-semibold text-navy-700 dark:text-navy-300 hover:text-navy-600 dark:text-navy-400"
        >
          Bepul ro'yxatdan o'tish →
        </Link>
      </p>
    </div>
  );
}
