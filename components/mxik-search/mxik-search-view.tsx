"use client";

import { useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ExternalLink,
  X,
  ChevronRight,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface MxikItem {
  code: string;
  name: string;
  description: string;
  category: string;
  usageCount?: number;
}

const CATEGORIES: { key: string; label: string; count: string }[] = [
  { key: "food", label: "Oziq-ovqat", count: "8 000+" },
  { key: "drinks", label: "Ichimliklar", count: "1 200+" },
  { key: "cigarettes", label: "Sigaret", count: "450" },
  { key: "beef", label: "Sigir go'shti", count: "120" },
  { key: "chicken", label: "Tovuq go'shti", count: "95" },
  { key: "household", label: "Maishiy tovarlar", count: "4 500+" },
  { key: "cosmetics", label: "Kosmetika", count: "2 300+" },
  { key: "electronics", label: "Elektronika", count: "1 800+" },
  { key: "stationery", label: "Kantselyariya", count: "650" },
  { key: "clothing", label: "Kiyim-kechak", count: "3 100+" },
  { key: "pharma", label: "Dori-darmon", count: "5 400+" },
  { key: "construction", label: "Qurilish", count: "2 800+" },
];

const POPULAR: MxikItem[] = [
  { code: "2202100000", name: "Coca-Cola 0.5L PET", description: "Gazlangan suv, qand qo'shilgan", category: "Ichimliklar", usageCount: 47 },
  { code: "2202100100", name: "Pepsi 0.5L PET", description: "Gazlangan suv, qand qo'shilgan", category: "Ichimliklar", usageCount: 38 },
  { code: "2201101000", name: "Mineral suv 0.5L", description: "Tabiiy mineral suv, gazsiz", category: "Ichimliklar", usageCount: 35 },
  { code: "2402200000", name: "Marlboro Red blok", description: "Filtrli sigaret, blok (10 paket)", category: "Sigaret", usageCount: 28 },
  { code: "1905901100", name: "Oq non 'Gulli'", description: "Bug'doy unidan, 600g", category: "Non mahsulotlari", usageCount: 56 },
  { code: "0401201000", name: "Imkon sut 1L", description: "Pasterizatsiya, 2.5% yog'lilik", category: "Sut mahsulotlari", usageCount: 41 },
  { code: "0201300000", name: "Sigir go'shti (premium)", description: "Suyaksiz, yangi", category: "Sigir go'shti", usageCount: 22 },
  { code: "0207120000", name: "Tovuq go'shti (tushka)", description: "Muzlatilgan, yaxlit", category: "Tovuq go'shti", usageCount: 31 },
  { code: "1512190000", name: "Kungaboqar yog'i 1L", description: "Tozalangan, dezodorlangan", category: "Oziq-ovqat", usageCount: 44 },
  { code: "1006301000", name: "Guruch (premium) 1kg", description: "Uzun donali, oq", category: "Oziq-ovqat", usageCount: 39 },
  { code: "1806320000", name: "Lazzat shokolad 100g", description: "Sutli shokolad, plitka", category: "Shirinliklar", usageCount: 25 },
  { code: "0901210000", name: "Qahva Nescafe Gold 100g", description: "Sublimatsiyalangan, banka", category: "Ichimliklar", usageCount: 27 },
  { code: "0902400000", name: "Choy 'Lipton' Yellow 100p", description: "Qora choy, paketli", category: "Ichimliklar", usageCount: 33 },
  { code: "1701991000", name: "Shakar 1kg", description: "Oq, kristall", category: "Oziq-ovqat", usageCount: 48 },
  { code: "3401110000", name: "Sovun 'Safeguard' 90g", description: "Antibakterial, qattiq", category: "Maishiy tovarlar", usageCount: 19 },
  { code: "3305100000", name: "Shampun 'Head & Shoulders' 400ml", description: "Qazg'oqqa qarshi", category: "Kosmetika", usageCount: 17 },
  { code: "2009891000", name: "Olma sharbati 1L", description: "100% tabiiy, gazsiz", category: "Ichimliklar", usageCount: 23 },
  { code: "0808100000", name: "Olma (mahalliy) 1kg", description: "Yangi, sortga ajratilmagan", category: "Meva-sabzavot", usageCount: 36 },
  { code: "0803000000", name: "Banan 1kg", description: "Ekvador, yetilgan", category: "Meva-sabzavot", usageCount: 29 },
  { code: "0805100000", name: "Apelsin 1kg", description: "Misr, yetilgan", category: "Meva-sabzavot", usageCount: 21 },
];

// Extra mock dataset for "search results"
const SEARCH_RESULTS: MxikItem[] = [
  { code: "2202100000", name: "Coca-Cola 0.5L PET", description: "Gazlangan suv, qand qo'shilgan, PET shisha", category: "Ichimliklar" },
  { code: "2202100050", name: "Coca-Cola 1.5L PET", description: "Gazlangan suv, qand qo'shilgan, PET 1.5L", category: "Ichimliklar" },
  { code: "2202100075", name: "Coca-Cola 2L PET", description: "Gazlangan suv, qand qo'shilgan, PET 2L", category: "Ichimliklar" },
  { code: "2202100110", name: "Coca-Cola Zero 0.5L", description: "Gazlangan suv, qandsiz, PET", category: "Ichimliklar" },
  { code: "2202100120", name: "Coca-Cola Light 0.5L", description: "Past kaloriyali, PET", category: "Ichimliklar" },
  { code: "2202100150", name: "Coca-Cola banka 0.33L", description: "Gazlangan suv, alyuminiy banka", category: "Ichimliklar" },
  { code: "2202100200", name: "Coca-Cola 0.25L shisha", description: "Gazlangan suv, qaytuvchi shisha", category: "Ichimliklar" },
  { code: "2202100100", name: "Pepsi 0.5L PET", description: "Gazlangan suv, qand qo'shilgan", category: "Ichimliklar" },
];

const RECENT_VIEWED: { code: string; name: string }[] = [
  { code: "2202100000", name: "Coca-Cola 0.5L PET" },
  { code: "1905901100", name: "Oq non 'Gulli'" },
  { code: "2402200000", name: "Marlboro Red blok" },
  { code: "0201300000", name: "Sigir go'shti (premium)" },
  { code: "0401201000", name: "Imkon sut 1L" },
];

const SPECIAL_TABLES: { label: string; hint: string }[] = [
  { label: "Aksiz tovarlari ro'yxati", hint: "Sigaret, alkohol, neft mahsulotlari" },
  { label: "Belgilangan tovarlari", hint: "MARKIROVKA majburiy" },
  { label: "Qishloq xo'jaligi", hint: "Don, meva-sabzavot, chorvachilik" },
  { label: "Eksport-import", hint: "TN VED kodlari bilan moslashtirilgan" },
];

export function MxikSearchView() {
  const { info } = useToast();

  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState<string[]>([]);

  const toggleCat = (key: string) => {
    setActiveCats((xs) =>
      xs.includes(key) ? xs.filter((x) => x !== key) : [...xs, key]
    );
  };

  const trimmedQuery = query.trim().toLowerCase();
  const hasQuery = trimmedQuery.length > 0;

  const filtered = useMemo(() => {
    if (!hasQuery) return [];
    return SEARCH_RESULTS.filter(
      (r) =>
        r.name.toLowerCase().includes(trimmedQuery) ||
        r.code.toLowerCase().includes(trimmedQuery) ||
        r.description.toLowerCase().includes(trimmedQuery)
    );
  }, [trimmedQuery, hasQuery]);

  const handleSelect = (item: MxikItem) => {
    info("Tez orada", `MXIK ${item.code} tafsilot oynasi`);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            MXIK katalog qidiruv
          </h1>
          <p className="mt-1 text-[13px] text-ink-500">
            461 950+ mahsulot kodi · Soliq.uz{" "}
            <span className="font-mono">tasnif.soliq.uz</span> bilan sinxron
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-600 bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-600" />
            Oxirgi sync: 21.05.2026 06:00
          </span>
          <Button variant="ghost" size="sm">
            <RefreshCw className="size-3.5" />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Hero search */}
      <div className="mb-6 rounded-lg border border-border bg-surface-card p-6">
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mahsulot nomi yoki MXIK kod (10 raqam)..."
              className={cn(
                "h-14 w-full rounded-md border border-border-strong bg-surface px-12 text-lg text-ink-900",
                "placeholder:text-ink-400",
                "focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1 focus:border-navy-700"
              )}
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-sm text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label="Tozalash"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="mt-4">
            <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              Asosiy filterlar
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const active = activeCats.includes(c.key);
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => toggleCat(c.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
                      active
                        ? "border-navy-700 bg-navy-50 text-navy-700 dark:text-navy-300"
                        : "border-border-strong bg-surface-card text-ink-600 hover:bg-ink-100"
                    )}
                  >
                    {c.label}
                    <span
                      className={cn(
                        "font-mono text-[10px]",
                        active ? "text-navy-700 dark:text-navy-300/70" : "text-ink-400"
                      )}
                    >
                      ({c.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main grid: results + sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Results area */}
        <div>
          {hasQuery ? (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-ink-900">
                  Topildi:{" "}
                  <span className="font-mono tabular-nums">
                    {filtered.length}
                  </span>{" "}
                  ta natija
                </h2>
                <span className="font-mono text-[11px] text-ink-500">
                  &ldquo;{query}&rdquo; bo&apos;yicha
                </span>
              </div>

              <div className="space-y-2">
                {filtered.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center text-[13px] text-ink-500">
                      Hech narsa topilmadi. Boshqa so&apos;z yoki kod kiriting.
                    </CardContent>
                  </Card>
                ) : (
                  filtered.map((r) => (
                    <Card
                      key={r.code}
                      className="overflow-hidden transition-colors hover:border-navy-700"
                    >
                      <CardContent className="flex items-center gap-4 py-3">
                        <div className="shrink-0 rounded-sm border border-border bg-ink-100/40 px-3 py-2 font-mono text-[15px] font-semibold tracking-wider text-ink-900">
                          {r.code}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-semibold text-ink-900">
                            {r.name}
                          </div>
                          <div className="mt-0.5 text-[12px] text-ink-600">
                            {r.description}
                          </div>
                          <div className="mt-1 inline-block rounded-full border border-border bg-ink-100/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-600">
                            {r.category}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSelect(r)}
                          >
                            Tanlash
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelect(r)}
                          >
                            Tafsilot
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-ink-900">
                  Eng ko&apos;p ishlatilgan
                </h2>
                <span className="font-mono text-[11px] text-ink-500">
                  So&apos;nggi 30 kun
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {POPULAR.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className="group flex flex-col items-start gap-1.5 rounded-md border border-border bg-surface-card p-3 text-left transition-colors hover:border-navy-700 hover:shadow-sm"
                  >
                    <div className="font-mono text-[14px] font-semibold tracking-wider text-ink-900 group-hover:text-navy-700 dark:text-navy-300">
                      {p.code}
                    </div>
                    <div className="text-[13px] font-medium text-ink-700 line-clamp-1">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-border bg-ink-100/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-600">
                        {p.category}
                      </span>
                    </div>
                    <div className="mt-auto pt-1 font-mono text-[10px] text-ink-500">
                      Bu do&apos;konda: {p.usageCount} marta ishlatilgan
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-4 space-y-4">
            {/* Recently viewed */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-[13px]">Yaqinda ko&apos;rilganlar</CardTitle>
              </CardHeader>
              <div>
                {RECENT_VIEWED.map((r) => (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() =>
                      handleSelect({
                        code: r.code,
                        name: r.name,
                        description: "",
                        category: "",
                      })
                    }
                    className="flex w-full items-center justify-between gap-2 border-b border-border px-4 py-2.5 text-left last:border-0 hover:bg-ink-100/50"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-[12px] font-semibold text-ink-900">
                        {r.code}
                      </div>
                      <div className="mt-0.5 truncate text-[12px] text-ink-600">
                        {r.name}
                      </div>
                    </div>
                    <ChevronRight className="size-3.5 shrink-0 text-ink-400" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Special tables */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-[13px]">Maxsus jadvallar</CardTitle>
              </CardHeader>
              <div>
                {SPECIAL_TABLES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => info("Tez orada", s.label)}
                    className="flex w-full items-center justify-between gap-2 border-b border-border px-4 py-2.5 text-left last:border-0 hover:bg-ink-100/50"
                  >
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-navy-700 dark:text-navy-300">
                        {s.label}
                      </div>
                      <div className="mt-0.5 text-[11px] text-ink-500">
                        {s.hint}
                      </div>
                    </div>
                    <ExternalLink className="size-3.5 shrink-0 text-ink-400" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Help */}
            <Card className="border-l-4 border-l-navy-700 bg-navy-50/40">
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="size-4 text-navy-700 dark:text-navy-300" />
                  <h3 className="text-[13px] font-semibold text-navy-700 dark:text-navy-300">
                    Yordam
                  </h3>
                </div>
                <p className="text-[12px] leading-relaxed text-ink-700">
                  MXIK kodlarini topishda yordam kerakmi? Yo&apos;riqnoma o&apos;qing
                  yoki AI yordamchidan so&apos;rang.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button variant="secondary" size="sm">
                    Yo&apos;riqnoma
                  </Button>
                  <Button variant="primary" size="sm">
                    <Sparkles className="size-3.5" />
                    AI yordamchi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </>
  );
}
