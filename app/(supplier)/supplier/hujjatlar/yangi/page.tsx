import { SupplierTopbar } from "@/components/supplier/supplier-topbar";
import { NewInvoiceForm } from "@/components/supplier/new-invoice-form";
import {
  getSupplierStores,
  getSupplierProducts,
  getOutgoingInvoices,
} from "@/lib/store";

export default async function NewInvoicePage() {
  const stores = getSupplierStores();
  const products = getSupplierProducts();
  const invoices = getOutgoingInvoices();

  const nextNum = invoices.length + 1;
  const nextNumber = `AD-2026-${String(nextNum).padStart(4, "0")}`;

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
