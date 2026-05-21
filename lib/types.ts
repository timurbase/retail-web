// Domain types — RetailFlow AI
// Multi-tenancy ready: store_id (required) + org_id (NULL OK, deferred)

export type ConfidenceLevel = "high" | "mid" | "low";

export type DocStatus =
  | "pending"      // parsing
  | "review"       // operator action needed
  | "approved"     // posted to warehouse
  | "rejected"     // rejected by operator
  | "duplicate";   // dedup hash hit

export type ProductRowStatus =
  | "matched"      // high confidence, ready to approve
  | "new"          // not in catalog, suggest add
  | "ambiguous"    // multiple matches, pick one
  | "approved"
  | "rejected";

export interface Supplier {
  id: string;
  storeId: string;
  orgId: string | null;
  name: string;
  stir: string; // 9-digit taxpayer ID
  verified: boolean;
}

export interface MxikSuggestion {
  code: string;     // 10-digit MXIK
  name: string;
  confidence: number; // 0..1
}

export interface ProductRow {
  id: string;
  rawName: string;          // as parsed from document
  mappedName: string | null; // matched product in catalog
  mappedProductId: string | null;
  mxik: MxikSuggestion | null;
  alternatives?: MxikSuggestion[]; // for ambiguous rows
  unit: string;             // kg, dona, l
  quantity: number;
  price: number;
  total: number;            // quantity * price
  confidence: number;
  status: ProductRowStatus;
}

export interface RetailDocument {
  id: string;
  storeId: string;
  orgId: string | null;
  number: string;           // doc number from supplier
  source: "didox" | "excel" | "pdf" | "photo" | "manual";
  supplier: Supplier;
  date: string;             // ISO
  totalAmount: number;
  status: DocStatus;
  rows: ProductRow[];
  reviewCount: number;      // how many rows need attention
  createdAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  mxik: string;
  unit: string;
  currentStock: number;
  minStock: number;
  avgPrice: number;
  lastReceivedAt: string | null;
}

export interface DashboardKpi {
  newDocumentsToday: number;
  reviewQueueCount: number;
  autoApprovalRate: number; // 0..1
  mxikErrorsToday: number;
  trends: {
    newDocs: number;  // +/- vs yesterday
    accuracy: number; // +/- vs last week
  };
}

export interface DailyInsight {
  id: string;
  type: "low-stock" | "reorder" | "price-spike" | "supplier-issue" | "duplicate";
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  productId?: string;
  supplierId?: string;
  suggestedAction?: {
    label: string;
    payload: Record<string, unknown>;
  };
  createdAt: string;
  dismissed?: boolean;
  acted?: boolean;
}

export type UserRole =
  | "admin"
  | "omborchi"
  | "buxgalter"
  | "kassir"
  | "auditor"
  | "firma"
  // Supplier (ta'minotchi) side
  | "supplier_admin"
  | "supplier_sales"
  | "supplier_logistics"
  | "supplier_buxgalter"
  // Soliq (tax authority) side
  | "soliq_inspector"
  | "soliq_admin";

// Top-level role for login/registration entry point
export type Role = "store" | "supplier" | "soliq";

export interface User {
  id: string;
  storeId: string;
  orgId: string | null;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "active" | "blocked" | "pending";
  lastLogin: string | null;
  createdAt: string;
}

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "auth"
  | "view"
  | "system";

export interface AuditEntry {
  id: string;
  storeId: string;
  timestamp: string;
  user: { id: string; name: string; role: UserRole };
  action: AuditAction;
  objectType:
    | "document"
    | "row"
    | "product"
    | "supplier"
    | "user"
    | "insight"
    | "integration"
    | "auth"
    | "system"
    | "company"
    // Supplier portal additions
    | "store"
    | "invoice"
    | "payment"
    | "order"
    | "route";
  objectId: string;
  objectLabel?: string;
  details?: string;
  ip: string;
}

