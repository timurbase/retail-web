"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Minus, Plus, ClipboardList } from "lucide-react";

import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { adjustStockAction } from "@/lib/actions/products";
import type { Product } from "@/lib/types";
import { formatNumber, cn } from "@/lib/utils";

type Kind = "kirim" | "chiqim" | "inventarizatsiya";

interface StockAdjustModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

const KIND_CONFIG: Record<
  Kind,
  { label: string; icon: typeof Plus; color: string; hint: string }
> = {
  kirim: {
    label: "Kirim",
    icon: Plus,
    color: "emerald",
    hint: "Mahsulot ombarga keldi",
  },
  chiqim: {
    label: "Chiqim",
    icon: Minus,
    color: "red",
    hint: "Buzilgan, qaytarilgan yoki yo'qotilgan",
  },
  inventarizatsiya: {
    label: "Inventarizatsiya",
    icon: ClipboardList,
    color: "navy",
    hint: "Aniq raqamga sozlash (yangi qoldiq)",
  },
};

export function StockAdjustModal({ open, onClose, product }: StockAdjustModalProps) {
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [kind, setKind] = useState<Kind>("kirim");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setKind("kirim");
      setQty("");
      setReason("");
      setFormError(null);
    }
  }, [open, product]);

  if (!product) return null;

  const cfg = KIND_CONFIG[kind];
  const KindIcon = cfg.icon;
  const qtyNum = Number(qty);
  const qtyValid = Number.isFinite(qtyNum) && qtyNum >= 0 && qty.trim() !== "";

  let preview = product.currentStock;
  if (qtyValid) {
    if (kind === "kirim") preview = product.currentStock + qtyNum;
    else if (kind === "chiqim") preview = Math.max(0, product.currentStock - qtyNum);
    else preview = qtyNum;
  }
  const delta = preview - product.currentStock;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!qtyValid) {
      setFormError("Miqdor noto'g'ri — manfiy bo'lmagan son kiriting");
      return;
    }
    if (kind === "chiqim" && qtyNum > product.currentStock) {
      setFormError(
        `Chiqim qoldiqdan ko'p (qoldiq: ${formatNumber(product.currentStock)} ${product.unit})`
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await adjustStockAction(product.id, kind, qtyNum, reason.trim() || undefined);
        if (res.ok) {
          success(
            `${cfg.label} qayd etildi`,
            `${product.name}: ${formatNumber(product.currentStock)} → ${formatNumber(preview)} ${product.unit}`
          );
          onClose();
        } else {
          error("Xatolik yuz berdi", "Qoldiqni o'zgartirib bo'lmadi");
        }
      } catch {
        error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title="Qoldiqni o'zgartirish"
      description={`${product.name} · joriy: ${formatNumber(product.currentStock)} ${product.unit}`}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}

          {/* Kind selector */}
          <div>
            <Label>Amal turi</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(KIND_CONFIG) as Kind[]).map((k) => {
                const c = KIND_CONFIG[k];
                const Icon = c.icon;
                const active = kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    disabled={pending}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-sm border px-3 py-2.5 text-[12px] font-medium transition-colors",
                      active && k === "kirim" && "border-emerald-600 bg-emerald-50 text-emerald-700 dark:text-emerald-300",
                      active && k === "chiqim" && "border-red-600 bg-red-50 text-red-700 dark:text-red-300",
                      active && k === "inventarizatsiya" && "border-navy-700 bg-navy-50 text-navy-700 dark:text-navy-300",
                      !active && "border-border-strong bg-surface-card text-ink-700 hover:bg-ink-100"
                    )}
                  >
                    <Icon className="size-4" />
                    {c.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-ink-500">{cfg.hint}</p>
          </div>

          {/* Qty */}
          <div>
            <Label htmlFor="stock-qty">
              {kind === "inventarizatsiya" ? "Yangi qoldiq" : "Miqdor"} ({product.unit})
            </Label>
            <Input
              id="stock-qty"
              mono
              type="number"
              min={0}
              step="any"
              placeholder="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              disabled={pending}
              autoFocus
            />
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="stock-reason">Izoh (ixtiyoriy)</Label>
            <Input
              id="stock-reason"
              placeholder={
                kind === "kirim"
                  ? "Masalan: Alpha Distribution №555"
                  : kind === "chiqim"
                  ? "Masalan: muddat o'tgan"
                  : "Masalan: oxirgi hisobotda hisobga olindi"
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={pending}
              maxLength={120}
            />
          </div>

          {/* Preview */}
          <div className="rounded-md border border-border bg-ink-100/40 px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              Natija
            </div>
            <div className="mt-1.5 flex items-baseline gap-2 font-mono">
              <span className="text-[15px] text-ink-500 tabular-nums">
                {formatNumber(product.currentStock)}
              </span>
              <span className="text-ink-400">→</span>
              <span
                className={cn(
                  "text-[20px] font-bold tabular-nums",
                  delta > 0 && "text-emerald-700 dark:text-emerald-300",
                  delta < 0 && "text-red-700 dark:text-red-300",
                  delta === 0 && "text-ink-900"
                )}
              >
                {formatNumber(preview)}
              </span>
              <span className="text-[12px] text-ink-500">{product.unit}</span>
              {delta !== 0 && qtyValid && (
                <span
                  className={cn(
                    "ml-auto text-[12px] font-semibold tabular-nums",
                    delta > 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
                  )}
                >
                  {delta > 0 ? "+" : ""}
                  {formatNumber(delta)}
                </span>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant={kind === "chiqim" ? "danger" : kind === "inventarizatsiya" ? "primary" : "emerald"}
            disabled={pending || !qtyValid}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saqlanmoqda…
              </>
            ) : (
              <>
                <KindIcon className="size-4" />
                {cfg.label}ni qayd etish
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
