/**
 * Supplier-side seed data — deterministic generation.
 *
 * Uses a fixed-seed mulberry32 RNG so reloads produce stable IDs/numbers.
 * This avoids hydration mismatches between server and client renders.
 */

import type {
  SupplierCompany,
  SupplierStore,
  OutgoingInvoice,
  OutgoingInvoiceStatus,
  OutgoingInvoiceItem,
  PaymentRecord,
  PaymentStatus,
  PaymentMethod,
  DemandSignal,
  SupplierProduct,
  SupplierProductCategory,
  IncomingOrder,
  IncomingOrderStatus,
  DeliveryRoute,
  DeliveryRouteStop,
} from "./types";

// ============================================================
// Deterministic RNG — mulberry32
// ============================================================

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(987654321);

function rand(): number {
  return rng();
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round((rand() * (max - min) + min) * factor) / factor;
}

// Date helper: returns ISO string for a date N days ago from a fixed reference date.
const NOW = new Date("2026-05-21T10:00:00Z").getTime();
const DAY_MS = 86400000;

function daysAgo(d: number, h = 0): string {
  const t = NOW - d * DAY_MS + h * 3600000;
  return new Date(t).toISOString();
}

function daysAhead(d: number): string {
  const t = NOW + d * DAY_MS;
  return new Date(t).toISOString();
}

function pad(n: number, w: number): string {
  return String(n).padStart(w, "0");
}

// ============================================================
// Supplier company (the logged-in distributor)
// ============================================================

export const SUPPLIER_ID = "sup_company_alpha";

export const seedSupplierCompany: SupplierCompany = {
  id: SUPPLIER_ID,
  name: "Alpha Distribution OOO",
  stir: "301234890",
  director: "Asror Tursunov",
  phone: "+998 78 555 11 00",
  email: "info@alpha-distribution.uz",
  address: "Toshkent, Yashnobod tumani, Mustaqillik 12",
  brandType: "exclusive",
  region: "Toshkent shahar",
  fleetSize: 23,
  warehouseAddress: "Toshkent, Sergeli tumani, Sanoat ko'chasi 5",
  createdAt: "2019-03-15T00:00:00Z",
};

// ============================================================
// 47 Supplier stores (customer network)
// ============================================================

interface StoreSpec {
  name: string;
  region: string;
  district: string;
}

