"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ChevronDown,
  ClipboardList,
  Package,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
} from "@/components/ui/dropdown";
import { Confirm } from "@/components/ui/confirm";
import { useToast } from "@/components/ui/toast";
import { ProductFormModal } from "@/components/products/product-form-modal";
import { deleteProductAction } from "@/lib/actions/products";
import type { Product } from "@/lib/types";
import { cn, formatDate, formatNumber, formatSom } from "@/lib/utils";

import { StockAdjustModal } from "./stock-adjust-modal";

type StockStatus = "critical" | "at-min" | "ok";

function stockStatusOf(p: Product): StockStatus {
  if (p.currentStock < p.minStock) return "critical";
  if (p.currentStock === p.minStock) return "at-min";
  return "ok";
}

interface ReorderSuggestion {
  qty: number;
  reasoning: string;
}

function suggestReorder(p: Product): ReorderSuggestion {
  const target = Math.max(p.minStock * 2, p.minStock + 10);
  const qty = Math.max(10, Math.ceil((target - p.currentStock) / 10) * 10);
  const reasoning =
    p.currentStock === 0
      ? "Zaxira tugagan — darhol yetkazib berish"
      : `Min ${p.minStock} ${p.unit} ushlash uchun`;
  return { qty, reasoning };
}

const statusPill: Record<StockStatus, { label: string; className: string; dot: string }> = {
  critical: {
    label: "KAM",
    className: "bg-red-50 text-red-700 dark:text-red-300 border-red-600",
    dot: "bg-red-600",
  },
  "at-min": {
    label: "LIMITDA",
    className: "bg-amber-50 text-amber-600 dark:text-amber-300 border-amber-600",
    dot: "bg-amber-600",
  },
  ok: {
    label: "YETARLI",
    className: "bg-emerald-50 text-emerald-700 dark:text-emerald-300 border-emerald-600",
    dot: "bg-emerald-600",
  },
};

