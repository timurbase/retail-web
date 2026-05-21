/**
 * RetailFlow AI — In-memory store
 *
 * Uses globalThis to survive Next.js dev hot-reload.
 * Server-side singleton; client mutations go through Server Actions.
 *
 * Audit log is auto-populated on every write via logAudit().
 */

import type {
  RetailDocument,
  Product,
  Supplier,
  DailyInsight,
  ProductRow,
  MxikSuggestion,
  User,
  AuditEntry,
  AuditAction,
  CompanyInfo,
  SupplierCompany,
  SupplierStore,
  OutgoingInvoice,
  OutgoingInvoiceItem,
  OutgoingInvoiceStatus,
  PaymentRecord,
  PaymentMethod,
  DemandSignal,
  SupplierProduct,
  IncomingOrder,
  DeliveryRoute,
} from "./types";
import {
  mockDocuments,
  mockProducts,
  mockSuppliers,
  mockInsights,
} from "./mock-data";
import {
  SUPPLIER_ID,
  seedSupplierCompany,
  seedSupplierStores,
  seedSupplierProducts,
  seedOutgoingInvoices,
  seedPayments,
  seedDemandSignals,
  seedIncomingOrders,
  seedDeliveryRoutes,
} from "./supplier-seed";

// ============================================
// Initial seed for users + audit
// ============================================

const STORE_ID = "store_demo_01";
const CURRENT_USER = {
  id: "user_aziz",
  name: "Aziz Karimov",
  role: "omborchi" as const,
};

const seedUsers: User[] = [
  {
    id: "user_aziz",
    storeId: STORE_ID,
    orgId: null,
    fullName: "Aziz Karimov",
    email: "aziz@karimov-mchj.uz",
    phone: "+998901234567",
    role: "omborchi",
    status: "active",
    lastLogin: "2026-05-21T08:30:00Z",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "user_sevara",
    storeId: STORE_ID,
    orgId: null,
    fullName: "Sevara Yusupova",
    email: "sevara@karimov-mchj.uz",
    phone: "+998901234568",
    role: "buxgalter",
    status: "active",
    lastLogin: "2026-05-21T07:45:00Z",
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "user_jasur",
    storeId: STORE_ID,
    orgId: null,
    fullName: "Jasur Toshmatov",
    email: "jasur@karimov-mchj.uz",
    phone: "+998901234569",
    role: "kassir",
    status: "active",
    lastLogin: "2026-05-21T09:15:00Z",
    createdAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "user_rustam",
    storeId: STORE_ID,
    orgId: null,
    fullName: "Rustam Karimov",
    email: "rustam@karimov-mchj.uz",
    phone: "+998901234570",
    role: "admin",
    status: "active",
    lastLogin: "2026-05-20T18:30:00Z",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "user_dilshod",
    storeId: STORE_ID,
    orgId: null,
    fullName: "Dilshod Akmalov",
    email: "dilshod@karimov-mchj.uz",
    phone: "+998901234571",
    role: "auditor",
    status: "blocked",
    lastLogin: "2026-04-10T14:00:00Z",
    createdAt: "2026-02-01T10:00:00Z",
  },
];

const seedCompany: CompanyInfo = {
  storeId: STORE_ID,
  stir: "301234567",
  stirVerified: true,
  name: "Karimov MChJ",
  activity: "Chakana savdo (47.11 — Oziq-ovqat)",
  address: "Toshkent shahar, Chilonzor tumani, Bunyodkor ko'chasi 1A",
  director: "Karimov Aziz Salimovich",
  phone: "+998 90 123 45 67",
  email: "aziz@karimov-mchj.uz",
  website: "karimov-mchj.uz",
};