// Distribution: Toshkent shahar 15, Toshkent viloyat 8, Samarqand 5,
// Buxoro 4, Andijon 4, Farg'ona 3, Namangan 3, others 5 = 47
const STORE_SPECS: StoreSpec[] = [
  // Toshkent shahar — 15
  { name: "Karimov MChJ", region: "Toshkent shahar", district: "Chilonzor" },
  { name: "Yangi Bozor", region: "Toshkent shahar", district: "Yunusobod" },
  { name: "Lazzat Market", region: "Toshkent shahar", district: "Mirzo Ulug'bek" },
  { name: "Chilonzor Market", region: "Toshkent shahar", district: "Chilonzor" },
  { name: "Sergeli Savdo", region: "Toshkent shahar", district: "Sergeli" },
  { name: "Olmazor Halol", region: "Toshkent shahar", district: "Olmazor" },
  { name: "Beruniy Plaza", region: "Toshkent shahar", district: "Shayxontohur" },
  { name: "Mirobod Savdo", region: "Toshkent shahar", district: "Mirobod" },
  { name: "Yakkasaroy Market", region: "Toshkent shahar", district: "Yakkasaroy" },
  { name: "Uchtepa Halol", region: "Toshkent shahar", district: "Uchtepa" },
  { name: "Yashnobod Savdo", region: "Toshkent shahar", district: "Yashnobod" },
  { name: "Bektemir Express", region: "Toshkent shahar", district: "Bektemir" },
  { name: "Eski Shahar Don", region: "Toshkent shahar", district: "Shayxontohur" },
  { name: "Yunusobod Plaza", region: "Toshkent shahar", district: "Yunusobod" },
  { name: "Mirzo Ulug'bek Market", region: "Toshkent shahar", district: "Mirzo Ulug'bek" },
  // Toshkent viloyat — 8
  { name: "Chirchiq Savdo", region: "Toshkent viloyat", district: "Chirchiq" },
  { name: "Angren Bozor", region: "Toshkent viloyat", district: "Angren" },
  { name: "Olmaliq Market", region: "Toshkent viloyat", district: "Olmaliq" },
  { name: "Bekobod Halol", region: "Toshkent viloyat", district: "Bekobod" },
  { name: "Yangiyo'l Savdo", region: "Toshkent viloyat", district: "Yangiyo'l" },
  { name: "Parkent Express", region: "Toshkent viloyat", district: "Parkent" },
  { name: "Qibray Market", region: "Toshkent viloyat", district: "Qibray" },
  { name: "Zangiota Plaza", region: "Toshkent viloyat", district: "Zangiota" },
  // Samarqand — 5
  { name: "Samarqand Markaziy", region: "Samarqand", district: "Samarqand shahar" },
  { name: "Registon Market", region: "Samarqand", district: "Samarqand shahar" },
  { name: "Kattaqo'rg'on Savdo", region: "Samarqand", district: "Kattaqo'rg'on" },
  { name: "Urgut Halol", region: "Samarqand", district: "Urgut" },
  { name: "Bulung'ur Bozor", region: "Samarqand", district: "Bulung'ur" },
  // Buxoro — 4
  { name: "Buxoro Markaziy", region: "Buxoro", district: "Buxoro shahar" },
  { name: "Kogon Savdo", region: "Buxoro", district: "Kogon" },
  { name: "G'ijduvon Market", region: "Buxoro", district: "G'ijduvon" },
  { name: "Vobkent Halol", region: "Buxoro", district: "Vobkent" },
  // Andijon — 4
  { name: "Andijon Bozor", region: "Andijon", district: "Andijon shahar" },
  { name: "Asaka Savdo", region: "Andijon", district: "Asaka" },
  { name: "Xonobod Market", region: "Andijon", district: "Xonobod" },
  { name: "Shahrixon Halol", region: "Andijon", district: "Shahrixon" },
  // Farg'ona — 3
  { name: "Farg'ona Markaziy", region: "Farg'ona", district: "Farg'ona shahar" },
  { name: "Qo'qon Savdo", region: "Farg'ona", district: "Qo'qon" },
  { name: "Marg'ilon Market", region: "Farg'ona", district: "Marg'ilon" },
  // Namangan — 3
  { name: "Namangan Bozor", region: "Namangan", district: "Namangan shahar" },
  { name: "Chust Savdo", region: "Namangan", district: "Chust" },
  { name: "Pop Market", region: "Namangan", district: "Pop" },
  // Others — 5
  { name: "Nukus Halol", region: "Qoraqalpog'iston", district: "Nukus" },
  { name: "Urganch Savdo", region: "Xorazm", district: "Urganch" },
  { name: "Termiz Market", region: "Surxondaryo", district: "Termiz" },
  { name: "Qarshi Plaza", region: "Qashqadaryo", district: "Qarshi" },
  { name: "Navoiy Express", region: "Navoiy", district: "Navoiy shahar" },
];

const FIRST_NAMES = [
  "Aziz",
  "Bobur",
  "Davron",
  "Eldor",
  "Farrux",
  "Jasur",
  "Kamol",
  "Mansur",
  "Nodir",
  "Otabek",
  "Rustam",
  "Sherzod",
  "Toshmat",
  "Ulug'bek",
  "Vohid",
  "Yorqin",
  "Zafar",
];
const SURNAMES = [
  "Karimov",
  "Tursunov",
  "Yusupov",
  "Toshmatov",
  "Akmalov",
  "Saidov",
  "Rahmonov",
  "Ahmedov",
  "Nazarov",
  "Mahmudov",
  "Olimov",
  "Qosimov",
  "Tashkentov",
  "Mirzayev",
];

function makeDirector(): string {
  return `${pick(SURNAMES)} ${pick(FIRST_NAMES)}`;
}

function makePhone(): string {
  const op = pick(["90", "91", "93", "94", "97", "98", "99", "33", "88", "77"]);
  const a = pad(randInt(100, 999), 3);
  const b = pad(randInt(10, 99), 2);
  const c = pad(randInt(10, 99), 2);
  return `+998 ${op} ${a} ${b} ${c}`;
}

