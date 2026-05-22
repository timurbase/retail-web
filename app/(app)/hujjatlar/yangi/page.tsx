import { Topbar } from "@/components/layout/topbar";
import { Alert } from "@/components/ui/alert";
import { NewDocForm } from "@/components/document/new-doc-form";
import { suppliers as suppliersApi, ApiError } from "@/lib/api";

export default async function NewDocumentPage() {
  let suppliers: Awaited<ReturnType<typeof suppliersApi.list>>["results"] = [];
  let loadError: string | null = null;
  try {
    const res = await suppliersApi.list();
    suppliers = res.results;
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "Noma'lum xato";
  }

  return (
    <>
      <Topbar
        breadcrumb={[
          { label: "Hujjatlar", href: "/hujjatlar" },
          { label: "Yangi hujjat" },
        ]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
              Yangi qabul
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              Yangi hujjat yaratish
            </h1>
            <p className="mt-1 text-[14px] text-ink-500">
              Qog&apos;oz nakladnoy yoki foto orqali kirim qo&apos;shing — Didox webhook kelmagan paytda qo&apos;l keladi.
            </p>
          </div>

          {loadError && (
            <Alert variant="error" className="mb-4">
              Yuklashda xatolik: {loadError}
            </Alert>
          )}

          <NewDocForm suppliers={suppliers} />
        </div>
      </main>
    </>
  );
}
