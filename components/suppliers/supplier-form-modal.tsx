"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { Check, Loader2, Search, ShieldCheck, Sparkles } from "lucide-react";

import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import {
  createSupplierAction,
  updateSupplierAction,
} from "@/lib/actions/suppliers";
import type { Supplier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SupplierFormModalProps {
  open: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

// Mock korxona name pool — picked by hash of STIR for determinism
const MOCK_NAME_POOL_3X = [
  "Alpha Distribution OOO",
  "Beta Trade MChJ",
  "Lazzat MChJ",
  "Mineralka OOO",
];

function mockKorxonaName(stir: string): string {
  if (stir.startsWith("3")) {
    const idx = Number(stir.slice(-1)) % MOCK_NAME_POOL_3X.length;
    return MOCK_NAME_POOL_3X[idx];
  }
  return `Korxona STIR-${stir}`;
}

export function SupplierFormModal({
  open,
  onClose,
  supplier,
}: SupplierFormModalProps) {
  const isEdit = !!supplier;
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [stir, setStir] = useState("");
  const [name, setName] = useState("");
  const [verified, setVerified] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form whenever modal opens
  useEffect(() => {
    if (!open) return;
    if (supplier) {
      setStir(supplier.stir);
      setName(supplier.name);
      setVerified(supplier.verified);
      setFetched(true); // Edit mode: treat as already fetched
    } else {
      setStir("");
      setName("");
      setVerified(false);
      setFetched(false);
    }
    setFetching(false);
    setError(null);
  }, [open, supplier]);

  const stirValid = stir.length === 9 || stir.length === 14;
  const canFetch = !isEdit && stirValid && !fetching;

  function handleFetch() {
    if (!canFetch) return;
    setError(null);
    setFetching(true);
    setTimeout(() => {
      const fetchedName = mockKorxonaName(stir);
      setName(fetchedName);
      setVerified(true);
      setFetched(true);
      setFetching(false);
    }, 1000);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Korxona nomi kamida 2 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (stir.length !== 9 && stir.length !== 14) {
      setError("STIR aniq 9 yoki 14 ta raqamdan iborat bo'lishi kerak.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEdit && supplier) {
          const res = await updateSupplierAction(supplier.id, {
            name: name.trim(),
            verified,
            // STIR is read-only in edit mode, but include defensively
            stir: supplier.stir,
          });
          if (res.ok) {
            toast.success("Saqlandi", `${name.trim()} ma'lumotlari yangilandi`);
            onClose();
          } else {
            setError("Saqlashda xatolik yuz berdi.");
          }
        } else {
          const res = await createSupplierAction({
            name: name.trim(),
            stir,
            verified,
          });
          if (res.ok) {
            toast.success(
              "Yetkazib beruvchi yaratildi",
              `${name.trim()} ro'yxatga qo'shildi`
            );
            onClose();
          } else {
            setError("Yaratishda xatolik yuz berdi.");
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Kutilmagan xatolik yuz berdi."
        );
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Yetkazib beruvchini tahrirlash" : "Yangi yetkazib beruvchi"}
      description={
        isEdit
          ? "Korxona ma'lumotlarini yangilang. STIR o'zgartirilmaydi."
          : "STIR'ni kiriting va Soliq.uz bo'yicha tekshiring."
      }
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          {/* STIR */}
          <div>
            <Label htmlFor="supplier-stir">STIR</Label>
            <div className="flex gap-2">
              <Input
                id="supplier-stir"
                mono
                inputMode="numeric"
                placeholder="9 yoki 14 ta raqam"
                value={stir}
                onChange={(e) => {
                  if (isEdit) return;
                  const v = digitsOnly(e.target.value).slice(0, 14);
                  setStir(v);
                  if (fetched) {
                    setFetched(false);
                    setName("");
                    setVerified(false);
                  }
                }}
                maxLength={14}
                readOnly={isEdit}
                disabled={isEdit}
                className={cn(
                  "flex-1 tracking-wider",
                  isEdit && "bg-ink-100 cursor-not-allowed"
                )}
                autoFocus={!isEdit}
              />
              {!isEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleFetch}
                  disabled={!canFetch}
                  className="shrink-0"
                >
                  {fetching ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Tekshirilmoqda…
                    </>
                  ) : (
                    <>
                      <Search className="size-4" />
                      Soliq.uz dan tekshirish
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[12px]">
              <span className="text-ink-500">
                {isEdit ? (
                  <span className="inline-flex items-center gap-1 font-mono text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="size-3.5" />
                    Tekshirilgan
                  </span>
                ) : (
                  "MChJ uchun 9 ta, YaT uchun 14 ta raqam"
                )}
              </span>
              <span className="font-mono text-ink-500">
                {stir.length}/{stir.length > 9 ? 14 : 9}
              </span>
            </div>
          </div>

          {/* Soliq.uz success card */}
          {!isEdit && fetched && (
            <Alert variant="success">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 shrink-0" />
                <span className="font-semibold">
                  Soliq.uz da topildi · Faol holatda
                </span>
              </div>
            </Alert>
          )}

          {/* Korxona nomi */}
          <div>
            <Label htmlFor="supplier-name">Korxona nomi</Label>
            <Input
              id="supplier-name"
              placeholder="Masalan: Alpha Distribution OOO"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={isEdit}
            />
            <div className="mt-1.5 text-[12px] text-ink-500">
              Rasmiy nom (Soliq.uz dan olingan bo&apos;lishi mumkin, lekin tahrirlanadi)
            </div>
          </div>

          {/* Verified toggle */}
          <div>
            <Label>STIR tasdiqlangan holati</Label>
            <button
              type="button"
              onClick={() => setVerified((v) => !v)}
              className={cn(
                "flex w-full items-center justify-between rounded-sm border px-3 py-2.5 text-left transition-colors",
                verified
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-border-strong bg-surface-card hover:bg-ink-100"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-sm border",
                    verified
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-border-strong bg-surface-card"
                  )}
                >
                  {verified && <Check className="size-3.5" strokeWidth={3} />}
                </div>
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    verified ? "text-emerald-700 dark:text-emerald-300" : "text-ink-700"
                  )}
                >
                  {verified
                    ? "Tasdiqlangan — Soliq.uz katalogida faol"
                    : "Tasdiqlanmagan — qo'lda kiritilgan"}
                </span>
              </div>
            </button>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isEdit ? "Saqlanmoqda…" : "Yaratilmoqda…"}
              </>
            ) : isEdit ? (
              "Saqlash"
            ) : (
              "Yaratish"
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
