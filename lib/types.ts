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

export type UserRole = "admin" | "omborchi" | "buxgalter" | "kassir" | "auditor" | "firma";

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
  objectType: "document" | "row" | "product" | "supplier" | "user" | "insight" | "integration" | "auth" | "system" | "company";
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
