import type { Metadata } from "next";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog · RetailFlow AI",
  description:
    "Mahsulot yangiliklari, kichik biznes maslahatlari, AI texnologiyasi va O'zbekiston chakana savdo industriyasi haqida.",
};

type Category = "Mahsulot" | "Maslahatlar" | "AI" | "Hodisalar";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  author: { name: string; initials: string; color: string };
  date: string;
  read: string;
  cover: string; // tailwind bg classes
}

const featured: Post = {
  slug: "v0-2-yangi-tafovutlar-oynasi",
  title: "RetailFlow AI v0.2: yangi tafovutlar oynasi va 3× tezroq MXIK qidiruv",
  excerpt:
    "Beta foydalanuvchilarning eng ko'p so'ralgan ikkita imkoniyati. Side-by-side tafovutlar paneli endi har bir hujjatda — qaysi maydon o'zgargani aniq ko'rinadi. Plus pgvector indeks reorg natijasida MXIK avtocomplete 50ms dan 17ms ga tushdi.",
  category: "Mahsulot",
  author: { name: "Asror Tursunov", initials: "AT", color: "bg-navy-700" },
  date: "18.05.2026",
  read: "6 daq",
  cover: "from-navy-700 to-emerald-600",
};

const posts: Post[] = [
  {
    slug: "mxik-95-aniqlik",
    title: "MXIK kodlarini 95% aniqlik bilan tanlash — qanday qilamiz?",
    excerpt:
      "461,800+ kod katalogi, pgvector embedding, GPT-4o re-ranking va custom O'zbek tokenizer. Pipeline ichida.",
    category: "AI",
    author: { name: "Karim Ibragimov", initials: "KI", color: "bg-emerald-600" },
    date: "15.05.2026",
    read: "9 daq",
    cover: "bg-navy-700",
  },
  {
    slug: "ehf-risk-scoring-2026",
    title: "2026 EHF risk scoring — kichik bizneslar nimaga tayyorgarlik ko'rishi kerak",
    excerpt:
      "1-yanvardan amal qiluvchi yangi tizim haqida hamma narsa: qaysi parametrlarga e'tibor bering, qizil flagga tushmaslik usullari.",
    category: "Maslahatlar",
    author: { name: "Dilshod Akmalov", initials: "DA", color: "bg-navy-800" },
    date: "12.05.2026",
    read: "8 daq",
    cover: "bg-emerald-600",
  },
  {
    slug: "5-belgi-crm-kerak",
    title: "5 ta belgi: do'koningiz qachon CRM'ga muhtoj",
    excerpt:
      "Excel kichik biznesni o'ldirayotganini qanday tushunish mumkin? Aniq belgilar va birinchi qadam tavsiyalari.",
    category: "Maslahatlar",
    author: { name: "Dilshod Akmalov", initials: "DA", color: "bg-navy-800" },
    date: "08.05.2026",
    read: "5 daq",
    cover: "bg-emerald-700",
  },
  {
    slug: "pgvector-gpt4o-mxik",
    title: "Pgvector + GPT-4o = real-time MXIK autocomplete",
    excerpt:
      "Texnik chuqurlashish: PostgreSQL pgvector indeksi va GPT-4o function calling bilan 17ms ichida 5 ta variant.",
    category: "AI",
    author: { name: "Jasur Toshmatov", initials: "JT", color: "bg-navy-700" },
    date: "05.05.2026",
    read: "12 daq",
    cover: "bg-amber-600",
  },
  {
    slug: "inventarizatsiya-qogozdan-ai",
    title: "Inventarizatsiya: qog'ozdan AI-ga",
    excerpt:
      "Yillik inventarizatsiya 3 kundan 4 soatga. Mobile foto-skanning va AI moslashtirish jarayoni.",
    category: "Maslahatlar",
    author: { name: "Dilshod Akmalov", initials: "DA", color: "bg-navy-800" },
    date: "01.05.2026",
    read: "7 daq",
    cover: "bg-emerald-600",
  },
  {
    slug: "didox-webhook-yoriqnoma",
    title: "Didox webhook integratsiyasini sozlash bo'yicha yo'riqnoma",
    excerpt:
      "Stepenidan oxirigacha: webhook URL ro'yxatdan o'tkazish, STIR moslashtirish, qabul qilingan hujjatlarni tekshirish.",
    category: "Mahsulot",
    author: { name: "Jasur Toshmatov", initials: "JT", color: "bg-navy-700" },
    date: "28.04.2026",
    read: "10 daq",
    cover: "bg-navy-700",
  },
  {
    slug: "operator-vaqti-5x",
    title: "Operator vaqtini 5× tezlashtirish — yarim avtomatik AI yondashuvi",
    excerpt:
      "Human-in-the-loop nima va u nima uchun &quot;to'liq avtomat&quot;dan yaxshi. Real beta foydalanuvchi statistikalari.",
    category: "AI",
    author: { name: "Asror Tursunov", initials: "AT", color: "bg-navy-700" },
    date: "24.04.2026",
    read: "8 daq",
    cover: "bg-amber-600",
  },
  {
    slug: "singapur-tajribasi",
    title: "Singapur tajribasi: O'zbek SME'lari uchun saboqlar",
    excerpt:
      "GovTech Singapur 10 yilda nimani o'rgandi — O'zbekiston EHF va MXIK ekotizimi uchun amaliy xulosalar.",
    category: "Maslahatlar",
    author: { name: "Aziz Karimov", initials: "AK", color: "bg-emerald-600" },
    date: "20.04.2026",
    read: "11 daq",
    cover: "bg-emerald-700",
  },
  {
    slug: "distribyutor-portal-2026-q3",
    title: "Distribyutor portal yo'l xaritasi: 2026-Q3",
    excerpt:
      "Multi-tenant rejim, 50-500 do'kon network, real-time talab grafikasi, narx sinxronizatsiyasi. Yo'l xaritasi.",
    category: "Mahsulot",
    author: { name: "Dilshod Akmalov", initials: "DA", color: "bg-navy-800" },
    date: "17.04.2026",
    read: "6 daq",
    cover: "bg-navy-700",
  },
  {
    slug: "walmart-alibaba-amazon",
    title: "Walmart, Alibaba va Amazon retail AI keyslar — bizning xulosalarimiz",
    excerpt:
      "3 ta dunyo gigantining retail AI strategiyasini taqqoslash. O'zbekiston bozori uchun nima ish beradi?",
    category: "Hodisalar",
    author: { name: "Asror Tursunov", initials: "AT", color: "bg-navy-700" },
    date: "14.04.2026",
    read: "13 daq",
    cover: "bg-ink-700",
  },
  {
    slug: "hackathon-36-soat",
    title: "Hackathon'da 36 soat: RetailFlow AI demo qanday qurildi",
    excerpt:
      "Mart oyidagi TechWeek hackathon — birinchi MVP, birinchi 8 foydalanuvchi, birinchi 200 ta MXIK tanlovi. Retro.",
    category: "Hodisalar",
    author: { name: "Karim Ibragimov", initials: "KI", color: "bg-emerald-600" },
    date: "10.04.2026",
    read: "9 daq",
    cover: "bg-ink-700",
  },
  {
    slug: "soliq-tekshiruvi-tayyorgarlik",
    title: "Soliq tekshiruvi: 30 daqiqada hujjatlarni tayyorlash",
    excerpt:
      "Auditor rolida audit log eksport, MXIK validatsiya tarixi, immutable o'zgarish jurnali. Tayyor 1-page checklist.",
    category: "Maslahatlar",
    author: { name: "Aziz Karimov", initials: "AK", color: "bg-emerald-600" },
    date: "07.04.2026",
    read: "7 daq",
    cover: "bg-emerald-600",
  },
];