function makeStir9(): string {
  return String(randInt(300000000, 399999999));
}

export const seedSupplierStores: SupplierStore[] = (() => {
  // Status distribution: 38 active, 6 slow, 3 inactive
  const statusPlan: SupplierStore["status"][] = [
    ...Array<SupplierStore["status"]>(38).fill("active"),
    ...Array<SupplierStore["status"]>(6).fill("slow"),
    ...Array<SupplierStore["status"]>(3).fill("inactive"),
  ];

  return STORE_SPECS.map((spec, i) => {
    const status = statusPlan[i] ?? "active";
    const lastOrderDays =
      status === "active" ? randInt(0, 6) : status === "slow" ? randInt(7, 13) : randInt(14, 60);
    const monthlyVolume = randInt(8_000_000, 180_000_000);
    const totalLifetimeVolume = monthlyVolume * randInt(5, 24) + randInt(40_000_000, 200_000_000);
    const creditLimit = randInt(5_000_000, 50_000_000);
    const outstandingBalance =
      status === "inactive" ? randInt(0, 5_000_000) : randInt(0, 15_000_000);
    // Reliability biased toward 8-9
    const reliability =
      status === "inactive"
        ? randFloat(6.5, 7.4, 1)
        : status === "slow"
        ? randFloat(7.0, 8.2, 1)
        : randFloat(7.8, 9.8, 1);

    return {
      id: `sup_store_${pad(i + 1, 3)}`,
      supplierId: SUPPLIER_ID,
      storeId: `store_${pad(i + 1, 3)}`,
      name: spec.name,
      stir: makeStir9(),
      director: makeDirector(),
      phone: makePhone(),
      region: spec.region,
      district: spec.district,
      status,
      reliabilityScore: reliability,
      monthlyVolume,
      totalLifetimeVolume,
      lastOrderAt: daysAgo(lastOrderDays, randInt(0, 23)),
      creditLimit,
      outstandingBalance,
      joinedAt: daysAgo(randInt(60, 1800)),
      growthPercent: randFloat(-12, 28, 1),
    };
  });
})();

// ============================================================
// 50 Supplier products (the catalog)
// ============================================================

interface ProductSpec {
  name: string;
  category: SupplierProductCategory;
  unit: string;
  basePrice: number;
}

