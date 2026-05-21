"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash2,
  Camera,
  ClipboardEdit,
  Webhook,
  Upload,
  UserPlus,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { createManualDocumentAction } from "@/lib/actions/documents";
import type { Supplier } from "@/lib/types";
import { cn, formatSom } from "@/lib/utils";

type Method = "manual" | "photo" | "didox";
type Source = "manual" | "photo" | "pdf" | "excel" | "didox";

interface RowState {
  id: string;
  rawName: string;
  mxik: string;
  unit: string;
  quantity: string;
  price: string;
}

const UNIT_OPTIONS = ["dona", "kg", "l", "blok", "paket", "m", "m²"] as const;

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

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface NewDocFormProps {
  suppliers: Supplier[];
}

export function NewDocForm({ suppliers }: NewDocFormProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [method, setMethod] = useState<Method>("manual");
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id ?? "");
  const [number, setNumber] = useState("");
  const [date, setDate] = useState<string>(todayIso());
  const [source, setSource] = useState<Source>("manual");
  const [rows, setRows] = useState<RowState[]>([blankRow()]);
  const [formError, setFormError] = useState<string | null>(null);
  const [photoFakeScanned, setPhotoFakeScanned] = useState(false);

  const total = useMemo(
    () =>
      rows.reduce((sum, r) => {
        const q = Number(r.quantity);
        const p = Number(r.price);
        if (Number.isFinite(q) && Number.isFinite(p)) return sum + q * p;
        return sum;
      }, 0),
    [rows]
  );

  const setRow = (id: string, patch: Partial<RowState>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const addRow = () => setRows((prev) => [...prev, blankRow()]);

  type SubmitMode = "draft" | "review";

  const validate = (): { ok: true; cleanRows: ReturnType<typeof cleanRow>[] } | { ok: false; msg: string } => {
    if (method !== "manual") return { ok: false, msg: "Hozircha faqat qo'lda kiritish faol" };
    if (!supplierId) return { ok: false, msg: "Yetkazib beruvchini tanlang" };
    if (!number.trim()) return { ok: false, msg: "Hujjat raqamini kiriting" };
    if (!date) return { ok: false, msg: "Sanani kiriting" };
    const cleaned = rows.map(cleanRow).filter((r) => r.rawName.length > 0);
    if (cleaned.length === 0) return { ok: false, msg: "Kamida bitta mahsulot qatorini to'ldiring" };
    for (const r of cleaned) {
      if (!Number.isFinite(r.quantity) || r.quantity <= 0)
        return { ok: false, msg: `"${r.rawName}" — miqdor noto'g'ri` };
      if (!Number.isFinite(r.price) || r.price < 0)
        return { ok: false, msg: `"${r.rawName}" — narx noto'g'ri` };
      if (r.mxik && !/^\d{10}$/.test(r.mxik))
        return { ok: false, msg: `"${r.rawName}" — MXIK 10 raqamdan iborat bo'lishi kerak` };
    }
    return { ok: true, cleanRows: cleaned };
  };

  const handleSubmit = (mode: SubmitMode) => {
    setFormError(null);
    const v = validate();
    if (!v.ok) {
      setFormError(v.msg);
      return;
    }

    const isoDate = new Date(`${date}T00:00:00Z`).toISOString();

    startTransition(async () => {
      try {
        const res = await createManualDocumentAction({
          supplierId,
          number: number.trim(),
          date: isoDate,
          rows: v.cleanRows.map((r) => ({
            rawName: r.rawName,
            mxik: r.mxik || null,
            unit: r.unit,
            quantity: r.quantity,
            price: r.price,
          })),
        });
        if (res.ok && res.document) {
          success(
            mode === "draft" ? "Qoralama saqlandi" : "Hujjat yaratildi",
            `№${res.document.number} · ${v.cleanRows.length} mahsulot`
          );
          router.push(`/hujjatlar/${res.document.id}`);
        } else {
          error("Xatolik yuz berdi", "Hujjatni yaratib bo'lmadi");
        }
      } catch {
        error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
      }
    });
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 pb-24 lg:pb-6">
      {/* Method selector */}
      <div className="grid gap-3 sm:grid-cols-3">
        <MethodCard
          selected={method === "photo"}
          onClick={() => setMethod("photo")}
          Icon={Camera}
          title="Foto orqali"
          desc="Telefon kamerasi yoki yuklangan rasm"
          badge="Tez orada"
          badgeColor="amber"
        />
        <MethodCard
          selected={method === "manual"}
          onClick={() => setMethod("manual")}
          Icon={ClipboardEdit}
          title="Qo'lda kiritish"
          desc="Qog'oz nakladnoy ma'lumotlarini qator-qator kiriting"
        />
        <MethodCard
          selected={method === "didox"}
          onClick={() => setMethod("didox")}
          Icon={Webhook}
          title="Didox webhook"
          desc="Avtomatik — yetkazib beruvchi yuborganda tushadi"
          badge="Ulangan"
          badgeColor="emerald"
        />
      </div>

      {formError && <Alert variant="error">{formError}</Alert>}

      {/* Manual form */}
      {method === "manual" && (
        <ManualSection
          suppliers={suppliers}
          supplierId={supplierId}
          setSupplierId={setSupplierId}
          number={number}
          setNumber={setNumber}
          date={date}
          setDate={setDate}
          source={source}
          setSource={setSource}
          rows={rows}
          setRow={setRow}
          removeRow={removeRow}
          addRow={addRow}
          total={total}
          pending={pending}
        />
      )}

      {/* Photo placeholder */}
      {method === "photo" && (
        <PhotoSection
          scanned={photoFakeScanned}
          onScan={() => setPhotoFakeScanned(true)}
          onReset={() => setPhotoFakeScanned(false)}
        />
      )}

      {/* Didox webhook info */}
      {method === "didox" && <DidoxSection />}

      {/* Sticky bottom actions */}
      {method === "manual" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-card px-4 py-3 shadow-lg lg:static lg:rounded-md lg:border lg:px-5 lg:py-4 lg:shadow-none">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 lg:mx-0">
            <div className="font-mono text-[13px] text-ink-600">
              Jami summa:{" "}
              <strong className="text-[16px] font-bold text-ink-900">
                {formatSom(total)}
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/hujjatlar">
                <Button type="button" variant="ghost" disabled={pending}>
                  Bekor qilish
                </Button>
              </Link>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => handleSubmit("draft")}
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Saqlash va kutish
              </Button>
              <Button
                type="button"
                variant="emerald"
                disabled={pending}
                onClick={() => handleSubmit("review")}
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Yaratilmoqda…
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Saqlash va review queue&apos;ga
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function cleanRow(r: RowState) {
  return {
    rawName: r.rawName.trim(),
    mxik: r.mxik.trim(),
    unit: r.unit,
    quantity: Number(r.quantity),
    price: Number(r.price),
  };
}

function MethodCard({
  selected,
  onClick,
  Icon,
  title,
  desc,
  badge,
  badgeColor,
}: {
  selected: boolean;
  onClick: () => void;
  Icon: typeof Camera;
  title: string;
  desc: string;
  badge?: string;
  badgeColor?: "amber" | "emerald";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start gap-2 rounded-md border bg-surface-card p-4 text-left transition-colors",
        selected
          ? "border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50/40"
          : "border-border hover:border-navy-700"
      )}
    >
      {badge && (
        <span
          className={cn(
            "absolute right-3 top-3 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
            badgeColor === "emerald"
              ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:text-emerald-300"
              : "border-amber-600 bg-amber-50 text-amber-600 dark:text-amber-300"
          )}
        >
          {badge}
        </span>
      )}
      <div
        className={cn(
          "grid size-9 place-items-center rounded-md",
          selected ? "bg-emerald-600 text-white" : "bg-navy-50 text-navy-700 dark:text-navy-300"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="text-[15px] font-semibold text-ink-900">{title}</div>
      <div className="text-[12px] leading-relaxed text-ink-600">{desc}</div>
    </button>
  );
}

function ManualSection({
  suppliers,
  supplierId,
  setSupplierId,
  number,
  setNumber,
  date,
  setDate,
  source,
  setSource,
  rows,
  setRow,
  removeRow,
  addRow,
  total,
  pending,
}: {
  suppliers: Supplier[];
  supplierId: string;
  setSupplierId: (v: string) => void;
  number: string;
  setNumber: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  source: Source;
  setSource: (v: Source) => void;
  rows: RowState[];
  setRow: (id: string, patch: Partial<RowState>) => void;
  removeRow: (id: string) => void;
  addRow: () => void;
  total: number;
  pending: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Top fields */}
      <div className="rounded-md border border-border bg-surface-card p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Label htmlFor="doc-supplier">Yetkazib beruvchi</Label>
            <select
              id="doc-supplier"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={pending}
              className="h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900 focus:-outline-offset-1 focus:border-navy-700 focus:outline-2 focus:outline-navy-700"
            >
              {suppliers.length === 0 && <option value="">— ro&apos;yxat bo&apos;sh —</option>}
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.verified ? "✓" : ""}
                </option>
              ))}
            </select>
            <Link
              href="/yetkazib-beruvchilar"
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-navy-700 dark:text-navy-300 hover:underline"
            >
              <UserPlus className="size-3" />
              Yangi yetkazib beruvchi qo&apos;shish
            </Link>
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
          <div>
            <Label htmlFor="doc-source">Manba</Label>
            <select
              id="doc-source"
              value={source}
              onChange={(e) => setSource(e.target.value as Source)}
              disabled={pending}
              className="h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900 focus:-outline-offset-1 focus:border-navy-700 focus:outline-2 focus:outline-navy-700"
            >
              <option value="manual">Manual (qo&apos;lda)</option>
              <option value="didox">Didox</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
              <option value="photo">Foto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="rounded-md border border-border bg-surface-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-ink-900">
              Mahsulotlar
            </h3>
            <span className="font-mono text-[11px] text-ink-500">
              ({rows.length})
            </span>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={addRow} disabled={pending}>
            <Plus className="size-3.5" />
            Mahsulot qo&apos;shish
          </Button>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-[1.4fr_130px_90px_90px_120px_130px_40px] items-center gap-2 border-b border-border bg-ink-100/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
            <span>Mahsulot nomi</span>
            <span>MXIK</span>
            <span>Birlik</span>
            <span className="text-right">Miqdor</span>
            <span className="text-right">Narx</span>
            <span className="text-right">Summa</span>
            <span />
          </div>
          {rows.map((r) => {
            const q = Number(r.quantity);
            const p = Number(r.price);
            const lineTotal =
              Number.isFinite(q) && Number.isFinite(p) ? q * p : 0;
            return (
              <div
                key={r.id}
                className="grid grid-cols-[1.4fr_130px_90px_90px_120px_130px_40px] items-center gap-2 border-b border-border px-4 py-2 last:border-0"
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
                <div className="h-8 flex items-center justify-end rounded-sm bg-ink-100/40 px-2 font-mono text-[13px] tabular-nums text-ink-900">
                  {formatSom(lineTotal)}
                </div>
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
            );
          })}
        </div>

        {/* Mobile card list */}
        <div className="space-y-3 p-4 lg:hidden">
          {rows.map((r, idx) => {
            const q = Number(r.quantity);
            const p = Number(r.price);
            const lineTotal =
              Number.isFinite(q) && Number.isFinite(p) ? q * p : 0;
            return (
              <div key={r.id} className="rounded-md border border-border bg-surface p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink-500">
                    Mahsulot #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRow(r.id)}
                    disabled={pending || rows.length === 1}
                    className="grid size-7 place-items-center rounded-sm text-ink-400 hover:bg-red-50 hover:text-red-700 dark:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Mahsulot nomi"
                    value={r.rawName}
                    onChange={(e) => setRow(r.id, { rawName: e.target.value })}
                    disabled={pending}
                    className="h-9 w-full rounded-sm border border-border bg-surface-card px-2 text-[13px] text-ink-900 placeholder:text-ink-400"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MXIK (10 raqam)"
                    value={r.mxik}
                    onChange={(e) =>
                      setRow(r.id, {
                        mxik: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    disabled={pending}
                    maxLength={10}
                    className="h-9 w-full rounded-sm border border-border bg-surface-card px-2 font-mono text-[12px] text-ink-700 placeholder:text-ink-400"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={r.unit}
                      onChange={(e) => setRow(r.id, { unit: e.target.value })}
                      disabled={pending}
                      className="h-9 w-full rounded-sm border border-border bg-surface-card px-2 font-mono text-[12px] text-ink-700"
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
                      placeholder="Miqdor"
                      value={r.quantity}
                      onChange={(e) => setRow(r.id, { quantity: e.target.value })}
                      disabled={pending}
                      className="h-9 w-full rounded-sm border border-border bg-surface-card px-2 text-right font-mono text-[13px] tabular-nums text-ink-900"
                    />
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="Narx"
                      value={r.price}
                      onChange={(e) => setRow(r.id, { price: e.target.value })}
                      disabled={pending}
                      className="h-9 w-full rounded-sm border border-border bg-surface-card px-2 text-right font-mono text-[13px] tabular-nums text-ink-900"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-sm bg-ink-100/40 px-2 py-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                      Summa
                    </span>
                    <span className="font-mono text-[14px] font-semibold tabular-nums text-ink-900">
                      {formatSom(lineTotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-border bg-ink-100/40 px-5 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Jami summa
          </span>
          <span className="font-mono text-[18px] font-bold tabular-nums text-ink-900">
            {formatSom(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function PhotoSection({
  scanned,
  onScan,
  onReset,
}: {
  scanned: boolean;
  onScan: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">
      <Alert variant="warning">
        <div className="font-semibold">Foto orqali kirim — tez orada</div>
        <div className="mt-0.5 text-[13px] text-amber-700">
          Bu rejim hozircha demo. Yuborish bloklangan — qo&apos;lda kiritishga o&apos;ting.
        </div>
      </Alert>

      {!scanned ? (
        <button
          type="button"
          onClick={onScan}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border bg-surface-card px-6 py-16 text-center transition-colors hover:border-navy-700 hover:bg-ink-100/40"
        >
          <div className="grid size-14 place-items-center rounded-full bg-navy-50 text-navy-700 dark:text-navy-300">
            <Upload className="size-6" />
          </div>
          <div>
            <div className="text-[16px] font-semibold text-ink-900">
              Foto yoki PDF tashlang
            </div>
            <div className="mt-1 text-[13px] text-ink-600">
              JPG, PNG, HEIC, PDF · maksimum 10 MB
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-sm border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-700">
              <Camera className="mr-1 inline size-3.5" />
              Kamera bilan suratga olish
            </span>
            <span className="rounded-sm border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-700">
              <Upload className="mr-1 inline size-3.5" />
              Fayl tanlash
            </span>
          </div>
        </button>
      ) : (
        <div className="space-y-3 rounded-md border border-emerald-600 bg-emerald-50/40 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-700 dark:text-emerald-300" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              AI tahlil natijasi (demo)
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <FakeField label="Aniqlangan yetkazib beruvchi" value="Alpha Distribution OOO" />
            <FakeField label="STIR" value="301234567" mono />
            <FakeField label="Hujjat raqami" value="12389" mono />
            <FakeField label="Sana" value="21.05.2026" mono />
            <FakeField label="Mahsulotlar" value="6 ta qator topildi" />
            <FakeField label="Jami summa" value="3 245 000 so'm" mono />
          </div>
          <Alert variant="warning">
            <div className="text-[13px]">
              Bu demo natija — yuborish faollashtirilmagan. To&apos;liq foto rejimi keyingi versiyada keladi.
            </div>
          </Alert>
          <Button type="button" variant="secondary" onClick={onReset}>
            Boshqa foto yuklash
          </Button>
        </div>
      )}
    </div>
  );
}

function FakeField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-surface-card px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div className={cn("mt-0.5 text-[13px] text-ink-900", mono && "font-mono")}>
        {value}
      </div>
    </div>
  );
}

function DidoxSection() {
  return (
    <div className="space-y-4">
      <Alert variant="success">
        <div className="font-semibold">Didox webhook ulangan</div>
        <div className="mt-0.5 text-[13px]">
          Yetkazib beruvchi Didox orqali EHF yuborganda hujjat avtomatik tushadi va parsing queue&apos;ga qo&apos;yiladi. Qo&apos;lda hech narsa qilish kerak emas.
        </div>
      </Alert>
      <div className="rounded-md border border-border bg-surface-card p-5">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          Webhook sozlamalari
        </div>
        <div className="space-y-2 text-[13px]">
          <div className="flex items-center justify-between gap-3 rounded-sm bg-ink-100/40 px-3 py-2">
            <span className="text-ink-500">URL:</span>
            <span className="font-mono text-ink-900">
              https://api.retailflow.uz/didox/webhook
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-sm bg-ink-100/40 px-3 py-2">
            <span className="text-ink-500">STIR:</span>
            <span className="font-mono text-ink-900">301234567</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-sm bg-ink-100/40 px-3 py-2">
            <span className="text-ink-500">Oxirgi qabul:</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-300">21.05.2026 09:42</span>
          </div>
        </div>
      </div>
      <Link href="/sozlamalar">
        <Button type="button" variant="secondary">
          Integratsiya sozlamalari
        </Button>
      </Link>
    </div>
  );
}
