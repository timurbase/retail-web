"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Pencil,
  Plus,
  Search,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownDivider, DropdownItem } from "@/components/ui/dropdown";
import { Confirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { deleteProductAction } from "@/lib/actions/products";
import type { Product } from "@/lib/types";
import { cn, formatDate, formatNumber, formatSom } from "@/lib/utils";
import { ProductFormModal } from "./product-form-modal";

interface ProductsViewProps {
  products: Product[];
}

const CATEGORIES = [
  "Hammasi",
  "Ichimliklar",
  "Oziq-ovqat",
  "Meva-sabzavot",
  "Maishiy",
  "Tamaki",
];

function productStatus(p: Product): "active" | "review" | "missing" {
  if (!p.mxik) return "missing";
  if (p.currentStock < p.minStock) return "review";
  return "active";
}

const statusStyles: Record<"active" | "review" | "missing", string> = {
  active: "bg-emerald-50 border-emerald-600 text-emerald-700",
  review: "bg-amber-50 border-amber-600 text-amber-600",
  missing: "bg-red-50 border-red-600 text-red-700",
};

const statusLabel: Record<"active" | "review" | "missing", string> = {
  active: "✓ Aktiv",
  review: "⚠ Tekshir",
  missing: "✕ MXIK yo'q",
};

export function ProductsView({ products }: ProductsViewProps) {
  const { success, error, info } = useToast();
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.mxik ?? "").toLowerCase().includes(q)
    );
  }, [products, query]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      try {
        const res = await deleteProductAction(target.id);
        if (res.ok) {
          success("Mahsulot o'chirildi", target.name);
          setDeleting(null);
        } else {
          error("O'chirib bo'lmadi", "Mahsulot topilmadi");
        }
      } catch {
        error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
      }
    });
  };

  return (
    <>
      {/* Filter bar */}
      <Card className="mb-4 p-3">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mahsulot nomi yoki MXIK kodi..."
              className="h-9 w-full rounded-sm border border-border bg-surface pl-9 pr-3 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-2 focus:-outline-offset-1 focus:outline-navy-700"
            />
          </div>

          {/* Sort dropdown (visual) */}
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-sm border border-border bg-surface-card px-3 text-[13px] text-ink-700 hover:bg-ink-100"
          >
            <span className="text-ink-500">Saralash:</span>
            <span className="font-medium">Eng so&apos;nggi</span>
            <ChevronDown className="size-3.5 text-ink-400" />
          </button>

          {/* View toggle (visual) */}
          <div className="ml-2 flex h-9 items-center overflow-hidden rounded-sm border border-border">
            <button
              type="button"
              className="grid h-full place-items-center bg-navy-700 px-2.5 text-white"
              aria-label="Jadval ko'rinishi"
            >
              <TableIcon className="size-4" />
            </button>
            <button
              type="button"
              className="grid h-full place-items-center px-2.5 text-ink-500 hover:bg-ink-100"
              aria-label="Grid ko'rinishi"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>

          {/* New product */}
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Yangi mahsulot
          </Button>
        </div>

        {/* Category pills (visual) */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat, i) => (
            <button
              type="button"
              key={cat}
              className={
                i === 0
                  ? "rounded-full bg-navy-700 px-3 py-1 text-[12px] font-medium text-white"
                  : "rounded-full border border-border bg-surface-card px-3 py-1 text-[12px] font-medium text-ink-600 hover:bg-ink-100"
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-ink-100/40 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                <th className="px-5 py-2.5 text-left">Mahsulot</th>
                <th className="px-3 py-2.5 text-left">MXIK</th>
                <th className="px-3 py-2.5 text-left">Birlik</th>
                <th className="px-3 py-2.5 text-right">Qoldiq</th>
                <th className="px-3 py-2.5 text-right">O&apos;rt narx</th>
                <th className="px-3 py-2.5 text-left">Oxirgi kirim</th>
                <th className="px-3 py-2.5 text-left">Status</th>
                <th className="px-3 py-2.5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-[13px] text-ink-500"
                  >
                    Mahsulot topilmadi. Yangi mahsulot qo&apos;shing yoki qidiruvni o&apos;zgartiring.
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const status = productStatus(p);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-ink-100/50"
                  >
                    {/* Mahsulot */}
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-ink-100 text-[12px] font-semibold text-ink-600">
                          {p.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-ink-900">
                            {p.name}
                          </div>
                          <div className="mt-0.5 text-[11px] text-ink-500">
                            Min. limit:{" "}
                            <span className="font-mono font-semibold text-ink-600">
                              {formatNumber(p.minStock)}
                            </span>{" "}
                            {p.unit}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* MXIK */}
                    <td className="px-3 py-3">
                      {p.mxik ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="font-mono text-[12px] font-semibold text-ink-700">
                            {p.mxik}
                          </span>
                          <Check
                            className="size-3.5 text-emerald-600"
                            strokeWidth={3}
                          />
                        </span>
                      ) : (
                        <span className="font-mono text-[12px] text-red-600">
                          — yo&apos;q —
                        </span>
                      )}
                    </td>

                    {/* Birlik */}
                    <td className="px-3 py-3">
                      <span className="font-mono text-[12px] text-ink-600">
                        {p.unit}
                      </span>
                    </td>

                    {/* Qoldiq */}
                    <td className="px-3 py-3 text-right">
                      <span
                        className={cn(
                          "font-mono text-[13px] font-semibold",
                          p.currentStock < p.minStock
                            ? "text-red-700"
                            : "text-ink-900"
                        )}
                      >
                        {formatNumber(p.currentStock)}
                      </span>
                    </td>

                    {/* O'rt narx */}
                    <td className="px-3 py-3 text-right">
                      <span className="font-mono text-[12px] text-ink-700">
                        {formatSom(p.avgPrice)}
                      </span>
                    </td>

                    {/* Oxirgi kirim */}
                    <td className="px-3 py-3">
                      <span className="font-mono text-[11px] text-ink-500">
                        {p.lastReceivedAt ? formatDate(p.lastReceivedAt) : "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold",
                          statusStyles[status]
                        )}
                      >
                        {statusLabel[status]}
                      </span>
                    </td>

                    {/* Amal */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end">
                        <Dropdown>
                          <DropdownItem
                            icon={<Pencil className="size-3.5" />}
                            onClick={() => openEdit(p)}
                          >
                            Tahrirlash
                          </DropdownItem>
                          <DropdownItem
                            icon={<Search className="size-3.5" />}
                            onClick={() =>
                              info(
                                "MXIK ma'lumoti",
                                p.mxik
                                  ? `Kod: ${p.mxik}`
                                  : "Bu mahsulotda MXIK biriktirilmagan"
                              )
                            }
                          >
                            MXIK ko&apos;rish
                          </DropdownItem>
                          <DropdownDivider />
                          <DropdownItem
                            variant="danger"
                            icon={<Trash2 className="size-3.5" />}
                            onClick={() => setDeleting(p)}
                          >
                            O&apos;chirish
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination (visual) */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <span className="font-mono text-[12px] text-ink-500">
            <span className="font-semibold text-ink-700">
              1&ndash;{filtered.length}
            </span>{" "}
            / {products.length} mahsulot
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="grid size-7 place-items-center rounded-sm border border-border text-ink-400 hover:bg-ink-100 disabled:opacity-40"
              disabled
              aria-label="Oldingi"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              className="grid size-7 place-items-center rounded-sm bg-navy-700 font-mono text-[12px] font-semibold text-white"
            >
              1
            </button>
            <button
              type="button"
              className="grid size-7 place-items-center rounded-sm border border-border text-ink-600 hover:bg-ink-100"
              aria-label="Keyingi"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Create / Edit modal */}
      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editing}
      />

      {/* Delete confirm */}
      <Confirm
        open={!!deleting}
        onClose={() => (pending ? null : setDeleting(null))}
        onConfirm={handleDelete}
        title="Mahsulotni o'chirish?"
        description={
          deleting
            ? `${deleting.name} katalogdan butunlay o'chiriladi. Hujjatlardagi tarixiy yozuvlar saqlanadi.`
            : undefined
        }
        confirmLabel="Ha, o'chirish"
        cancelLabel="Bekor qilish"
        variant="danger"
        loading={pending}
      />
    </>
  );
}
