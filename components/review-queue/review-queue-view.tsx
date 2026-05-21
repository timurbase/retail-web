"use client";

import { useMemo, useTransition } from "react";
import { CheckCircle2, ChevronDown, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { bulkApproveHighConfidenceAction } from "@/lib/actions/documents";
import type { ProductRow, RetailDocument } from "@/lib/types";
import { NewProductCard } from "./new-product-card";
import { AmbiguousCard } from "./ambiguous-card";

interface QueueItem {
  row: ProductRow;
  doc: RetailDocument;
}

interface ReviewQueueViewProps {
  documents: RetailDocument[];
}

function FilterButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-surface-card px-3 text-[12px] font-medium text-ink-700 hover:bg-ink-100"
    >
      {label}
      <ChevronDown className="size-3.5 text-ink-400" />
    </button>
  );
}

export function ReviewQueueView({ documents }: ReviewQueueViewProps) {
  const { success, info } = useToast();
  const [pending, startTransition] = useTransition();

  const { queue, newItems, ambiguousItems, autoApproveCount } = useMemo(() => {
    const queueArr: QueueItem[] = [];
    for (const doc of documents) {
      for (const row of doc.rows) {
        if (row.status === "new" || row.status === "ambiguous") {
          queueArr.push({ row, doc });
        }
      }
    }
    return {
      queue: queueArr,
      newItems: queueArr.filter((q) => q.row.status === "new"),
      ambiguousItems: queueArr.filter((q) => q.row.status === "ambiguous"),
      autoApproveCount: queueArr.filter((q) => q.row.confidence >= 0.9).length,
    };
  }, [documents]);

  const handleBulkAutoApprove = () => {
    // Only run across docs that actually have eligible rows
    const docIds = Array.from(
      new Set(
        queue
          .filter((q) => q.row.confidence >= 0.9)
          .map((q) => q.doc.id)
      )
    );
    if (docIds.length === 0) {
      info(
        "Mos qator yo'q",
        "Yashil-confidence qatorlar topilmadi"
      );
      return;
    }
    startTransition(async () => {
      let total = 0;
      for (const id of docIds) {
        const res = await bulkApproveHighConfidenceAction(id);
        total += res.count;
      }
      success(
        `${total} ta qator avto-tasdiqlandi`,
        `${docIds.length} ta hujjat bo'yicha`
      );
    });
  };

  // Empty state
  if (queue.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="text-[15px] font-semibold text-ink-900">
            🎉 Hammasi tekshirildi!
          </div>
          <div className="mt-1 text-[13px] text-ink-500">
            Yangi hujjatlar kelguncha kuting.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Filter bar + bulk action */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 font-mono">
            Filter:
          </span>
          <FilterButton label="Hammasi" />
          <FilterButton label="Confidence" />
          <FilterButton label="Hujjat manbai" />
        </div>
        {autoApproveCount > 0 && (
          <button
            type="button"
            onClick={handleBulkAutoApprove}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="size-3.5" />
            Bulk action: Hammasini yashil-confidence avto-tasdiq (
            {autoApproveCount} ta)
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* New products */}
        {newItems.length > 0 && (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="inline-block size-2.5 rounded-full bg-amber-600" />
                Yangi mahsulot{" "}
                <span className="font-mono text-[12px] text-ink-500">
                  ({newItems.length} ta)
                </span>
              </CardTitle>
              <span className="text-[11px] text-ink-500 font-mono">
                Katalogda yo&apos;q &mdash; qo&apos;shish kerak
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {newItems.map((item) => (
                <NewProductCard
                  key={`${item.doc.id}-${item.row.id}`}
                  row={item.row}
                  doc={item.doc}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Ambiguous */}
        {ambiguousItems.length > 0 && (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="inline-block size-2.5 rounded-full bg-red-600" />
                MXIK aniq emas{" "}
                <span className="font-mono text-[12px] text-ink-500">
                  ({ambiguousItems.length} ta)
                </span>
              </CardTitle>
              <span className="text-[11px] text-ink-500 font-mono">
                Bir nechta variant &mdash; birini tanlang
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {ambiguousItems.map((item) => (
                <AmbiguousCard
                  key={`${item.doc.id}-${item.row.id}`}
                  row={item.row}
                  doc={item.doc}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Bottom info alert */}
        <Alert variant="info" className="text-[13px]">
          <div className="font-semibold leading-tight">
            Tasdiqlangan yozuvlar omborga avtomatik kiritiladi
          </div>
          <div className="mt-0.5 text-[12px] opacity-80">
            Har bir harakat audit log&apos;da saqlanadi va orqaga qaytarish
            mumkin.
          </div>
        </Alert>
      </div>
    </>
  );
}
