"use client";

import { useTransition } from "react";
import { Sparkles, Check, Bell, X, Repeat, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  actOnInsightAction,
  dismissInsightAction,
} from "@/lib/actions/insights";
import type { DailyInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

const severityBar: Record<DailyInsight["severity"], string> = {
  critical: "border-l-red-600",
  warning: "border-l-amber-600",
  info: "border-l-navy-700",
};

const severityDot: Record<DailyInsight["severity"], string> = {
  critical: "bg-red-600",
  warning: "bg-amber-600",
  info: "bg-navy-700",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "Hozir";
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
}

function AiSuggestionBlock({ label }: { label: string }) {
  return (
    <div className="rounded-sm border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-[13px]">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-emerald-700 dark:text-emerald-300" />
        <div className="flex-1">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            AI tavsiya
          </span>
          <p className="mt-0.5 font-medium text-emerald-700 dark:text-emerald-300">{label}</p>
        </div>
      </div>
    </div>
  );
}

interface InsightCardProps {
  insight: DailyInsight;
  /**
   * Visual layout variant. "default" renders the standard low-stock / reorder
   * style. "price-spike" and "duplicate" tweak the action row.
   */
  variant?: "default" | "price-spike" | "duplicate";
}

export function InsightCard({ insight, variant = "default" }: InsightCardProps) {
  const { success, info } = useToast();
  const [pending, startTransition] = useTransition();

  const handleAct = () => {
    startTransition(async () => {
      await actOnInsightAction(insight.id);
      success(
        "Bajarildi",
        insight.suggestedAction?.label ?? "Tavsiyaga amal qilindi"
      );
    });
  };

  const handleDismiss = () => {
    startTransition(async () => {
      await dismissInsightAction(insight.id);
      success("Dismiss qilindi");
    });
  };

  const handleRemind = () => {
    info("Tez orada", "Eslatma funksiyasi yaqinda qo'shiladi");
  };

  const actionLabel =
    insight.suggestedAction?.label ??
    (variant === "duplicate" ? "Birlashtirish" : "Amal qilish");

  return (
    <div
      className={cn(
        "group relative rounded-md border border-border border-l-4 bg-surface-card p-4 transition-shadow hover:shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08)]",
        severityBar[insight.severity]
      )}
    >
      {/* Header: severity dot + title + time + dismiss X */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-1.5 rounded-full",
              severityDot[insight.severity]
            )}
          />
          <h3 className="text-[14px] font-semibold leading-tight text-ink-900">
            {insight.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-ink-500">
            {timeAgo(insight.createdAt)}
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            disabled={pending}
            aria-label="Yopish"
            className="rounded-sm p-0.5 text-ink-400 opacity-0 transition-opacity hover:bg-ink-100 hover:text-ink-600 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-ink-600">{insight.body}</p>

      {/* AI suggestion block — skip for duplicates per legacy layout */}
      {variant !== "duplicate" && insight.suggestedAction?.label && (
        <div className="mt-3">
          <AiSuggestionBlock label={insight.suggestedAction.label} />
        </div>
      )}

      {/* Action row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {variant === "price-spike" ? (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAct}
              disabled={pending}
            >
              <Repeat className="size-3.5" />
              {actionLabel}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              disabled={pending}
            >
              Tafsilot
              <ArrowRight className="size-3.5" />
            </Button>
          </>
        ) : variant === "duplicate" ? (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAct}
              disabled={pending}
            >
              <Repeat className="size-3.5" />
              {actionLabel}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDismiss}
              disabled={pending}
            >
              Alohida saqlash
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                info("Tez orada", "Solishtirish funksiyasi yaqinda qo'shiladi")
              }
              disabled={pending}
            >
              Solishtirish &rarr;
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="emerald"
              size="sm"
              onClick={handleAct}
              disabled={pending}
            >
              <Check className="size-3.5" />
              {actionLabel}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRemind}
              disabled={pending}
            >
              <Bell className="size-3.5" />
              Eslatma o&apos;rnatish
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              disabled={pending}
            >
              Bekor qilish
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
