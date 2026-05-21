"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function StatusSubscribeForm() {
  const { success, error } = useToast();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      error("Email noto'g'ri", "To'g'ri email manzilini kiriting");
      return;
    }
    setPending(true);
    setTimeout(() => {
      setPending(false);
      success("Obuna bo'ldingiz", `${v} manziliga incident xabarlari yuboriladi`);
      setEmail("");
    }, 700);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
        <input
          type="email"
          required
          disabled={pending}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="siz@kompaniya.uz"
          className="h-11 w-full rounded-sm border border-border-strong bg-surface-card pl-9 pr-3 text-[14px] text-ink-900 placeholder:text-ink-400 focus:-outline-offset-1 focus:border-navy-700 focus:outline-2 focus:outline-navy-700"
        />
      </div>
      <Button type="submit" disabled={pending} className="h-11 px-5">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Yuborilmoqda…
          </>
        ) : (
          "Obuna bo'lish"
        )}
      </Button>
    </form>
  );
}