const seedAudit: AuditEntry[] = [
  {
    id: "audit_seed_1",
    storeId: STORE_ID,
    timestamp: "2026-05-21T08:42:00Z",
    user: { id: "user_aziz", name: "Aziz Karimov", role: "omborchi" },
    action: "create",
    objectType: "document",
    objectId: "doc_12345",
    objectLabel: "Hujjat №12345",
    details: "Didox webhook orqali qabul qilindi · 8 mahsulot",
    ip: "192.168.1.45",
  },
  {
    id: "audit_seed_2",
    storeId: STORE_ID,
    timestamp: "2026-05-21T07:15:00Z",
    user: { id: "user_aziz", name: "Aziz Karimov", role: "omborchi" },
    action: "approve",
    objectType: "document",
    objectId: "doc_12346",
    objectLabel: "Hujjat №12346",
    details: "Tasdiqlandi · Ombor kirim qilindi",
    ip: "192.168.1.45",
  },
];

// ============================================
// Store shape
// ============================================

export interface RetailStore {
  documents: RetailDocument[];
  products: Product[];
  suppliers: Supplier[];
  insights: DailyInsight[];
  users: User[];
  audit: AuditEntry[];
  company: CompanyInfo;
  // Supplier portal state
  supplierCompany: SupplierCompany;
  supplierStores: SupplierStore[];
  outgoingInvoices: OutgoingInvoice[];
  payments: PaymentRecord[];
  demandSignals: DemandSignal[];
  supplierProducts: SupplierProduct[];
  incomingOrders: IncomingOrder[];
  deliveryRoutes: DeliveryRoute[];
}

function createStore(): RetailStore {
  return {
    documents: structuredClone(mockDocuments),
    products: structuredClone(mockProducts),
    suppliers: structuredClone(mockSuppliers),
    insights: structuredClone(mockInsights),
    users: structuredClone(seedUsers),
    audit: structuredClone(seedAudit),
    company: structuredClone(seedCompany),
    supplierCompany: structuredClone(seedSupplierCompany),
    supplierStores: structuredClone(seedSupplierStores),
    outgoingInvoices: structuredClone(seedOutgoingInvoices),
    payments: structuredClone(seedPayments),
    demandSignals: structuredClone(seedDemandSignals),
    supplierProducts: structuredClone(seedSupplierProducts),
    incomingOrders: structuredClone(seedIncomingOrders),
    deliveryRoutes: structuredClone(seedDeliveryRoutes),
  };
}

// Hot-reload safe singleton
declare global {
  // eslint-disable-next-line no-var
  var __retailflowStore: RetailStore | undefined;
}

export const store: RetailStore = globalThis.__retailflowStore ??= createStore();

// ============================================
// Helpers
// ============================================

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function logAudit(
  action: AuditAction,
  objectType: AuditEntry["objectType"],
  objectId: string,
  objectLabel?: string,
  details?: string
): void {
  store.audit.unshift({
    id: uid("audit"),
    storeId: STORE_ID,
    timestamp: new Date().toISOString(),
    user: { ...CURRENT_USER },
    action,
    objectType,
    objectId,
    objectLabel,
    details,
    ip: "192.168.1.45",
  });
  // Cap audit log at 500 entries to prevent unbounded growth
  if (store.audit.length > 500) store.audit.length = 500;
}

// ============================================
// READ — getters (server components)
// ============================================

export function getDocuments(): RetailDocument[] {
  return store.documents;
}

export function getDocument(id: string): RetailDocument | undefined {
  return store.documents.find((d) => d.id === id);
}

export function getProducts(): Product[] {
  return store.products;
}

export function getProduct(id: string): Product | undefined {
  return store.products.find((p) => p.id === id);
}

export function getSuppliers(): Supplier[] {
  return store.suppliers;
}

export function getSupplier(id: string): Supplier | undefined {
  return store.suppliers.find((s) => s.id === id);
}

export function getInsights(): DailyInsight[] {
  return store.insights.filter((i) => !i.dismissed);
}

export function getAllInsights(): DailyInsight[] {
  return store.insights;
}

export function getUsers(): User[] {
  return store.users;
}

export function getUser(id: string): User | undefined {
  return store.users.find((u) => u.id === id);
}