const PRODUCT_SPECS: ProductSpec[] = [
  // Ichimliklar — 12
  { name: "🥤 Coca-Cola 0.5L", category: "ichimliklar", unit: "dona", basePrice: 7500 },
  { name: "🥤 Coca-Cola 1.5L", category: "ichimliklar", unit: "dona", basePrice: 15500 },
  { name: "🥤 Pepsi 0.5L", category: "ichimliklar", unit: "dona", basePrice: 7200 },
  { name: "🥤 Pepsi 1.5L", category: "ichimliklar", unit: "dona", basePrice: 14800 },
  { name: "🥤 Fanta 0.5L", category: "ichimliklar", unit: "dona", basePrice: 7300 },
  { name: "🥤 Sprite 0.5L", category: "ichimliklar", unit: "dona", basePrice: 7300 },
  { name: "💧 Mineral suv 0.5L", category: "ichimliklar", unit: "dona", basePrice: 3000 },
  { name: "💧 Mineral suv 1.5L", category: "ichimliklar", unit: "dona", basePrice: 5500 },
  { name: "🧃 Olma sharbati 1L", category: "ichimliklar", unit: "dona", basePrice: 12000 },
  { name: "🧃 Apelsin sharbati 1L", category: "ichimliklar", unit: "dona", basePrice: 12500 },
  { name: "☕ Nescafe 100g", category: "ichimliklar", unit: "dona", basePrice: 38000 },
  { name: "🍵 Hindiston choyi 100g", category: "ichimliklar", unit: "dona", basePrice: 12000 },
  // Oziq-ovqat — 18
  { name: "🍞 Non gulli", category: "oziq-ovqat", unit: "dona", basePrice: 3500 },
  { name: "🍞 Non oddiy", category: "oziq-ovqat", unit: "dona", basePrice: 2800 },
  { name: "🥛 Sut 1L Imkon", category: "oziq-ovqat", unit: "dona", basePrice: 8500 },
  { name: "🥛 Sut 1L Domyz", category: "oziq-ovqat", unit: "dona", basePrice: 8200 },
  { name: "🧈 Sariyog' 200g", category: "oziq-ovqat", unit: "dona", basePrice: 22000 },
  { name: "🧀 Pishloq 200g", category: "oziq-ovqat", unit: "dona", basePrice: 28000 },
  { name: "🥚 Tuxum 10 dona", category: "oziq-ovqat", unit: "qadoq", basePrice: 18000 },
  { name: "🍚 Guruch Loziq 1kg", category: "oziq-ovqat", unit: "kg", basePrice: 14000 },
  { name: "🍝 Makaron 400g", category: "oziq-ovqat", unit: "dona", basePrice: 9500 },
  { name: "🌾 Un oliy 1kg", category: "oziq-ovqat", unit: "kg", basePrice: 7800 },
  { name: "🧂 Tuz 1kg", category: "oziq-ovqat", unit: "kg", basePrice: 3200 },
  { name: "🍯 Asal 500g", category: "oziq-ovqat", unit: "dona", basePrice: 65000 },
  { name: "🍫 Shokolad Snickers", category: "oziq-ovqat", unit: "dona", basePrice: 8500 },
  { name: "🍪 Pechene 200g", category: "oziq-ovqat", unit: "dona", basePrice: 12000 },
  { name: "🥩 Mol go'shti premium", category: "oziq-ovqat", unit: "kg", basePrice: 85000 },
  { name: "🍗 Tovuq go'shti", category: "oziq-ovqat", unit: "kg", basePrice: 42000 },
  { name: "🛢 O'simlik yog'i 1L", category: "oziq-ovqat", unit: "dona", basePrice: 49200 },
  { name: "🧴 O'simlik yog'i 5L", category: "oziq-ovqat", unit: "dona", basePrice: 235000 },
  // Sigaret — 6
  { name: "🚬 Marlboro Red", category: "sigaret", unit: "blok", basePrice: 220000 },
  { name: "🚬 Marlboro Gold", category: "sigaret", unit: "blok", basePrice: 220000 },
  { name: "🚬 Esse Light", category: "sigaret", unit: "blok", basePrice: 150000 },
  { name: "🚬 Parliament", category: "sigaret", unit: "blok", basePrice: 280000 },
  { name: "🚬 LD Blue", category: "sigaret", unit: "blok", basePrice: 130000 },
  { name: "🚬 Winston", category: "sigaret", unit: "blok", basePrice: 175000 },
  // Maishiy — 8
  { name: "🧻 Sochiq qog'oz", category: "maishiy", unit: "dona", basePrice: 8500 },
  { name: "🧻 Tualet qog'oz 4-roll", category: "maishiy", unit: "qadoq", basePrice: 14000 },
  { name: "🧼 Sovun Safeguard", category: "maishiy", unit: "dona", basePrice: 7500 },
  { name: "🧴 Shampun Head&Shoulders", category: "maishiy", unit: "dona", basePrice: 48000 },
  { name: "🪥 Tish pasta Colgate", category: "maishiy", unit: "dona", basePrice: 22000 },
  { name: "🧽 Idish yuvuvchi Fairy", category: "maishiy", unit: "dona", basePrice: 32000 },
  { name: "🧺 Kir kukuni 1kg", category: "maishiy", unit: "kg", basePrice: 38000 },
  { name: "🧹 Quruq solfetka 100", category: "maishiy", unit: "qadoq", basePrice: 18000 },
  // Kosmetika — 4
  { name: "💄 Dudoq pomadasi", category: "kosmetika", unit: "dona", basePrice: 28000 },
  { name: "🧴 Krem yuz uchun", category: "kosmetika", unit: "dona", basePrice: 45000 },
  { name: "💧 Atir Adidas", category: "kosmetika", unit: "dona", basePrice: 85000 },
  { name: "🧴 Deodorant Rexona", category: "kosmetika", unit: "dona", basePrice: 32000 },
  // Boshqa — 2
  { name: "🔋 Baterey AA 4-pack", category: "boshqa", unit: "qadoq", basePrice: 18000 },
  { name: "💡 Lampa LED 9W", category: "boshqa", unit: "dona", basePrice: 22000 },
];

