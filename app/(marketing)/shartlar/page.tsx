import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foydalanish shartlari · RetailFlow AI",
  description:
    "RetailFlow AI xizmatidan foydalanish qoidalari va shartlari.",
};

const sections = [
  { id: "tomonlar", label: "Tomonlar va atamalar" },
  { id: "predmet", label: "Xizmatning predmeti" },
  { id: "hisob", label: "Hisob yaratish va akkaunt xavfsizligi" },
  { id: "majburiyatlar-fk", label: "Foydalanuvchi majburiyatlari" },
  { id: "majburiyatlar-xk", label: "Xizmat ko'rsatuvchining majburiyatlari" },
  { id: "intellektual", label: "Intellektual mulk" },
  { id: "sla", label: "SLA va kafolatlar" },
  { id: "tolovlar", label: "To'lovlar va qaytarish" },
  { id: "toxtatish", label: "Hisobni to'xtatish va o'chirish" },
  { id: "masuliyat", label: "Mas'uliyatni cheklash" },
  { id: "nizolar", label: "Nizolarni hal qilish" },
  { id: "yakuniy", label: "Yakuniy qoidalar" },
];

export default function ShartlarPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
          Huquqiy hujjat · Oxirgi yangilanish: 15.05.2026
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-ink-900">
          Foydalanish shartlari
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-ink-600">
          RetailFlow AI xizmatidan foydalanish qoidalari. Hisob yaratish orqali siz ushbu shartlarning to&apos;liq matnini o&apos;qib, tushunib va qabul qilganingizni tasdiqlaysiz.
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
        <section id="tomonlar" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            1. Tomonlar va atamalar
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Ushbu Foydalanish shartlari (keyingi o&apos;rinlarda — &quot;Shartlar&quot;) bir tomondan &quot;Karimov&quot; mas&apos;uliyati cheklangan jamiyati (keyingi o&apos;rinlarda — &quot;Xizmat ko&apos;rsatuvchi&quot; yoki &quot;RetailFlow AI&quot;) va ikkinchi tomondan platformadan foydalanuvchi yuridik shaxs (keyingi o&apos;rinlarda — &quot;Foydalanuvchi&quot;) o&apos;rtasidagi munosabatlarni tartibga soladi.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Ushbu hujjatda quyidagi atamalar ishlatiladi:
          </p>
          <ul className="list-disc space-y-1 pl-6 text-[15px] text-ink-700">
            <li><strong className="text-ink-900">Platforma</strong> — RetailFlow AI veb-saytida (retailflow.uz) va mobile ilovalarda joylashgan barcha xizmatlar majmuasi.</li>
            <li><strong className="text-ink-900">Hisob</strong> — Foydalanuvchi tomonidan ro&apos;yxatdan o&apos;tilgan korxona uchun yaratilgan profil.</li>
            <li><strong className="text-ink-900">Kontent</strong> — Foydalanuvchi tomonidan platformaga yuklangan hujjatlar, mahsulot ma&apos;lumotlari, ombor qoldiqlari va boshqa ma&apos;lumotlar.</li>
            <li><strong className="text-ink-900">Tarif rejasi</strong> — Beta, Pro yoki Enterprise — har biri o&apos;ziga xos imkoniyatlar va narxlar majmuasiga ega obuna turi.</li>
          </ul>
        </section>

        <section id="predmet" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            2. Xizmatning predmeti
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Xizmat ko&apos;rsatuvchi Foydalanuvchiga RetailFlow AI platformasi orqali quyidagi xizmatlarni taklif qiladi: elektron hujjatlarni AI yordamida tahlil qilish, MXIK kodlarini avtomatik tanlash va validatsiya qilish, ombor qoldiqlarini hisobga olish, Soliq.uz va Didox tizimlari bilan integratsiya, real-time hisobotlar va analitika, ko&apos;p foydalanuvchili kirish boshqaruvi.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Xizmatlar SaaS (Software-as-a-Service) modelida taqdim etiladi: Foydalanuvchi dasturiy ta&apos;minotni o&apos;rnatish shart emas, faqat brauzer yoki mobil ilova orqali kirib foydalanadi. Platformaning to&apos;liq funksional ro&apos;yxati va ularning Tarif rejalari bo&apos;yicha taqsimoti retailflow.uz/narxlar sahifasida e&apos;lon qilingan.
          </p>
        </section>

        <section id="hisob" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            3. Hisob yaratish va akkaunt xavfsizligi
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Hisob yaratish uchun Foydalanuvchi haqiqiy STIR, korxona nomi, telefon raqami va elektron pochta manzilini taqdim etishi shart. Bir korxonaga bir nechta foydalanuvchi qo&apos;shilishi mumkin, lekin har bir foydalanuvchi alohida login va parolga ega bo&apos;ladi.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Foydalanuvchi quyidagilarga rozilik beradi:
          </p>
          <ul className="mb-3 list-disc space-y-1 pl-6 text-[15px] text-ink-700">
            <li>Hisob ma&apos;lumotlarining haqiqiyligi va dolzarbligi uchun shaxsan javobgar bo&apos;lish</li>
            <li>Login va parolni uchinchi shaxslarga oshkor qilmaslik</li>
            <li>Administrator va Buxgalter rollari uchun ikki bosqichli autentifikatsiyani (2FA) yoqish</li>
            <li>Ruxsatsiz kirish gumon qilingan taqdirda darhol Xizmat ko&apos;rsatuvchini xabardor qilish</li>
          </ul>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Foydalanuvchi ma&apos;lumotlarining ishonchsizligi yoki noqonuniy foydalanish natijasida yuzaga keladigan oqibatlar uchun Xizmat ko&apos;rsatuvchi mas&apos;ul emas.
          </p>
        </section>

        <section id="majburiyatlar-fk" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            4. Foydalanuvchi majburiyatlari
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Platformadan foydalanuvchi quyidagilarni o&apos;z zimmasiga oladi:
          </p>
          <ul className="list-disc space-y-1.5 pl-6 text-[15px] text-ink-700">
            <li>O&apos;zbekiston Respublikasi qonunchiligi doirasida ish yuritish va platformani noqonuniy maqsadlarda ishlatmaslik</li>
            <li>Faqat o&apos;ziga qonuniy ravishda tegishli bo&apos;lgan hujjatlarni va ma&apos;lumotlarni yuklash</li>
            <li>AI tomonidan taqdim etilgan tavsiyalarni operator sifatida tekshirish — AI natijalari yakuniy qaror sifatida qabul qilinmaydi</li>
            <li>Platforma xavfsizligiga zarar yetkazadigan harakatlar (DDoS, reverse engineering, ruxsatsiz API so&apos;rovlari) qilmaslik</li>
            <li>O&apos;rnatilgan kvotalar va ratelimit chegaralarini hurmat qilish</li>
            <li>Tarif rejasi shartlariga muvofiq vaqtida to&apos;lov amalga oshirish</li>
            <li>Aloqa ma&apos;lumotlarini (telefon, email) dolzarb holatda saqlash</li>
          </ul>
        </section>

        <section id="majburiyatlar-xk" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            5. Xizmat ko&apos;rsatuvchining majburiyatlari
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Xizmat ko&apos;rsatuvchi quyidagilarni o&apos;z zimmasiga oladi:
          </p>
          <ul className="list-disc space-y-1.5 pl-6 text-[15px] text-ink-700">
            <li>Platformaning uzluksiz ishlashini ta&apos;minlash (SLA — 7-bo&apos;limga qarang)</li>
            <li>Foydalanuvchi ma&apos;lumotlarini Maxfiylik siyosatiga muvofiq himoya qilish</li>
            <li>Texnik qo&apos;llab-quvvatlash xizmatini ish kunlari 09:00 dan 18:00 gacha (Asia/Tashkent) taqdim etish</li>
            <li>Platformaga muhim o&apos;zgarishlar (yangi versiya, narx, funksiya o&apos;chirilishi) haqida kamida 30 kun oldindan xabar berish</li>
            <li>Foydalanuvchi yozma talabiga binoan ma&apos;lumotlarni eksport qilish imkoniyatini taqdim etish</li>
            <li>Xizmat to&apos;xtagan taqdirda barcha foydalanuvchi ma&apos;lumotlarini kamida 90 kun davomida o&apos;chirmaslik va ularni yuklab olishni ta&apos;minlash</li>
          </ul>
        </section>

        <section id="intellektual" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            6. Intellektual mulk
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            RetailFlow AI platformasi, uning dizayni, manba kodi, brendi, logotipi va barcha hujjatlari Xizmat ko&apos;rsatuvchining intellektual mulkidir va O&apos;zbekiston Respublikasi va xalqaro mualliflik huquqi qonunlari bilan himoyalangan.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Foydalanuvchi tomonidan yuklangan kontent (hujjatlar, mahsulot ro&apos;yxatlari, ombor qoldiqlari) Foydalanuvchining mulki bo&apos;lib qoladi. Xizmat ko&apos;rsatuvchi bu kontentni faqat xizmatni taqdim etish maqsadida ishlatish huquqiga ega.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Anonimlashtirilgan agregatsiyalangan statistika (masalan, &quot;87% MXIK to&apos;g&apos;ri tanlangan&quot;) Xizmat ko&apos;rsatuvchi tomonidan mahsulot rivojlanishi va marketing maqsadlarida ishlatilishi mumkin.
          </p>
        </section>

        <section id="sla" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            7. SLA va kafolatlar
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Xizmat ko&apos;rsatuvchi quyidagi xizmat darajasini (Service Level Agreement) kafolatlaydi:
          </p>
          <div className="mb-3 rounded-md border border-border bg-surface-card p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">99.5%</div>
                <div className="text-[12px] uppercase tracking-wider text-ink-500">Uptime (oylik)</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-navy-700 dark:text-navy-300">&lt; 4 soat</div>
                <div className="text-[12px] uppercase tracking-wider text-ink-500">Kritik incident javob</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-navy-700 dark:text-navy-300">&lt; 24 soat</div>
                <div className="text-[12px] uppercase tracking-wider text-ink-500">Oddiy so&apos;rov javob</div>
              </div>
            </div>
          </div>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Uptime hisoblashda quyidagilar istisno qilinadi: rejalashtirilgan profilaktika (oldindan 7 kun e&apos;lon qilingan), uchinchi tomon xizmatlarining ishlamasligi (Soliq.uz, Didox), Foydalanuvchi infratuzilmasi nosozligi (internet, qurilma), forc majeure.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Agar oylik uptime 99.5% dan past bo&apos;lsa, Foydalanuvchi keyingi oylik to&apos;lovga nisbatan kompensatsiya olish huquqiga ega: 99.0–99.49% — 10% chegirma, 95.0–98.99% — 25% chegirma, 95.0% dan past — 50% chegirma.
          </p>
        </section>

        <section id="tolovlar" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            8. To&apos;lovlar va qaytarish
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Beta tarif rejasi birinchi 6 oy uchun bepul taqdim etiladi. Pro tarif rejasi — 299,000 so&apos;m/oy. Enterprise tarif rejasi narxlari individual kelishuv asosida belgilanadi. Barcha narxlar QQS bilan ko&apos;rsatilgan.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            To&apos;lovlar bank o&apos;tkazmasi orqali (yuridik shaxslar uchun), Click, Payme, Uzcard yoki HUMO kartalari orqali amalga oshiriladi. Hisob-faktura va EHF Didox orqali avtomatik yuboriladi.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Pulni qaytarish siyosati: birinchi 14 kun ichida sababsiz to&apos;liq qaytarish kafolatlanadi. 14 kundan keyin xizmat ko&apos;rsatilmagan davr uchun proporsional qaytarish amalga oshiriladi.
          </p>
        </section>

        <section id="toxtatish" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            9. Hisobni to&apos;xtatish va o&apos;chirish
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Foydalanuvchi hisobni istalgan vaqtda Sozlamalar &rarr; Hisobni o&apos;chirish bo&apos;limidan to&apos;xtatishi mumkin. Hisob to&apos;xtatilgandan keyin ma&apos;lumotlar 90 kun davomida tiklash uchun saqlanadi, keyin esa Maxfiylik siyosatiga muvofiq arxivlanadi yoki o&apos;chiriladi.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Xizmat ko&apos;rsatuvchi quyidagi hollarda hisobni bir tomonlama to&apos;xtatish huquqiga ega: Shartlarni qo&apos;pol buzish, qonunbuzarlik aniqlanishi, to&apos;lovni 30 kundan ortiq kechiktirish, platforma xavfsizligiga tahdid solish. Bunday hollarda Foydalanuvchi 7 kun oldindan elektron pochta orqali xabardor qilinadi.
          </p>
        </section>

        <section id="masuliyat" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            10. Mas&apos;uliyatni cheklash
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Xizmat ko&apos;rsatuvchining umumiy mas&apos;uliyati har qanday holatda Foydalanuvchi tomonidan oxirgi 12 oy davomida to&apos;langan summadan oshib ketmaydi. Bilvosita, tasodifiy, oqibatli yoki jazo zararlari (foyda yo&apos;qotilishi, ma&apos;lumotlar yo&apos;qotilishi, biznes uzilishi) uchun mas&apos;uliyat ko&apos;tarmaydi.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            AI tavsiyalari, MXIK kodlari yoki boshqa avtomatik natijalardan foydalanish qarori — Foydalanuvchining shaxsiy mas&apos;uliyatidir. Operator har bir AI natijasini ko&apos;rib chiqishi va tasdiqlashi kerak. Soliq jarimalari, MXIK kodi noto&apos;g&apos;ri tanlanishi va boshqa qonuniy oqibatlar uchun Xizmat ko&apos;rsatuvchi javobgar emas.
          </p>
        </section>

        <section id="nizolar" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            11. Nizolarni hal qilish
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Tomonlar o&apos;rtasidagi nizolar dastlab muzokaralar yo&apos;li bilan hal qilinadi. Yozma da&apos;voga javob berish muddati 30 kalendar kun.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Muzokaralar natija bermagan taqdirda nizo O&apos;zbekiston Respublikasi qonunchiligi bo&apos;yicha Toshkent shahar Iqtisodiy sudida ko&apos;rib chiqiladi. Ushbu Shartlarga nisbatan O&apos;zbekiston Respublikasi moddiy huquqi qo&apos;llaniladi.
          </p>
        </section>

        <section id="yakuniy" className="mb-2">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            12. Yakuniy qoidalar
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Agar ushbu Shartlarning biror bandi yaroqsiz deb topilsa, qolgan bandlar amal qilishda davom etadi. Shartlarning O&apos;zbek tilidagi varianti asosiy hisoblanadi. Rus va Ingliz tarjimalari ma&apos;lumot uchungina taqdim etiladi.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Bog&apos;lanish: <span className="font-mono text-navy-700 dark:text-navy-300">legal@retailflow.uz</span> · <span className="font-mono">+998 78 555 00 00</span> · Toshkent shahri, Chilonzor tumani, Bunyodkor ko&apos;chasi 1A.
          </p>
        </section>
      </div>
    </article>
  );
}
