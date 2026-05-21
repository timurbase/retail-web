import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Top mini-header with logo */}
      <header className="border-b border-border bg-surface-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-md bg-navy-700 font-mono text-sm font-bold text-white">
              RF
            </div>
            <div className="leading-none">
              <div className="text-[15px] font-bold text-ink-900">RetailFlow</div>
              <div className="font-mono text-[10px] text-ink-500">AI · BETA</div>
            </div>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}
