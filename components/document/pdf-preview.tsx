import { formatNumber } from "@/lib/utils";
import type { RetailDocument } from "@/lib/types";

interface PdfPreviewProps {
  doc: RetailDocument;
}

export function PdfPreview({ doc }: PdfPreviewProps) {
  const date = new Date(doc.date).toLocaleDateString("uz-UZ");

  return (
    <div className="rounded-md border border-border bg-white p-8 shadow-md mx-auto max-w-md text-[11px] leading-relaxed text-ink-700">
      <div className="mb-3 text-[14px] font-bold text-ink-900">
        YUK XATI №{doc.number}
      </div>

      <dl className="text-[10px] space-y-1">
        <div className="flex justify-between border-b border-ink-200 py-1.5">
          <dt className="text-ink-500">Yetkazib beruvchi:</dt>
          <dd className="font-medium">{doc.supplier.name}</dd>
        </div>
        <div className="flex justify-between border-b border-ink-200 py-1.5">
          <dt className="text-ink-500">STIR:</dt>
          <dd className="font-mono">{doc.supplier.stir}</dd>
        </div>
        <div className="flex justify-between border-b border-ink-200 py-1.5">
          <dt className="text-ink-500">Qabul qiluvchi:</dt>
          <dd className="font-medium">Karimov MChJ</dd>
        </div>
        <div className="flex justify-between border-b border-ink-200 py-1.5">
          <dt className="text-ink-500">Sana:</dt>
          <dd className="font-mono">{date}</dd>
        </div>
        <div className="flex justify-between border-b border-ink-200 py-1.5">
          <dt className="text-ink-500">Hujjat raqami:</dt>
          <dd className="font-mono">{doc.number}</dd>
        </div>
      </dl>

      <table className="mt-4 w-full text-[10px]">
        <thead>
          <tr className="bg-ink-100 uppercase tracking-wider text-[9px] text-ink-700">
            <th className="px-1 py-1.5 text-left">№</th>
            <th className="px-1 py-1.5 text-left">Mahsulot</th>
            <th className="px-1 py-1.5 text-right">Miqdor</th>
            <th className="px-1 py-1.5 text-right">Narx</th>
            <th className="px-1 py-1.5 text-right">Summa</th>
          </tr>
        </thead>
        <tbody>
          {doc.rows.map((row, i) => (
            <tr key={row.id} className="border-b border-ink-200">
              <td className="px-1 py-1.5">{i + 1}</td>
              <td className="px-1 py-1.5">{row.rawName}</td>
              <td className="px-1 py-1.5 text-right font-mono">
                {formatNumber(row.quantity)}
              </td>
              <td className="px-1 py-1.5 text-right font-mono">
                {formatNumber(row.price)}
              </td>
              <td className="px-1 py-1.5 text-right font-mono">
                {formatNumber(row.total)}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} className="px-1 pt-2 text-right font-semibold">
              JAMI:
            </td>
            <td className="px-1 pt-2 text-right font-mono font-bold">
              {formatNumber(doc.totalAmount)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
