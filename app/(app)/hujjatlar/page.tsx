import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { DocListRowMenu } from "@/components/document/doc-list-row-menu";
import { NewDocButton } from "@/components/document/new-doc-button";
import { FileText, Image as ImageIcon, FileSpreadsheet } from "lucide-react";
import { getDocuments, getSuppliers } from "@/lib/store";
import { formatSom, formatDate } from "@/lib/utils";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const sourceIcons: Record<string, LucideIcon> = {
  didox: FileText,
  excel: FileSpreadsheet,
  pdf: FileText,
  photo: ImageIcon,
  manual: FileText,
};

const statusStyles: Record<string, string> = {
  pending: "bg-navy-50 border-navy-700 text-navy-700 dark:text-navy-300",
  review: "bg-amber-50 border-amber-600 text-amber-600 dark:text-amber-300",
  approved: "bg-emerald-50 border-emerald-600 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-red-50 border-red-600 text-red-700 dark:text-red-300",
  duplicate: "bg-ink-100 border-ink-400 text-ink-600",
};

const statusLabel: Record<string, string> = {
  pending: "Parsing...",
  review: "Review",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
  duplicate: "Dublikat",
};

export default function HujjatlarPage() {
  const documents = getDocuments();
  const suppliers = getSuppliers();

  return (
    <>
      <Topbar breadcrumb={[{ label: "Hujjatlar" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                Kutilayotgan hujjatlar
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">
                Didox, Excel, PDF va foto orqali kelgan hujjatlar
              </p>
            </div>
            <div className="flex gap-2">
              <NewDocButton suppliers={suppliers} />
            </div>
          </div>

          <Card>
            {documents.length === 0 ? (
              <div className="px-5 py-12 text-center text-[13px] text-ink-500">
                Hujjatlar mavjud emas
              </div>
            ) : (
              <div>
                {documents.map((doc) => {
                  const Icon = sourceIcons[doc.source] ?? FileText;
                  return (
                    <div
                      key={doc.id}
                      className="relative flex items-center justify-between border-b border-border last:border-0 hover:bg-ink-100/50 transition-colors"
                    >
                      <Link
                        href={`/hujjatlar/${doc.id}`}
                        className="flex flex-1 items-center gap-4 min-w-0 px-5 py-4"
                      >
                        <div className="grid size-10 shrink-0 place-items-center rounded-md bg-navy-50 text-navy-700 dark:text-navy-300">
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[13px] font-semibold text-ink-700">
                              №{doc.number}
                            </span>
                            <span className="text-sm font-semibold text-ink-900 truncate">
                              {doc.supplier.name}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-[11px] text-ink-500 font-mono">
                            <span>{formatDate(doc.date)}</span>
                            <span className="text-ink-300">·</span>
                            <span>STIR: {doc.supplier.stir}</span>
                            <span className="text-ink-300">·</span>
                            <span className="uppercase">{doc.source}</span>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-3 shrink-0 pr-3">
                        <span className="font-mono text-[13px] font-semibold text-ink-900">
                          {formatSom(doc.totalAmount)}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase ${statusStyles[doc.status]}`}
                        >
                          {statusLabel[doc.status]}
                        </span>
                        <DocListRowMenu docId={doc.id} docNumber={doc.number} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
