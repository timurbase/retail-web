import { Topbar } from "@/components/layout/topbar";
import { ProductRow } from "@/components/document/product-row";
import { PdfPreview } from "@/components/document/pdf-preview";
import { DocActionBar } from "@/components/document/doc-action-bar";
import { DocHeaderMenu } from "@/components/document/doc-header-menu";
import { Card } from "@/components/ui/card";
import { Sparkles, FileText } from "lucide-react";
import { getDocument } from "@/lib/store";
import { formatSom, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const doc = getDocument(id);
  if (!doc) notFound();

  const reviewCount = doc.rows.filter(
    (r) => r.status === "new" || r.status === "ambiguous"
  ).length;
  const matchedCount = doc.rows.filter((r) => r.status === "matched").length;
  const approvedCount = doc.rows.filter((r) => r.status === "approved").length;

  return (
    <>
      <Topbar
        breadcrumb={[
          { label: "Hujjatlar", href: "/hujjatlar" },
          { label: `№${doc.number}` },
        ]}
      />

      {/* Doc header */}
      <div className="flex items-start justify-between border-b border-border bg-surface-card px-6 py-5">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-ink-900">
            Hujjat №{doc.number} —{" "}
            <span className="text-ink-700">{doc.supplier.name}</span>
          </h1>
          <div className="mt-1 flex items-center gap-3 text-[13px] text-ink-500">
            <span className="flex items-center gap-1.5">
              <FileText className="size-3.5" />
              {doc.source === "didox" ? "Didox" : doc.source.toUpperCase()}
            </span>
            <span className="text-ink-300">·</span>
            <span className="font-mono">{formatDate(doc.date)}</span>
            <span className="text-ink-300">·</span>
            <span className="font-mono">STIR: {doc.supplier.stir}</span>
            <span className="text-ink-300">·</span>
            <span>
              <strong className="font-mono text-ink-900">
                {formatSom(doc.totalAmount)}
              </strong>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {reviewCount > 0 && (
            <span className="rounded-full border border-amber-600 bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-600 dark:text-amber-300">
              ⚠ {reviewCount} ta yozuv tekshirish kerak
            </span>
          )}
          <DocHeaderMenu docId={doc.id} docNumber={doc.number} />
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: PDF */}
        <div className="w-1/2 overflow-y-auto border-r border-border bg-[#EEF2F7] p-6">
          <PdfPreview doc={doc} />
        </div>

        {/* Right: AI analysis */}
        <div className="w-1/2 overflow-y-auto bg-surface p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700">
            <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            AI tahlil
          </div>

          {/* Supplier summary */}
          <Card className="mb-4 grid grid-cols-2 gap-3 p-3.5">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Yetkazib beruvchi
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium text-ink-900">
                {doc.supplier.name}
                {doc.supplier.verified && (
                  <span className="inline-flex size-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                STIR
              </div>
              <div className="mt-0.5 font-mono text-[13px] text-ink-900">
                {doc.supplier.stir}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Sana
              </div>
              <div className="mt-0.5 font-mono text-[13px] text-ink-900">
                {formatDate(doc.date)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Jami summa
              </div>
              <div className="mt-0.5 font-mono text-[13px] font-semibold text-ink-900">
                {formatSom(doc.totalAmount)}
              </div>
            </div>
          </Card>

          <div className="mb-3 flex items-center justify-between font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700">
            <span>Mahsulotlar ({doc.rows.length} ta)</span>
            <span className="text-emerald-600 dark:text-emerald-400 normal-case font-sans">
              {matchedCount} avto-mos · {approvedCount} tasdiqlangan
            </span>
          </div>

          {doc.rows.map((row, i) => (
            <ProductRow key={row.id} row={row} index={i + 1} docId={doc.id} />
          ))}
        </div>
      </div>

      {/* Bottom action bar */}
      <DocActionBar
        docId={doc.id}
        totalRows={doc.rows.length}
        matchedCount={matchedCount}
        approvedCount={approvedCount}
        reviewCount={reviewCount}
      />
    </>
  );
}
