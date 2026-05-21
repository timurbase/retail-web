import { SupplierSozlamalarView } from "@/components/supplier/supplier-sozlamalar-view";
import { getSupplierCompany } from "@/lib/store";

export default function SupplierSozlamalarPage() {
  const company = getSupplierCompany();
  return <SupplierSozlamalarView company={company} />;
}
