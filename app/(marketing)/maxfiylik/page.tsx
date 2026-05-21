import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati · RetailFlow AI",
  description:
    "RetailFlow AI sizning shaxsiy ma'lumotlaringizni qanday yig'adi, ishlatadi va himoya qiladi.",
};

const sections = [
  { id: "umumiy", label: "Umumiy qoidalar" },
  { id: "yigiladigan", label: "Yig'iladigan ma'lumotlar" },
  { id: "maqsadlar", label: "Ma'lumotlardan foydalanish maqsadlari" },
  { id: "ulashish", label: "Uchinchi shaxslar bilan ulashish" },
  { id: "saqlash", label: "Ma'lumotlarni saqlash muddati" },
  { id: "huquqlar", label: "Sizning huquqlaringiz" },
  { id: "xavfsizlik", label: "Xavfsizlik choralari" },
  { id: "cookies", label: "Cookies va trekerlar" },
  { id: "bolalar", label: "Bolalar maxfiyligi" },
  { id: "ozgarishlar", label: "Siyosat o'zgarishlari" },
  { id: "boglanish", label: "Bog'lanish" },
];

export default function MaxfiylikPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-700 dark:text-navy-300">
          Huquqiy hujjat · Oxirgi yangilanish: 15.05.2026
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-ink-900">
          Maxfiylik siyosati
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-ink-600">
          RetailFlow AI sizning shaxsiy ma&apos;lumotlaringizni qanday ishlatadi va himoya qiladi. Ushbu siyosat O&apos;zbekiston Respublikasining &quot;Shaxsiy ma&apos;lumotlar to&apos;g&apos;risida&quot;gi 2019-yil 2-iyuldagi qonuni asosida ishlab chiqilgan.
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
            1. Umumiy qoidalar
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Ushbu Maxfiylik siyosati &quot;Karimov&quot; mas&apos;uliyati cheklangan jamiyati (keyingi o&apos;rinlarda — &quot;RetailFlow AI&quot;, &quot;biz&quot;, &quot;bizning&quot;) tomonidan foydalanuvchilarning shaxsiy ma&apos;lumotlarini qayta ishlash tartibini belgilaydi. Foydalanuvchi platforma xizmatlaridan foydalanish orqali ushbu siyosatga rozilik bildiradi.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            RetailFlow AI — bu sun&apos;iy intellektga asoslangan tovar qabul qilish va hujjat avtomatlashtirish platformasi. Platforma Didox elektron hujjatlarini parslaydi, MXIK kodlarini Soliq.uz katalogi bilan tasdiqlaydi, do&apos;kon ombori bilan integratsiyalashadi. Bizning maqsadli auditoriyamiz — O&apos;zbekiston Respublikasidagi chakana savdo korxonalari va distribyutorlar.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Ushbu hujjat sizga qanday ma&apos;lumotlar yig&apos;ilishini, ular qanday ishlatilishini va himoya qilinishini, hamda ma&apos;lumotlaringizga nisbatan qanday huquqlarga ega ekanligingizni tushuntiradi. Hujjat aniq, tushunarli va tartibga solinadigan tilda yozilgan.
          </p>
        </section>

        <section id="yigiladigan" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            2. Yig&apos;iladigan ma&apos;lumotlar
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Biz quyidagi toifadagi ma&apos;lumotlarni yig&apos;amiz va qayta ishlaymiz:
          </p>
          <p className="mb-2 text-[16px] font-semibold text-ink-900">2.1. Hisob ma&apos;lumotlari</p>
          <ul className="mb-3 list-disc space-y-1 pl-6 text-[15px] text-ink-700">
            <li>Korxona STIR (soliq to&apos;lovchining identifikatsion raqami)</li>
            <li>Korxona nomi va tashkiliy-huquqiy shakli</li>
            <li>Aloqa shaxsining FIO si, lavozimi</li>
            <li>Telefon raqami, elektron pochta manzili</li>
            <li>Yuridik va pochta manzili</li>
          </ul>
          <p className="mb-2 text-[16px] font-semibold text-ink-900">2.2. Foydalanish ma&apos;lumotlari</p>
          <ul className="mb-3 list-disc space-y-1 pl-6 text-[15px] text-ink-700">
            <li>Tizim ichidagi faollik (kirish vaqti, ko&apos;rilgan sahifalar, bajarilgan amallar)</li>
            <li>Yuklangan yoki qabul qilingan elektron hujjatlar va ularning tarkibi</li>
            <li>Mahsulot nomenklaturasi, MXIK kodlari, ombor qoldiqlari</li>
            <li>AI tahlil natijalari va operator tasdiqlari</li>
          </ul>
          <p className="mb-2 text-[16px] font-semibold text-ink-900">2.3. Texnik ma&apos;lumotlar</p>
          <ul className="list-disc space-y-1 pl-6 text-[15px] text-ink-700">
            <li>IP-manzil va geografik joylashuv (shahar darajasida)</li>
            <li>Brauzer turi va versiyasi, qurilma identifikatori</li>
            <li>Operatsion tizim, ekran o&apos;lchami</li>
            <li>Tizim xatolari va diagnostika loglari</li>
          </ul>
        </section>

        <section id="maqsadlar" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            3. Ma&apos;lumotlardan foydalanish maqsadlari
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Yig&apos;ilgan ma&apos;lumotlardan faqat quyidagi aniq belgilangan maqsadlarda foydalanamiz:
          </p>
          <ul className="mb-3 list-disc space-y-2 pl-6 text-[15px] text-ink-700">
            <li><strong className="text-ink-900">Xizmat ko&apos;rsatish:</strong> hisobni boshqarish, hujjatlarni qayta ishlash, ombor sinxronizatsiyasi, hisobotlar yaratish.</li>
            <li><strong className="text-ink-900">AI tahlil:</strong> MXIK kodlarini tavsiya qilish, mahsulot nomenklaturasini moslashtirish, anomal yozuvlarni aniqlash. AI modelimiz ma&apos;lumotlaringiz ustida o&apos;qitilmaydi — biz faqat mavjud OpenAI / GPT-4o tizimini foydalanuvchi sessiyasi davomida ishlatamiz.</li>
            <li><strong className="text-ink-900">Qo&apos;llab-quvvatlash:</strong> texnik muammolarni hal qilish, foydalanuvchi savollariga javob berish, xizmat sifatini oshirish.</li>
            <li><strong className="text-ink-900">Qonuniy talab:</strong> O&apos;zbekiston Respublikasi qonunchiligi talablariga muvofiq audit loglarini saqlash, soliq tekshiruvi ehtiyojlari uchun ma&apos;lumotlarni taqdim etish.</li>
            <li><strong className="text-ink-900">Mahsulot rivojlanishi:</strong> anonimlashtirilgan agregatsiyalangan statistika asosida platforma funksionalini takomillashtirish.</li>
          </ul>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Sizning shaxsiy ma&apos;lumotlaringizdan marketing maqsadlarida foydalanish faqat aniq roziligingiz asosida amalga oshiriladi. Roziligingizni istalgan vaqtda bekor qilishingiz mumkin.
          </p>
        </section>

        <section id="ulashish" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            4. Uchinchi shaxslar bilan ulashish
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Biz sizning shaxsiy ma&apos;lumotlaringizni quyidagi cheklangan toifadagi uchinchi shaxslar bilan ulashamiz:
          </p>
          <ul className="mb-3 list-disc space-y-2 pl-6 text-[15px] text-ink-700">
            <li><strong className="text-ink-900">Soliq.uz (majburiy):</strong> MXIK kodi validatsiya so&apos;rovlari va EHF risk scoring tizimi bilan integratsiya doirasida — bu O&apos;zbekiston Respublikasi qonunchiligi talabi.</li>
            <li><strong className="text-ink-900">Didox EDO (foydalanuvchi roziligi bilan):</strong> elektron hujjatlarni qabul qilish va yuborish uchun siz oferta tuzganingizdan keyin webhook va API integratsiyasi orqali.</li>
            <li><strong className="text-ink-900">OpenAI (anonimlashtirilgan):</strong> matn tahlili va MXIK tavsiyalari uchun. STIR, telefon, FIO kabi shaxsiy identifikatorlar so&apos;rov tarkibidan olib tashlanadi.</li>
            <li><strong className="text-ink-900">Infratuzilma xizmatchilari:</strong> Cloudflare (DDoS himoyasi, CDN), Vercel (web hosting), Amazon Web Services (ma&apos;lumotlar bazasi). Bu xizmatchilar bizning ma&apos;lumotlarni qayta ishlash shartnomalarimiz bo&apos;yicha ishlaydi.</li>
          </ul>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Biz sizning ma&apos;lumotlaringizni sotmaymiz, reklama beruvchilarga uzatmaymiz va boshqa savdo maqsadlarida ulashmaymiz. Sud qarori yoki vakolatli davlat organi talabiga binoan ma&apos;lumot taqdim etish hollari bundan mustasno.
          </p>
        </section>

        <section id="saqlash" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            5. Ma&apos;lumotlarni saqlash muddati
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Shaxsiy ma&apos;lumotlaringiz hisobingiz aktiv bo&apos;lgan davr mobaynida saqlanadi. Hisob to&apos;xtatilganidan keyin O&apos;zbekiston Respublikasi Soliq kodeksi talabiga muvofiq buxgalteriya hujjatlari va ularga aloqador ma&apos;lumotlar yana <strong>5 (besh) yil</strong> davomida saqlanadi.
          </p>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            5 yillik muddat o&apos;tgach, ma&apos;lumotlar avtomatik ravishda anonimlashtiriladi (statistika uchun) yoki to&apos;liq o&apos;chiriladi. Audit log yozuvlari va sertifikatlangan elektron hujjatlar qonuniy talab muddati doirasida saqlab qolinadi.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Texnik loglar (kirish, xatolar, diagnostika) odatda 90 kun davomida saqlanadi va keyin avtomatik o&apos;chiriladi.
          </p>
        </section>

        <section id="huquqlar" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            6. Sizning huquqlaringiz
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            O&apos;zbekiston Respublikasining &quot;Shaxsiy ma&apos;lumotlar to&apos;g&apos;risida&quot;gi qonuniga muvofiq, siz quyidagi huquqlarga egasiz:
          </p>
          <ul className="mb-3 list-disc space-y-2 pl-6 text-[15px] text-ink-700">
            <li><strong className="text-ink-900">Ko&apos;rish huquqi:</strong> qaysi ma&apos;lumotlaringiz saqlanayotganini va ular qanday ishlatilayotganini bilish.</li>
            <li><strong className="text-ink-900">Eksport huquqi:</strong> o&apos;z ma&apos;lumotlaringizni mashina o&apos;qiy oladigan formatda (JSON, CSV) yuklab olish — Sozlamalar &rarr; Ma&apos;lumotlarni eksport qilish bo&apos;limidan.</li>
            <li><strong className="text-ink-900">To&apos;g&apos;rilash huquqi:</strong> noto&apos;g&apos;ri yoki eskirgan ma&apos;lumotlarni o&apos;zgartirish. Aksariyat maydonlarni o&apos;zingiz hisob sozlamalaridan tahrirlay olasiz.</li>
            <li><strong className="text-ink-900">O&apos;chirish huquqi:</strong> hisobni va u bilan bog&apos;liq ma&apos;lumotlarni o&apos;chirish — faqat aktiv soliq davri tugagandan keyin va qonuniy saqlash muddati doirasida. Talab privacy@retailflow.uz manziliga yuboriladi.</li>
            <li><strong className="text-ink-900">Cheklash huquqi:</strong> ma&apos;lum bir maqsadda ma&apos;lumotlarni qayta ishlashga e&apos;tiroz bildirish (masalan, marketing).</li>
          </ul>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Talabingiz 30 kalendar kun ichida ko&apos;rib chiqiladi va sizga yozma ravishda javob beriladi.
          </p>
        </section>

        <section id="xavfsizlik" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            7. Xavfsizlik choralari
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Ma&apos;lumotlaringizni himoya qilish uchun biz quyidagi texnik va tashkiliy choralarni ko&apos;ramiz:
          </p>
          <ul className="mb-3 list-disc space-y-1 pl-6 text-[15px] text-ink-700">
            <li>Trafik shifrlash: <span className="font-mono">TLS 1.3</span> barcha ulanishlar uchun</li>
            <li>Saqlash shifrlash: <span className="font-mono">AES-256</span> ma&apos;lumotlar bazasi va zaxira nusxalari uchun</li>
            <li>Rolga asoslangan kirish boshqaruvi (RBAC) — 7 ta rol darajasi</li>
            <li>Ikki bosqichli autentifikatsiya (2FA) — barcha boshqaruvchi rollar uchun majburiy</li>
            <li>Immutable audit log — har bir amal yozib olinadi va o&apos;zgartirib bo&apos;lmaydi</li>
            <li>Avtomatik zaxira nusxalash kuniga 4 marta, geografik tarqalgan saqlash</li>
            <li>Doimiy zaiflik skanerlash va yillik xavfsizlik auditi</li>
          </ul>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Xavfsizlik buzilishi yuz bersa, biz O&apos;zbekiston Respublikasi qonuniga muvofiq 72 soat ichida vakolatli organlarga va ta&apos;sirlangan foydalanuvchilarga xabar beramiz.
          </p>
        </section>

        <section id="cookies" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            8. Cookies va trekerlar
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Platforma faqat zaruriy cookies dan foydalanadi: sessiya identifikatori (kirish holatini saqlash), tanlangan til (UZ / RU / EN), tema (light / dark). Bu cookies platformaning ishlashi uchun majburiy va opt-out qilib bo&apos;lmaydi.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            Analitika cookies (ishlatish statistikasi, sahifa tezligi metrikasi) faqat sizning aniq roziligingiz bilan yoqiladi. Cookie banneridan istalgan vaqtda tanlovni o&apos;zgartirishingiz mumkin. Biz uchinchi tomon reklama trekerlarini (Google Ads, Facebook Pixel va shu kabilar) <strong>ishlatmaymiz</strong>.
          </p>
        </section>

        <section id="bolalar" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            9. Bolalar maxfiyligi
          </h2>
          <p className="text-[16px] leading-relaxed text-ink-700">
            RetailFlow AI — bu B2B platforma va u 18 yoshga to&apos;lgan, korxona vakili sifatida ish yuritish huquqiga ega bo&apos;lgan shaxslar uchun mo&apos;ljallangan. Biz bilib turib voyaga yetmaganlardan ma&apos;lumot to&apos;plamaymiz. Agar 18 yoshdan kichik foydalanuvchi tomonidan hisob ochilganligini aniqlasak, hisobni darhol o&apos;chiramiz va barcha tegishli ma&apos;lumotlarni yo&apos;q qilamiz.
          </p>
        </section>

        <section id="ozgarishlar" className="mb-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            10. Siyosat o&apos;zgarishlari
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Biz ushbu Maxfiylik siyosatini vaqti-vaqti bilan yangilashimiz mumkin. Sezilarli o&apos;zgarishlar to&apos;g&apos;risida sizga elektron pochta orqali va platforma ichidagi bildirishnoma orqali kamida <strong>30 kalendar kun</strong> oldindan xabar beramiz.
          </p>
          <p className="text-[16px] leading-relaxed text-ink-700">
            O&apos;zgarishlardan keyin platformadan foydalanishni davom ettirsangiz, yangi siyosat shartlarini qabul qilgan hisoblanasiz. Roziligingiz bo&apos;lmasa, hisobni to&apos;xtatish huquqiga egasiz.
          </p>
        </section>

        <section id="boglanish" className="mb-2">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink-900">
            11. Bog&apos;lanish
          </h2>
          <p className="mb-3 text-[16px] leading-relaxed text-ink-700">
            Maxfiylik bilan bog&apos;liq har qanday savol, talab yoki shikoyat uchun biz bilan bog&apos;laning:
          </p>
          <div className="rounded-md border border-border bg-surface-card p-5">
            <div className="space-y-2 text-[14px]">
              <div className="flex flex-wrap gap-x-2">
                <span className="font-semibold text-ink-900">Ma&apos;lumotlarni himoya qilish bo&apos;yicha mas&apos;ul shaxs:</span>
                <span className="text-ink-700">Karim Ibragimov (DPO)</span>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <span className="font-semibold text-ink-900">Email:</span>
                <span className="font-mono text-navy-700 dark:text-navy-300">privacy@retailflow.uz</span>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <span className="font-semibold text-ink-900">Telefon:</span>
                <span className="font-mono text-ink-700">+998 78 555 00 00</span>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <span className="font-semibold text-ink-900">Manzil:</span>
                <span className="text-ink-700">Toshkent shahri, Chilonzor tumani, Bunyodkor ko&apos;chasi 1A, 4-qavat</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
