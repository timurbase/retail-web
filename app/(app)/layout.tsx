import { Sidebar } from "@/components/layout/sidebar";
import { AIHelper } from "@/components/ai-helper/ai-helper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      <AIHelper />
    </div>
  );
}