export function getAuditLog(limit = 100): AuditEntry[] {
  return store.audit.slice(0, limit);
}

export function getCompany(): CompanyInfo {
  return store.company;
}

export function updateCompany(
  patch: Partial<Omit<CompanyInfo, "storeId">>
): CompanyInfo {
  const c = store.company;
  const changes: string[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if ((c as any)[k] !== v) {
      changes.push(`${k}: ${(c as any)[k]} → ${v}`);
      (c as any)[k] = v;
    }
  }
  logAudit(
    "update",
    "company",
    STORE_ID,
    c.name,
    changes.join("; ") || "tahrirlandi"
  );
  return c;
}

// ============================================
// WRITE — Documents
// ============================================

export interface ManualDocRowInput {
  rawName: string;
  mxik: string | null;
  unit: string;
  quantity: number;
  price: number;
  mappedProductId?: string | null;
}

export interface ManualDocInput {
  supplierId: string;
  number: string;
  date: string; // ISO
  rows: ManualDocRowInput[];
}

export function createManualDocument(input: ManualDocInput): RetailDocument | null {
  const supplier = store.suppliers.find((s) => s.id === input.supplierId);
  if (!supplier) return null;

  const rows: ProductRow[] = input.rows.map((r, i) => {
    const mxik: MxikSuggestion | null = r.mxik
      ? { code: r.mxik, name: r.rawName, confidence: 1.0 }
      : null;
    return {
      id: uid(`row_${i}`),
      rawName: r.rawName,
      mappedName: r.rawName,
      mappedProductId: r.mappedProductId ?? null,
      mxik,
      unit: r.unit,
      quantity: r.quantity,
      price: r.price,
      total: r.quantity * r.price,
      confidence: 1.0,
      status: "matched",
    };
  });

  const totalAmount = rows.reduce((sum, r) => sum + r.total, 0);
  const doc: RetailDocument = {
    id: uid("doc"),
    storeId: STORE_ID,
    orgId: null,
    number: input.number,
    source: "manual",
    supplier,
    date: input.date,
    totalAmount,
    status: "review",
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    rows,
  };

  store.documents.unshift(doc);
  logAudit(
    "create",
    "document",
    doc.id,
    `Hujjat №${doc.number}`,
    `Qo'lda yaratildi · ${supplier.name} · ${rows.length} mahsulot`
  );
  return doc;
}

export function deleteDocument(id: string): boolean {
  const idx = store.documents.findIndex((d) => d.id === id);
  if (idx < 0) return false;
  const doc = store.documents[idx];
  store.documents.splice(idx, 1);
  logAudit("delete", "document", id, `Hujjat №${doc.number}`, `${doc.supplier.name} dan keladigan ${doc.rows.length} mahsulotli hujjat o'chirildi`);
  return true;
}

export function approveDocument(id: string): boolean {
  const doc = store.documents.find((d) => d.id === id);
  if (!doc) return false;
  doc.status = "approved";
  doc.reviewCount = 0;
  doc.rows.forEach((r) => {
    if (r.status === "matched") r.status = "approved";
  });
  logAudit("approve", "document", id, `Hujjat №${doc.number}`, `${doc.rows.length} mahsulot ombarga kirim qilindi`);
  return true;
}

export function rejectDocument(id: string, reason?: string): boolean {
  const doc = store.documents.find((d) => d.id === id);
  if (!doc) return false;
  doc.status = "rejected";
  logAudit("reject", "document", id, `Hujjat №${doc.number}`, reason ?? "Operator rad etdi");
  return true;
}

// ============================================
// WRITE — Document rows
// ============================================

function findRow(docId: string, rowId: string): { doc: RetailDocument; row: ProductRow } | null {
  const doc = store.documents.find((d) => d.id === docId);
  if (!doc) return null;
  const row = doc.rows.find((r) => r.id === rowId);
  if (!row) return null;
  return { doc, row };
}

