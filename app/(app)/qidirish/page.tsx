import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { getDocuments, getProducts, getSuppliers, getUsers } from "@/lib/store";
import { formatSom, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  FileText,
  Package,
  Truck,
  User as UserIcon,
  Compass,
  ChevronRight,
  SearchX,
  Plus,
  TrendingUp,
  LayoutDashboard,
  Inbox,
  AlertTriangle,
  Warehouse,
  ClipboardCheck,
  PackageCheck,
  ListTree,
  Search as SearchIcon,
  Sparkles,
  Network,
  BarChart3,
  FileSearch,
  Settings,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

// Sidebar items + a few extra app pages — auth/marketing routes excluded.
const PAGES: { href: string; label: string; icon: LucideIcon; keywords?: string[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, keywords: ["bosh", "asosiy", "kpi"] },
  { href: "/hujjatlar", label: "Hujjatlar", icon: Inbox, keywords: ["didox", "hujjat"] },
  { href: "/hujjatlar/yangi", label: "Yangi hujjat", icon: Plus, keywords: ["qo'lda", "qoshish", "qoshish hujjat"] },
  { href: "/review-queue", label: "Review Queue", icon: AlertTriangle, keywords: ["tasdiqlash", "queue"] },
  { href: "/ombor", label: "Ombor", icon: Warehouse, keywords: ["sklad", "zaxira"] },
  { href: "/inventarizatsiya", label: "Inventarizatsiya", icon: ClipboardCheck, keywords: ["inv"] },
  { href: "/buyurtmalar", label: "Buyurtmalar", icon: PackageCheck, keywords: ["order"] },
  { href: "/nomenklatura", label: "Nomenklatura", icon: ListTree, keywords: ["mahsulot katalog"] },
  { href: "/mxik-search", label: "MXIK katalog", icon: SearchIcon, keywords: ["mxik"] },
  { href: "/yetkazib-beruvchilar", label: "Yetkazib beruvchilar", icon: Truck, keywords: ["supplier", "stir"] },
  { href: "/insights", label: "AI Insights", icon: Sparkles, keywords: ["tavsiya", "ai"] },
  { href: "/distributor", label: "Distribyutor portal", icon: Network },
  { href: "/hisobotlar", label: "Hisobotlar", icon: BarChart3, keywords: ["report"] },
  { href: "/audit-log", label: "Audit log", icon: FileSearch, keywords: ["jurnal"] },
  { href: "/sozlamalar", label: "Sozlamalar", icon: Settings, keywords: ["settings", "config"] },
  { href: "/notifications", label: "Bildirishnomalar", icon: Bell, keywords: ["xabar"] },
  { href: "/profil", label: "Profil", icon: UserIcon, keywords: ["foydalanuvchi"] },
];

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  omborchi: "Omborchi",
  buxgalter: "Buxgalter",
  kassir: "Kassir",
  auditor: "Auditor",
  firma: "Firma operatori",
};

const TRENDING_QUERIES = [
  "Mol go'shti",
  "MXIK 0201",
  "Alpha Distribution",
  "Hujjat 12345",
  "Aziz Karimov",
  "Sut",
];

function norm(s: string): string {
  return s.toLowerCase();
}

function matches(haystack: string | null | undefined, needle: string): boolean {
  if (!haystack) return false;
  return norm(haystack).includes(needle);
}

/**
 * Returns the original text with the first occurrence of `needle` wrapped in
 * a <mark>. Case-insensitive. If no match, returns the text plain.
 */
function highlight(text: string, needle: string): ReactNode {
  if (!needle) return text;
  const lower = text.toLowerCase();
  const target = needle.toLowerCase();
  const idx = lower.indexOf(target);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-50 text-amber-600 dark:text-amber-300 px-0.5 rounded">
        {text.slice(idx, idx + needle.length)}
      </mark>
      {text.slice(idx + needle.length)}
    </>
  );
}

interface SectionDef {
  key: string;
  label: string;
  icon: LucideIcon;
}

