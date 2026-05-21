"use client";

import { useEffect, useState, useTransition } from "react";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createUserAction } from "@/lib/actions/users";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "omborchi", label: "Omborchi" },
  { value: "buxgalter", label: "Buxgalter" },
  { value: "kassir", label: "Kassir" },
  { value: "auditor", label: "Auditor" },
  { value: "firma", label: "Firma operatori" },
];

const EMPTY_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  role: "kassir",
};

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

function validate(state: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!state.fullName.trim() || state.fullName.trim().length < 2) {
    errors.fullName = "F.I.O. kamida 2 ta belgidan iborat bo'lishi kerak";
  }
  if (!state.email.trim()) {
    errors.email = "Email kiritilishi shart";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
    errors.email = "Email manzil noto'g'ri formatda";
  }
  if (digitsOnly(state.phone).length !== 9) {
    errors.phone = "Telefon raqam to'liq emas (+998 dan keyin 9 ta raqam)";
  }
  if (!state.role) {
    errors.role = "Rolni tanlang";
  }

  return errors;
}

export function InviteUserModal({ open, onClose }: InviteUserModalProps) {
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [open]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = validate(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: `+998${digitsOnly(form.phone)}`,
      role: form.role,
      status: "pending" as const,
    };

    startTransition(async () => {
      try {
        const res = await createUserAction(payload);
        if (res.ok) {
          success("Taklif yuborildi", payload.fullName);
          onClose();
        } else {
          error("Xatolik yuz berdi", "Foydalanuvchini yaratib bo'lmadi");
        }
      } catch {
        error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title="Yangi foydalanuvchi"
      description="Korxonaga yangi foydalanuvchi taklif yuborish"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {/* Full name */}
          <div>
            <Label htmlFor="invite-fullname">F.I.O.</Label>
            <Input
              id="invite-fullname"
              placeholder="Karimov Alisher Botirovich"
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              disabled={pending}
              autoFocus
            />
            {errors.fullName && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="alisher@korxona.uz"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              disabled={pending}
            />
            {errors.email && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="invite-phone">Telefon raqam</Label>
            <div className="flex h-9 w-full overflow-hidden rounded-sm border border-border-strong bg-surface-card focus-within:border-navy-700 focus-within:outline focus-within:outline-2 focus-within:outline-navy-700 focus-within:-outline-offset-1">
              <span className="grid place-items-center border-r border-border-strong bg-ink-100 px-3 font-mono text-sm font-semibold text-ink-700">
                +998
              </span>
              <input
                id="invite-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="XX XXX XX XX"
                value={formatPhone(form.phone)}
                onChange={(e) => setField("phone", digitsOnly(e.target.value))}
                disabled={pending}
                className="h-full flex-1 bg-transparent px-3 font-mono text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none disabled:opacity-60"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="invite-role">Rol</Label>
            <select
              id="invite-role"
              value={form.role}
              onChange={(e) => setField("role", e.target.value as UserRole)}
              disabled={pending}
              className={cn(
                "h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900",
                "focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1 focus:border-navy-700"
              )}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{errors.role}</p>
            )}
          </div>

          {/* Status (read-only badge) */}
          <div>
            <Label>Status</Label>
            <div className="flex h-9 items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-600 bg-amber-50 px-2.5 py-0.5 text-[11px] font-mono font-semibold uppercase text-amber-600 dark:text-amber-300">
                <span className="size-1.5 rounded-full bg-amber-600" />
                Taklif yuborilmoqda
              </span>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={pending}
          >
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Yuborilmoqda..." : "Taklif yuborish"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
