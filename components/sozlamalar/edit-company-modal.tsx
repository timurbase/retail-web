"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { updateCompanyAction } from "@/lib/actions/company";
import type { CompanyInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EditCompanyModalProps {
  open: boolean;
  onClose: () => void;
  company: CompanyInfo;
}

interface FormState {
  name: string;
  activity: string;
  address: string;
  director: string;
  phone: string;
  email: string;
  website: string;
}

function toForm(c: CompanyInfo): FormState {
  return {
    name: c.name,
    activity: c.activity,
    address: c.address,
    director: c.director,
    phone: c.phone,
    email: c.email,
    website: c.website,
  };
}

const ACTIVITY_OPTIONS = [
  "Chakana savdo (47.11 — Oziq-ovqat)",
  "Chakana savdo (47.19 — Universal magazin)",
  "Chakana savdo (47.21 — Meva-sabzavot)",
  "Ulgurji savdo (46.39 — Oziq-ovqat distribyutori)",
  "Umumiy ovqatlanish (56.10 — Restoran)",
  "Boshqa",
];

export function EditCompanyModal({ open, onClose, company }: EditCompanyModalProps) {
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(() => toForm(company));
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(toForm(company));
      setFormError(null);
    }
  }, [open, company]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (form.name.trim().length < 2) {
      setFormError("Korxona nomi kamida 2 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (form.director.trim().length < 2) {
      setFormError("Direktor F.I.O. ni kiriting");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError("Email manzili noto'g'ri");
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateCompanyAction({
          name: form.name.trim(),
          activity: form.activity.trim(),
          address: form.address.trim(),
          director: form.director.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          website: form.website.trim(),
        });
        if (res.ok) {
          success("Saqlandi", "Korxona ma'lumotlari yangilandi");
          onClose();
        } else {
          error("Xatolik yuz berdi", "Saqlab bo'lmadi");
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
      title="Korxona ma'lumotlarini tahrirlash"
      description={`STIR: ${company.stir} (o'zgartirilmaydi)`}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}

          <div>
            <Label htmlFor="comp-name">Korxona nomi</Label>
            <Input
              id="comp-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              disabled={pending}
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="comp-activity">Faoliyat turi</Label>
            <select
              id="comp-activity"
              value={
                ACTIVITY_OPTIONS.includes(form.activity) ? form.activity : "Boshqa"
              }
              onChange={(e) => setField("activity", e.target.value)}
              disabled={pending}
              className={cn(
                "h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900",
                "focus:-outline-offset-1 focus:border-navy-700 focus:outline-2 focus:outline-navy-700"
              )}
            >
              {ACTIVITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="comp-address">Manzil</Label>
            <Input
              id="comp-address"
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              disabled={pending}
            />
          </div>

          <div>
            <Label htmlFor="comp-director">Direktor</Label>
            <Input
              id="comp-director"
              value={form.director}
              onChange={(e) => setField("director", e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="comp-phone">Telefon</Label>
              <Input
                id="comp-phone"
                mono
                placeholder="+998 90 123 45 67"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                disabled={pending}
              />
            </div>
            <div>
              <Label htmlFor="comp-email">Email</Label>
              <Input
                id="comp-email"
                mono
                type="email"
                placeholder="info@example.uz"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                disabled={pending}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="comp-website">Veb-sayt</Label>
            <Input
              id="comp-website"
              mono
              placeholder="example.uz"
              value={form.website}
              onChange={(e) => setField("website", e.target.value)}
              disabled={pending}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saqlanmoqda…
              </>
            ) : (
              "Saqlash"
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