function recalcReviewCount(doc: RetailDocument): void {
  doc.reviewCount = doc.rows.filter(
    (r) => r.status === "new" || r.status === "ambiguous"
  ).length;
}

export function approveRow(docId: string, rowId: string): boolean {
  const found = findRow(docId, rowId);
  if (!found) return false;
  found.row.status = "approved";
  recalcReviewCount(found.doc);
  logAudit("approve", "row", rowId, found.row.rawName, `Hujjat №${found.doc.number} qator tasdiqlandi · MXIK ${found.row.mxik?.code ?? "—"}`);
  return true;
}

export function rejectRow(docId: string, rowId: string, reason?: string): boolean {
  const found = findRow(docId, rowId);
  if (!found) return false;
  found.row.status = "rejected";
  recalcReviewCount(found.doc);
  logAudit("reject", "row", rowId, found.row.rawName, reason ?? "Operator rad etdi");
  return true;
}

export function updateRowMxik(docId: string, rowId: string, mxik: MxikSuggestion): boolean {
  const found = findRow(docId, rowId);
  if (!found) return false;
  const oldCode = found.row.mxik?.code;
  found.row.mxik = mxik;
  found.row.confidence = mxik.confidence;
  if (mxik.confidence >= 0.9) {
    found.row.status = "matched";
  } else if (mxik.confidence >= 0.6) {
    found.row.status = "new";
  } else {
    found.row.status = "ambiguous";
  }
  recalcReviewCount(found.doc);
  logAudit("update", "row", rowId, found.row.rawName, `MXIK ${oldCode ?? "—"} → ${mxik.code}`);
  return true;
}

export function selectVariant(docId: string, rowId: string, variantCode: string): boolean {
  const found = findRow(docId, rowId);
  if (!found || !found.row.alternatives) return false;
  const variant = found.row.alternatives.find((a) => a.code === variantCode);
  if (!variant) return false;
  found.row.mxik = variant;
  found.row.confidence = variant.confidence;
  found.row.status = "approved";
  recalcReviewCount(found.doc);
  logAudit("update", "row", rowId, found.row.rawName, `MXIK variantidan tanlandi: ${variantCode}`);
  return true;
}

export function bulkApproveHighConfidence(docId: string): number {
  const doc = store.documents.find((d) => d.id === docId);
  if (!doc) return 0;
  let count = 0;
  doc.rows.forEach((r) => {
    if (r.confidence >= 0.9 && (r.status === "matched" || r.status === "new")) {
      r.status = "approved";
      count++;
    }
  });
  recalcReviewCount(doc);
  logAudit("approve", "document", docId, `Hujjat №${doc.number}`, `Bulk: ${count} ta yuqori-confidence qator avto-tasdiqlandi`);
  return count;
}

// ============================================
// WRITE — Products
// ============================================

export function createProduct(input: Omit<Product, "id" | "storeId" | "lastReceivedAt">): Product {
  const product: Product = {
    ...input,
    id: uid("p"),
    storeId: STORE_ID,
    lastReceivedAt: null,
  };
  store.products.push(product);
  logAudit("create", "product", product.id, product.name, `Yangi mahsulot katalogga qo'shildi · MXIK ${product.mxik}`);
  return product;
}

export function updateProduct(id: string, patch: Partial<Omit<Product, "id" | "storeId">>): Product | null {
  const p = store.products.find((x) => x.id === id);
  if (!p) return null;
  const changes: string[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if ((p as any)[k] !== v) {
      changes.push(`${k}: ${(p as any)[k]} → ${v}`);
      (p as any)[k] = v;
    }
  }
  logAudit("update", "product", id, p.name, changes.join("; ") || "tahrirlandi");
  return p;
}

export function deleteProduct(id: string): boolean {
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx < 0) return false;
  const p = store.products[idx];
  store.products.splice(idx, 1);
  logAudit("delete", "product", id, p.name, `Katalogdan o'chirildi`);
  return true;
}

