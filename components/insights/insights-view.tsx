"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Repeat,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { dismissAllInsightsAction } from "@/lib/actions/insights";
import type { DailyInsight } from "@/lib/types";
import { formatSom, cn } from "@/lib/utils";
import { InsightCard } from "./insight-card";

interface InsightsViewProps {
  insights: DailyInsight[];
}

function SectionHeader({
  icon: Icon,
  iconClass,
  title,
  count,
  subtitle,
}: {
  icon: typeof Sparkles;
  iconClass: string;
  title: string;
  count: number;
  subtitle?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div className="flex items-center gap-2.5">
        <div
          className={cn("grid size-7 place-items-center rounded-sm", iconClass)}
        >
          <Icon className="size-4" />
        </div>
        <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
          {title}
          <span className="ml-2 font-mono text-[12px] font-medium text-ink-500">
            ({count} ta)
          </span>
        </h2>
      </div>
      {subtitle && (
        <span className="font-mono text-[11px] text-ink-500">{subtitle}</span>
      )}
    </div>
  );
}

export function InsightsView({ insights }: InsightsViewProps) {
  const { success, info } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const groups = useMemo(() => {
    return {
      lowStock: insights.filter((i) => i.type === "low-stock"),
      priceSpikes: insights.filter((i) => i.type === "price-spike"),
      reorders: insights.filter((i) => i.type === "reorder"),
      duplicates: insights.filter((i) => i.type === "duplicate"),
      supplierIssues: insights.filter((i) => i.type === "supplier-issue"),
    };
  }, [insights]);

  const totalSavings = 88_400; // mock — sum of suggested savings

  const handleBulkApply = () => {
    if (insights.length === 0) {
      info("Insight yo'q", "Hozircha amal qilinadigan tavsiyalar yo'q");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await dismissAllInsightsAction();
      success(
        "Hammasi bajarildi",
        `${res.count} ta tavsiya yopildi`
      );
      setConfirmOpen(false);
    });
  };

  if (insights.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-600/30 bg-emerald-50 p-8 text-center">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-emerald-600 text-white">
          <Check className="size-6" />
        </div>
        <h2 className="text-[16px] font-semibold text-emerald-700">
          Hammasi tartibda!
        </h2>
        <p className="mt-1 text-[13px] text-emerald-700/80">
          Bugun e&apos;tibor talab qiladigan tavsiyalar yo&apos;q.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* HERO — bugungi xulosa */}
      <div className="mb-8 overflow-hidden rounded-lg border border-emerald-600/30 bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-50/40">
        <div className="flex items-start gap-4 p-5">
          <div className="grid size-10 shrink-0 place-items-center rounded-md bg-emerald-600 text-white shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-bold tracking-tight text-emerald-700">
                Bugungi xulosa
              </h2>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                AI
              </span>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-emerald-700">
              <span className="font-mono font-semibold">
                {groups.lowStock.length}
              </span>{" "}
              ta mahsulot kritik darajada ·{" "}
              <span className="font-mono font-semibold">
                {groups.priceSpikes.length}
              </span>{" "}
              ta narx oshishi ·{" "}
              <span className="font-mono font-semibold">
                {groups.reorders.length}
              </span>{" "}
              ta tavsiya buyurtma · Jami tejov:{" "}
              <span className="font-mono font-bold">
                {formatSom(totalSavings)}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                variant="emerald"
                size="md"
                onClick={handleBulkApply}
                disabled={pending}
              >
                <Check className="size-4" />
                Hammasiga amal qilish (1-click)
              </Button>
              <span className="font-mono text-[11px] text-emerald-700/70">
                {groups.lowStock.length + groups.reorders.length} ta buyurtma ·
                3 ta yetkazib beruvchi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1 — Kritik qoldiqlar */}
      {groups.lowStock.length > 0 && (
        <section className="mb-8">
          <SectionHeader
            icon={AlertTriangle}
            iconClass="bg-red-50 text-red-700"
            title="Kritik qoldiqlar"
            count={groups.lowStock.length}
            subtitle="Tugashga 24 soat"
          />
          <div className="grid grid-cols-2 gap-3">
            {groups.lowStock.map((ins) => (
              <InsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2 — Narx o'zgarishlari */}
      {groups.priceSpikes.length > 0 && (
        <section className="mb-8">
          <SectionHeader
            icon={TrendingUp}
            iconClass="bg-amber-50 text-amber-600"
            title="Narx o'zgarishlari"
            count={groups.priceSpikes.length}
            subtitle="Bozor monitoring · 14 ta yetkazib beruvchi"
          />
          <div className="space-y-3">
            {groups.priceSpikes.map((ins) => (
              <InsightCard key={ins.id} insight={ins} variant="price-spike" />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3 — Buyurtma tavsiyalari */}
      {groups.reorders.length > 0 && (
        <section className="mb-8">
          <SectionHeader
            icon={Repeat}
            iconClass="bg-navy-50 text-navy-700"
            title="Buyurtma tavsiyalari"
            count={groups.reorders.length}
            subtitle="Iste'mol tezligiga asoslangan"
          />
          <div className="grid grid-cols-2 gap-3">
            {groups.reorders.map((ins) => (
              <InsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4 — Dublikatlar */}
      {groups.duplicates.length > 0 && (
        <section className="mb-8">
          <SectionHeader
            icon={Copy}
            iconClass="bg-amber-50 text-amber-600"
            title="Dublikat shubhalari"
            count={groups.duplicates.length}
            subtitle="Nomenklatura tozaligi"
          />
          <div className="space-y-3">
            {groups.duplicates.map((ins) => (
              <InsightCard key={ins.id} insight={ins} variant="duplicate" />
            ))}
          </div>
        </section>
      )}

      {/* SECTION X — Supplier issues (extra type, default style) */}
      {groups.supplierIssues.length > 0 && (
        <section className="mb-8">
          <SectionHeader
            icon={AlertTriangle}
            iconClass="bg-amber-50 text-amber-600"
            title="Yetkazib beruvchi muammolari"
            count={groups.supplierIssues.length}
          />
          <div className="space-y-3">
            {groups.supplierIssues.map((ins) => (
              <InsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        </section>
      )}

      {/* Confirm: 1-click apply all */}
      <Confirm
        open={confirmOpen}
        onClose={() => (pending ? null : setConfirmOpen(false))}
        onConfirm={handleConfirm}
        title={`${insights.length} ta insightga amal qilish?`}
        description={[
          `${groups.lowStock.length} ta kritik qoldiq`,
          `${groups.priceSpikes.length} ta narx o'zgarishi`,
          `${groups.reorders.length} ta buyurtma tavsiyasi`,
          `${groups.duplicates.length} ta dublikat shubhasi`,
        ]
          .filter((line) => !line.startsWith("0 ta"))
          .join(" · ")}
        confirmLabel="Ha, hammasiga amal qilish"
        cancelLabel="Bekor qilish"
        variant="warning"
        loading={pending}
      />
    </>
  );
}
