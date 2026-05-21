"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  approveDocumentAction,
  bulkApproveHighConfidenceAction,
} from "@/lib/actions/documents";
import { Sparkles, Check } from "lucide-react";

interface DocActionBarProps {
  docId: string;
  totalRows: number;
  matchedCount: number;
  approvedCount: number;
  reviewCount: number;
}

export function DocActionBar({
  docId,
  totalRows,
  matchedCount,
  approvedCount,
  reviewCount,
}: DocActionBarProps) {
  const router = useRouter();
  const { success, error, info } = useToast();
  const [pending, startTransition] = useTransition();

  function handleBulkApprove() {
    startTransition(async () => {
      const res = await bulkApproveHighConfidenceAction(docId);
      if (res.ok) {
        if (res.count > 0) {
          success(
            "Avto-tasdiqlandi",
            `${res.count} ta yuqori-confidence qator tasdiqlandi`
          );
        } else {
          info("Avto-tasdiqlash", "Tasdiqlash uchun mos qator topilmadi");
        }
      } else {
        error("Xatolik", "Avto-tasdiqlash bajarilmadi");
      }
    });
  }

  function handleApproveDocument() {
    startTransition(async () => {
      const res = await approveDocumentAction(docId);
      if (res.ok) {
        success("Hujjat tasdiqlandi", "Ombor kirim qilindi");
        router.push("/hujjatlar");
      } else {
        error("Xatolik", "Hujjatni tasdiqlab bo'lmadi");
      }
    });
  }

  return (
    <div className="flex items-center justify-between border-t border-border bg-surface-card px-6 py-3">
      <div className="text-[13px] text-ink-600">
        <strong className="font-mono text-ink-900">
          {matchedCount + approvedCount}/{totalRows}
        </strong>{" "}
        avto-mos · <strong className="text-amber-600 dark:text-amber-300">{reviewCount}</strong>{" "}
        kutmoqda
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={handleBulkApprove}
          disabled={pending}
        >
          <Sparkles className="size-4" />
          Hammasini avto-tasdiqlash
        </Button>
        <Button
          variant="emerald"
          onClick={handleApproveDocument}
          disabled={pending}
        >
          <Check className="size-4" />
          Saqlash va Ombor kirim
        </Button>
      </div>
    </div>
  );
}
