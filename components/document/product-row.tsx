"use client";

import { useState, useTransition } from "react";
import { cn, formatSom, formatNumber } from "@/lib/utils";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  ArrowRight,
  Plus,
  Search,
  Check,
  X,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import type { ProductRow as ProductRowType } from "@/lib/types";
import {
  approveRowAction,
  rejectRowAction,
  selectVariantAction,
  updateRowMxikAction,
} from "@/lib/actions/documents";

interface ProductRowProps {
  row: ProductRowType;
  index: number;
  docId: string;
}

export function ProductRow({ row, index, docId }: ProductRowProps) {
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [mxikDraft, setMxikDraft] = useState(row.mxik?.code ?? "");

  const borderColor =
    row.status === "approved"
      ? "border-l-emerald-600"
      : row.status === "rejected"
      ? "border-l-ink-400"
      : row.confidence >= 0.9
      ? "border-l-emerald-600"
      : row.confidence >= 0.6
      ? "border-l-amber-600"
      : "border-l-red-600";

  const arrowText =
    row.status === "matched"
      ? row.mappedName
      : row.status === "approved"
      ? row.mappedName ?? row.mxik?.name ?? "Tasdiqlangan"
      : row.status === "rejected"
      ? "Rad etilgan"
      : row.status === "new"
      ? "Yangi mahsulot"
      : "Aniq emas";

  const arrowColor =
    row.status === "matched" || row.status === "approved"
      ? "text-emerald-700"
      : row.status === "rejected"
      ? "text-ink-500 line-through"
      : row.status === "new"
      ? "text-amber-600"
      : "text-red-700";

  function handleApprove() {
    startTransition(async () => {
      const res = await approveRowAction(docId, row.id);
      if (res.ok) success("Qator tasdiqlandi", row.rawName);
      else error("Xatolik", "Qatorni tasdiqlab bo'lmadi");
    });
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectRowAction(docId, row.id);
      if (res.ok) success("Qator rad etildi", row.rawName);
      else error("Xatolik", "Qatorni rad eta olmadik");
    });
  }

  function handleSelectVariant(code: string) {
    startTransition(async () => {
      const res = await selectVariantAction(docId, row.id, code);
      if (res.ok) success("Variant tanlandi", `MXIK ${code} tasdiqlandi`);
      else error("Xatolik", "Variantni qo'llab bo'lmadi");
    });
  }

  function openEdit() {
    setMxikDraft(row.mxik?.code ?? "");
    setEditOpen(true);
  }

  function handleSaveMxik() {
    const trimmed = mxikDraft.trim();
    if (!/^\d{10}$/.test(trimmed)) {
      error("Noto'g'ri MXIK", "MXIK kodi aniq 10 ta raqamdan iborat bo'lishi kerak");
      return;
    }
    startTransition(async () => {
      const res = await updateRowMxikAction(docId, row.id, {
        code: trimmed,
        name: row.mxik?.name ?? row.rawName,
        confidence: row.mxik?.confidence ?? row.confidence,
      });
      if (res.ok) {
        success("MXIK yangilandi", `Yangi kod: ${trimmed}`);
        setEditOpen(false);
      } else {
        error("Xatolik", "MXIK saqlanmadi");
      }
    });
  }

  const isApproved = row.status === "approved";
  const isRejected = row.status === "rejected";
  const isFinal = isApproved || isRejected;

  return (
    <div
      className={cn(
        "rounded-md border border-l-4 border-border bg-surface-card p-3.5 mb-2 transition-opacity",
        borderColor,
        pending && "opacity-60",
        isRejected && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-ink-900 leading-tight">
            <span className="text-ink-400 mr-2 font-mono text-[11px]">
              {String(index).padStart(2, "0")}
            </span>
            {row.rawName}
            <ArrowRight className="inline mx-1.5 size-3 text-ink-400 align-middle" />
            <span className={arrowColor}>{arrowText}</span>
          </div>
          {row.status === "matched" && (
            <div className="mt-1 text-[12px] text-ink-600">
              Ichki katalogda topildi
            </div>
          )}
          {row.status === "new" && (
            <div className="mt-1 text-[12px] text-ink-600">
              Katalogda yo'q · AI taklif: {row.mxik?.name}
            </div>
          )}
          {row.status === "ambiguous" && (
            <div className="mt-1 text-[12px] text-ink-600">
              {row.alternatives?.length} ta variantdan birini tanlang:
            </div>
          )}
        </div>
        <ConfidenceBadge score={row.confidence} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-ink-500">
        {row.mxik && (
          <span className="inline-flex items-center gap-1">
            MXIK:{" "}
            <span className="font-semibold text-ink-900">{row.mxik.code}</span>
            {row.status === "new" && <span> ?</span>}
            <button
              type="button"
              onClick={openEdit}
              disabled={pending || isRejected}
              className="ml-0.5 grid size-5 place-items-center rounded-sm text-ink-400 hover:bg-ink-100 hover:text-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="MXIK kodini tahrirlash"
              title="MXIK kodini tahrirlash"
            >
              <Pencil className="size-3" />
            </button>
          </span>
        )}
        {!row.mxik && (
          <button
            type="button"
            onClick={openEdit}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-sm border border-dashed border-border-strong px-2 py-0.5 text-ink-500 hover:bg-ink-100 hover:text-navy-700"
          >
            <Pencil className="size-3" />
            MXIK qo'shish
          </button>
        )}
        <span>
          {formatNumber(row.quantity)} {row.unit} ×{" "}
          <span className="font-semibold text-ink-900">
            {formatNumber(row.price)}
          </span>{" "}
          ={" "}
          <span className="font-semibold text-ink-900">
            {formatSom(row.total)}
          </span>
        </span>
      </div>

      {row.status === "ambiguous" && row.alternatives && (
        <div className="mt-3 flex flex-col gap-1.5">
          {row.alternatives.map((alt) => {
            const checked = row.mxik?.code === alt.code;
            return (
              <label
                key={alt.code}
                className={cn(
                  "flex items-center gap-2.5 rounded-sm border bg-surface px-3 py-2 text-[12px] cursor-pointer transition-colors hover:bg-navy-50 hover:border-navy-700",
                  checked && "border-navy-700 bg-navy-50/50",
                  pending && "pointer-events-none"
                )}
              >
                <input
                  type="radio"
                  name={`alt-${row.id}`}
                  checked={checked}
                  onChange={() => handleSelectVariant(alt.code)}
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
      )}

      {/* Action bar */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {row.status === "new" && (
          <>
            <Button variant="emerald" size="sm" onClick={handleApprove} disabled={pending}>
              <Plus className="size-3.5" />
              Qo'shish
            </Button>
            <Button variant="secondary" size="sm" onClick={openEdit} disabled={pending}>
              <Search className="size-3.5" />
              MXIK qidirish
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReject}
              disabled={pending}
              className="ml-auto text-red-700 hover:bg-red-50"
            >
              <X className="size-3.5" />
              Rad qilish
            </Button>
          </>
        )}

        {row.status === "matched" && (
          <>
            <Button variant="emerald" size="sm" onClick={handleApprove} disabled={pending}>
              <Check className="size-3.5" />
              Tasdiqlash
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReject}
              disabled={pending}
              className="ml-auto text-red-700 hover:bg-red-50"
            >
              <X className="size-3.5" />
              Rad qilish
            </Button>
          </>
        )}

        {row.status === "ambiguous" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReject}
            disabled={pending}
            className="ml-auto text-red-700 hover:bg-red-50"
          >
            <X className="size-3.5" />
            Rad qilish
          </Button>
        )}

        {isApproved && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="size-3" />
            Tasdiqlangan
          </span>
        )}

        {isRejected && (
          <>
            <span className="inline-flex items-center gap-1 rounded-full border border-ink-300 bg-ink-100 px-2.5 py-0.5 text-[11px] font-semibold text-ink-600">
              <X className="size-3" />
              Rad etilgan
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleApprove}
              disabled={pending}
              className="ml-auto text-emerald-700 hover:bg-emerald-50"
            >
              <Check className="size-3.5" />
              Qaytarish
            </Button>
          </>
        )}

        {isFinal && !isRejected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReject}
            disabled={pending}
            className="ml-auto text-red-700 hover:bg-red-50"
          >
            <X className="size-3.5" />
            Rad qilish
          </Button>
        )}
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="MXIK kodini tahrirlash"
        description={row.rawName}
        size="sm"
      >
        <ModalBody>
          <Label htmlFor={`mxik-input-${row.id}`}>MXIK kodi (10 raqam)</Label>
          <Input
            id={`mxik-input-${row.id}`}
            mono
            value={mxikDraft}
            onChange={(e) =>
              setMxikDraft(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveMxik();
              } else if (e.key === "Escape") {
                setEditOpen(false);
              }
            }}
            placeholder="1234567890"
            inputMode="numeric"
            autoFocus
            maxLength={10}
          />
          <p className="mt-2 text-[12px] text-ink-500">
            Joriy nom: {row.mxik?.name ?? "—"}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={pending}>
            Bekor qilish
          </Button>
          <Button variant="primary" onClick={handleSaveMxik} disabled={pending}>
            {pending ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
