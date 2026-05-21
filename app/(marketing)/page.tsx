import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  ShieldCheck,
  Camera,
  Search,
  BarChart3,
  Zap,
  Smartphone,
  Network,
  PlayCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        {/* subtle navy grid background */}
        <div className="absolute inset-0 -z-10 opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(to right, #0B3D91 1px, transparent 1px), linear-gradient(to bottom, #0B3D91 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: copy */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-600 bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                BETA · O'zbekistondagi 270K+ do'kon uchun yaratildi
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
                Tovar qabul qilishni{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">AI yordamida</span>
                  <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-emerald-500/30" />
                </span>{" "}
                10× tez bajaring.
              </h1>

              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-600">
                Didox hujjatlarini avtomatik parslaydi, MXIK kodlarini Soliq.uz katalogi bilan tasdiqlaydi, do'kon omboriga yozadi. Operator faqat shubhali yozuvlarni tekshiradi.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/register">
                  <Button size="md" className="h-11 px-6 text-[15px]">
                    Bepul boshlash
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="secondary" size="md" className="h-11 px-6 text-[15px]">
                    <PlayCircle className="size-4" />
                    Demo ko'rish
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-ink-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Didox EDO
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Soliq.uz MXIK
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  O'zbek tilida
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Beta — birinchi 6 oy bepul
                </span>
              </div>
            </div>

            {/* Right: dashboard preview card */}
            <div className="relative">
              <div className="rounded-xl border border-border bg-surface-card p-5 shadow-2xl shadow-navy-900/10">
                {/* mini chrome */}
                <div className="mb-4 flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-500" />
                  <span className="size-2.5 rounded-full bg-amber-600" />
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-3 font-mono text-[10px] text-ink-400">
                    retailflow.uz/hujjatlar/12345
                  </span>
                </div>

                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="text-[13px] font-bold text-ink-900">
                      Hujjat №12345 — Alpha Distribution
                    </div>
                    <div className="font-mono text-[11px] text-ink-500">
                      21.05.2026 · 4,567,800 so'm
                    </div>
                  </div>
                  <span className="rounded-full border border-amber-600 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-300">
                    3 review
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-md border border-l-4 border-border border-l-emerald-600 bg-surface-card p-2.5 text-[12px]">
                    <div className="flex-1">
                      <div className="font-semibold text-ink-900">Mol go'shti premium</div>
                      <div className="font-mono text-[10px] text-ink-500">MXIK 0201301000 · 15 kg</div>
                    </div>
                    <ConfidenceBadge score={0.98} />
                  </div>
                  <div className="flex items-center gap-3 rounded-md border border-l-4 border-border border-l-amber-600 bg-surface-card p-2.5 text-[12px]">
                    <div className="flex-1">
                      <div className="font-semibold text-ink-900">Coca-Cola 0.5L</div>
                      <div className="font-mono text-[10px] text-amber-600 dark:text-amber-300">Yangi mahsulot · MXIK 2202100000?</div>
                    </div>
                    <ConfidenceBadge score={0.72} />
                  </div>
                  <div className="flex items-center gap-3 rounded-md border border-l-4 border-border border-l-red-600 bg-surface-card p-2.5 text-[12px]">
                    <div className="flex-1">
                      <div className="font-semibold text-ink-900">Hindiston choyi</div>
                      <div className="font-mono text-[10px] text-red-700 dark:text-red-300">3 variantdan tanlang</div>
                    </div>
                    <ConfidenceBadge score={0.43} />
                  </div>
                  <div className="flex items-center gap-3 rounded-md border border-l-4 border-border border-l-emerald-600 bg-surface-card p-2.5 text-[12px]">
                    <div className="flex-1">
                      <div className="font-semibold text-ink-900">Sut 1L Imkon</div>
                      <div className="font-mono text-[10px] text-ink-500">MXIK 0401200000 · 30 dona</div>
                    </div>
                    <ConfidenceBadge score={0.95} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-md bg-ink-100 px-3 py-2 text-[11px]">
                  <span className="text-ink-600">
                    <strong className="font-mono text-ink-900">5/8</strong> avto-mos · 3 kutmoqda
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">Tasdiqlash →</span>
                </div>
              </div>

              {/* floating elements */}
              <div className="absolute -left-6 -bottom-6 hidden rounded-lg border border-border bg-surface-card p-3 shadow-lg lg:block">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[12px] font-semibold text-ink-900">
                    AI tahlil 5 sekundda
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="border-b border-border bg-surface-card">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <Stat value="270K+" label="Maqsadli do'konlar" />
            <Stat value="461,800+" label="MXIK kodi katalogda" />
            <Stat value="87%" label="Avto-aniqlik (beta)" valueColor="text-emerald-600 dark:text-emerald-400" />
            <Stat value="10×" label="Tezroq qabul qilish" valueColor="text-navy-700 dark:text-navy-300" />
          </div>
        </div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
              Muammo
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              O'zbekiston chakana savdosi hali ham qog'oz davrida.
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-600">
              88,541 ta chakana savdo korxonasidan 99.6% kichik biznes. Ularning aksariyati hujjatlarni qo'lda yuritadi, MXIK kodlarini Excelda nusxalaydi, ombor qoldig'ini kechikib biladi.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <ProblemCard
              stat="58.8%"
              title="Qo'lda yuritiladi"
              body="270,000+ kichik korxona Excel yoki qog'oz yordamida hujjat yuritadi. CRM tizimlardan foydalanish darajasi atigi 12.3%."
            />
            <ProblemCard
              stat="1%"
              title="Jarima MXIK xato uchun"
              body="Realizatsiya qilingan tovar qiymatining 1% — har bir noto'g'ri MXIK kodi soliq jarimasini keltiradi. Plus QQS kredit yo'qotish xavfi."
              accent="red"
            />
            <ProblemCard
              stat="10%"
              title="EHF 2026 risk scoring"
              body="2026-yil 1-yanvardan EHF real-time risk baholash tizimi: ~10% hujjat 'qizil' belgilanishi mumkin. Manual hujjat boshqaruvi keskin xavfli."
              accent="amber"
            />
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="qanday-ishlaydi" className="border-b border-border bg-navy-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-500">
              Qanday ishlaydi
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Hujjat → AI → Ombor. 30 soniya.
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-white/70">
              Yarim-avtomatik (human-in-the-loop) — AI ishonchli yozuvlarni avtomatik o'tkazadi, faqat shubhali joylarni operatorga ko'rsatadi.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <StepCard
              n="01"
              title="Hujjat keladi"
              body="Didox EDO orqali, Excel/PDF yuklab olish, yoki mobile foto orqali. Yetkazib beruvchi tomondan webhook qabul qilinadi."
              Icon={FileText}
            />
            <StepCard
              n="02"
              title="AI parslaydi"
              body="GPT-4o mahsulot nomlarini ajratadi, pgvector similarity bilan ichki nomenklatura'ga moslashtiradi, tasnif.soliq.uz katalogidan MXIK kodini tavsiya qiladi."
              Icon={Sparkles}
            />
            <StepCard
              n="03"
              title="Operator tasdiqlaydi"
              body="Yuqori ishonchlilik (≥90%) avtomatik o'tadi. Shubhali yozuvlar review queue'ga tushadi. Tasdiq → do'kon ombori yangilanadi."
              Icon={ShieldCheck}
            />
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="imkoniyatlar" className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
              Imkoniyatlar
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Operator vaqtini 5× tezlashtiradigan vositalar.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              Icon={Network}
              title="Didox to'g'ridan-to'g'ri integratsiya"
              body="EDO webhook qabul qiluvchi tayyor. STIR avtomatik tekshirilad, hujjatlar darhol parsing queue'ga tushadi."
            />
            <FeatureCard
              Icon={Search}
              title="MXIK real-time validator"
              body="461,800+ kod katalogi pgvector similarity bilan. Operator yozayotganda autocomplete, 50ms ichida 5 ta variant."
            />
            <FeatureCard
              Icon={Sparkles}
              title="AI confidence scoring"
              body="Har bir yozuv 0-100% ishonchlilik. Yashil (≥90%) avto-tasdiq, sariq (60-89%) operator ko'rib chiqadi, qizil (<60%) batafsil review."
            />
            <FeatureCard
              Icon={Camera}
              title="Mobile foto-kirim"
              body="Qog'oz nakladnoyni surat oling — GPT-4o vision parslaydi, MXIK tavsiya qiladi, ombor kirim yaratadi. Daladan bevosita ish."
            />
            <FeatureCard
              Icon={Zap}
              title="Daily AI insights"
              body="Har kuni ertalab: kritik qoldiqlar, 1-click reorder tavsiyalari, narx oshishlari, dublikat shubhalari. Push notification."
            />
            <FeatureCard
              Icon={BarChart3}
              title="To'liq audit log"
              body="Har bir amal (kim, qachon, nima) PostgreSQL append-only loglarda. Soliq tekshiruvi uchun tayyor, immutable."
            />
            <FeatureCard
              Icon={Smartphone}
              title="iOS + Android mobile"
              body="Omborchi savdo zalida bir qo'l ish: swipe-to-approve, barcode scan, push bildirishnoma. React Native + Expo."
            />
            <FeatureCard
              Icon={ShieldCheck}
              title="Multi-tenant ready"
              body="Distribyutor portal kelmoqda: 1 firma → 50-500 do'kon network, real-time talab grafikasi, narx sinxronizatsiyasi."
            />
            <FeatureCard
              Icon={FileText}
              title="O'zbek tilida AI yordamchi"
              body="Har sahifada chat widget. 'Yangi mahsulot qanday qo'shaman?' so'rang — GPT-4o-mini o'zbek tilida javob beradi."
            />
          </div>
        </div>
      </section>

      {/* ===== DEMO CALLOUT ===== */}
      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-xl border border-border bg-navy-900 p-10 text-white md:p-16">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-500">
                  Live demo
                </div>
                <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                  Ro'yxatdan o'tmasdan ham demo ko'ring.
                </h2>
                <p className="mt-5 text-white/70">
                  Mock ma'lumotlar bilan to'liq Dashboard, hujjat tafsiloti va review queue. Hech qanday ro'yxatdan o'tish kerak emas — bir bosish va boshlaydi.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/dashboard">
                    <Button variant="emerald" size="md" className="h-11 px-6 text-[15px]">
                      <PlayCircle className="size-4" />
                      Demo dashboard
                    </Button>
                  </Link>
                  <Link href="/hujjatlar/doc_12345">
                    <Button variant="secondary" size="md" className="h-11 px-6 text-[15px] !bg-white/10 !text-white !border-white/20 hover:!bg-white/15">
                      Hujjat review ko'rinishi
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-lg bg-white/5 p-1 backdrop-blur">
                  <div className="rounded-md bg-navy-800 p-4 font-mono text-[11px] leading-relaxed">
                    <div className="text-emerald-500">$ retailflow demo</div>
                    <div className="mt-2 text-white/60">→ Initializing mock store...</div>
                    <div className="text-white/60">→ Loading 8 documents...</div>
                    <div className="text-white/60">→ Computing MXIK matches...</div>
                    <div className="text-emerald-500">✓ Demo ready in 0.3s</div>
                    <div className="mt-3 text-white">
                      <span className="text-emerald-500">▶</span> http://demo.retailflow.uz
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="narxlar" className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
              Narxlar
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Beta bosqichida — birinchi 6 oy bepul.
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-600">
              Maxsus oferta: birinchi 100 ta do'kon uchun cheksiz hujjat, cheksiz mahsulot, cheksiz foydalanuvchi.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            <PricingCard
              name="Beta"
              price="Bepul"
              priceNote="birinchi 6 oy"
              features={[
                "Cheksiz hujjat parsing",
                "Cheksiz MXIK validatsiya",
                "Mobile ilova (iOS + Android)",
                "AI Insights (kunlik)",
                "Audit log + export",
                "5 ta foydalanuvchi",
              ]}
              cta="Beta'ga qo'shilish"
              ctaHref="/register"
              highlighted
            />
            <PricingCard
              name="Pro"
              price="299,000"
              priceNote="so'm / oy (6 oy keyin)"
              features={[
                "Hammasi Beta'da",
                "Cheksiz foydalanuvchi",
                "Didox to'g'ridan-to'g'ri webhook",
                "Distribyutor portal (multi-tenant)",
                "Custom integratsiya (POS, ERP)",
                "Prioritet qo'llab-quvvatlash",
              ]}
              cta="Pro'ga buyurtma"
              ctaHref="/register?plan=pro"
            />
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section id="bog-lanish" className="bg-surface py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Bugundan boshlab qog'oz hujjatdan voz keching.
          </h2>
          <p className="mt-5 text-[17px] text-ink-600">
            30 soniyada ro'yxatdan o'ting, do'koningizning STIR'i bilan kiring, birinchi hujjatni AI sizga parslab beradi.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/register">
              <Button size="md" className="h-11 px-6 text-[15px]">
                Bepul boshlash
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="md" className="h-11 px-6 text-[15px]">
                Demo ko'rish
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label, valueColor = "text-ink-900" }: { value: string; label: string; valueColor?: string }) {
  return (
    <div>
      <div className={`font-mono text-4xl font-bold tracking-tight ${valueColor}`}>
        {value}
      </div>
      <div className="mt-1 text-[12px] font-medium uppercase tracking-wider text-ink-500">
        {label}
      </div>
    </div>
  );
}

