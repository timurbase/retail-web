import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, Lock, Handshake, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Biz haqimizda · RetailFlow AI",
  description:
    "RetailFlow AI — O'zbekiston chakana savdosini raqamlashtirish maqsadidagi B2B SaaS platforma.",
};

const team = [
  {
    name: "Asror Tursunov",
    role: "Asoschisi · CEO",
    bio: "Avval Soliq qo'mitasida 6 yil davomida MXIK tizimini ishlab chiqdi.",
    initials: "AT",
    color: "bg-navy-700",
  },
  {
    name: "Karim Ibragimov",
    role: "Asoschisi · CTO",
    bio: "Eski Uzcard CTO. Pgvector, GPT-4o va distributed systems.",
    initials: "KI",
    color: "bg-emerald-600",
  },
  {
    name: "Dilshod Akmalov",
    role: "Product Lead",
    bio: "10 yil 1C UZ va Moysklad ishlab chiqaruvchi. Retail workflow eksperti.",
    initials: "DA",
    color: "bg-navy-800",
  },
  {
    name: "Sevara Yusupova",
    role: "Design Lead",
    bio: "Avval Click va Payme'da. USDS-style government UX'ga ixtisoslashgan.",
    initials: "SY",
    color: "bg-emerald-700",
  },
  {
    name: "Jasur Toshmatov",
    role: "Engineering",
    bio: "Backend kapitan. PostgreSQL, Next.js, AI infrastructure.",
    initials: "JT",
    color: "bg-navy-700",
  },
  {
    name: "Aziz Karimov",
    role: "Sales & Partnerships",
    bio: "Didox va Soliq.uz bilan integratsiya muzokaralari.",
    initials: "AK",
    color: "bg-emerald-600",
  },
];

const values = [
  {
    Icon: Target,
    title: "Aniqlik",
    body: "Soliq tekshiruviga tayyor sifat. Har bir AI natija tekshirilgan, har bir kod auditga tayyor.",
  },
  {
    Icon: Zap,
    title: "Tezlik",
    body: "Operator vaqti — eng qimmatli resurs. Har bir click 100ms ichida, har bir hujjat 30 soniyada.",
  },
  {
    Icon: Lock,
    title: "Maxfiylik",
    body: "Sizning ma'lumotlaringiz sizniki. Biz hech qachon sotmaymiz, reklamaga bermaymiz, AI modelimizga o'qitmaymiz.",
  },
  {
    Icon: Handshake,
    title: "Hamkorlik",
    body: "Hech kim yolg'iz emas. Telegram'da 24/7, Du-Ju ish vaqtida — har bir operator ortida real odam turadi.",
  },
];

const partners = [
  { name: "Soliq.uz", note: "MXIK integratsiya partner" },
  { name: "Didox", note: "Rasmiy EDO partner" },
  { name: "Click", note: "To'lov integratsiya" },
  { name: "Payme", note: "To'lov integratsiya" },
  { name: "AWS Activate", note: "Pre-seed credit" },
  { name: "Beta backers", note: "Anonim malakali investorlar" },
];

