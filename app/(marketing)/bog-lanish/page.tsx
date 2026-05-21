import type { Metadata } from "next";
import { Phone, Mail, MessageCircle, Building2, MapPin, Clock } from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Bog'lanish · RetailFlow AI",
  description:
    "RetailFlow AI bilan bog'laning — demo, savol, taklif yoki shartnoma.",
};

const methods = [
  {
    Icon: Phone,
    title: "Telefon",
    value: "+998 78 555 00 00",
    note: "Du–Ju · 09:00–18:00 (Asia/Tashkent)",
    mono: true,
  },
  {
    Icon: Mail,
    title: "Email",
    value: "hello@retailflow.uz",
    note: "24 soat ichida javob beramiz",
    mono: true,
  },
  {
    Icon: MessageCircle,
    title: "Telegram",
    value: "@retailflow_uz",
    note: "Eng tez kanal — daqiqa ichida javob",
    mono: true,
  },
  {
    Icon: Building2,
    title: "Ofis",
    value: "Toshkent, Chilonzor tumani",
    note: "Bunyodkor ko'chasi 1A, 4-qavat",
    mono: false,
  },
];

const hours = [
  { day: "Dushanba", hours: "09:00 – 18:00" },
  { day: "Seshanba", hours: "09:00 – 18:00" },
  { day: "Chorshanba", hours: "09:00 – 18:00" },
  { day: "Payshanba", hours: "09:00 – 18:00" },
  { day: "Juma", hours: "09:00 – 17:00" },
  { day: "Shanba", hours: "Telegram orqali" },
  { day: "Yakshanba", hours: "Dam olish kuni" },
];

export default function BogLanishPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 max-w-2xl">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
          Bog&apos;lanish
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-ink-900">
          Biz bilan suhbatlashing
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-600">
          Demo, savol, taklif yoki shartnoma — istalgan kanal orqali bog&apos;laning. Ish vaqtida 24 soat ichida, Telegram orqali esa daqiqa ichida javob beramiz.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* LEFT: Contact methods + hours */}
        <div className="space-y-4">
          {methods.map(({ Icon, title, value, note, mono }) => (
            <div
              key={title}
              className="rounded-md border border-border bg-surface-card p-5 transition-colors hover:border-navy-700"
            >
              <div className="flex items-start gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-md bg-navy-50 text-navy-700 dark:text-navy-300">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    {title}
                  </div>
                  <div className={`mt-1 text-[16px] font-semibold text-ink-900 ${mono ? "font-mono" : ""}`}>
                    {value}
                  </div>
                  <div className="mt-1 text-[13px] text-ink-600">{note}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Ish vaqti */}
          <div className="rounded-md border border-border bg-surface-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="size-4 text-navy-700 dark:text-navy-300" />
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                Ish vaqti
              </div>
            </div>
            <div className="divide-y divide-border">
              {hours.map((h) => (
                <div
                  key={h.day}
                  className="flex items-center justify-between py-2 text-[14px]"
                >
                  <span className="text-ink-700">{h.day}</span>
                  <span className={`font-mono text-[13px] ${h.day === "Yakshanba" ? "text-ink-400" : "text-ink-900"}`}>
                    {h.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <ContactForm />
      </div>

      {/* Map */}
      <div className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-bold tracking-tight text-ink-900">
            Bizning ofisimiz
          </h2>
          <a
            href="https://yandex.uz/maps/"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[13px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
          >
            Yandex Xarita&apos;da ochish →
          </a>
        </div>
        <div className="relative h-80 overflow-hidden rounded-md border border-border bg-navy-50">
          {/* grid background */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #0B3D91 1px, transparent 1px), linear-gradient(to bottom, #0B3D91 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Pin */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-navy-700/30" />
                <div className="relative grid size-14 place-items-center rounded-full bg-navy-700 text-white shadow-lg">
                  <MapPin className="size-7" />
                </div>
              </div>
              <div className="rounded-md border border-border bg-surface-card px-4 py-2.5 shadow-md">
                <div className="text-[13px] font-semibold text-ink-900">
                  RetailFlow AI ofisi
                </div>
                <div className="font-mono text-[11px] text-ink-500">
                  41.2856° N, 69.2034° E
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