export type StockMovementKind = "kirim" | "chiqim" | "inventarizatsiya";

export function adjustStock(
  id: string,
  kind: StockMovementKind,
  qty: number,
  reason?: string
): Product | null {
  const p = store.products.find((x) => x.id === id);
  if (!p) return null;
  const before = p.currentStock;
  let after: number;
  if (kind === "kirim") after = before + qty;
  else if (kind === "chiqim") after = Math.max(0, before - qty);
  else after = qty; // inventarizatsiya: set to exact value
  p.currentStock = after;
  if (kind === "kirim") {
    p.lastReceivedAt = new Date().toISOString();
  }
  const kindLabel =
    kind === "kirim"
      ? "Qo'lda kirim"
      : kind === "chiqim"
      ? "Qo'lda chiqim"
      : "Inventarizatsiya";
  const details = `${kindLabel}: ${before} → ${after} ${p.unit}${
    reason ? ` · ${reason}` : ""
  }`;
  logAudit("update", "product", id, p.name, details);
  return p;
}

// ============================================
// WRITE — Suppliers
// ============================================

export function createSupplier(input: Omit<Supplier, "id" | "storeId" | "orgId">): Supplier {
  const supplier: Supplier = {
    ...input,
    id: uid("sup"),
    storeId: STORE_ID,
    orgId: null,
  };
  store.suppliers.push(supplier);
  logAudit("create", "supplier", supplier.id, supplier.name, `STIR ${supplier.stir}`);
  return supplier;
}

export function updateSupplier(id: string, patch: Partial<Omit<Supplier, "id" | "storeId">>): Supplier | null {
  const s = store.suppliers.find((x) => x.id === id);
  if (!s) return null;
  const changes: string[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if ((s as any)[k] !== v) {
      changes.push(`${k}: ${(s as any)[k]} → ${v}`);
      (s as any)[k] = v;
    }
  }
  logAudit("update", "supplier", id, s.name, changes.join("; ") || "tahrirlandi");
  return s;
}

export function deleteSupplier(id: string): boolean {
  const idx = store.suppliers.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  const s = store.suppliers[idx];
  store.suppliers.splice(idx, 1);
  logAudit("delete", "supplier", id, s.name, "Yetkazib beruvchi o'chirildi");
  return true;
}

// ============================================
// WRITE — Users
// ============================================

export function createUser(input: Omit<User, "id" | "storeId" | "orgId" | "lastLogin" | "createdAt">): User {
  const user: User = {
    ...input,
    id: uid("user"),
    storeId: STORE_ID,
    orgId: null,
    lastLogin: null,
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  logAudit("create", "user", user.id, user.fullName, `Yangi foydalanuvchi taklif qilindi · rol: ${user.role}`);
  return user;
}

export function updateUser(id: string, patch: Partial<Omit<User, "id" | "storeId">>): User | null {
  const u = store.users.find((x) => x.id === id);
  if (!u) return null;
  const changes: string[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if ((u as any)[k] !== v) {
      changes.push(`${k}: ${(u as any)[k]} → ${v}`);
      (u as any)[k] = v;
    }
  }
  logAudit("update", "user", id, u.fullName, changes.join("; ") || "tahrirlandi");
  return u;
}

export function deleteUser(id: string): boolean {
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx < 0) return false;
  const u = store.users[idx];
  store.users.splice(idx, 1);
  logAudit("delete", "user", id, u.fullName, "Foydalanuvchi o'chirildi");
  return true;
}

export function toggleUserStatus(id: string): User | null {
  const u = store.users.find((x) => x.id === id);
  if (!u) return null;
  u.status = u.status === "active" ? "blocked" : "active";
  logAudit("update", "user", id, u.fullName, `Status: ${u.status}`);
  return u;
}

// ============================================
// WRITE — Insights
// ============================================

