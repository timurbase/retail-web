"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Send, Loader2 } from "lucide-react";

const subjects = [
  "Demo so'rovi",
  "Savol",
  "Texnik yordam",
  "Shartnoma / sotuvlar",
  "Hamkorlik",
  "Boshqa",
] as const;

interface FormState {
  ism: string;
  email: string;
  telefon: string;
  korxona: string;
  mavzu: string;
  xabar: string;
}

const initial: FormState = {
  ism: "",
  email: "",
  telefon: "",
  korxona: "",
  mavzu: subjects[0],
  xabar: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.xabar.trim().length < 20) {
      toast.warning("Xabar juda qisqa", "Iltimos kamida 20 ta belgi yozing.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    toast.success("Xabar yuborildi", "24 soat ichida javob beramiz.");
    setForm(initial);
  }

  return (
    <div className="rounded-md border border-border bg-surface-card p-7">
      <h2 className="text-xl font-bold tracking-tight text-ink-900">
        Xabar yuborish
      </h2>
      <p className="mt-1 text-[13px] text-ink-500">
        Maydonlar to&apos;ldirilgach &quot;Yuborish&quot; tugmasini bosing.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ism">Ism *</Label>
            <Input
              id="ism"
              required
              value={form.ism}
              onChange={(e) => update("ism", e.target.value)}
              placeholder="Asror Tursunov"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="ism@korxona.uz"
              mono
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="telefon">Telefon *</Label>
            <Input
              id="telefon"
              type="tel"
              required
              value={form.telefon}
              onChange={(e) => update("telefon", e.target.value)}
              placeholder="+998 90 123 45 67"
              mono
            />
          </div>
          <div>
            <Label htmlFor="korxona">Korxona</Label>
            <Input
              id="korxona"
              value={form.korxona}
              onChange={(e) => update("korxona", e.target.value)}
              placeholder="Korxona nomi"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="mavzu">Mavzu *</Label>
          <select
            id="mavzu"
            required
            value={form.mavzu}
            onChange={(e) => update("mavzu", e.target.value)}
            className="h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900 focus:border-navy-700 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="xabar">Xabar * <span className="font-normal text-ink-400 normal-case">(kamida 20 belgi)</span></Label>
          <textarea
            id="xabar"
            required
            minLength={20}
            value={form.xabar}
            onChange={(e) => update("xabar", e.target.value)}
            placeholder="Loyihangiz, savolingiz yoki taklifingiz haqida qisqacha yozing..."
            rows={5}
            className="w-full rounded-sm border border-border-strong bg-surface-card px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-navy-700 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
          />
          <div className="mt-1 text-right font-mono text-[11px] text-ink-400">
            {form.xabar.length} / 20+
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="emerald"
            disabled={submitting}
            className="h-11 w-full px-6 text-[15px]"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Yuborish
              </>
            )}
          </Button>
          <p className="mt-3 text-center text-[12px] text-ink-500">
            Yuborish orqali siz{" "}
            <Link href="/maxfiylik" className="text-navy-700 dark:text-navy-300 hover:underline">
              maxfiylik siyosati
            </Link>
            ni qabul qilasiz.
          </p>
        </div>
      </form>
    </div>
  );
}