function ProblemCard({
  stat,
  title,
  body,
  accent = "navy",
}: {
  stat: string;
  title: string;
  body: string;
  accent?: "navy" | "red" | "amber";
}) {
  const accentColor = {
    navy: "text-navy-700 dark:text-navy-300",
    red: "text-red-700 dark:text-red-300",
    amber: "text-amber-600 dark:text-amber-300",
  }[accent];

  return (
    <div className="rounded-md border border-border bg-surface-card p-6">
      <div className={`font-mono text-3xl font-bold ${accentColor}`}>{stat}</div>
      <div className="mt-2 text-[15px] font-semibold text-ink-900">{title}</div>
      <div className="mt-2 text-[13px] leading-relaxed text-ink-600">{body}</div>
    </div>
  );
}

function StepCard({
  n,
  title,
  body,
  Icon,
}: {
  n: string;
  title: string;
  body: string;
  Icon: typeof FileText;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="grid size-10 place-items-center rounded-md bg-emerald-600">
          <Icon className="size-5" />
        </div>
        <span className="font-mono text-2xl font-bold text-white/30">{n}</span>
      </div>
      <div className="text-[17px] font-bold">{title}</div>
      <div className="mt-2 text-[13px] leading-relaxed text-white/70">{body}</div>
    </div>
  );
}

