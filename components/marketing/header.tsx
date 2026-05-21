import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-md bg-navy-700 font-mono text-sm font-bold text-white">
            RF
          </div>
          <div className="leading-none">
            <div className="text-[15px] font-bold text-ink-900">RetailFlow</div>
            <div className="font-mono text-[10px] text-ink-500">AI · BETA</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="#imkoniyatlar" className="text-[13px] font-medium text-ink-600 hover:text-ink-900">
            Imkoniyatlar
          </Link>
          <Link href="#qanday-ishlaydi" className="text-[13px] font-medium text-ink-600 hover:text-ink-900">
            Qanday ishlaydi
          </Link>
          <Link href="#narxlar" className="text-[13px] font-medium text-ink-600 hover:text-ink-900">
            Narxlar
          </Link>
          <Link href="#bog-lanish" className="text-[13px] font-medium text-ink-600 hover:text-ink-900">
            Bog'lanish
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center overflow-hidden rounded-sm border border-border font-mono text-[11px]">
            <button className="bg-navy-700 px-2.5 py-1 text-white">UZ</button>
            <button className="px-2.5 py-1 text-ink-600 hover:bg-ink-100">РУ</button>
          </div>
          <Link href="/login">
            <Button variant="ghost" size="sm">Kirish</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">Bepul boshlash</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
