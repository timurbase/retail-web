import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  ArrowRight,
  ChevronRight,
  BookOpen,
  PlayCircle,
  MessageCircle,
  Mail,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Yordam markazi · RetailFlow AI",
  description:
    "RetailFlow AI yordam markazi — tez-tez beriladigan savollar, qo'llanmalar va aloqaga chiqish.",
};

const POPULAR_TOPICS = [
  "Hujjat yuklash",
  "MXIK xato",
  "To'lov",
  "Didox sozlash",
  "Foydalanuvchi qo'shish",
];

const QUICK_LINKS = [
  {
    Icon: BookOpen,
    title: "Boshlang'ich qo'llanma",
    desc: "Ro'yxatdan o'tish, birinchi hujjatni qabul qilish va MXIK tasdiqlash.",
    href: "#boshlangich",
    external: false,
  },
  {
    Icon: PlayCircle,
    title: "Video darslar",
    desc: "10 daqiqalik o'zbek tilidagi video qo'llanmalar — kelmoqda.",
    href: "#video",
    external: false,
  },
  {
    Icon: MessageCircle,
    title: "Telegram qo'llab-quvvatlash",
    desc: "@retailflow_uz · daqiqa ichida javob, 09:00–18:00",
    href: "https://t.me/retailflow_uz",
    external: true,
  },
  {
    Icon: Mail,
    title: "Email yuborish",
    desc: "hello@retailflow.uz · 24 soat ichida batafsil javob.",
    href: "mailto:hello@retailflow.uz",
    external: true,
  },
];

interface Faq {
  q: string;
  a: React.ReactNode;
}

interface Category {
  key: string;
  title: string;
  note: string;
  items: Faq[];
}

