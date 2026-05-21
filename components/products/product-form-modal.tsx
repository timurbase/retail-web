"use client";

import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  createProductAction,
  updateProductAction,
} from "@/lib/actions/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

interface FormState {
  name: string;
  mxik: string;
  unit: string;
  currentStock: string;
  minStock: string;
  avgPrice: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const UNIT_OPTIONS = ["dona", "kg", "l", "blok", "paket", "m", "m²"] as const;

const EMPTY_FORM: FormState = {
  name: "",
  mxik: "",
  unit: "dona",
  currentStock: "0",
  minStock: "0",
  avgPrice: "0",
};

function toForm(product: Product | null | undefined): FormState {
  if (!product) return { ...EMPTY_FORM };
  return {
    name: product.name,
    mxik: product.mxik ?? "",
    unit: product.unit || "dona",
    currentStock: String(product.currentStock ?? 0),
    minStock: String(product.minStock ?? 0),
    avgPrice: String(product.avgPrice ?? 0),
  };
}

function validate(state: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!state.name.trim() || state.name.trim().length < 2) {
    errors.name = "Nomi kamida 2 ta belgidan iborat bo'lishi kerak";
  }

  if (!/^\d{10}$/.test(state.mxik.trim())) {
    errors.mxik = "MXIK kodi aniq 10 ta raqamdan iborat bo'lishi kerak";
  }

  if (!state.unit) {
    errors.unit = "Birlikni tanlang";
  }

  const currentStock = Number(state.currentStock);
  if (!Number.isFinite(currentStock) || currentStock < 0) {
    errors.currentStock = "Manfiy bo'lmagan son kiriting";
  }

  const minStock = Number(state.minStock);
  if (!Number.isFinite(minStock) || minStock < 0) {
    errors.minStock = "Manfiy bo'lmagan son kiriting";
  }

  const avgPrice = Number(state.avgPrice);
  if (!Number.isFinite(avgPrice) || avgPrice < 0) {
    errors.avgPrice = "Manfiy bo'lmagan son kiriting";
  }

  return errors;
}

export function ProductFormModal({
  open,
  onClose,
  product,
}: ProductFormModalProps) {
  const isEdit = !!product;
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(() => toForm(product));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setForm(toForm(product));
      setErrors({});
    }
  }, [open, product]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = validate(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    const payload = {
      name: form.name.trim(),
      mxik: form.mxik.trim(),
      unit: form.unit,
      currentStock: Number(form.currentStock),
      minStock: Number(form.minStock),
      avgPrice: Number(form.avgPrice),
    };

    startTransition(async () => {
      try {
        const res = isEdit
          ? await updateProductAction(product!.id, payload)
          : await createProductAction(payload);

        if (res.ok) {
          success(
            isEdit ? "Mahsulot saqlandi" : "Mahsulot yaratildi",
            payload.name
          );
          onClose();
        } else {
          error("Xatolik yuz berdi", "Mahsulotni saqlab bo'lmadi");
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
      title={isEdit ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
      description={
        isEdit
          ? "Katalogdagi mahsulot ma'lumotlarini yangilang"
          : "Katalogga yangi mahsulot qo'shing"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="product-name">Nomi</Label>
            <Input
              id="product-name"
              placeholder="Masalan: Coca-Cola 0.5L plastik"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              disabled={pending}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* MXIK + Unit row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="product-mxik">MXIK kodi</Label>
              <div className="relative">
                <Input
                  id="product-mxik"
                  mono
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  placeholder="0201301000"
                  value={form.mxik}
                  onChange={(e) =>
                    setField("mxik", e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  disabled={pending}
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => {
                    /* MXIK lookup placeholder */
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 grid size-7 place-items-center rounded-sm text-ink-500 hover:bg-ink-100 hover:text-navy-700 dark:text-navy-300"
                  aria-label="MXIK qidirish"
                  tabIndex={-1}
                >
                  <Search className="size-3.5" />
                </button>
              </div>
              {errors.mxik && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{errors.mxik}</p>
              )}
            </div>

            <div>
              <Label htmlFor="product-unit">Birlik</Label>
              <select
                id="product-unit"
                value={form.unit}
                onChange={(e) => setField("unit", e.target.value)}
                disabled={pending}
                className={cn(
                  "h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900",
                  "focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1 focus:border-navy-700"
                )}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{errors.unit}</p>
              )}
            </div>
          </div>

          {/* Stock row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="product-stock">Hozirgi qoldiq</Label>
              <Input
                id="product-stock"
                mono
                type="number"
                min={0}
                step="any"
                value={form.currentStock}
                onChange={(e) => setField("currentStock", e.target.value)}
                disabled={pending}
              />
              {errors.currentStock && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {errors.currentStock}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="product-min">Minimal limit</Label>
              <Input
                id="product-min"
                mono
                type="number"
                min={0}
                step="any"
                value={form.minStock}
                onChange={(e) => setField("minStock", e.target.value)}
                disabled={pending}
              />
              {errors.minStock && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{errors.minStock}</p>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="product-price">O&apos;rtacha narx (so&apos;m)</Label>
            <Input
              id="product-price"
              mono
              type="number"
              min={0}
              step="any"
              value={form.avgPrice}
              onChange={(e) => setField("avgPrice", e.target.value)}
              disabled={pending}
            />
            {errors.avgPrice && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{errors.avgPrice}</p>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={pending}
          >
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending
              ? "Saqlanmoqda..."
              : isEdit
              ? "Saqlash"
              : "Yaratish"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
