"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Search, SkipForward, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { useToast } from "@/components/ui/toast";
import {
  approveRowAction,
  rejectRowAction,
} from "@/lib/actions/documents";
import type { ProductRow, RetailDocument } from "@/lib/types";
import { formatNumber, formatSom } from "@/lib/utils";

interface NewProductCardProps {
  row: ProductRow;
  doc: RetailDocument;
}

export function NewProductCard({ row, doc }: NewProductCardProps) {
  const { success, info } = useToast();
  const [pending, startTransition] = useTransition();

  const handleAdd = () => {
    startTransition(async () => {
      await approveRowAction(doc.id, row.id);
      success("Katalogga qo'shildi", row.rawName);
    });
  };

  const handleSkip = () => {
    startTransition(async () => {
      await rejectRowAction(doc.id, row.id, "Skip");
      success("Skip qilindi", row.rawName);
    });
  };

  const handleMxikSearch = () => {
    info("Tez orada", "MXIK qidirish dialogi yaqinda qo'shiladi");
  };

  return (
    <div className="rounded-md border border-l-4 border-border border-l-amber-600 bg-surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-ink-900 leading-tight">
            {row.rawName}
            <ArrowRight className="inline mx-1.5 size-3 text-ink-400 align-middle" />
            <span className="text-amber-600">Yangi mahsulot</span>
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

      {row.mxik && (
        <div className="mt-3 rounded-sm border border-border bg-surface px-3 py-2.5">
          <div className="flex items-center gap-2 text-[11px] text-ink-500 font-mono uppercase tracking-wider">
            <Sparkles className="size-3 text-emerald-600" />
            AI taklif
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="font-mono text-[13px] font-semibold text-navy-700">
              {row.mxik.code}
            </span>
            <span className="text-[13px] text-ink-700">{row.mxik.name}</span>
          </div>
        </div>
      )}

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
            onClick={handleAdd}
            disabled={pending}
          >
            <Plus className="size-3.5" />
            Qo&apos;shish
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMxikSearch}
            disabled={pending}
          >
            <Search className="size-3.5" />
            MXIK qidirish
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
        </div>
      </div>
    </div>
  );
}