const SECTIONS: SectionDef[] = [
  { key: "documents", label: "Hujjatlar", icon: FileText },
  { key: "products", label: "Mahsulotlar", icon: Package },
  { key: "suppliers", label: "Yetkazib beruvchilar", icon: Truck },
  { key: "users", label: "Foydalanuvchilar", icon: UserIcon },
  { key: "pages", label: "Sahifalar", icon: Compass },
];

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const needle = norm(query);
  const hasQuery = query.length > 0;

  // Empty query — landing state. Skip the heavy aggregation.
  if (!hasQuery) {
    return (
      <>
        <Topbar breadcrumb={[{ label: "Qidirish" }]} />
        <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-ink-900">
                Qidiruv
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Hujjat, mahsulot, yetkazib beruvchi, foydalanuvchi va sahifa
                nomi bo&apos;yicha qidiriladi
              </p>
            </div>

            <Card className="p-6">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                Mashhur qidiruvlar
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TRENDING_QUERIES.map((t) => (
                  <Link
                    key={t}
                    href={`/qidirish?q=${encodeURIComponent(t)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-card px-3 py-1 text-[12px] text-ink-700 hover:border-navy-700 hover:bg-navy-50 hover:text-navy-700 dark:text-navy-300 transition-colors"
                  >
                    <TrendingUp className="size-3" />
                    {t}
                  </Link>
                ))}
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  So&apos;nggi qidiruvlar
                </div>
                <p className="mt-2 text-[13px] text-ink-500">Topib bo&apos;lmadi</p>
              </div>
            </Card>
          </div>
        </main>
      </>
    );
  }

  // Aggregate matches.
  const documents = getDocuments().filter(
    (d) => matches(d.number, needle) || matches(d.supplier.name, needle)
  );

  const products = getProducts().filter(
    (p) => matches(p.name, needle) || matches(p.mxik, needle)
  );

  const suppliers = getSuppliers().filter(
    (s) => matches(s.name, needle) || matches(s.stir, needle)
  );

  const users = getUsers().filter(
    (u) =>
      matches(u.fullName, needle) ||
      matches(u.email, needle) ||
      matches(u.phone, needle)
  );

  const pages = PAGES.filter(
    (p) =>
      matches(p.label, needle) ||
      (p.keywords ?? []).some((k) => matches(k, needle))
  );

  const totals = {
    documents: documents.length,
    products: products.length,
    suppliers: suppliers.length,
    users: users.length,
    pages: pages.length,
  };
  const totalAll =
    totals.documents +
    totals.products +
    totals.suppliers +
    totals.users +
    totals.pages;

  return (
    <>
      <Topbar
        breadcrumb={[
          { label: "Qidirish" },
          { label: `"${query}"` },
        ]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-ink-900">
              Qidiruv: <span className="font-mono text-navy-700 dark:text-navy-300">{query}</span>
            </h1>
            <p className="mt-1 text-[13px] text-ink-500">
              Hujjat, mahsulot, yetkazib beruvchi, foydalanuvchi va sahifa nomi
              bo&apos;yicha qidiriladi
            </p>
          </div>

          {/* Filter pills (visual) */}
          <div className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-2 text-[12px] text-ink-600">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-navy-700 bg-navy-50 px-3 py-1 font-medium text-navy-700 dark:text-navy-300">
              Hammasi
              <span className="font-mono text-[11px]">({totalAll})</span>
            </span>
            {SECTIONS.map((s) => (
              <span
                key={s.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-card px-3 py-1 text-ink-600"
              >
                <s.icon className="size-3" />
                {s.label}
                <span className="font-mono text-[11px] text-ink-500">
                  ({totals[s.key as keyof typeof totals]})
                </span>
              </span>
            ))}
          </div>

          {totalAll === 0 ? (
            <EmptyResults query={query} />
          ) : (
            <div className="space-y-4">
              {documents.length > 0 && (
                <ResultsSection label="Hujjatlar" count={documents.length} Icon={FileText}>
                  {documents.map((doc) => (
                    <ResultRow
                      key={doc.id}
                      href={`/hujjatlar/${doc.id}`}
                      Icon={FileText}
                      title={
                        <>
                          <span className="font-mono">
                            №{highlight(doc.number, query)}
                          </span>
                          <span className="mx-2 text-ink-300">·</span>
                          <span>{highlight(doc.supplier.name, query)}</span>
                        </>
                      }
                      subtitle={
                        <>
                          <span className="font-mono">{formatSom(doc.totalAmount)}</span>
                          <span className="mx-1.5 text-ink-300">·</span>
                          <span className="font-mono">{formatDate(doc.date)}</span>
                        </>
                      }
                    />
                  ))}
                </ResultsSection>
              )}

              {products.length > 0 && (
                <ResultsSection label="Mahsulotlar" count={products.length} Icon={Package}>
                  {products.map((p) => (
                    <ResultRow
                      key={p.id}
                      href={`/nomenklatura/${p.id}`}
                      Icon={Package}
                      title={highlight(p.name, query)}
                      subtitle={
                        <>
                          <span className="font-mono">
                            MXIK {highlight(p.mxik, query)}
                          </span>
                          <span className="mx-1.5 text-ink-300">·</span>
                          <span className="font-mono">
                            Qoldiq: {p.currentStock} {p.unit}
                          </span>
                        </>
                      }
                    />
                  ))}
                </ResultsSection>
              )}

              {suppliers.length > 0 && (
                <ResultsSection
                  label="Yetkazib beruvchilar"
                  count={suppliers.length}
                  Icon={Truck}
                >
                  {suppliers.map((s) => (
                    <ResultRow
                      key={s.id}
                      href={`/yetkazib-beruvchilar/${s.id}`}
                      Icon={Truck}
                      title={highlight(s.name, query)}
                      subtitle={
                        <>
                          <span className="font-mono">
                            STIR: {highlight(s.stir, query)}
                          </span>
                          <span className="mx-1.5 text-ink-300">·</span>
                          {s.verified ? (
                            <span className="text-emerald-700 dark:text-emerald-300">
                              &#x2713; Tasdiqlangan
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-300">
                              &#x26A0; Tasdiqlanmagan
                            </span>
                          )}
                        </>
                      }
                    />
                  ))}
                </ResultsSection>
              )}

              {users.length > 0 && (
                <ResultsSection
                  label="Foydalanuvchilar"
                  count={users.length}
                  Icon={UserIcon}
                >
                  {users.map((u) => {
                    const isCurrent = u.id === "user_aziz";
                    return (
                      <ResultRow
                        key={u.id}
                        href={isCurrent ? "/profil" : "/sozlamalar"}
                        Icon={UserIcon}
                        title={highlight(u.fullName, query)}
                        subtitle={
                          <>
                            <span className="font-mono">
                              {highlight(u.email, query)}
                            </span>
                            <span className="mx-1.5 text-ink-300">·</span>
                            <span>{ROLE_LABEL[u.role] ?? u.role}</span>
                          </>
                        }
                      />
                    );
                  })}
                </ResultsSection>
              )}

              {pages.length > 0 && (
                <ResultsSection label="Sahifalar" count={pages.length} Icon={Compass}>
                  {pages.map((p) => (
                    <ResultRow
                      key={p.href}
                      href={p.href}
                      Icon={p.icon}
                      title={highlight(p.label, query)}
                      subtitle={
                        <span className="font-mono">{p.href}</span>
                      }
                    />
                  ))}
                </ResultsSection>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function ResultsSection({
  label,
  count,
  Icon,
  children,
}: {
  label: string;
  count: number;
  Icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-ink-500" />
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-ink-700">
            {label}
          </h2>
        </div>
        <span className="font-mono text-[11px] font-semibold text-ink-500">
          {count}
        </span>
      </div>
      <div>{children}</div>
    </Card>
  );
}

function ResultRow({
  href,
  Icon,
  title,
  subtitle,
}: {
  href: string;
  Icon: LucideIcon;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 border-b border-border px-5 py-3 last:border-0 hover:bg-ink-100/50 transition-colors"
    >
      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-navy-50 text-navy-700 dark:text-navy-300">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-ink-900">
          {title}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-ink-500">{subtitle}</div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-ink-400" />
    </Link>
  );
}

function EmptyResults({ query }: { query: string }) {
  return (
    <Card className="px-6 py-16 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-ink-100 text-ink-500">
        <SearchX className="size-6" />
      </div>
      <h2 className="mt-4 text-[16px] font-semibold text-ink-900">
        <span className="font-mono">&quot;{query}&quot;</span> bo&apos;yicha hech narsa
        topilmadi
      </h2>
      <p className="mx-auto mt-2 max-w-md text-[13px] text-ink-500">
        Imlo xatosini tekshiring yoki boshqa kalit so&apos;z bilan urinib ko&apos;ring.
      </p>

      <div className="mx-auto mt-6 max-w-md text-left">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          Quyidagini sinab ko&apos;ring:
        </div>
        <ul className="mt-2 space-y-1.5 text-[13px] text-ink-700">
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-ink-400" />
            Hujjat raqami (masalan, <span className="font-mono">12345</span>)
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-ink-400" />
            Yetkazib beruvchi nomi yoki STIR
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-ink-400" />
            MXIK kodi yoki mahsulot nomi
          </li>
        </ul>
      </div>

      <div className="mt-6">
        <Link
          href="/hujjatlar/yangi"
          className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus className="size-4" />
          Yangi hujjat yaratish
        </Link>
      </div>
    </Card>
  );
}
