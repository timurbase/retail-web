import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { NewInvoiceForm } from "@/components/supplier/new-invoice-form";
import { Alert } from "@/components/ui/alert";
import { supplierPortal, ApiError } from "@/lib/api";
import type { SupplierProduct, SupplierStore } from "@/lib/types";

export default async function NewInvoicePage() {
  let stores: SupplierStore[] = [];
  let products: SupplierProduct[] = [];
  let loadError: string | null = null;
  try {
    const [storesRes, productsRes] = await Promise.all([
      supplierPortal.stores.list({ limit: 200 }),
      supplierPortal.products.list({ limit: 500 }),
    ]);
    stores = storesRes.results;
    products = productsRes.results;
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "Ma'lumotlarni yuklab bo'lmadi";
  }

  // Backend assigns invoice number on create — placeholder shown to the user.
  const nextNumber = "AD-2026-XXXX";

  return (
    <>
      <SupplierTopbar
        breadcrumb={[
          { label: "Hujjatlar", href: "/supplier/hujjatlar" },
          { label: "Yangi hujjat" },
        ]}
      />

      <main className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-5xl">
          {loadError && (
            <Alert variant="error" className="mb-4">
              {loadError}
            </Alert>
          )}
          <div className="mb-6">
            <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Yangi yuborish
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              Yangi hujjat yuborish
            </h1>
            <p className="mt-1 text-[14px] text-ink-500">
              Bitta do&apos;konga invoice yaratish va Didox orqali yuborish.
            </p>
          </div>

          <NewInvoiceForm
            stores={stores}
            products={products}
            nextNumber={nextNumber}
          />
        </div>
      </main>
    </>
  );
}
