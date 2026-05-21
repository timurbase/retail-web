import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-md bg-emerald-600 font-mono text-sm font-bold">
                RF
              </div>
              <div className="leading-none">
                <div className="text-[15px] font-bold">RetailFlow</div>
                <div className="font-mono text-[10px] text-white/60 mt-0.5">AI · v0.1 BETA</div>
              </div>
            </Link>
            <p className="mt-4 text-[13px] leading-relaxed text-white/60">
              AI-asosli tovar qabul qilish va hujjat avtomatlashtirish platformasi. O'zbekiston chakana savdosi uchun.
            </p>
          </div>

          <div>
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Mahsulot
            </div>
            <ul className="space-y-2 text-[13px]">
              <li><Link href="#imkoniyatlar" className="text-white/70 hover:text-white">Imkoniyatlar</Link></li>
              <li><Link href="#qanday-ishlaydi" className="text-white/70 hover:text-white">Qanday ishlaydi</Link></li>
              <li><Link href="#narxlar" className="text-white/70 hover:text-white">Narxlar</Link></li>
              <li><Link href="/dashboard" className="text-white/70 hover:text-white">Demo dashboard</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Kompaniya
            </div>
            <ul className="space-y-2 text-[13px]">
              <li><Link href="/about" className="text-white/70 hover:text-white">Biz haqimizda</Link></li>
              <li><Link href="/blog" className="text-white/70 hover:text-white">Blog</Link></li>
              <li><Link href="/blog" className="text-white/70 hover:text-white">Yangiliklar</Link></li>
              <li><Link href="/bog-lanish" className="text-white/70 hover:text-white">Bog&apos;lanish</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Aloqa
            </div>
            <ul className="space-y-2.5 text-[13px] text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="size-3.5" />
                <span className="font-mono">+998 78 555 00 00</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-3.5" />
                <span className="font-mono">hello@retailflow.uz</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-3.5 mt-0.5" />
                <span>Toshkent, Chilonzor tumani<br />Bunyodkor 1A</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-[11px] text-white/50">
            © 2026 RetailFlow AI · Barcha huquqlar himoyalangan
          </div>
          <div className="flex gap-4 text-[12px] text-white/60">
            <Link href="/maxfiylik" className="hover:text-white">Maxfiylik siyosati</Link>
            <Link href="/shartlar" className="hover:text-white">Foydalanish shartlari</Link>
            <Link href="/oferta" className="hover:text-white">Oferta</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