function makeMxik10(): string {
  // 10-digit MXIK
  let s = "";
  for (let i = 0; i < 10; i++) s += String(randInt(0, 9));
  return s;
}

export const seedSupplierProducts: SupplierProduct[] = PRODUCT_SPECS.map(
  (spec, i): SupplierProduct => ({
    id: `sup_prod_${pad(i + 1, 3)}`,
    supplierId: SUPPLIER_ID,
    name: spec.name,
    mxik: makeMxik10(),
    category: spec.category,
    unit: spec.unit,
    basePrice: spec.basePrice,
    stock: randInt(100, 10000),
    monthlySales: randInt(200, 5000),
    trendPercent: randFloat(-15, 35, 1),
  }),
);

// ============================================================
// 200 Outgoing invoices
// ============================================================

function makeInvoiceItems(count: number): OutgoingInvoiceItem[] {
  const items: OutgoingInvoiceItem[] = [];
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    let idx = randInt(0, seedSupplierProducts.length - 1);
    let guard = 0;
    while (used.has(idx) && guard < 20) {
      idx = randInt(0, seedSupplierProducts.length - 1);
      guard++;
    }
    used.add(idx);
    const p = seedSupplierProducts[idx];
    const quantity = randInt(5, 200);
    const price = Math.round(p.basePrice * randFloat(0.95, 1.08, 3));
    items.push({
      productId: p.id,
      name: p.name,
      mxik: p.mxik,
      unit: p.unit,
      quantity,
      price,
      total: quantity * price,
    });
  }
  return items;
}

// Status plan: 12 draft, 8 sent, 15 received, 22 approved, 18 preparing,
// 24 delivering, 71 delivered, 28 paid, 2 cancelled = 200
const INVOICE_STATUS_PLAN: OutgoingInvoiceStatus[] = [
  ...Array<OutgoingInvoiceStatus>(12).fill("draft"),
  ...Array<OutgoingInvoiceStatus>(8).fill("sent"),
  ...Array<OutgoingInvoiceStatus>(15).fill("received"),
  ...Array<OutgoingInvoiceStatus>(22).fill("approved"),
  ...Array<OutgoingInvoiceStatus>(18).fill("preparing"),
  ...Array<OutgoingInvoiceStatus>(24).fill("delivering"),
  ...Array<OutgoingInvoiceStatus>(71).fill("delivered"),
  ...Array<OutgoingInvoiceStatus>(28).fill("paid"),
  ...Array<OutgoingInvoiceStatus>(2).fill("cancelled"),
];

// Shuffle deterministically using the same rng.
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const shuffledInvoiceStatuses = shuffle(INVOICE_STATUS_PLAN);

export const seedOutgoingInvoices: OutgoingInvoice[] = (() => {
  const list: OutgoingInvoice[] = [];
  // Spread invoices from day 140 ago up to today (2026-01-01 to 2026-05-21 ≈ 141 days)
  for (let i = 0; i < 200; i++) {
    const status = shuffledInvoiceStatuses[i];
    const itemCount = randInt(2, 15);
    const items = makeInvoiceItems(itemCount);
    const totalAmount = items.reduce((s, it) => s + it.total, 0);
    const sentDaysAgo = Math.floor((140 * (200 - i)) / 200) + randInt(0, 2);
    const sentAt = daysAgo(sentDaysAgo, randInt(8, 18));
    const dueDate = daysAhead(-sentDaysAgo + 14); // 14-day net
    const store = seedSupplierStores[randInt(0, seedSupplierStores.length - 1)];
    let paidAt: string | null = null;
    if (status === "paid") {
      paidAt = daysAgo(Math.max(0, sentDaysAgo - randInt(2, 12)), randInt(8, 18));
    }
    list.push({
      id: `inv_${pad(i + 1, 4)}`,
      supplierId: SUPPLIER_ID,
      storeId: store.id,
      number: `AD-2026-${pad(i + 1, 4)}`,
      status,
      items,
      totalAmount,
      sentAt,
      dueDate,
      paidAt,
      trackingNote:
        status === "delivering"
          ? "Yo'lda · ETA 2 soat"
          : status === "preparing"
          ? "Omborda yig'ilmoqda"
          : undefined,
    });
  }
  // Sort: newest first
  list.sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
  return list;
})();

