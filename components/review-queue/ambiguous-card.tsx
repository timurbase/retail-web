"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { useToast } from "@/components/ui/toast";
import {
  rejectRowAction,
  selectVariantAction,
} from "@/lib/actions/documents";
import type { MxikSuggestion, ProductRow, RetailDocument } from "@/lib/types";
import { cn, formatNumber, formatSom } from "@/lib/utils";

interface AmbiguousCardProps {
  row: ProductRow;
  doc: RetailDocument;
}

export function AmbiguousCard({ row, doc }: AmbiguousCardProps) {
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const alternatives: MxikSuggestion[] = row.alternatives ?? [];
  // Default selection: prefer index 1 (matches legacy "topPick") if available
  const defaultIndex = alternatives.length > 1 ? 1 : 0;
  const [selectedCode, setSelectedCode] = useState<string | null>(
    alternatives[defaultIndex]?.code ?? null
  );

  const handleSelectVariant = (code: string) => {
    setSelectedCode(code);
    startTransition(async () => {
      const res = await selectVariantAction(doc.id, row.id, code);
      if (res.ok) {
        const variant = alternatives.find((a) => a.code === code);
        success("Variant tanlandi", variant?.name ?? code);
      } else {
        error("Tanlab bo'lmadi", "Variant topilmadi");
      }
    });
  };

  const handleConfirmSelection = () => {
    if (!selectedCode) {
      error("Variant tanlanmadi", "Avval birini tanlang");
      return;
    }
    handleSelectVariant(selectedCode);
  };

  const handleSkip = () => {
    startTransition(async () => {
      await rejectRowAction(doc.id, row.id, "Skip");
      success("Skip qilindi", row.rawName);
    });
  };

  return (
    <div className="rounded-md border border-l-4 border-border border-l-red-600 bg-surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-ink-900 leading-tight">
            {row.rawName}
            <ArrowRight className="inline mx-1.5 size-3 text-ink-400 align-middle" />
            <span className="text-red-700">MXIK aniq emas</span>
          </div>
          <div className="mt-1 text-[12px] text-ink-500">
            Hujjat{" "}
            <Link
              href={`/hujjatlar/${doc.id}`}
              className="font-mono font-semibold text-navy-700 hover:underline"
            >
              №{doc.number}
            </Link>{" "}
            <span className="text-ink-300">·</span>{" "}
            <span>{doc.supplier.name}</span>
          </div>
        </div>
        <ConfidenceBadge score={row.confidence} />
      </div>

      <div className="mt-3 text-[12px] font-medium text-ink-700">
        {alternatives.length} ta variant &mdash; birini tanlang:
      </div>

      <div className="mt-2 flex flex-col gap-1.5">
        {alternatives.map((alt, i) => {
          const checked = selectedCode === alt.code;
          return (
            <label
              key={`${row.id}-${alt.code}-${i}`}
              className={cn(
                "flex items-center gap-2.5 rounded-sm border bg-surface px-3 py-2 text-[12px] cursor-pointer transition-colors hover:bg-navy-50 hover:border-navy-700",
                checked && "border-navy-700 bg-navy-50/50"
              )}
            >
              <input
                type="radio"
                name={`alt-${row.id}`}
                checked={checked}
                onChange={() => setSelectedCode(alt.code)}
                disabled={pending}
                className="accent-navy-700"
              />
              <span className="font-mono font-semibold text-navy-700">
                {alt.code}
              </span>
              <span className="text-ink-700">{alt.name}</span>
              <span className="ml-auto font-mono text-[10px] text-ink-500">
                {Math.round(alt.confidence * 100)}%
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[12px] text-ink-500">
          {formatNumber(row.quantity)} {row.unit} ×{" "}
          <span className="font-semibold text-ink-900">
            {formatNumber(row.price)}
          </span>{" "}
          ={" "}
          <span className="font-semibold text-ink-900">
            {formatSom(row.total)}
          </span>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="emerald"
            size="sm"
            onClick={handleConfirmSelection}
            disabled={pending || !selectedCode}
          >
            <CheckCircle2 className="size-3.5" />
            Tanlash va davom etish
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={pending}
          >
            <SkipForward className="size-3.5" />
            Skip
          </Button>
          <Link href={`/hujjatlar/${doc.id}`}>
            <Button variant="secondary" size="sm" disabled={pending}>
              <ArrowRight className="size-3.5" />
              Hujjatga o&apos;tish
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
