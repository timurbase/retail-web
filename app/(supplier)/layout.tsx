import { SupplierSidebar } from "@/components/supplier/supplier-sidebar";
import { AIHelper } from "@/components/ai-helper/ai-helper";

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SupplierSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      <AIHelper />
    </div>
  );
}
