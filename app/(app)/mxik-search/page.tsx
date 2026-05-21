import { Topbar } from "@/components/layout/topbar";
import { MxikSearchView } from "@/components/mxik-search/mxik-search-view";

export default function MxikSearchPage() {
  return (
    <>
      <Topbar breadcrumb={[{ label: "MXIK qidiruv" }]} />

      <main className="flex-1 overflow-y-auto bg-surface px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <MxikSearchView />
        </div>
      </main>
    </>
  );
}