// ============================================================
// 150 Payment records
// ============================================================

const PAYMENT_STATUS_PLAN: PaymentStatus[] = [
  ...Array<PaymentStatus>(22).fill("pending"),
  ...Array<PaymentStatus>(95).fill("paid"),
  ...Array<PaymentStatus>(28).fill("overdue"),
  ...Array<PaymentStatus>(5).fill("partial"),
];

const PAYMENT_METHODS: PaymentMethod[] = ["click", "payme", "bank", "cash"];
function pickMethod(): PaymentMethod {
  const r = rand();
  if (r < 0.4) return "click";
  if (r < 0.7) return "payme";
  if (r < 0.9) return "bank";
  return "cash";
}

const shuffledPaymentStatuses = shuffle(PAYMENT_STATUS_PLAN);

export const seedPayments: PaymentRecord[] = (() => {
  // Map payments to delivered/paid invoices (101 such records); for "overdue"
  // we use older invoices to make daysOverdue realistic.
  const settledInvoices = seedOutgoingInvoices.filter(
    (inv) => inv.status === "delivered" || inv.status === "paid",
  );
  const list: PaymentRecord[] = [];
  for (let i = 0; i < 150; i++) {
    const status = shuffledPaymentStatuses[i];
    // Pick an invoice; fallback to any invoice if settled pool too small
    const inv =
      settledInvoices[i % settledInvoices.length] ??
      seedOutgoingInvoices[i % seedOutgoingInvoices.length];
    const sup = seedSupplierStores.find((s) => s.id === inv.storeId);
    const storeName = sup?.name ?? "Noma'lum do'kon";
    let paidAt: string | null = null;
    let paidAmount = 0;
    let daysOverdue = 0;
    const invoiceDate = inv.sentAt;
    const due = inv.dueDate;
    const dueMs = new Date(due).getTime();
    if (status === "paid") {
      paidAt = daysAgo(randInt(0, 30), randInt(8, 18));
      paidAmount = inv.totalAmount;
    } else if (status === "partial") {
      paidAt = daysAgo(randInt(0, 15), randInt(8, 18));
      paidAmount = Math.round(inv.totalAmount * randFloat(0.3, 0.75, 2));
    } else if (status === "overdue") {
      daysOverdue = randInt(1, 90);
      paidAmount = 0;
    } else {
      // pending
      daysOverdue = Math.max(0, Math.floor((NOW - dueMs) / DAY_MS));
      if (daysOverdue > 0) {
        // ensure pending stays not-overdue: clamp
        daysOverdue = 0;
      }
      paidAmount = 0;
    }
    list.push({
      id: `pay_${pad(i + 1, 4)}`,
      invoiceId: inv.id,
      supplierId: SUPPLIER_ID,
      storeId: inv.storeId,
      invoiceNumber: inv.number,
      storeName,
      amount: inv.totalAmount,
      paidAmount,
      invoiceDate,
      dueDate: due,
      paidAt,
      status,
      daysOverdue,
      method: status === "paid" || status === "partial" ? pickMethod() : undefined,
    });
  }
  return list;
})();

// ============================================================
// 30 Demand signals
// ============================================================

const DEMAND_REGIONS = ["Toshkent shahar", "Toshkent viloyat", "Samarqand", "Buxoro"];
const DEMAND_DISTRICTS: Record<string, string[]> = {
  "Toshkent shahar": ["Chilonzor", "Yunusobod", "Sergeli", "Mirobod", "Yashnobod"],
  "Toshkent viloyat": ["Chirchiq", "Angren", "Olmaliq"],
  Samarqand: ["Samarqand shahar", "Urgut"],
  Buxoro: ["Buxoro shahar", "Kogon"],
};