function StatusPill({ status }: { status: StockStatus }) {
  const cfg = statusPill[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
        cfg.className
      )}
    >
      <span className={cn("inline-block size-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

interface OmborViewProps {
  products: Product[];
}

export function OmborView({ products }: OmborViewProps) {
  const { success, error, info } = useToast();
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.mxik.toLowerCase().includes(q)
    );
  }, [products, query]);

  const critical = products.filter((p) => stockStatusOf(p) === "critical");
  const atMin = products.filter((p) => stockStatusOf(p) === "at-min");
  const needsReorder = [...critical, ...atMin];

  const openCreate = () => {
    setEditing(null);
    setProductFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setProductFormOpen(true);
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

  const handleReorder = (p: Product, qty: number) => {
    info(
      "Buyurtma yuborildi",
      `${p.name}: ${formatNumber(qty)} ${p.unit} (demo — backend ulanmagan)`
    );
  };

  const handleBulkReorder = () => {
    if (needsReorder.length === 0) return;
    info(
      "Hammasi yuborildi",
      `${needsReorder.length} ta mahsulot bo'yicha buyurtma Alpha Distribution'ga yuborildi`
    );
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Ombor qoldiqlari
          </h1>
          <p className="mt-1 text-[13px] text-ink-500">
            Real vaqt qoldiq holati va minimal limit nazorati
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              info(
                "Inventarizatsiya",
                "Har bir mahsulot menyusidan 'Inventarizatsiya' tanlang"
              )
            }
          >
            <ClipboardList className="size-4" />
            Inventarizatsiya boshlash
          </Button>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Yangi mahsulot
          </Button>
        </div>
      </div>

      {/* Critical section */}
      {needsReorder.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full bg-red-600" />
            <h2 className="text-[15px] font-semibold text-ink-900">Kritik darajada</h2>
            <span className="font-mono text-[12px] text-ink-500">
              ({needsReorder.length} ta)
            </span>
          </div>

          <Alert variant="error" className="mb-3 text-[13px]">
            <div className="font-semibold leading-tight">
              {needsReorder.length} ta mahsulot minimal limitdan kam
            </div>
            <div className="mt-0.5 text-[12px] opacity-80">
              AI tavsiyalari tayyor — buyurtmalarni yuborish mumkin.
            </div>
          </Alert>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ink-100">
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Mahsulot
                    </th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      MXIK
                    </th>
                    <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Qoldiq
                    </th>
                    <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Min
                    </th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Tavsiya
                    </th>
                    <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Amal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {needsReorder.map((p) => {
                    const status = stockStatusOf(p);
                    const sug = suggestReorder(p);
                    const qtyColor =
                      status === "critical" ? "text-red-700 dark:text-red-300" : "text-amber-600 dark:text-amber-300";
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-border last:border-0 hover:bg-ink-100/50"
                      >
                        <td className="px-4 py-3">
                          <div className="text-[13px] font-medium text-ink-900">
                            {p.name}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-ink-500">
                            {p.unit}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-ink-500">
                          {p.mxik}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 text-right font-mono text-[15px] font-bold tabular-nums",
                            qtyColor
                          )}
                        >
                          {formatNumber(p.currentStock)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-400 tabular-nums">
                          {formatNumber(p.minStock)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill status={status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-1.5 text-[12px] text-ink-700">
                            <Sparkles className="mt-0.5 size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <div>
                              <span className="font-semibold">
                                {formatNumber(sug.qty)} {p.unit}
                              </span>{" "}
                              buyurtma berish
                              <div className="text-[11px] text-ink-500">
                                {sug.reasoning}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => handleReorder(p, sug.qty)}
                          >
                            <Package className="size-3.5" />
                            Buyurtma
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-3 flex justify-end">
            <Button onClick={handleBulkReorder}>
              <Send className="size-4" />
              Hammasiga buyurtma yuborish (Alpha Distribution&apos;ga)
            </Button>
          </div>
        </section>
      )}

      {/* All products */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full bg-navy-700" />
            <h2 className="text-[15px] font-semibold text-ink-900">
              Barcha mahsulotlar
            </h2>
            <span className="font-mono text-[12px] text-ink-500">
              ({products.length} ta)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mahsulot yoki MXIK qidirish..."
                className="h-8 w-64 rounded-sm border border-border bg-surface-card pl-8 pr-3 text-[12px] text-ink-700 placeholder:text-ink-400 focus:-outline-offset-1 focus:outline-2 focus:outline-navy-700"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-surface-card px-3 text-[12px] font-medium text-ink-700 hover:bg-ink-100"
            >
              Saralash: Nomi
              <ChevronDown className="size-3.5 text-ink-400" />
            </button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex items-center justify-between py-3">
            <CardTitle className="text-[13px]">
              Katalog ({formatNumber(filtered.length)}
              {filtered.length !== products.length ? ` / ${products.length}` : ""}{" "}
              mahsulot)
            </CardTitle>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              So&apos;nggi yangilanish bugun
            </span>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-100">
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Mahsulot
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    MXIK
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Birlik
                  </th>
                  <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Qoldiq
                  </th>
                  <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Min
                  </th>
                  <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    O&apos;rt narx
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Oxirgi kirim
                  </th>
                  <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Amal
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-[13px] text-ink-500"
                    >
                      Mahsulot topilmadi.
                    </td>
                  </tr>
                )}
                {filtered.map((p) => {
                  const status = stockStatusOf(p);
                  const qtyColor =
                    status === "critical"
                      ? "text-red-700 dark:text-red-300 font-bold"
                      : status === "at-min"
                      ? "text-amber-600 dark:text-amber-300 font-semibold"
                      : "text-ink-900";
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-ink-100/50"
                    >
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-medium text-ink-900">
                          {p.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-ink-500">
                        {p.mxik}
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-ink-700">
                        {p.unit}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-mono text-[13px] tabular-nums",
                          qtyColor
                        )}
                      >
                        {formatNumber(p.currentStock)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-400 tabular-nums">
                        {formatNumber(p.minStock)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[12px] tabular-nums text-ink-700">
                        {formatSom(p.avgPrice)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-ink-500">
                        {p.lastReceivedAt ? formatDate(p.lastReceivedAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end">
                          <Dropdown>
                            <DropdownItem
                              icon={<Plus className="size-3.5" />}
                              onClick={() => setAdjusting(p)}
                            >
                              Qoldiqni o&apos;zgartirish
                            </DropdownItem>
                            <DropdownItem
                              icon={<Pencil className="size-3.5" />}
                              onClick={() => openEdit(p)}
                            >
                              Tahrirlash
                            </DropdownItem>
                            <DropdownItem
                              icon={<Package className="size-3.5" />}
                              onClick={() =>
                                handleReorder(p, suggestReorder(p).qty)
                              }
                            >
                              Buyurtma berish
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
        </Card>
      </section>

      {/* Modals */}
      <ProductFormModal
        open={productFormOpen}
        onClose={() => setProductFormOpen(false)}
        product={editing}
      />

      <StockAdjustModal
        open={!!adjusting}
        onClose={() => setAdjusting(null)}
        product={adjusting}
      />

      <Confirm
        open={!!deleting}
        onClose={() => (pending ? null : setDeleting(null))}
        onConfirm={handleDelete}
        title="Mahsulotni o'chirish?"
        description={
          deleting
            ? `${deleting.name} katalogdan butunlay o'chiriladi. Tarixiy yozuvlar saqlanadi.`
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
