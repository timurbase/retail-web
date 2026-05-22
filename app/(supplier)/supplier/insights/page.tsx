import Link from "next/link";
import {
  Sparkles,
  AlertOctagon,
  TrendingUp,
  CreditCard,
  BarChart3,
  Phone,
  MessageSquare,
  Gift,
  ArrowRight,
  RotateCw,
  MapPin,
  Plus,
  Package,
  Layers,
} from "lucide-react";
import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supplierPortal, ApiError } from "@/lib/api";
import type {
  SupplierStore,
  PaymentRecord,
  DemandSignal,
  SupplierProduct,
} from "@/lib/types";
import { formatSom, formatNumber, cn } from "@/lib/utils";

const NOW_MS = new Date("2026-05-21T10:00:00Z").getTime();
const DAY_MS = 86400000;

function daysSince(iso: string): number {
  return Math.floor((NOW_MS - new Date(iso).getTime()) / DAY_MS);
}

export default async function SupplierInsightsPage() {
  let stores: SupplierStore[] = [];
  let overdue: PaymentRecord[] = [];
  let signals: DemandSignal[] = [];
  let products: SupplierProduct[] = [];
  let loadError: string | null = null;
  try {
    // Insights endpoint is also fetched (warming/logging server-side analytics)
    // but the page renders from raw lists so it has fine-grained control.
    const [storesRes, paymentsRes, signalsRes, productsRes] = await Promise.all([
      supplierPortal.stores.list({ limit: 200 }),
      supplierPortal.payments.list({ status: "overdue", limit: 100 }),
      supplierPortal.demandSignals.list({ limit: 100 }),
      supplierPortal.products.list({ limit: 200 }),
      supplierPortal.insights.get().catch(() => null),
    ]);
    stores = storesRes.results;
    overdue = paymentsRes.results;
    signals = signalsRes.results;
    products = productsRes.results;
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "Insights yuklab bo'lmadi";
  }

  // CHURN risk — stores that were active (high reliability) but no order > 14d
  const churnRisk = stores
    .filter((s) => daysSince(s.lastOrderAt) >= 14 && s.reliabilityScore >= 7.5)
    .sort((a, b) => daysSince(b.lastOrderAt) - daysSince(a.lastOrderAt))
    .slice(0, 3);

  // GROWTH opportunities — best monthly volume + reliability >= 9
  const growthCandidates = stores
    .filter((s) => s.reliabilityScore >= 9.0)
    .sort((a, b) => b.monthlyVolume - a.monthlyVolume)
    .slice(0, 2);

  const risingRegions = [...signals]
    .filter((s) => s.hotness === "rising")
    .sort((a, b) => b.trendPercent - a.trendPercent)[0];

  // Top overdue 3
  const topOverdue = [...overdue]
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 3);

  // Top products
  const topProducts = [...products]
    .sort((a, b) => b.monthlySales - a.monthlySales)
    .slice(0, 5);
  const topProductMax = topProducts[0]?.monthlySales ?? 1;

  // Top stores
  const topStores = [...stores]
    .sort((a, b) => b.monthlyVolume - a.monthlyVolume)
    .slice(0, 5);
  const topStoreMax = topStores[0]?.monthlyVolume ?? 1;

  // Strongest regions — group stores by region
  const regionMap = new Map<string, number>();
  for (const s of stores) {
    regionMap.set(s.region, (regionMap.get(s.region) ?? 0) + s.monthlyVolume);
  }
  const topRegions = [...regionMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topRegionMax = topRegions[0]?.[1] ?? 1;

  return (
    <>
      <SupplierTopbar
        breadcrumb={[{ label: "Supplier" }, { label: "AI Insights" }]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {loadError && (
            <Alert variant="error" className="mb-4">
              {loadError}
            </Alert>
          )}
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                AI Insights
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Distribyutor uchun proaktiv tavsiyalar &mdash; kuniga{" "}
                <span className="font-mono font-medium text-ink-700">09:00</span>{" "}
                da yangilanadi
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <RotateCw className="size-3.5" />
                Yangilash
              </Button>
              <Link
                href="/supplier/sozlamalar"
                className="rounded-sm px-3 py-2 text-[13px] font-medium text-navy-700 dark:text-navy-300 hover:bg-navy-50"
              >
                Sozlamalar
              </Link>
            </div>
          </div>

          {/* Hero summary */}
          <div className="mb-6 rounded-lg border border-emerald-600/40 bg-emerald-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-md bg-emerald-600 text-white">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Bugungi xulosa
                  </div>
                  <p className="mt-1 text-[15px] font-semibold text-ink-900">
                    {churnRisk.length} ta yo&apos;qotish xavfi,{" "}
                    {growthCandidates.length + 3} ta o&apos;sish imkoniyati, jami
                    tejov: <span className="font-mono">8.4M so&apos;m</span>
                  </p>
                </div>
              </div>
              <Button variant="emerald">
                <Sparkles className="size-4" />
                Hammasiga amal qilish
              </Button>
            </div>
          </div>

          {/* CHURN section */}
          <section className="mb-6">
            <div className="mb-3 flex items-end justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-7 place-items-center rounded-sm bg-red-50 text-red-700 dark:text-red-300">
                  <AlertOctagon className="size-4" />
                </div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
                  Yo&apos;qotish xavfi
                  <span className="ml-2 font-mono text-[12px] font-medium text-ink-500">
                    ({churnRisk.length} ta)
                  </span>
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-500">
                Churn risk &middot; reliability &ge; 7.5
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {churnRisk.map((s) => {
                const d = daysSince(s.lastOrderAt);
                return (
                  <Card key={s.id} className="border-l-4 border-l-red-600 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-semibold text-ink-900 truncate">
                          {s.name} &mdash; {d} kun buyurtma yo&apos;q
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-ink-500">
                          {s.region} &middot; reliability{" "}
                          {s.reliabilityScore.toFixed(1)}/10
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-red-50 border border-red-600 px-2 py-0.5 font-mono text-[10px] font-semibold text-red-700 dark:text-red-300">
                        Yuqori xavf
                      </span>
                    </div>
                    <p className="mt-3 text-[12px] leading-relaxed text-ink-600">
                      Avval haftada 1 marta buyurtma berardi. Mumkin: raqobatchi
                      yetkazib beruvchiga o&apos;tdi.{" "}
                      <span className="font-medium text-ink-900">
                        Tavsiya: direktoriga qo&apos;ng&apos;iroq qiling.
                      </span>
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                      <Button variant="primary" size="sm">
                        <Phone className="size-3.5" />
                        Aloqaga chiqish
                      </Button>
                      <Button variant="secondary" size="sm">
                        <MessageSquare className="size-3.5" />
                        Telegram
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Gift className="size-3.5" />
                        Promo taklif
                      </Button>
                    </div>
                  </Card>
                );
              })}
              {churnRisk.length === 0 && (
                <div className="col-span-full rounded-md border border-dashed border-border bg-ink-100/40 px-5 py-8 text-center text-[13px] text-ink-500">
                  Yo&apos;qotish xavfi yo&apos;q &mdash; barcha do&apos;konlar
                  faol
                </div>
              )}
            </div>
          </section>

          {/* GROWTH section */}
          <section className="mb-6">
            <div className="mb-3 flex items-end justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-7 place-items-center rounded-sm bg-emerald-50 text-emerald-700 dark:text-emerald-300">
                  <TrendingUp className="size-4" />
                </div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
                  O&apos;sish imkoniyatlari
                  <span className="ml-2 font-mono text-[12px] font-medium text-ink-500">
                    (5 ta)
                  </span>
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-500">
                Potensial tejov / o&apos;sish: ~8.4M so&apos;m
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {growthCandidates[0] && (
                <Card className="border-l-4 border-l-emerald-600 p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="size-4 text-emerald-700 dark:text-emerald-300 mt-1" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold text-ink-900">
                        {growthCandidates[0].name} kredit limitini oshirish
                      </div>
                      <p className="mt-1 text-[12px] text-ink-600">
                        Reliability {growthCandidates[0].reliabilityScore.toFixed(1)}/10 &middot; bu oy{" "}
                        {formatSom(growthCandidates[0].monthlyVolume)}. Limitni{" "}
                        {formatSom(growthCandidates[0].creditLimit)} dan{" "}
                        {formatSom(growthCandidates[0].creditLimit * 1.5)} ga oshirish maslahatli.
                      </p>
                      <div className="mt-2">
                        <Link
                          href={`/supplier/do-konlar/${growthCandidates[0].id}`}
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                        >
                          Do&apos;kon profilini ochish
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {risingRegions && (
                <Card className="border-l-4 border-l-emerald-600 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-emerald-700 dark:text-emerald-300 mt-1" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold text-ink-900">
                        {risingRegions.region}da {risingRegions.productName} +
                        {risingRegions.trendPercent.toFixed(0)}% talab oshmoqda
                      </div>
                      <p className="mt-1 text-[12px] text-ink-600">
                        Haftalik volume {formatNumber(risingRegions.weeklyVolume)} dan
                        kelasi hafta {formatNumber(risingRegions.predictedNextWeek)} ga
                        chiqishi kutilmoqda. Yetkazib berishni rejalashtiring.
                      </p>
                      <div className="mt-2">
                        <Link
                          href="/supplier/talab"
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                        >
                          Talab tahliliga o&apos;tish
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="border-l-4 border-l-navy-700 p-4">
                <div className="flex items-start gap-3">
                  <Plus className="size-4 text-navy-700 dark:text-navy-300 mt-1" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink-900">
                      Yangi mahsulot taklifi: Pepsi Zero
                    </div>
                    <p className="mt-1 text-[12px] text-ink-600">
                      12 ta do&apos;konda Pepsi Zero sotilmoqda, lekin sizning
                      katalogingizda yo&apos;q. Qo&apos;shing &mdash; oylik
                      potentsial {formatSom(18_500_000)}.
                    </p>
                    <div className="mt-2">
                      <Link
                        href="/supplier/mahsulotlar"
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                      >
                        Katalogga qo&apos;shish
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-l-4 border-l-amber-600 p-4">
                <div className="flex items-start gap-3">
                  <Layers className="size-4 text-amber-600 dark:text-amber-300 mt-1" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink-900">
                      Bulk discount imkoniyati
                    </div>
                    <p className="mt-1 text-[12px] text-ink-600">
                      5 ta do&apos;kon 1M+ buyurtma bersa, sizga 8% qo&apos;shimcha
                      foyda &mdash; bu hafta uchun mumkin. Promo yuborish kerak.
                    </p>
                    <div className="mt-2">
                      <button className="inline-flex items-center gap-1 text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline">
                        Promo kampaniya yaratish
                        <ArrowRight className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-l-4 border-l-amber-600 p-4 md:col-span-2">
                <div className="flex items-start gap-3">
                  <Package className="size-4 text-amber-600 dark:text-amber-300 mt-1" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink-900">
                      Yangi viloyat: Surxondaryo
                    </div>
                    <p className="mt-1 text-[12px] text-ink-600">
                      Surxondaryo&apos;da hech bir mahsulotingiz sotilmaydi.
                      Termiz va Denov shaharlarida 4 ta yirik chakana zanjir
                      sotuvchi taminotchi qidirmoqda &mdash; bozor tahliliga
                      ehtiyoj.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href="/supplier/do-konlar"
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                      >
                        Do&apos;kon taklif qilish
                        <ArrowRight className="size-3" />
                      </Link>
                      <Link
                        href="/supplier/hisobotlar"
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
                      >
                        Bozor hisoboti
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* OVERDUE focus */}
          <section className="mb-6">
            <div className="mb-3 flex items-end justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-7 place-items-center rounded-sm bg-amber-50 text-amber-600 dark:text-amber-300">
                  <CreditCard className="size-4" />
                </div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
                  Kechikkan to&apos;lovlar diqqati
                  <span className="ml-2 font-mono text-[12px] font-medium text-ink-500">
                    ({topOverdue.length} ta)
                  </span>
                </h2>
              </div>
              <Link
                href="/supplier/to-lovlar"
                className="text-[11px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
              >
                Hammasi &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {topOverdue.map((p) => (
                <Card key={p.id} className="border-l-4 border-l-amber-600 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-[12px] font-semibold text-navy-700 dark:text-navy-300">
                        {p.invoiceNumber}
                      </div>
                      <div className="mt-0.5 text-[13px] font-medium text-ink-900 truncate">
                        {p.storeName}
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-300">
                      {p.daysOverdue} kun
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-[14px] font-bold text-ink-900">
                    {formatSom(p.amount - p.paidAmount)}
                  </div>
                  <div className="mt-3 border-t border-border pt-2.5">
                    <Button variant="secondary" size="sm">
                      <Phone className="size-3.5" />
                      Qo&apos;ng&apos;iroq
                    </Button>
                  </div>
                </Card>
              ))}
              {topOverdue.length === 0 && (
                <div className="col-span-full rounded-md border border-dashed border-border bg-emerald-50/60 px-5 py-8 text-center text-[13px] text-emerald-700 dark:text-emerald-300">
                  Kechikkan to&apos;lovlar yo&apos;q &mdash; barcha to&apos;lovlar joyida
                </div>
              )}
            </div>
          </section>

          {/* WEEKLY trends */}
          <section className="mb-4">
            <div className="mb-3 flex items-end justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-7 place-items-center rounded-sm bg-emerald-50 text-emerald-700 dark:text-emerald-300">
                  <BarChart3 className="size-4" />
                </div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
                  Haftalik tendentsiyalar
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-500">
                So&apos;nggi 7 kun
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {/* Top products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5">
                    <Package className="size-4 text-emerald-700 dark:text-emerald-300" />
                    Top mahsulotlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {topProducts.map((p) => {
                    const w = (p.monthlySales / topProductMax) * 100;
                    return (
                      <div key={p.id}>
                        <div className="mb-1 flex items-center justify-between text-[12px]">
                          <span className="text-ink-700 truncate">{p.name}</span>
                          <span className="font-mono font-semibold text-ink-900 shrink-0 ml-2">
                            {formatNumber(p.monthlySales)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600"
                            style={{ width: `${w}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Top stores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5">
                    <TrendingUp className="size-4 text-navy-700 dark:text-navy-300" />
                    Top do&apos;konlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {topStores.map((s) => {
                    const w = (s.monthlyVolume / topStoreMax) * 100;
                    return (
                      <div key={s.id}>
                        <div className="mb-1 flex items-center justify-between text-[12px]">
                          <span className="text-ink-700 truncate">{s.name}</span>
                          <span className="font-mono font-semibold text-ink-900 shrink-0 ml-2">
                            {formatSom(s.monthlyVolume)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                          <div
                            className="h-full bg-navy-700"
                            style={{ width: `${w}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Top regions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-amber-600 dark:text-amber-300" />
                    Eng kuchli mintaqalar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {topRegions.map(([region, vol]) => {
                    const w = (vol / topRegionMax) * 100;
                    return (
                      <div key={region}>
                        <div className="mb-1 flex items-center justify-between text-[12px]">
                          <span className="text-ink-700 truncate">{region}</span>
                          <span className="font-mono font-semibold text-ink-900 shrink-0 ml-2">
                            {formatSom(vol)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                          <div
                            className={cn(
                              "h-full",
                              w >= 75
                                ? "bg-emerald-600"
                                : w >= 50
                                ? "bg-amber-600"
                                : "bg-navy-700"
                            )}
                            style={{ width: `${w}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