export const seedDemandSignals: DemandSignal[] = (() => {
  const list: DemandSignal[] = [];
  // Use top 30 products from the catalog (mix categories)
  const top = seedSupplierProducts.slice(0, 30);
  for (let i = 0; i < 30; i++) {
    const p = top[i];
    const region = pick(DEMAND_REGIONS);
    const districts = DEMAND_DISTRICTS[region] ?? [];
    const district = districts.length > 0 ? pick(districts) : undefined;
    const trend = randFloat(-15, 35, 1);
    const weekly = randInt(80, 4200);
    const hotness: DemandSignal["hotness"] =
      trend >= 8 ? "rising" : trend <= -5 ? "falling" : "stable";
    list.push({
      id: `dem_${pad(i + 1, 3)}`,
      productId: p.id,
      productName: p.name,
      region,
      district,
      weeklyVolume: weekly,
      trendPercent: trend,
      predictedNextWeek: Math.round(weekly * (1 + trend / 100)),
      hotness,
    });
  }
  return list;
})();

// ============================================================
// 25 Incoming orders (stores ordering from supplier)
// ============================================================

const ORDER_STATUS_PLAN: IncomingOrderStatus[] = [
  ...Array<IncomingOrderStatus>(12).fill("pending"),
  ...Array<IncomingOrderStatus>(8).fill("accepted"),
  ...Array<IncomingOrderStatus>(4).fill("fulfilled"),
  ...Array<IncomingOrderStatus>(1).fill("rejected"),
];

const shuffledOrderStatuses = shuffle(ORDER_STATUS_PLAN);

export const seedIncomingOrders: IncomingOrder[] = (() => {
  const list: IncomingOrder[] = [];
  for (let i = 0; i < 25; i++) {
    const status = shuffledOrderStatuses[i];
    const items = makeInvoiceItems(randInt(2, 8));
    const total = items.reduce((s, it) => s + it.total, 0);
    const store = seedSupplierStores[randInt(0, seedSupplierStores.length - 1)];
    list.push({
      id: `ord_${pad(i + 1, 4)}`,
      supplierId: SUPPLIER_ID,
      storeId: store.id,
      storeName: store.name,
      number: `ORD-2026-${pad(i + 1, 4)}`,
      items,
      totalAmount: total,
      requestedAt: daysAgo(randInt(0, 7), randInt(8, 18)),
      status,
      rejectionReason: status === "rejected" ? "Mahsulot omborda yo'q" : undefined,
    });
  }
  list.sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
  return list;
})();

// ============================================================
// 8 Delivery routes
// ============================================================

const DRIVER_NAMES = [
  "Toshmatov Otabek",
  "Karimov Rustam",
  "Yusupov Sherzod",
  "Akmalov Bobur",
  "Saidov Jasur",
  "Rahmonov Davron",
  "Nazarov Eldor",
  "Mahmudov Vohid",
];

function makePlate(): string {
  const num = pad(randInt(100, 999), 3);
  const series = pick(["AA", "BA", "TA", "CA", "DA"]);
  const reg = pad(randInt(1, 99), 2);
  return `${reg}${series} ${num} GG`;
}

export const seedDeliveryRoutes: DeliveryRoute[] = (() => {
  const list: DeliveryRoute[] = [];
  for (let i = 0; i < 8; i++) {
    const isCompleted = i >= 5;
    const stopCount = randInt(4, 8);
    const stops: DeliveryRouteStop[] = [];
    for (let j = 0; j < stopCount; j++) {
      const store = seedSupplierStores[randInt(0, seedSupplierStores.length - 1)];
      const delivered = isCompleted || j < Math.floor(stopCount / 2);
      stops.push({
        storeId: store.id,
        storeName: store.name,
        eta: daysAgo(isCompleted ? randInt(0, 1) : 0, randInt(8, 18)),
        status: delivered ? "delivered" : "pending",
      });
    }
    list.push({
      id: `route_${pad(i + 1, 3)}`,
      supplierId: SUPPLIER_ID,
      driverName: DRIVER_NAMES[i % DRIVER_NAMES.length],
      vehiclePlate: makePlate(),
      stops,
      startedAt: daysAgo(isCompleted ? randInt(0, 1) : 0, randInt(6, 9)),
      estimatedCompletion: daysAgo(isCompleted ? 0 : -1, randInt(16, 20)),
    });
  }
  return list;
})();
