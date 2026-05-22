import { SupplierSozlamalarView } from "@/components/supplier/supplier-sozlamalar-view";
import { supplierPortal, ApiError } from "@/lib/api";
import { seedSupplierCompany } from "@/lib/supplier-seed";
import type { SupplierCompany } from "@/lib/types";

export default async function SupplierSozlamalarPage() {
  let company: SupplierCompany;
  try {
    company = await supplierPortal.company.get();
  } catch (e) {
    // Sozlamalar page must render even if the API is down.
    if (!(e instanceof ApiError)) throw e;
    company = seedSupplierCompany;
  }
  return <SupplierSozlamalarView company={company} />;
}