export function dismissInsight(id: string): boolean {
  const ins = store.insights.find((i) => i.id === id);
  if (!ins) return false;
  ins.dismissed = true;
  logAudit("update", "insight", id, ins.title, "Dismiss qilindi");
  return true;
}

export function actOnInsight(id: string): boolean {
  const ins = store.insights.find((i) => i.id === id);
  if (!ins) return false;
  ins.acted = true;
  ins.dismissed = true;
  logAudit("update", "insight", id, ins.title, `Tavsiyaga amal qilindi: ${ins.suggestedAction?.label ?? "—"}`);
  return true;
}

// ============================================
// WRITE — Integrations (config-only, no entity)
// ============================================

/**
 * Integrations are a static UI config today, but every mutation
 * (configure / disconnect / manual sync) still needs to land in the audit log.
 */
export function logIntegrationEvent(
  action: AuditAction,
  integrationId: string,
  integrationLabel: string,
  details?: string
): void {
  logAudit(action, "integration", integrationId, integrationLabel, details);
}

export function dismissAllInsights(): number {
  let count = 0;
  store.insights.forEach((i) => {
    if (!i.dismissed) {
      i.dismissed = true;
      count++;
    }
  });
  logAudit("update", "insight", "bulk", undefined, `Hammasi (${count} ta) dismiss qilindi`);
  return count;
}

// ============================================
// Counters / stats (for KPI cards)
// ============================================

export function getDocumentStats() {
  const docs = store.documents;
  const today = new Date().toISOString().slice(0, 10);
  const newToday = docs.filter((d) => d.createdAt.startsWith(today)).length;
  const reviewQueue = docs.reduce((sum, d) => sum + d.reviewCount, 0);
  const totalRows = docs.reduce((sum, d) => sum + d.rows.length, 0);
  const approvedRows = docs.reduce(
    (sum, d) => sum + d.rows.filter((r) => r.status === "approved" || r.status === "matched").length,
    0
  );
  const autoApprovalRate = totalRows > 0 ? approvedRows / totalRows : 0;
  return { newToday, reviewQueue, autoApprovalRate, totalRows, approvedRows };
}

export function getProductStats() {
  const products = store.products;
  const critical = products.filter((p) => p.currentStock < p.minStock).length;
  const atMin = products.filter((p) => p.currentStock === p.minStock).length;
  const ok = products.filter((p) => p.currentStock > p.minStock).length;
  const withMxik = products.filter((p) => !!p.mxik).length;
  return { total: products.length, critical, atMin, ok, withMxik, withoutMxik: products.length - withMxik };
}

// ============================================================
// Supplier portal — READ
// ============================================================

export function getSupplierCompany(): SupplierCompany {
  return store.supplierCompany;
}

export function getSupplierStores(): SupplierStore[] {
  return store.supplierStores;
}

export function getSupplierStore(id: string): SupplierStore | undefined {
  return store.supplierStores.find((s) => s.id === id);
}

export function getOutgoingInvoices(): OutgoingInvoice[] {
  return store.outgoingInvoices;
}

export function getOutgoingInvoice(id: string): OutgoingInvoice | undefined {
  return store.outgoingInvoices.find((i) => i.id === id);
}

export function getPayments(): PaymentRecord[] {
  return store.payments;
}

export function getOverduePayments(): PaymentRecord[] {
  return store.payments.filter((p) => p.status === "overdue");
}

export function getDemandSignals(): DemandSignal[] {
  return store.demandSignals;
}

export function getSupplierProducts(): SupplierProduct[] {
  return store.supplierProducts;
}

export function getSupplierProduct(id: string): SupplierProduct | undefined {
  return store.supplierProducts.find((p) => p.id === id);
}

export function getIncomingOrders(): IncomingOrder[] {
  return store.incomingOrders;
}

export function getDeliveryRoutes(): DeliveryRoute[] {
  return store.deliveryRoutes;
}

