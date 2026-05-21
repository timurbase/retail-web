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
} from "./types";
import {
  mockDocuments,
  mockProducts,
  mockSuppliers,
  mockInsights,
} from "./mock-data";

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
}

function createStore(): RetailStore {
  return {
    documents: structuredClone(mockDocuments),
    products: structuredClone(mockProducts),
    suppliers: structuredClone(mockSuppliers),
    insights: structuredClone(mockInsights),
    users: structuredClone(seedUsers),
    audit: structuredClone(seedAudit),
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

// ============================================
// WRITE — Documents
// ============================================

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
