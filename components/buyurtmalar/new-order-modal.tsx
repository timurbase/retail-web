"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Plus, Send, Trash2 } from "lucide-react";

import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import type { Product, Supplier } from "@/lib/types";
import { cn, formatSom } from "@/lib/utils";

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  products: Product[];
}

interface LineState {
  id: string;
  productId: string;
  qty: string;
  price: string;
}

function blankLine(products: Product[]): LineState {
  const p = products[0];
  return {
    id: Math.random().toString(36).slice(2, 10),
    productId: p?.id ?? "",
    qty: "",
    price: p ? String(p.avgPrice) : "",
  };
}

function plusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function generateOrderNumber(): string {
  const tail = Math.floor(1000 + Math.random() * 9000);
  return `BR-2026-${tail}`;
}

export function NewOrderModal({
  open,
  onClose,
  suppliers,
  products,
}: NewOrderModalProps) {
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [supplierId, setSupplierId] = useState<string>("");
  const [eta, setEta] = useState<string>(plusDays(2));
  const [note, setNote] = useState<string>("");
  const [lines, setLines] = useState<LineState[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSupplierId(suppliers[0]?.id ?? "");
      setEta(plusDays(2));
      setNote("");
      setLines([blankLine(products)]);
      setFormError(null);
    }
  }, [open, suppliers, products]);

  const productMap = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const total = useMemo(() => {
    return lines.reduce((sum, l) => {
      const q = Number(l.qty);
      const p = Number(l.price);
      if (Number.isFinite(q) && Number.isFinite(p)) return sum + q * p;
      return sum;
    }, 0);
  }, [lines]);

  const setLine = (id: string, patch: Partial<LineState>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const onProductChange = (id: string, productId: string) => {
    const p = productMap.get(productId);
    setLine(id, {
      productId,
      price: p ? String(p.avgPrice) : "",
    });
  };

  const addLine = () => setLines((prev) => [...prev, blankLine(products)]);

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((l) => l.id !== id)));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!supplierId) {
      setFormError("Yetkazib beruvchini tanlang");
      return;
    }
    if (!eta) {
      setFormError("Yetkazib berish sanasini kiriting");
      return;
    }

    const cleanLines = lines
      .map((l) => ({
        productId: l.productId,
        qty: Number(l.qty),
        price: Number(l.price),
      }))
      .filter((l) => l.productId);

    if (cleanLines.length === 0) {
      setFormError("Kamida bitta mahsulot qatorini to'ldiring");
      return;
    }
    for (const l of cleanLines) {
      const p = productMap.get(l.productId);
      if (!Number.isFinite(l.qty) || l.qty <= 0) {
        setFormError(`"${p?.name ?? "?"}" — miqdor noto'g'ri`);
        return;
      }
      if (!Number.isFinite(l.price) || l.price <= 0) {
        setFormError(`"${p?.name ?? "?"}" — narx noto'g'ri`);
        return;
      }
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    const orderNumber = generateOrderNumber();

    startTransition(async () => {
      // No backend entity for orders yet — simulate the network call
      // so loading state is visible and audit trail can be added later.
      await new Promise((r) => setTimeout(r, 500));
      try {
        success(
          `Buyurtma #${orderNumber} yuborildi`,
          `${supplier?.name ?? ""} · ${cleanLines.length} ta mahsulot · ${formatSom(total)}`
        );
        onClose();
      } catch {
        error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title="Yangi buyurtma"
      description="Yetkazib beruvchiga buyurtma yuborish"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}

          <div className="grid grid-cols-[1.5fr_1fr] gap-3">
            <div>
              <Label htmlFor="order-supplier">Yetkazib beruvchi</Label>
              <select
                id="order-supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                disabled={pending}
                className={cn(
                  "h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900",
                  "focus:-outline-offset-1 focus:border-navy-700 focus:outline-2 focus:outline-navy-700"
                )}
              >
                {suppliers.length === 0 && (
                  <option value="">— ro&apos;yxat bo&apos;sh —</option>
                )}
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.verified ? "✓" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="order-eta">Yetkazib berish sanasi</Label>
              <Input
                id="order-eta"
                mono
                type="date"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                disabled={pending}
                min={plusDays(0)}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="mb-0">Mahsulotlar ({lines.length})</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addLine}
                disabled={pending || products.length === 0}
              >
                <Plus className="size-3.5" />
                Qator qo&apos;shish
              </Button>
            </div>

            <div className="overflow-hidden rounded-sm border border-border">
              <div className="grid grid-cols-[1.6fr_90px_110px_110px_36px] items-center gap-2 border-b border-border bg-ink-100/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                <span>Mahsulot</span>
                <span className="text-right">Miqdor</span>
                <span className="text-right">Narx</span>
                <span className="text-right">Jami</span>
                <span></span>
              </div>

              {lines.map((l) => {
                const product = productMap.get(l.productId);
                const lineTotal = Number(l.qty) * Number(l.price);
                return (
                  <div
                    key={l.id}
                    className="grid grid-cols-[1.6fr_90px_110px_110px_36px] items-center gap-2 border-b border-border px-3 py-2 last:border-0"
                  >
                    <select
                      value={l.productId}
                      onChange={(e) => onProductChange(l.id, e.target.value)}
                      disabled={pending}
                      className="h-8 w-full rounded-sm border border-border bg-surface-card px-2 text-[13px] text-ink-900"
                    >
                      {products.length === 0 && (
                        <option value="">— mahsulot yo&apos;q —</option>
                      )}
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={l.qty}
                      onChange={(e) => setLine(l.id, { qty: e.target.value })}
                      disabled={pending}
                      className="h-8 w-full rounded-sm border border-border bg-surface-card px-2 text-right font-mono text-[13px] tabular-nums text-ink-900 placeholder:text-ink-400 focus:-outline-offset-1 focus:outline-2 focus:outline-navy-700"
                    />
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={l.price}
                      onChange={(e) => setLine(l.id, { price: e.target.value })}
                      disabled={pending}
                      className="h-8 w-full rounded-sm border border-border bg-surface-card px-2 text-right font-mono text-[13px] tabular-nums text-ink-900 placeholder:text-ink-400 focus:-outline-offset-1 focus:outline-2 focus:outline-navy-700"
                    />
                    <span className="text-right font-mono text-[12px] tabular-nums text-ink-700 px-2">
                      {Number.isFinite(lineTotal) && lineTotal > 0
                        ? formatSom(lineTotal)
                        : product
                          ? `~${product.unit}`
                          : "—"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(l.id)}
                      disabled={pending || lines.length === 1}
                      className="grid size-8 place-items-center rounded-sm text-ink-400 hover:bg-red-50 hover:text-red-700 dark:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="O'chirish"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="order-note">Eslatma (ixtiyoriy)</Label>
            <textarea
              id="order-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={pending}
              rows={2}
              placeholder="Yetkazib beruvchiga maxsus ko'rsatmalar…"
              className="w-full rounded-sm border border-border-strong bg-surface-card px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1 focus:border-navy-700"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-ink-100/40 px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              Jami summa
            </span>
            <span className="font-mono text-[18px] font-bold tabular-nums text-ink-900">
              {formatSom(total)}
            </span>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="emerald" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Yuborilmoqda…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Buyurtma yuborish
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