function FeatureCard({
  Icon,
  title,
  body,
}: {
  Icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-card p-5 transition-colors hover:border-navy-700">
      <div className="mb-3 grid size-9 place-items-center rounded-md bg-navy-50 text-navy-700 dark:text-navy-300">
        <Icon className="size-4" />
      </div>
      <div className="text-[15px] font-semibold text-ink-900">{title}</div>
      <div className="mt-1.5 text-[13px] leading-relaxed text-ink-600">{body}</div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  priceNote,
  features,
  cta,
  ctaHref,
  highlighted,
}: {
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative rounded-lg border p-7 ${
        highlighted
          ? "border-navy-700 bg-navy-700 text-white shadow-xl"
          : "border-border bg-surface-card text-ink-900"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 right-6 rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider">
          Tavsiya
        </span>
      )}
      <div className={`text-[13px] font-bold uppercase tracking-wider ${highlighted ? "text-emerald-400" : "text-navy-700 dark:text-navy-300"}`}>
        {name}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-4xl font-bold">{price}</span>
        <span className={`text-[12px] ${highlighted ? "text-white/60" : "text-ink-500"}`}>
          {priceNote}
        </span>
      </div>

      <ul className={`mt-6 space-y-2.5 text-[13px] ${highlighted ? "text-white/85" : "text-ink-700"}`}>
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2 className={`size-4 shrink-0 mt-0.5 ${highlighted ? "text-emerald-400" : "text-emerald-600 dark:text-emerald-400"}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link href={ctaHref} className="mt-8 block">
        <Button
          variant={highlighted ? "emerald" : "secondary"}
          className="w-full h-11"
        >
          {cta}
          <ArrowRight className="size-4" />
        </Button>
      </Link>
    </div>
  );
}
