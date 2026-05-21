"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileClock,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
} from "@/components/ui/dropdown";
import { Confirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { deleteSupplierAction } from "@/lib/actions/suppliers";
import type { Supplier } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

import { SupplierFormModal } from "./supplier-form-modal";

// Palette pairs (bg → text) for avatar circles
const avatarPalette: Array<{ bg: string; text: string }> = [
  { bg: "bg-navy-700", text: "text-white" },
  { bg: "bg-emerald-600", text: "text-white" },
  { bg: "bg-amber-600", text: "text-white" },
  { bg: "bg-navy-50", text: "text-navy-700 dark:text-navy-300" },
  { bg: "bg-emerald-50", text: "text-emerald-700 dark:text-emerald-300" },
  { bg: "bg-ink-700", text: "text-white" },
  { bg: "bg-red-600", text: "text-white" },
  { bg: "bg-ink-100", text: "text-ink-700" },
];

function initials(name: string): string {
  const cleaned = name
    .replace(/\b(OOO|MChJ|LLC|Inc|MCHJ|JSC|АО|ООО)\b/g, "")
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function paletteFor(id: string, fallbackIdx: number): { bg: string; text: string } {
  // Deterministic by id, but with fallback to index if id is empty
  if (!id) return avatarPalette[fallbackIdx % avatarPalette.length];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0x7fffffff;
  }
  return avatarPalette[hash % avatarPalette.length];
}

interface SuppliersViewProps {
  suppliers: Supplier[];
}

export function SuppliersView({ suppliers }: SuppliersViewProps) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const visibleSuppliers = useMemo(() => suppliers, [suppliers]);

  function handleDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      try {
        const res = await deleteSupplierAction(target.id);
        if (res.ok) {
          toast.success(
            "Yetkazib beruvchi o'chirildi",
            `${target.name} ro'yxatdan olib tashlandi`
          );
          setDeleting(null);
        } else {
          toast.error("O'chirib bo'lmadi", "Yetkazib beruvchi topilmadi");
        }
      } catch (err) {
        toast.error(
          "Xatolik",
          err instanceof Error ? err.message : "Kutilmagan xatolik"
        );
      }
    });
  }

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-[13px] text-ink-500">
          <span className="font-mono font-semibold text-ink-700">
            {formatNumber(visibleSuppliers.length)}
          </span>{" "}
          ta yetkazib beruvchi ko&apos;rsatilmoqda
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-sm border border-border bg-surface-card px-3 text-[13px] text-ink-700 hover:bg-ink-100"
          >
            <span className="text-ink-500">Saralash:</span>
            <span className="font-medium">So&apos;nggi faollik</span>
            <ChevronDown className="size-3.5 text-ink-400" />
          </button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Yangi yetkazib beruvchi
          </Button>
        </div>
      </div>

      {/* Card grid */}
      {visibleSuppliers.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface-card p-12 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-ink-100 text-ink-500">
            <Plus className="size-5" />
          </div>
          <h3 className="mt-3 text-[14px] font-semibold text-ink-900">
            Hozircha yetkazib beruvchilar yo&apos;q
          </h3>
          <p className="mt-1 text-[12px] text-ink-500">
            Birinchi yetkazib beruvchini qo&apos;shish uchun yuqoridagi tugmani bosing
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleSuppliers.map((s, i) => (
            <SupplierCard
              key={s.id}
              supplier={s}
              fallbackIdx={i}
              onEdit={() => setEditing(s)}
              onDelete={() => setDeleting(s)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <SupplierFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Edit modal */}
      <SupplierFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        supplier={editing}
      />

      {/* Delete confirm */}
      <Confirm
        open={!!deleting}
        onClose={() => (isPending ? undefined : setDeleting(null))}
        onConfirm={handleDelete}
        title="Yetkazib beruvchini o'chirish?"
        description={
          deleting
            ? `${String.fromCharCode(0x201c)}${deleting.name}${String.fromCharCode(0x201d)} o'chiriladi. STIR: ${deleting.stir}. Bu yetkazib beruvchidan kelgan hujjatlar tarixi saqlanadi.`
            : undefined
        }
        confirmLabel="Ha, o'chirish"
        variant="danger"
        loading={isPending}
      />
    </>
  );
}

interface SupplierCardProps {
  supplier: Supplier;
  fallbackIdx: number;
  onEdit: () => void;
  onDelete: () => void;
}

function SupplierCard({
  supplier,
  fallbackIdx,
  onEdit,
  onDelete,
}: SupplierCardProps) {
  const { bg, text } = paletteFor(supplier.id, fallbackIdx);

  return (
    <div className="group relative rounded-md border border-border bg-surface-card p-5 transition-colors hover:border-border-strong hover:bg-ink-100/30">
      {/* Action menu — absolute top right */}
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Dropdown align="right">
          <DropdownItem
            icon={<Pencil className="size-3.5" />}
            onClick={onEdit}
          >
            Tahrirlash
          </DropdownItem>
          <DropdownItem
            icon={<FileClock className="size-3.5" />}
            onClick={() => {
              /* visual link — no-op */
            }}
          >
            Hujjatlar tarixi
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem
            icon={<Trash2 className="size-3.5" />}
            variant="danger"
            onClick={onDelete}
          >
            O&apos;chirish
          </DropdownItem>
        </Dropdown>
      </div>

      {/* Top: avatar + name + STIR + verified */}
      <div className="flex items-start gap-3 pr-8">
        <div
          className={`grid size-12 shrink-0 place-items-center rounded-full font-mono text-[14px] font-bold ${bg} ${text}`}
        >
          {initials(supplier.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-ink-900 truncate">
            {supplier.name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] text-ink-500">
              STIR:{" "}
              <span className="text-ink-700 font-semibold">
                {supplier.stir}
              </span>
            </span>
            {supplier.verified ? (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-600 bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                <Check className="size-2.5" strokeWidth={3} />
                tasdiq
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-600 bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-600 dark:text-amber-300">
                <ShieldAlert className="size-2.5" strokeWidth={3} />
                tekshir
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: status hint + chevron */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="text-[11px] text-ink-500">
          {supplier.verified ? (
            <span className="text-emerald-700 dark:text-emerald-300">Soliq.uz da faol</span>
          ) : (
            <span className="text-amber-600 dark:text-amber-300">Qo&apos;lda kiritilgan</span>
          )}
        </div>
        <ChevronRight className="size-4 text-ink-400" />
      </div>
    </div>
  );
}
