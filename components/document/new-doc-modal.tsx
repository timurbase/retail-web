"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { createManualDocumentAction } from "@/lib/actions/documents";
import type { Supplier } from "@/lib/types";
import { cn, formatSom } from "@/lib/utils";

interface NewDocModalProps {
  open: boolean;
  onClose: () => void;
  suppliers: Supplier[];
}

interface RowState {
  id: string;
  rawName: string;
  mxik: string;
  unit: string;
  quantity: string;
  price: string;
}

function blankRow(): RowState {
  return {
    id: Math.random().toString(36).slice(2, 10),
    rawName: "",
    mxik: "",
    unit: "dona",
    quantity: "",
    price: "",
  };
}

const UNIT_OPTIONS = ["dona", "kg", "l", "blok", "paket", "m", "m²"] as const;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function NewDocModal({ open, onClose, suppliers }: NewDocModalProps) {
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [supplierId, setSupplierId] = useState<string>("");
  const [number, setNumber] = useState("");
  const [date, setDate] = useState<string>(todayIso());
  const [rows, setRows] = useState<RowState[]>([blankRow()]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSupplierId(suppliers[0]?.id ?? "");
      setNumber("");
      setDate(todayIso());
      setRows([blankRow()]);
      setFormError(null);
    }
  }, [open, suppliers]);

  const total = useMemo(() => {
    return rows.reduce((sum, r) => {
      const q = Number(r.quantity);
      const p = Number(r.price);
      if (Number.isFinite(q) && Number.isFinite(p)) return sum + q * p;
      return sum;
    }, 0);
  }, [rows]);

  const setRow = (id: string, patch: Partial<RowState>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const addRow = () => setRows((prev) => [...prev, blankRow()]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!supplierId) {
      setFormError("Yetkazib beruvchini tanlang");
      return;
    }
    if (!number.trim()) {
      setFormError("Hujjat raqamini kiriting");
      return;
    }
    if (!date) {
      setFormError("Sanani kiriting");
      return;
    }

    const cleanRows = rows
      .map((r) => ({
        rawName: r.rawName.trim(),
        mxik: r.mxik.trim(),
        unit: r.unit,
        quantity: Number(r.quantity),
        price: Number(r.price),
      }))
      .filter((r) => r.rawName.length > 0);

    if (cleanRows.length === 0) {
      setFormError("Kamida bitta mahsulot qatorini to'ldiring");
      return;
    }
    for (const r of cleanRows) {
      if (!Number.isFinite(r.quantity) || r.quantity <= 0) {
        setFormError(`"${r.rawName}" — miqdor noto'g'ri`);
        return;
      }
      if (!Number.isFinite(r.price) || r.price < 0) {
        setFormError(`"${r.rawName}" — narx noto'g'ri`);
        return;
      }
      if (r.mxik && !/^\d{10}$/.test(r.mxik)) {
        setFormError(`"${r.rawName}" — MXIK 10 raqamdan iborat bo'lishi kerak`);
        return;
      }
    }

    const isoDate = new Date(`${date}T00:00:00Z`).toISOString();

    startTransition(async () => {
      try {
        const res = await createManualDocumentAction({
          supplierId,
          number: number.trim(),
          date: isoDate,
          rows: cleanRows.map((r) => ({
            rawName: r.rawName,
            mxik: r.mxik || null,
            unit: r.unit,
            quantity: r.quantity,
            price: r.price,
          })),
        });
        if (res.ok && res.document) {
          success("Hujjat yaratildi", `№${res.document.number} · ${cleanRows.length} mahsulot`);
          onClose();
        } else {
          error("Xatolik yuz berdi", "Hujjatni yaratib bo'lmadi");
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
      title="Yangi hujjat"
      description="Qo'lda yangi qabul hujjati yarating — Didox, foto yoki Excel'siz"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}

          {/* Top fields */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-3">
            <div>
              <Label htmlFor="doc-supplier">Yetkazib beruvchi</Label>
              <select
                id="doc-supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                disabled={pending}
                className={cn(
                  "h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900",
                  "focus:-outline-offset-1 focus:border-navy-700 focus:outline-2 focus:outline-navy-700"
                )}
              >
                {suppliers.length === 0 && <option value="">— ro'yxat bo'sh —</option>}
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.verified ? "✓" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="doc-number">Hujjat raqami</Label>
              <Input
                id="doc-number"
                mono
                placeholder="12345"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                disabled={pending}
                maxLength={20}
              />
            </div>

            <div>
              <Label htmlFor="doc-date">Sana</Label>
              <Input
                id="doc-date"
                mono
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={pending}
              />
            </div>
          </div>

          {/* Rows */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="mb-0">Mahsulotlar ({rows.length})</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addRow} disabled={pending}>
                <Plus className="size-3.5" />
                Qator qo&apos;shish
              </Button>
            </div>

            <div className="overflow-hidden rounded-sm border border-border">
              <div className="grid grid-cols-[1.4fr_120px_90px_90px_110px_36px] items-center gap-2 border-b border-border bg-ink-100/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                <span>Nomi</span>
                <span>MXIK</span>
                <span>Birlik</span>
                <span className="text-right">Miqdor</span>
                <span className="text-right">Narx</span>
                <span></span>
              </div>

              {rows.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[1.4fr_120px_90px_90px_110px_36px] items-center gap-2 border-b border-border px-3 py-2 last:border-0"
                >
                  <input
                    type="text"
                    placeholder="Masalan: Coca-Cola 0.5L"
                    value={r.rawName}
                    onChange={(e) => setRow(r.id, { rawName: e.target.value })}
                    disabled={pending}
                    className="h-8 w-full rounded-sm border border-border bg-surface-card px-2 text-[13px] text-ink-900 placeholder:text-ink-400 focus:-outline-offset-1 focus:outline-2 focus:outline-navy-700"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="10 raqam"
                    value={r.mxik}
                    onChange={(e) =>
                      setRow(r.id, {
                        mxik: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    disabled={pending}
                    maxLength={10}
                    className="h-8 w-full rounded-sm border border-border bg-surface-card px-2 font-mono text-[12px] text-ink-700 placeholder:text-ink-400 focus:-outline-offset-1 focus:outline-2 focus:outline-navy-700"
                  />
                  <select
                    value={r.unit}
                    onChange={(e) => setRow(r.id, { unit: e.target.value })}
                    disabled={pending}
                    className="h-8 w-full rounded-sm border border-border bg-surface-card px-2 font-mono text-[12px] text-ink-700"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="0"
                    value={r.quantity}
                    onChange={(e) => setRow(r.id, { quantity: e.target.value })}
                    disabled={pending}
                    className="h-8 w-full rounded-sm border border-border bg-surface-card px-2 text-right font-mono text-[13px] tabular-nums text-ink-900 placeholder:text-ink-400 focus:-outline-offset-1 focus:outline-2 focus:outline-navy-700"
                  />
                  <input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="0"
                    value={r.price}
                    onChange={(e) => setRow(r.id, { price: e.target.value })}
                    disabled={pending}
                    className="h-8 w-full rounded-sm border border-border bg-surface-card px-2 text-right font-mono text-[13px] tabular-nums text-ink-900 placeholder:text-ink-400 focus:-outline-offset-1 focus:outline-2 focus:outline-navy-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(r.id)}
                    disabled={pending || rows.length === 1}
                    className="grid size-8 place-items-center rounded-sm text-ink-400 hover:bg-red-50 hover:text-red-700 dark:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
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
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Yaratilmoqda…
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Hujjat yaratish
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