const CATEGORIES: Category[] = [
  {
    key: "boshlangich",
    title: "Boshlang'ich",
    note: "Ro'yxatdan o'tish va birinchi sozlash",
    items: [
      {
        q: "RetailFlow AI nima qiladi?",
        a: (
          <>
            <p>
              RetailFlow AI — O&apos;zbekiston chakana savdo do&apos;konlari uchun AI-yordamchi tovar nazorati platformasi. Didox EDO orqali kelgan hujjatlarni avtomatik parslaydi, Soliq.uz MXIK katalogi bilan tekshiradi va do&apos;kon omborini real vaqtda yangilaydi.
            </p>
            <p className="mt-2">
              Operator faqat AI ishonchsizroq belgilagan yozuvlarni ko&apos;rib chiqadi — qolganlari avtomatik tasdiqlanadi. Qog&apos;oz nakladnoy bilan ishlash o&apos;rniga, 30 soniyada bir hujjat.
            </p>
          </>
        ),
      },
      {
        q: "Qanday qilib ro'yxatdan o'taman?",
        a: (
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Sahifaning yuqori o&apos;ng burchagidagi <strong>Bepul boshlash</strong> tugmasini bosing.</li>
            <li>Do&apos;koningiz <span className="font-mono">STIR</span> raqamini kiriting — Soliq.uz orqali avtomatik tasdiqlanadi.</li>
            <li>Telefon raqamingizga SMS kod yuboriladi — 6 raqamni kiriting.</li>
            <li>Asosiy ma&apos;lumotlarni (do&apos;kon nomi, manzili) tekshiring va tasdiqlang.</li>
            <li>Dashboard&apos;ga kirib, birinchi hujjatni import qiling yoki Didox webhook&apos;ni ulang.</li>
          </ul>
        ),
      },
      {
        q: "Beta bosqichida bepulmi?",
        a: (
          <p>
            Ha — birinchi 100 ta do&apos;kon uchun 6 oy davomida cheksiz hujjat, cheksiz MXIK validatsiya va cheksiz foydalanuvchi. Hech qanday kredit karta yoki majburiyat talab qilinmaydi.
          </p>
        ),
      },
      {
        q: "STIR'imni qayerdan olaman?",
        a: (
          <p>
            STIR — Davlat soliq qo&apos;mitasi tomonidan beriladigan 9 raqamli identifikator. Soliq.uz portali orqali kabinetingizga kirib ko&apos;rishingiz mumkin yoki <a href="https://soliq.uz" target="_blank" rel="noopener" className="font-semibold text-navy-700 dark:text-navy-300 hover:underline">soliq.uz</a> saytidan kompaniyangiz nomi bo&apos;yicha qidiring.
          </p>
        ),
      },
      {
        q: "Demo ko'rishim mumkinmi?",
        a: (
          <p>
            Albatta — <Link href="/dashboard" className="font-semibold text-navy-700 dark:text-navy-300 hover:underline">/dashboard</Link> sahifasiga o&apos;ting. Ro&apos;yxatdan o&apos;tmasdan, mock ma&apos;lumotlar bilan to&apos;liq interfeysni sinab ko&apos;ring.
          </p>
        ),
      },
    ],
  },
  {
    key: "hujjat-mxik",
    title: "Hujjatlar va MXIK",
    note: "Didox, Excel, PDF, MXIK kodlari",
    items: [
      {
        q: "Didox bilan qanday ulanaman?",
        a: (
          <p>
            <strong>Sozlamalar → Integratsiyalar</strong> bo&apos;limidan <strong>Didox</strong> kartasini bosing va STIR&apos;ingiz bilan avtorizatsiya qiling. Webhook URL sizga avtomatik beriladi — uni Didox kabinetida belgilang. Birinchi hujjat 1 daqiqa ichida tushadi.
          </p>
        ),
      },
      {
        q: "MXIK kodi noto'g'ri tanlangan bo'lsa nima qilaman?",
        a: (
          <p>
            Bunday qatorlar avtomatik <strong>Review queue</strong>&apos;ga tushadi. Operator yoki buxgalter qator yonidagi <span className="font-mono text-[12px]">✎ Tahrir</span> tugmasini bosib, to&apos;g&apos;ri MXIK kodini tanlashi mumkin. Tahrir audit log&apos;da saqlanadi.
          </p>
        ),
      },
      {
        q: "Excel orqali hujjat yuklash",
        a: (
          <p>
            <Link href="/hujjatlar" className="font-semibold text-navy-700 dark:text-navy-300 hover:underline">Hujjatlar</Link> sahifasidan <strong>Excel import</strong> tugmasini bosing. Sarlavhalar: <span className="font-mono text-[12px]">nomi, mxik, miqdor, birlik, narx</span>. AI noaniq qatorlarni avtomatik review&apos;ga qo&apos;yadi.
          </p>
        ),
      },
      {
        q: "PDF skaner'lar qo'llab-quvvatlanadimi?",
        a: (
          <p>
            Ha — GPT-4o Vision PDF&apos;ni avtomatik o&apos;qiydi: mahsulot nomlari, miqdor, narx va summalarni ajratadi. Sifati past skanerlar uchun AI confidence pasayadi va qator review&apos;ga tushadi.
          </p>
        ),
      },
      {
        q: "AI confidence 60% dan past bo'lsa nima?",
        a: (
          <p>
            Bunday yozuvlar <strong>qizil</strong> belgilanadi va <Link href="/review-queue" className="font-semibold text-navy-700 dark:text-navy-300 hover:underline">Review queue</Link>&apos;ga tushadi. Operator 3 ta variantdan birini tanlashi yoki yangi MXIK qidirishi mumkin. Tasdiqlangach ombor yangilanadi.
          </p>
        ),
      },
    ],
  },
  {
    key: "ombor",
    title: "Ombor va Inventarizatsiya",
    note: "Qoldiqlar, limit, tafovutlar",
    items: [
      {
        q: "Qoldiq qachon yangilanadi?",
        a: (
          <p>
            Hujjat tasdiqlanganidan keyin <strong>1 daqiqa ichida</strong> ombor qoldiqlari yangilanadi. BullMQ job orqali asinxron — interfeys to&apos;xtab qolmaydi.
          </p>
        ),
      },
      {
        q: "Inventarizatsiya qancha vaqt oladi?",
        a: (
          <p>
            100 ta mahsulot uchun mobile ilova orqali barcode scan bilan <span className="font-mono">~20 daqiqa</span>. Yakuniy tafovut hisoboti AI bilan tahlil qilinadi — sabablari (yo&apos;qotish, o&apos;g&apos;irlik, hisob xatosi) tavsiyalanadi.
          </p>
        ),
      },
      {
        q: "Minimal limit qanday ishlaydi?",
        a: (
          <p>
            Har mahsulot uchun <strong>Min qoldiq</strong> ni belgilang — pasaygan zahoti AI Insights sizga bildiradi va 1-click reorder taklif qiladi. Daily Insights bilan birga ertalab keladi.
          </p>
        ),
      },
      {
        q: "Tovar yo'qotilishi qanday qayd etiladi?",
        a: (
          <p>
            <Link href="/inventarizatsiya" className="font-semibold text-navy-700 dark:text-navy-300 hover:underline">Inventarizatsiya</Link> oynasidan tafovutni tasdiqlang — <span className="font-mono text-[12px]">chiqim</span> ko&apos;rinishida yoziladi, audit log&apos;da saqlanadi. AI takrorlangan tafovutlarni paterndan aniqlaydi.
          </p>
        ),
      },
    ],
  },
  {
    key: "ai",
    title: "AI funksiyalari",
    note: "Confidence, Insights, AI chat",
    items: [
      {
        q: "AI qancha aniq ishlaydi?",
        a: (
          <p>
            Beta bosqichida <strong className="text-emerald-700 dark:text-emerald-300">87%</strong> avto-aniqlik (high-confidence avto-tasdiqlangan qatorlar). Har operator tasdig&apos;i bilan model takomillashadi — har oyda 1–2% o&apos;sib bormoqda.
          </p>
        ),
      },
      {
        q: "Daily Insights nima vaqtda keladi?",
        a: (
          <p>
            Har kuni ertalab <span className="font-mono">09:00 (Asia/Tashkent)</span> &apos;da push bildirishnoma va email. Mazmuni: kritik qoldiqlar, narx oshishlari, dublikat shubhalari, reorder tavsiyalari.
          </p>
        ),
      },
      {
        q: "AI yordamchidan qanday foydalanaman?",
        a: (
          <p>
            Pastki o&apos;ng burchakdagi chat ikonini bosing yoki <span className="font-mono text-[12px]">⌘K</span> &apos;ni bosing — &quot;Mol go&apos;shti uchun MXIK&quot; yoki &quot;Bu oy Pepsi qancha sotildi?&quot; deb yozing. GPT-4o-mini o&apos;zbek tilida javob beradi.
          </p>
        ),
      },
      {
        q: "GPT-4o xarajati menga ta'sir qiladimi?",
        a: (
          <p>
            Yo&apos;q — Beta bosqichida AI infrastruktura xarajati bizning hisobimizdan. Pro tarifda ham har hujjat uchun alohida to&apos;lov yo&apos;q.
          </p>
        ),
      },
    ],
  },
  {
    key: "xavfsizlik",
    title: "Xavfsizlik va maxfiylik",
    note: "Ma'lumotlar saqlash, 2FA, hisob",
    items: [
      {
        q: "Ma'lumotlarim qayerda saqlanadi?",
        a: (
          <p>
            Hujjat PDF/foto fayllari Cloudflare R2 (<span className="font-mono text-[12px]">Frankfurt + Singapur</span>) regionlarida. Tranzaktsion ma&apos;lumotlar PostgreSQL primary + read-replica. End-to-end TLS, at-rest AES-256.
          </p>
        ),
      },
      {
        q: "Kim mening hujjatlarimni ko'ra oladi?",
        a: (
          <p>
            Faqat siz <Link href="/sozlamalar" className="font-semibold text-navy-700 dark:text-navy-300 hover:underline">Sozlamalar → Foydalanuvchilar</Link> orqali ruxsat bergan akkauntlar. RetailFlow AI xodimlari sizning ruxsatingizsiz hech qachon ma&apos;lumotga kirmaydi (audit log bilan).
          </p>
        ),
      },
      {
        q: "2FA qanday yoqaman?",
        a: (
          <p>
            <Link href="/profil" className="font-semibold text-navy-700 dark:text-navy-300 hover:underline">Profil → Xavfsizlik</Link> bo&apos;limida <strong>Two-factor</strong>&apos;ni yoqing. Google Authenticator, Authy yoki SMS — tanlovingiz.
          </p>
        ),
      },
      {
        q: "Hisobimni qanday o'chiraman?",
        a: (
          <p>
            <strong>Sozlamalar → Tarif → Hisobni o&apos;chirish</strong>. O&apos;chirgandan keyin ma&apos;lumotlar 90 kun davomida saqlanadi (qonun talabi) — shu davrda qaytarib olishingiz mumkin. 90 kundan keyin to&apos;liq o&apos;chiriladi.
          </p>
        ),
      },
    ],
  },
  {
    key: "tolov",
    title: "To'lov va tarif",
    note: "Beta, Pro, to'lov usullari",
    items: [
      {
        q: "Qachon to'lashni boshlayman?",
        a: (
          <p>
            Beta tugagach (ro&apos;yxatdan o&apos;tgan kunidan <strong>6 oy</strong> keyin). Beta tugashidan 30 kun oldin sizga eslatma yuboriladi.
          </p>
        ),
      },
      {
        q: "Qaysi to'lov usullari?",
        a: (
          <p>
            <span className="font-mono text-[12px]">Click · Payme · Uzcard · HUMO · Bank o&apos;tkazma (yuridik shaxslar)</span>. Avtomatik oylik debet ham mavjud.
          </p>
        ),
      },
      {
        q: "Tarifni o'zgartira olamanmi?",
        a: (
          <p>
            Ha — istalgan vaqtda. <strong>Sozlamalar → Tarif</strong>&apos;dan upgrade/downgrade qiling. Yangi tarif <strong>keyingi to&apos;lov davridan</strong> faollashadi.
          </p>
        ),
      },
      {
        q: "Bekor qilish bormi?",
        a: (
          <p>
            Ha — istalgan vaqtda bekor qiling. Hisobingiz oylik to&apos;lov tugaguncha aktiv qoladi va keyin avtomatik <em>read-only</em> rejimga o&apos;tadi. Ma&apos;lumotlar 90 kun saqlanadi.
          </p>
        ),
      },
    ],
  },
];