export default function AboutPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          className="absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #0B3D91 1px, transparent 1px), linear-gradient(to bottom, #0B3D91 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="mx-auto max-w-5xl px-6 py-20 lg:py-24">
          <div className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
            Biz haqimizda
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink-900 sm:text-5xl lg:text-[52px]">
            Bizning maqsadimiz —{" "}
            <span className="relative inline-block">
              <span className="relative z-10">O&apos;zbekiston chakana savdosini</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-emerald-500/30" />
            </span>{" "}
            raqamlashtirish.
          </h1>
          <p className="mt-6 max-w-3xl text-[18px] leading-relaxed text-ink-600">
            Biz 270,000+ kichik do&apos;konlarning kun-kunlik tovar qabul qilish va hujjat ishlash jarayonini AI bilan tezlashtiramiz. Operator faqat shubhali yozuvlarni ko&apos;rib chiqadi — qolganlarini AI o&apos;zi bajaradi.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
            <Stat value="270K+" label="Maqsadli do'konlar" />
            <Divider />
            <Stat value="87%" label="AI aniqlik" color="text-emerald-600 dark:text-emerald-400" />
            <Divider />
            <Stat value="6 oy" label="Beta davri" color="text-navy-700 dark:text-navy-300" />
            <Divider />
            <Stat value="2026" label="Toshkentda asoslangan" />
          </div>
        </div>
      </section>

      {/* ===== HIKOYAMIZ ===== */}
      <section className="border-b border-border bg-surface-card py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
            Hikoyamiz
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Nima uchun RetailFlow AI ni qurdik
          </h2>

          <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-ink-700">
            <p>
              2024-yilda asoschilarimizdan biri — Karim — eski Uzcard&apos;da ishlab yurganda, do&apos;stining oilaviy do&apos;konida bir kun o&apos;tkazdi. Omborchi bir nakladnoyni 47 daqiqa davomida Excelga ko&apos;chirardi. Mahsulot nomi noto&apos;g&apos;ri yozildi, MXIK kodi taxminan tanlandi, qoldiq 2 kun keyin ko&apos;ndi.
            </p>
            <p>
              O&apos;zbekistondagi 88,541 ta chakana savdo korxonasidan{" "}
              <strong className="text-ink-900">58.8%</strong> hali ham qog&apos;oz yoki Excel bilan ish yuritadi. Atigi 12.3% CRM tizimidan foydalanadi. Va 2026-yilning 1-yanvaridan Soliq.uz EHF risk scoring tizimini ishga tushirdi — ~10% hujjat avtomatik &quot;qizil&quot; belgilanishi mumkin. Manual hujjat boshqaruvi — keskin xavfli.
            </p>
            <p>
              MXIK kodi noto&apos;g&apos;ri tanlangani uchun jarima — realizatsiya qiymatining{" "}
              <strong className="text-ink-900">1%</strong>. Bu yiliga millionlab so&apos;m. Qo&apos;shimcha QQS kredit yo&apos;qotish xavfi va EHF rad etilishi.
            </p>
            <p>
              Biz <strong className="text-ink-900">2026-yil may oyida Toshkentda</strong> RetailFlow AI ni asosladik. Maqsadimiz — kichik biznes egasiga &quot;1C UZ&quot; yoki &quot;Moysklad&quot; o&apos;rniga, 2026-yil dizayni, AI yordami va O&apos;zbek tilida ishlaydigan vositadir. Birinchi 100 do&apos;kon uchun beta bepul.
            </p>
            <p>
              Biz Linear-clone yoki AliExpress-clone qurmaymiz. Biz mahalliy muammoga mahalliy yechim quramiz — Soliq.uz va Didox bilan birinchi qatorda integratsiya qilingan, USDS Public Sans bilan dizayn qilingan, lotin va kiril alifbosida birdek ishlaydigan platforma.
            </p>
          </div>
        </div>
      </section>

      {/* ===== JAMOA ===== */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
              Jamoa
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              6 odamlik jamoa, 60 yillik tajriba
            </h2>
            <p className="mt-4 text-[16px] text-ink-600">
              Soliq qo&apos;mitasi, Uzcard, Click, Payme, 1C UZ — biz O&apos;zbekiston fintech va retail dunyosini ichidan bilamiz.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((p) => (
              <div
                key={p.name}
                className="rounded-md border border-border bg-surface-card p-5 transition-colors hover:border-navy-700"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`grid size-12 shrink-0 place-items-center rounded-full ${p.color} font-mono text-[14px] font-bold text-white`}
                  >
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold text-ink-900">{p.name}</div>
                    <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-navy-700 dark:text-navy-300">
                      {p.role}
                    </div>
                    <div className="mt-2 text-[13px] leading-relaxed text-ink-600">
                      {p.bio}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARTNERS ===== */}
      <section className="border-b border-border bg-surface-card py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 max-w-2xl">
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
              Investorlar va sheriklar
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              Ishonchli ekotizim
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3"
              >
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-ink-900">{p.name}</div>
                  <div className="text-[12px] text-ink-500">{p.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QADRIYATLAR ===== */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
              Qadriyatlar
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Biz nimaga ishonamiz
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-md border border-border bg-surface-card p-5">
                <div className="mb-4 grid size-10 place-items-center rounded-md bg-navy-50 text-navy-700 dark:text-navy-300">
                  <Icon className="size-5" />
                </div>
                <div className="text-[16px] font-semibold text-ink-900">{title}</div>
                <div className="mt-2 text-[13px] leading-relaxed text-ink-600">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-xl border border-emerald-600 bg-emerald-50 p-10 md:p-14">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Bizga qo&apos;shiling
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-ink-900">
                  Birinchi 100 do&apos;kon uchun beta bepul
                </h2>
                <p className="mt-3 max-w-2xl text-[16px] text-ink-700">
                  6 oy davomida cheksiz hujjat, cheksiz MXIK validatsiya, cheksiz foydalanuvchi. Hech qanday kredit karta, hech qanday majburiyat.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/register">
                  <Button variant="emerald" size="md" className="h-11 px-6 text-[15px]">
                    Demo&apos;ni boshlash
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/bog-lanish">
                  <Button variant="secondary" size="md" className="h-11 px-6 text-[15px]">
                    Bog&apos;lanish
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({
  value,
  label,
  color = "text-ink-900",
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <div>
      <div className={`font-mono text-3xl font-bold tracking-tight ${color}`}>{value}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-ink-500">
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="hidden h-10 w-px bg-border sm:block" />;
}
