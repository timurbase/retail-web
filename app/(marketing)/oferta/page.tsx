import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ommaviy oferta · RetailFlow AI",
  description:
    "RetailFlow AI xizmatlaridan foydalanish bo'yicha ommaviy taklif (oferta).",
};

const sections = [
  { id: "umumiy", label: "Ofertaning umumiy qoidalari" },
  { id: "atamalar", label: "Atamalar" },
  { id: "predmet", label: "Oferta predmeti" },
  { id: "huquqlar", label: "Tomonlarning huquq va majburiyatlari" },
  { id: "narx", label: "Xizmat narxi va to'lov tartibi" },
  { id: "akseptlash", label: "Akseptlash tartibi" },
  { id: "masuliyat", label: "Mas'uliyat" },
  { id: "force-majeure", label: "Force majeure" },
  { id: "maxfiylik", label: "Maxfiylik" },
  { id: "muddat", label: "Hujjatning amal qilish muddati" },
  { id: "rekvizitlar", label: "Rekvizitlar" },
];

export default function OfertaPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
          Huquqiy hujjat · Oxirgi yangilanish: 15.05.2026
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-ink-900">
          Ommaviy oferta
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-ink-600">
          RetailFlow AI xizmatlaridan foydalanish bo&apos;yicha ommaviy taklif. Ushbu hujjat O&apos;zbekiston Respublikasi Fuqarolik kodeksining 367-moddasi (ommaviy oferta) asosida tuzilgan.
        </p>
      </header>

      <nav className="mb-12 rounded-md border border-border bg-surface-card p-5">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          Mundarija
        </div>
        <ol className="space-y-1.5 text-[14px]">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-navy-700 dark:text-navy-300 hover:underline">
                {i + 1}. {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="max-w-none">
        <section id="umumiy" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            1. Ofertaning umumiy qoidalari
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Ushbu ommaviy oferta (keyingi o&apos;rinlarda — &quot;Oferta&quot;) &quot;Karimov&quot; mas&apos;uliyati cheklangan jamiyati (keyingi o&apos;rinlarda — &quot;Ijrochi&quot;) tomonidan istalgan O&apos;zbekiston Respublikasi yuridik shaxsiga yoki yakka tartibdagi tadbirkorga (keyingi o&apos;rinlarda — &quot;Buyurtmachi&quot;) RetailFlow AI platformasi xizmatlaridan foydalanish bo&apos;yicha shartnoma tuzish taklifi sifatida e&apos;lon qilinadi.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Ushbu Oferta retailflow.uz veb-saytida e&apos;lon qilingan paytdan boshlab amalga oshiriladi. Ofertaning shartlari Ijrochi tomonidan bir tomonlama o&apos;zgartirilishi mumkin va o&apos;zgarishlar e&apos;lon qilingan paytdan boshlab kuchga kiradi. Mavjud Buyurtmachilar o&apos;zgarishlar haqida elektron pochta orqali 30 kun oldindan xabardor qilinadi.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Buyurtmachi tomonidan Ofertani akseptlash (qabul qilish) Ijrochi va Buyurtmachi o&apos;rtasida xizmat ko&apos;rsatish shartnomasini tuzilganligi sifatida qaraladi.
          </p>
        </section>

        <section id="atamalar" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            2. Atamalar
          </h2>
          <ul className="list-disc space-y-1.5 pl-6 text-[15px] text-ink-700">
            <li><strong className="text-ink-900">Platforma</strong> — retailflow.uz domenida joylashgan RetailFlow AI dasturiy ta&apos;minoti va mobile ilovalar.</li>
            <li><strong className="text-ink-900">Akseptlash</strong> — Buyurtmachi tomonidan Ofertaning to&apos;liq va so&apos;zsiz qabul qilinishi (Fuqarolik kodeksining 370-moddasiga muvofiq).</li>
            <li><strong className="text-ink-900">Tarif rejasi</strong> — Beta, Pro, Enterprise — har biri imkoniyatlar va narx jihatidan farqlanuvchi xizmat to&apos;plamlari.</li>
            <li><strong className="text-ink-900">Hisobot davri</strong> — kalendar oy (1-sanadan oxirgi sanaga).</li>
            <li><strong className="text-ink-900">EHF</strong> — elektron hisob-faktura.</li>
          </ul>
        </section>

        <section id="predmet" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            3. Oferta predmeti
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Ijrochi Buyurtmachiga RetailFlow AI Platformasiga kirish huquqini taqdim etadi va quyidagi xizmatlarni ko&apos;rsatadi:
          </p>
          <ul className="mb-5 list-disc space-y-1 pl-6 text-[15px] text-ink-700">
            <li>Elektron hujjatlarni AI yordamida tahlil qilish va parslash</li>
            <li>MXIK kodlarini Soliq.uz katalogi bilan validatsiya qilish</li>
            <li>Didox EDO bilan integratsiya va webhook qabul qilish</li>
            <li>Ombor qoldiqlari va aylanmasini hisobga olish</li>
            <li>Multi-tenant distribyutor portal (Pro va Enterprise tarif rejalari uchun)</li>
            <li>Mobile ilova (iOS va Android)</li>
            <li>Texnik qo&apos;llab-quvvatlash</li>
          </ul>
          <p className="mb-3 text-[16px] font-semibold text-ink-900">3.1. Tarif rejalari</p>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-[14px]">
              <thead className="bg-ink-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-ink-900">Tarif</th>
                  <th className="px-4 py-2 text-left font-semibold text-ink-900">Narx (oyiga)</th>
                  <th className="px-4 py-2 text-left font-semibold text-ink-900">Foydalanuvchilar</th>
                  <th className="px-4 py-2 text-left font-semibold text-ink-900">Hujjat / oy</th>
                </tr>
              </thead>
              <tbody className="text-ink-700">
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-semibold">Beta</td>
                  <td className="px-4 py-2 font-mono text-emerald-700 dark:text-emerald-300">Bepul (6 oy)</td>
                  <td className="px-4 py-2 font-mono">5 gacha</td>
                  <td className="px-4 py-2 font-mono">Cheksiz</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-semibold">Pro</td>
                  <td className="px-4 py-2 font-mono">299,000 so&apos;m</td>
                  <td className="px-4 py-2 font-mono">Cheksiz</td>
                  <td className="px-4 py-2 font-mono">Cheksiz</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-semibold">Enterprise</td>
                  <td className="px-4 py-2 font-mono">Kelishuv</td>
                  <td className="px-4 py-2 font-mono">Cheksiz</td>
                  <td className="px-4 py-2 font-mono">Cheksiz + SLA</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="huquqlar" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            4. Tomonlarning huquq va majburiyatlari
          </h2>
          <p className="mb-2 text-[16px] font-semibold text-ink-900">4.1. Ijrochi:</p>
          <ul className="mb-4 list-disc space-y-1 pl-6 text-[15px] text-ink-700">
            <li>Platformaning uzluksiz ishlashini ta&apos;minlaydi (SLA — 99.5%)</li>
            <li>Buyurtmachi ma&apos;lumotlarini Maxfiylik siyosatiga muvofiq himoya qiladi</li>
            <li>Texnik qo&apos;llab-quvvatlashni ish kunlari soat 09:00–18:00 oralig&apos;ida taqdim etadi</li>
            <li>Hisobot davri yakuniga ko&apos;ra EHF Didox tizimi orqali avtomatik yuboradi</li>
          </ul>
          <p className="mb-2 text-[16px] font-semibold text-ink-900">4.2. Buyurtmachi:</p>
          <ul className="list-disc space-y-1 pl-6 text-[15px] text-ink-700">
            <li>Tarif rejasiga muvofiq to&apos;lovni o&apos;z vaqtida amalga oshiradi</li>
            <li>Hisob ma&apos;lumotlarini haqiqiy va dolzarb holatda saqlaydi</li>
            <li>Platformani qonun doirasida ishlatadi va xavfsizlik talablariga rioya qiladi</li>
            <li>Foydalanish shartlarini (retailflow.uz/shartlar) qabul qiladi va ularga rioya qiladi</li>
          </ul>
        </section>

        <section id="narx" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            5. Xizmat narxi va to&apos;lov tartibi
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Xizmat narxi 3.1-bandda ko&apos;rsatilgan tarif rejalariga muvofiq belgilanadi. Barcha narxlar O&apos;zbekiston Respublikasi milliy valyutasi — so&apos;mda va QQS bilan ko&apos;rsatilgan.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            <strong className="text-ink-900">Beta tarif rejasi:</strong> Akseptlash sanasidan boshlab 6 (olti) kalendar oy davomida bepul. 6 oy o&apos;tgach Buyurtmachi avtomatik ravishda Pro tarif rejasiga o&apos;tkaziladi (qarorga binoan). Buyurtmachi 7 kun oldin ogohlantirilib, agar rozi bo&apos;lmasa, hisobni to&apos;xtatish huquqiga ega.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            <strong className="text-ink-900">Pro tarif rejasi:</strong> 299,000 (ikki yuz to&apos;qson to&apos;qqiz ming) so&apos;m oyiga. To&apos;lov oldindan, kalendar oyning 5-sanasigacha amalga oshiriladi. To&apos;lov usullari: bank o&apos;tkazmasi, Click, Payme, Uzcard, HUMO.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            <strong className="text-ink-900">Enterprise tarif rejasi:</strong> narx individual shartnoma asosida belgilanadi. Aloqa: <span className="font-mono text-navy-700 dark:text-navy-300">sales@retailflow.uz</span>.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            EHF har bir hisobot davri yakuniga ko&apos;ra Didox tizimi orqali Buyurtmachiga avtomatik yuboriladi. Buyurtmachi EHF ni qabul qilishni 10 ish kuni ichida tasdiqlashi shart.
          </p>
        </section>

        <section id="akseptlash" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            6. Akseptlash tartibi
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Buyurtmachi Ofertani quyidagi harakatlardan birini bajarish orqali akseptlaydi:
          </p>
          <ul className="mb-3 list-disc space-y-1 pl-6 text-[15px] text-ink-700">
            <li>retailflow.uz da ro&apos;yxatdan o&apos;tish va &quot;Ofertaga roziman&quot; tugmasini bosish</li>
            <li>Birinchi to&apos;lovni amalga oshirish</li>
            <li>Platformadan foydalanishni boshlash (kirish, hujjat yuklash, MXIK validatsiya)</li>
          </ul>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Akseptlash paytidan boshlab Buyurtmachi va Ijrochi o&apos;rtasida xizmat ko&apos;rsatish shartnomasi tuzilgan hisoblanadi va u Ofertada belgilangan shartlarga muvofiq amal qiladi.
          </p>
        </section>

        <section id="masuliyat" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            7. Mas&apos;uliyat
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Tomonlar o&apos;z majburiyatlarini bajarmaganliklari yoki tegishli darajada bajarmaganliklari uchun O&apos;zbekiston Respublikasi qonunchiligiga muvofiq mas&apos;uliyat ko&apos;tarishadi.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Buyurtmachi to&apos;lovni 30 kalendar kundan ortiq kechiktirgan taqdirda Ijrochi har kun uchun 0.1% miqdorida penya undirish huquqiga ega, lekin umumiy summaning 10% dan oshmaydi.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Ijrochining umumiy mas&apos;uliyati har qanday holatda Buyurtmachi tomonidan oxirgi 12 oy davomida to&apos;langan summadan oshmaydi. AI tavsiyalari va MXIK kodlari tanlovi natijasida yuzaga keladigan soliq oqibatlari uchun Ijrochi javobgar emas.
          </p>
        </section>

        <section id="force-majeure" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            8. Force majeure
          </h2>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Tomonlar fors-major holatlari (tabiiy ofatlar, urush, davlat organlari qarorlari, internetning umumdavlat darajasida uzilishi, uchinchi tomon kritik xizmatlarining ishlamasligi — Soliq.uz, Didox) tufayli majburiyatlarini bajara olmagan taqdirda mas&apos;uliyatdan ozod qilinadi. Bunday holatlar 30 kundan ortiq davom etsa, har bir tomon shartnomani bekor qilish huquqiga ega.
          </p>
        </section>

        <section id="maxfiylik" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            9. Maxfiylik
          </h2>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Tomonlar ushbu Oferta doirasida olgan barcha tijorat va texnik ma&apos;lumotlarni maxfiy deb hisoblaydi. Buyurtmachining shaxsiy ma&apos;lumotlari Ijrochi tomonidan retailflow.uz/maxfiylik sahifasida e&apos;lon qilingan Maxfiylik siyosatiga muvofiq qayta ishlanadi. Maxfiylik majburiyati shartnoma bekor qilinganidan keyin ham 5 yil davomida amal qiladi.
          </p>
        </section>

        <section id="muddat" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            10. Hujjatning amal qilish muddati
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Ushbu Oferta retailflow.uz veb-saytida e&apos;lon qilingan paytdan boshlab kuchga kiradi va Ijrochi tomonidan bekor qilinmaguncha amal qiladi.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Buyurtmachi va Ijrochi o&apos;rtasidagi shartnoma akseptlash paytidan boshlab kuchga kiradi va Buyurtmachi hisobni o&apos;chirgan yoki Ijrochi xizmatni Shartlarga muvofiq to&apos;xtatgan paytda tugaydi.
          </p>
        </section>

        <section id="rekvizitlar" className="mb-2">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            11. Rekvizitlar
          </h2>
          <div className="rounded-md border border-border bg-surface-card p-5">
            <div className="space-y-2 text-[14px]">
              <div className="text-[15px] font-bold text-ink-900">
                &quot;Karimov&quot; mas&apos;uliyati cheklangan jamiyati
              </div>
              <div className="grid gap-y-1.5 sm:grid-cols-[160px_1fr]">
                <span className="text-ink-500">STIR:</span>
                <span className="font-mono text-ink-900">307 845 921</span>

                <span className="text-ink-500">Hisob raqami:</span>
                <span className="font-mono text-ink-900">2020 8000 7045 8129 3001</span>

                <span className="text-ink-500">Bank:</span>
                <span className="text-ink-900">&quot;Asakabank&quot; ATB, Toshkent filiali</span>

                <span className="text-ink-500">MFO:</span>
                <span className="font-mono text-ink-900">00420</span>

                <span className="text-ink-500">OKED:</span>
                <span className="font-mono text-ink-900">62010 — kompyuter dasturlashtirish</span>

                <span className="text-ink-500">Yuridik manzil:</span>
                <span className="text-ink-900">100096, Toshkent shahri, Chilonzor tumani, Bunyodkor ko&apos;chasi 1A, 4-qavat</span>

                <span className="text-ink-500">Direktor:</span>
                <span className="text-ink-900">Tursunov Asror Ravshanovich</span>

                <span className="text-ink-500">Telefon:</span>
                <span className="font-mono text-ink-900">+998 78 555 00 00</span>

                <span className="text-ink-500">Email:</span>
                <span className="font-mono text-navy-700 dark:text-navy-300">legal@retailflow.uz</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