export default function YordamPage() {
  return (
    <>
      {/* ===== HERO + SEARCH ===== */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          className="absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #0B3D91 1px, transparent 1px), linear-gradient(to bottom, #0B3D91 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:py-24">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
            Yordam markazi
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            Yordam markazi
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-600">
            Tez-tez beriladigan savollar, qo&apos;llanmalar va aloqaga chiqish
          </p>

          {/* Big search */}
          <div className="relative mx-auto mt-9 max-w-2xl">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              placeholder="Savol yoki kalit so'z bilan qidiring..."
              className="min-h-14 w-full rounded-md border border-border-strong bg-surface-card pl-14 pr-5 text-[16px] text-ink-900 placeholder:text-ink-400 shadow-sm focus:-outline-offset-1 focus:border-navy-700 focus:outline-2 focus:outline-navy-700"
            />
          </div>

          {/* Popular topics */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
              Mashhur mavzular:
            </span>
            {POPULAR_TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                className="rounded-full border border-border bg-surface-card px-3 py-1 text-[12px] font-medium text-ink-700 transition-colors hover:border-navy-700 hover:text-navy-700 dark:text-navy-300"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QUICK LINKS ===== */}
      <section className="border-b border-border bg-surface-card py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map((q) => (
              <QuickLinkCard key={q.title} {...q} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
              FAQ
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Tez-tez beriladigan savollar
            </h2>
            <p className="mt-4 text-[16px] text-ink-600">
              Javobni topa olmadingizmi? Telegram&apos;da yozing —{" "}
              <a
                href="https://t.me/retailflow_uz"
                target="_blank"
                rel="noopener"
                className="font-semibold text-navy-700 dark:text-navy-300 hover:underline"
              >
                @retailflow_uz
              </a>
            </p>
          </div>

          <div className="space-y-10">
            {CATEGORIES.map((cat) => (
              <div key={cat.key} id={cat.key} className="scroll-mt-20">
                <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-border pb-3">
                  <h3 className="text-[20px] font-bold tracking-tight text-ink-900">
                    {cat.title}
                  </h3>
                  <span className="text-[12px] text-ink-500">{cat.note}</span>
                </div>
                <div className="space-y-2">
                  {cat.items.map((it, i) => (
                    <FaqItem key={i} q={it.q} a={it.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-xl border border-emerald-600 bg-emerald-50 p-10">
            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="size-3.5" />
                  Hali ham savolingiz bormi?
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                  Javob topa olmadingizmi? Bizga yozing.
                </h2>
                <p className="mt-2 text-[15px] text-ink-700">
                  Telegram&apos;da daqiqa ichida, email orqali 24 soat ichida — real odam javob beradi.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/bog-lanish">
                  <Button variant="emerald" size="md" className="h-11 px-6 text-[15px]">
                    Bog&apos;lanish
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <a href="https://t.me/retailflow_uz" target="_blank" rel="noopener">
                  <Button variant="secondary" size="md" className="h-11 px-6 text-[15px]">
                    <MessageCircle className="size-4" />
                    Telegram
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function QuickLinkCard({
  Icon,
  title,
  desc,
  href,
  external,
}: {
  Icon: typeof BookOpen;
  title: string;
  desc: string;
  href: string;
  external?: boolean;
}) {
  const inner = (
    <div className="group flex h-full flex-col rounded-md border border-border bg-surface-card p-5 transition-colors hover:border-navy-700">
      <div className="mb-3 grid size-10 place-items-center rounded-md bg-navy-50 text-navy-700 dark:text-navy-300">
        <Icon className="size-5" />
      </div>
      <div className="text-[15px] font-semibold text-ink-900">{title}</div>
      <div className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-600">{desc}</div>
      <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-navy-700 dark:text-navy-300">
        Ochish
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
  if (external) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener">
        {inner}
      </a>
    );
  }
  return <Link href={href}>{inner}</Link>;
}

function FaqItem({ q, a }: { q: string; a: React.ReactNode }) {
  return (
    <details className="group rounded-md border border-border bg-surface-card open:border-navy-700">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-semibold text-ink-900 transition-colors hover:bg-ink-100/40">
        <span className="flex-1">{q}</span>
        <ChevronRight className="size-4 shrink-0 text-ink-500 transition-transform group-open:rotate-90" />
      </summary>
      <div className="border-t border-border px-5 py-4 text-[14px] leading-relaxed text-ink-700">
        {a}
      </div>
    </details>
  );
}