export function getSupplierKpi(): {
  activeStores: number;
  totalStores: number;
  todayInvoices: number;
  outstandingPayments: number;
  monthlyRevenue: number;
} {
  const stores = store.supplierStores;
  const activeStores = stores.filter((s) => s.status === "active").length;
  const today = new Date().toISOString().slice(0, 10);
  const todayInvoices = store.outgoingInvoices.filter((inv) =>
    inv.sentAt.startsWith(today),
  ).length;
  const outstandingPayments = store.payments
    .filter((p) => p.status === "pending" || p.status === "overdue" || p.status === "partial")
    .reduce((sum, p) => sum + (p.amount - p.paidAmount), 0);
  // Approx "monthly revenue" = sum of last 30 days delivered+paid invoices
  const cutoff = Date.now() - 30 * 86400000;
  const monthlyRevenue = store.outgoingInvoices
    .filter((inv) => {
      if (inv.status !== "delivered" && inv.status !== "paid") return false;
      return new Date(inv.sentAt).getTime() >= cutoff;
    })
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  return {
    activeStores,
    totalStores: stores.length,
    todayInvoices,
    outstandingPayments,
    monthlyRevenue,
  };
}

// ============================================================
// Supplier portal — WRITE
// ============================================================

export interface CreateOutgoingInvoiceInput {
  storeId: string;
  items: OutgoingInvoiceItem[];
  dueDate?: string;
  trackingNote?: string;
}

export function createOutgoingInvoice(
  input: CreateOutgoingInvoiceInput,
): OutgoingInvoice | null {
  const sup = store.supplierStores.find((s) => s.id === input.storeId);
  if (!sup) return null;
  const totalAmount = input.items.reduce((s, it) => s + it.total, 0);
  const nextNum = store.outgoingInvoices.length + 1;
  const invoice: OutgoingInvoice = {
    id: uid("inv"),
    supplierId: SUPPLIER_ID,
    storeId: input.storeId,
    number: `AD-2026-${String(nextNum).padStart(4, "0")}`,
    status: "sent",
    items: input.items,
    totalAmount,
    sentAt: new Date().toISOString(),
    dueDate: input.dueDate ?? new Date(Date.now() + 14 * 86400000).toISOString(),
    paidAt: null,
    trackingNote: input.trackingNote,
  };
  store.outgoingInvoices.unshift(invoice);
  logAudit(
    "create",
    "invoice",
    invoice.id,
    invoice.number,
    `${sup.name} ga yuborildi · ${input.items.length} mahsulot · ${totalAmount.toLocaleString("uz-UZ")} so'm`,
  );
  return invoice;
}

export function markInvoiceDelivered(id: string): boolean {
  const inv = store.outgoingInvoices.find((i) => i.id === id);
  if (!inv) return false;
  inv.status = "delivered";
  inv.trackingNote = "Yetkazib berildi";
  logAudit(
    "update",
    "invoice",
    inv.id,
    inv.number,
    "Yetkazib berildi deb belgilandi",
  );
  return true;
}

export function markInvoicePaid(id: string, method: PaymentMethod): boolean {
  const inv = store.outgoingInvoices.find((i) => i.id === id);
  if (!inv) return false;
  inv.status = "paid";
  inv.paidAt = new Date().toISOString();
  // Create / update payment record
  const existing = store.payments.find((p) => p.invoiceId === inv.id);
  const sup = store.supplierStores.find((s) => s.id === inv.storeId);
  if (existing) {
    existing.status = "paid";
    existing.paidAt = inv.paidAt;
    existing.paidAmount = inv.totalAmount;
    existing.method = method;
    existing.daysOverdue = 0;
  } else {
    store.payments.unshift({
      id: uid("pay"),
      invoiceId: inv.id,
      supplierId: SUPPLIER_ID,
      storeId: inv.storeId,
      invoiceNumber: inv.number,
      storeName: sup?.name ?? "Noma'lum do'kon",
      amount: inv.totalAmount,
      paidAmount: inv.totalAmount,
      invoiceDate: inv.sentAt,
      dueDate: inv.dueDate,
      paidAt: inv.paidAt,
      status: "paid",
      daysOverdue: 0,
      method,
    });
  }
  logAudit(
    "update",
    "payment",
    inv.id,
    inv.number,
    `To'lov qabul qilindi (${method}) · ${inv.totalAmount.toLocaleString("uz-UZ")} so'm`,
  );
  return true;
}