const categoryStyles: Record<Category, string> = {
  Mahsulot: "border-navy-700 bg-navy-50 text-navy-700 dark:text-navy-300",
  Maslahatlar: "border-emerald-600 bg-emerald-50 text-emerald-700 dark:text-emerald-300",
  AI: "border-amber-600 bg-amber-50 text-amber-600 dark:text-amber-300",
  Hodisalar: "border-ink-700 bg-ink-100 text-ink-700",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
            Blog
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink-900">Blog</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-600">
            Mahsulot yangiliklari, kichik biznes maslahatlari, AI texnologiyasi va O&apos;zbekiston chakana savdo industriyasi haqida.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            placeholder="Maqolalardan qidirish..."
            className="h-10 w-full rounded-sm border border-border-strong bg-surface-card pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-navy-700 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-10 flex flex-wrap gap-2 border-b border-border pb-5">
        <CategoryChip active>Barchasi</CategoryChip>
        <CategoryChip>Mahsulot</CategoryChip>
        <CategoryChip>Maslahatlar</CategoryChip>
        <CategoryChip>AI</CategoryChip>
        <CategoryChip>Hodisalar</CategoryChip>
      </div>

      {/* Featured */}
      <Link
        href={`/blog/${featured.slug}`}
        className="group mb-12 block overflow-hidden rounded-md border border-border bg-surface-card transition-colors hover:border-navy-700"
      >
        <div className="grid lg:grid-cols-[5fr_4fr]">
          <div
            className={`relative h-56 bg-gradient-to-br ${featured.cover} lg:h-80`}
          >
            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="absolute left-5 top-5">
              <span className="inline-flex items-center rounded-full border border-white/40 bg-white/15 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                Tanlangan · {featured.category}
              </span>
            </div>
            <div className="absolute bottom-5 left-5 font-mono text-[11px] text-white/70">
              retailflow.uz/blog/{featured.slug}
            </div>
          </div>
          <div className="p-7 lg:p-10">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-ink-900 group-hover:text-navy-700 dark:text-navy-300 lg:text-[28px]">
              {featured.title}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
              {featured.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div
                className={`grid size-9 place-items-center rounded-full ${featured.author.color} font-mono text-[12px] font-bold text-white`}
              >
                {featured.author.initials}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-ink-900">
                  {featured.author.name}
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-ink-500">
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {featured.read} o&apos;qish
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
        <div className="font-mono text-[12px] text-ink-500">
          1–12 / 47 maqola
        </div>
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            disabled
            className="grid size-9 place-items-center rounded-sm border border-border text-ink-400 disabled:cursor-not-allowed"
            aria-label="Oldingi"
          >
            <ChevronLeft className="size-4" />
          </button>
          <PageBtn n={1} active />
          <PageBtn n={2} />
          <PageBtn n={3} />
          <span className="px-2 text-ink-400">...</span>
          <PageBtn n={4} />
          <button
            className="grid size-9 place-items-center rounded-sm border border-border text-ink-700 hover:border-navy-700 hover:text-navy-700 dark:text-navy-300"
            aria-label="Keyingi"
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}

function CategoryChip({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`rounded-sm border px-3 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? "border-navy-700 bg-navy-700 text-white"
          : "border-border bg-surface-card text-ink-700 hover:border-navy-700 hover:text-navy-700 dark:text-navy-300"
      }`}
    >
      {children}
    </button>
  );
}

function PageBtn({ n, active }: { n: number; active?: boolean }) {
  return (
    <button
      className={`grid size-9 place-items-center rounded-sm border font-mono text-[13px] font-semibold transition-colors ${
        active
          ? "border-navy-700 bg-navy-700 text-white"
          : "border-border bg-surface-card text-ink-700 hover:border-navy-700 hover:text-navy-700 dark:text-navy-300"
      }`}
    >
      {n}
    </button>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-md border border-border bg-surface-card transition-colors hover:border-navy-700"
    >
      <div className={`relative h-40 ${post.cover}`}>
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute left-4 top-4">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${categoryStyles[post.category]}`}
          >
            {post.category}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[16px] font-semibold leading-snug text-ink-900 group-hover:text-navy-700 dark:text-navy-300">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-ink-600">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-2.5 border-t border-border pt-4">
          <div
            className={`grid size-7 place-items-center rounded-full ${post.author.color} font-mono text-[10px] font-bold text-white`}
          >
            {post.author.initials}
          </div>
          <div className="flex-1 text-[12px] font-medium text-ink-700">
            {post.author.name}
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-ink-500">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.read}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