export interface CompanyInfo {
  storeId: string;
  stir: string;
  stirVerified: boolean;
  name: string;
  activity: string;
  address: string;
  director: string;
  phone: string;
  email: string;
  website: string;
}

// ============================================================
// Supplier (ta'minotchi / distribyutor) portal — domain types
// ============================================================

export interface SupplierCompany {
  id: string; // sup_company_*
  name: string; // "Alpha Distribution OOO"
  stir: string;
  director: string;
  phone: string;
  email: string;
  address: string;
  brandType: "local" | "international" | "exclusive";
  region: string; // primary HQ region
  fleetSize: number;
  warehouseAddress: string;
  createdAt: string;
}

// "Store" from the SUPPLIER's perspective (their customer)
export interface SupplierStore {
  id: string;
  supplierId: string;
  storeId: string; // back-ref to store_demo_01 type
  name: string;
  stir: string;
  director: string;
  phone: string;
  region: string; // viloyat
  district: string; // tuman
  status: "active" | "slow" | "inactive"; // active=<7d, slow=7-14d, inactive=14+d
  reliabilityScore: number; // 0-10
  monthlyVolume: number; // so'm
  totalLifetimeVolume: number;
  lastOrderAt: string;
  creditLimit: number;
  outstandingBalance: number;
  joinedAt: string;
  growthPercent: number; // % vs prev month
}

export type OutgoingInvoiceStatus =
  | "draft"
  | "sent"
  | "received"
  | "approved"
  | "preparing"
  | "delivering"
  | "delivered"
  | "paid"
  | "cancelled";

export interface OutgoingInvoiceItem {
  productId: string;
  name: string;
  mxik: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OutgoingInvoice {
  id: string;
  supplierId: string;
  storeId: string;
  number: string; // "AD-2026-0042"
  status: OutgoingInvoiceStatus;
  items: OutgoingInvoiceItem[];
  totalAmount: number;
  sentAt: string;
  dueDate: string;
  paidAt: string | null;
  trackingNote?: string;
}

export type PaymentStatus = "pending" | "paid" | "overdue" | "partial";

export type PaymentMethod = "click" | "payme" | "bank" | "cash";

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  supplierId: string;
  storeId: string;
  invoiceNumber: string;
  storeName: string;
  amount: number;
  paidAmount: number; // for partial payments
  invoiceDate: string;
  dueDate: string;
  paidAt: string | null;
  status: PaymentStatus;
  daysOverdue: number;
  method?: PaymentMethod;
}

export interface DemandSignal {
  id: string;
  productId: string;
  productName: string;
  region: string;
  district?: string;
  weeklyVolume: number;
  trendPercent: number;
  predictedNextWeek: number;
  hotness: "rising" | "stable" | "falling";
}

export type SupplierProductCategory =
  | "ichimliklar"
  | "oziq-ovqat"
  | "sigaret"
  | "maishiy"
  | "kosmetika"
  | "boshqa";

export interface SupplierProduct {
  id: string;
  supplierId: string;
  name: string;
  mxik: string;
  category: SupplierProductCategory;
  unit: string;
  basePrice: number;
  stock: number;
  monthlySales: number;
  trendPercent: number;
}

export type IncomingOrderStatus = "pending" | "accepted" | "rejected" | "fulfilled";

export interface IncomingOrder {
  id: string;
  supplierId: string;
  storeId: string;
  storeName: string;
  number: string; // "ORD-2026-NNNN"
  items: OutgoingInvoiceItem[];
  totalAmount: number;
  requestedAt: string;
  status: IncomingOrderStatus;
  rejectionReason?: string;
}

export interface DeliveryRouteStop {
  storeId: string;
  storeName: string;
  eta: string;
  status: "pending" | "delivered";
}

export interface DeliveryRoute {
  id: string;
  supplierId: string;
  driverName: string;
  vehiclePlate: string;
  stops: DeliveryRouteStop[];
  startedAt: string;
  estimatedCompletion: string;
}
