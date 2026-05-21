"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  FileSpreadsheet,
  Loader2,
  Upload,
  CheckCircle2,
  X,
} from "lucide-react";

import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { createManualDocumentAction } from "@/lib/actions/documents";
import type { Supplier } from "@/lib/types";
import { cn, formatSom } from "@/lib/utils";

interface ExcelImportModalProps {
  open: boolean;
  onClose: () => void;
  suppliers: Supplier[];
}

interface PreviewRow {
  name: string;
  mxik: string;
  unit: string;
  qty: number;
  price: number;
}

/**
 * Fake "parsed" preview to demonstrate the flow without a real XLSX parser.
 * Real implementation would call /api/excel/parse with the uploaded file.
 */
const MOCK_PREVIEW: PreviewRow[] = [
  { name: "Coca-Cola 0.5L PET", mxik: "1234567890", unit: "dona", qty: 50, price: 7500 },
  { name: "Pepsi 0.5L PET", mxik: "1234567891", unit: "dona", qty: 40, price: 7000 },
  { name: "Fanta 0.5L PET", mxik: "1234567892", unit: "dona", qty: 30, price: 7000 },
  { name: "Sprite 0.5L PET", mxik: "1234567893", unit: "dona", qty: 30, price: 7000 },
  { name: "Mineral suv 1.5L", mxik: "1234567894", unit: "dona", qty: 60, price: 6000 },
  { name: "Sok 'Vimm-Bill-Dann' 1L", mxik: "1234567895", unit: "dona", qty: 25, price: 12000 },
  { name: "Chips 'Lay\\'s' 80g", mxik: "1234567896", unit: "dona", qty: 100, price: 9500 },
  { name: "Snickers 50g", mxik: "1234567897", unit: "dona", qty: 80, price: 3500 },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExcelImportModal({ open, onClose, suppliers }: ExcelImportModalProps) {
  const { success, error, info } = useToast();
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"upload" | "parsing" | "preview">("upload");
  const [fileName, setFileName] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("upload");
      setFileName("");
      setSupplierId(suppliers[0]?.id ?? "");
      setDragOver(false);
    }
  }, [open, suppliers]);

  const handleFile = (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    setStep("parsing");
    info("Fayl tahlil qilinmoqda", file.name);
    setTimeout(() => {
      setStep("preview");
      success("Tahlil tugadi", `${MOCK_PREVIEW.length} ta mahsulot topildi`);
    }, 1000);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const total = MOCK_PREVIEW.reduce((s, r) => s + r.qty * r.price, 0);

  const handleSubmit = () => {
    if (!supplierId) {
      error("Yetkazib beruvchini tanlang", "Importga yetkazib beruvchi kerak");
      return;
    }
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) {
      error("Yetkazib beruvchi topilmadi", "Iltimos qaytadan tanlang");
      return;
    }

    startTransition(async () => {
      try {
        const number = `XL-${Date.now().toString().slice(-6)}`;
        const res = await createManualDocumentAction({
          supplierId,
          number,
          date: new Date(`${todayIso()}T00:00:00Z`).toISOString(),
          rows: MOCK_PREVIEW.map((r) => ({
            rawName: r.name,
            mxik: r.mxik,
            unit: r.unit,
            quantity: r.qty,
            price: r.price,
          })),
        });
        if (res.ok && res.document) {
          success(
            "Hujjat import qilindi",
            `№${res.document.number} · ${MOCK_PREVIEW.length} mahsulot · ${supplier.name}`
          );
          onClose();
        } else {
          error("Xatolik yuz berdi", "Hujjatni yaratib bo'lmadi");
        }
      } catch {
        error("Xatolik yuz berdi", "Server bilan aloqa uzildi");
      }
    });
  };

  const reset = () => {
    setStep("upload");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title="Excel import"
      description="Excel yoki CSV fayldan kelgan mahsulotlarni qabul hujjati sifatida yarating"
      size="lg"
    >
      <ModalBody className="space-y-4">
        {step === "upload" && (
          <label
            htmlFor="excel-file"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-12 text-center transition-colors",
              dragOver
                ? "border-navy-700 bg-navy-50/50"
                : "border-border bg-ink-100/30 hover:border-navy-600 hover:bg-ink-100/60"
            )}
          >
            <div className="grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-700 dark:text-emerald-300">
              <Upload className="size-6" />
            </div>
            <p className="mt-3 text-[14px] font-semibold text-ink-900">
              Excel/CSV faylni tanlang yoki shu yerga tashlang
            </p>
            <p className="mt-1 text-[12px] text-ink-500">
              .xlsx · .xls · .csv · maksimal 10 MB
            </p>
            <input
              ref={fileInputRef}
              id="excel-file"
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={onFileChange}
              className="sr-only"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-4 pointer-events-none"
            >
              <FileSpreadsheet className="size-3.5" />
              Faylni tanlash
            </Button>
          </label>
        )}

        {step === "parsing" && (
          <div className="flex flex-col items-center justify-center rounded-md border border-border bg-ink-100/30 px-6 py-12 text-center">
            <Loader2 className="size-8 animate-spin text-navy-700 dark:text-navy-300" />
            <p className="mt-3 text-[14px] font-semibold text-ink-900">
              Fayl tahlil qilinmoqda…
            </p>
            <p className="mt-1 font-mono text-[12px] text-ink-500">{fileName}</p>
          </div>
        )}

        {step === "preview" && (
          <>
            <Alert variant="success">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <div className="flex-1">
                  <strong className="font-semibold">
                    {MOCK_PREVIEW.length} ta mahsulot topildi
                  </strong>{" "}
                  · <span className="font-mono text-[12px]">{fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="grid size-6 place-items-center rounded-sm text-ink-500 hover:bg-ink-100"
                  aria-label="Boshqa fayl"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </Alert>

            <div>
              <Label htmlFor="excel-supplier">Yetkazib beruvchi</Label>
              <select
                id="excel-supplier"
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
              <Label>Mahsulotlar ({MOCK_PREVIEW.length})</Label>
              <div className="overflow-hidden rounded-sm border border-border">
                <div className="grid grid-cols-[1.6fr_110px_70px_70px_110px] items-center gap-2 border-b border-border bg-ink-100/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                  <span>Nomi</span>
                  <span>MXIK</span>
                  <span>Birlik</span>
                  <span className="text-right">Miqdor</span>
                  <span className="text-right">Narx</span>
                </div>
                {MOCK_PREVIEW.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1.6fr_110px_70px_70px_110px] items-center gap-2 border-b border-border px-3 py-2 last:border-0 text-[12px]"
                  >
                    <span className="truncate text-ink-900">{row.name}</span>
                    <span className="font-mono text-ink-700">{row.mxik}</span>
                    <span className="font-mono text-ink-500">{row.unit}</span>
                    <span className="text-right font-mono tabular-nums text-ink-900">
                      {row.qty}
                    </span>
                    <span className="text-right font-mono tabular-nums text-ink-900">
                      {formatSom(row.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border bg-ink-100/40 px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                Jami summa
              </span>
              <span className="font-mono text-[18px] font-bold tabular-nums text-ink-900">
                {formatSom(total)}
              </span>
            </div>
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
          Bekor qilish
        </Button>
        {step === "preview" && (
          <Button
            type="button"
            variant="emerald"
            onClick={handleSubmit}
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Yuklanmoqda…
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Yuklash
              </>
            )}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