export function acceptIncomingOrder(id: string): boolean {
  const o = store.incomingOrders.find((x) => x.id === id);
  if (!o) return false;
  o.status = "accepted";
  logAudit("update", "order", o.id, o.number, `${o.storeName} buyurtmasi qabul qilindi`);
  return true;
}

export function rejectIncomingOrder(id: string, reason: string): boolean {
  const o = store.incomingOrders.find((x) => x.id === id);
  if (!o) return false;
  o.status = "rejected";
  o.rejectionReason = reason;
  logAudit(
    "reject",
    "order",
    o.id,
    o.number,
    `${o.storeName} buyurtmasi rad etildi: ${reason}`,
  );
  return true;
}

export interface InviteStoreInput {
  stir: string;
  phone: string;
  name: string;
  region?: string;
  district?: string;
  director?: string;
  creditLimit?: number;
}

export function inviteStore(input: InviteStoreInput): SupplierStore {
  const nextNum = store.supplierStores.length + 1;
  const id = `sup_store_${String(nextNum).padStart(3, "0")}`;
  const supStore: SupplierStore = {
    id,
    supplierId: SUPPLIER_ID,
    storeId: `store_${String(nextNum).padStart(3, "0")}`,
    name: input.name,
    stir: input.stir,
    director: input.director ?? "—",
    phone: input.phone,
    region: input.region ?? "Toshkent shahar",
    district: input.district ?? "—",
    status: "active",
    reliabilityScore: 8.0,
    monthlyVolume: 0,
    totalLifetimeVolume: 0,
    lastOrderAt: new Date().toISOString(),
    creditLimit: input.creditLimit ?? 10_000_000,
    outstandingBalance: 0,
    joinedAt: new Date().toISOString(),
    growthPercent: 0,
  };
  store.supplierStores.unshift(supStore);
  logAudit(
    "create",
    "store",
    supStore.id,
    supStore.name,
    `Yangi do'kon taklif qilindi · STIR ${input.stir} · ${input.phone}`,
  );
  return supStore;
}

export function updateStoreCreditLimit(id: string, newLimit: number): SupplierStore | null {
  const s = store.supplierStores.find((x) => x.id === id);
  if (!s) return null;
  const old = s.creditLimit;
  s.creditLimit = newLimit;
  logAudit(
    "update",
    "store",
    s.id,
    s.name,
    `Kredit limiti: ${old.toLocaleString("uz-UZ")} → ${newLimit.toLocaleString("uz-UZ")} so'm`,
  );
  return s;
}

export function bulkSendInvoices(inputs: CreateOutgoingInvoiceInput[]): {
  ok: boolean;
  count: number;
  invoices: OutgoingInvoice[];
} {
  const created: OutgoingInvoice[] = [];
  for (const input of inputs) {
    const inv = createOutgoingInvoice(input);
    if (inv) created.push(inv);
  }
  logAudit(
    "create",
    "invoice",
    "bulk",
    `${created.length} ta hujjat`,
    `Bulk yuborish: ${created.length}/${inputs.length} muvaffaqiyatli`,
  );
  return { ok: true, count: created.length, invoices: created };
}

// Used to bridge a supplier-side invoice status update from another flow.
export function updateInvoiceStatus(
  id: string,
  status: OutgoingInvoiceStatus,
): OutgoingInvoice | null {
  const inv = store.outgoingInvoices.find((i) => i.id === id);
  if (!inv) return null;
  const old = inv.status;
  inv.status = status;
  logAudit("update", "invoice", inv.id, inv.number, `Status: ${old} → ${status}`);
  return inv;
}
