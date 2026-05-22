/**
 * Supplier portal resource — distributor-side endpoints.
 *
 * All paths under /api/supplier/. Requires active_portal=supplier.
 *
 * Contract groups these into one module with nested namespaces so callers
 * write `supplierPortal.stores.list()` etc. — easier to discover than
 * eight separate sibling modules.
 */

import "server-only";
import { apiFetch } from "../client";
import { camelize, snakeify } from "../transform";
import type {
  SupplierCompany,
  SupplierStore,
  SupplierProduct,
  OutgoingInvoice,
  OutgoingInvoiceItem,
  IncomingOrder,
  PaymentRecord,
  DemandSignal,
  DeliveryRoute,
  PaymentMethod,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Common helpers
// ---------------------------------------------------------------------------

interface ListResult<T> {
  count: number;
  results: T[];
}

function asList<T>(raw: unknown): ListResult<T> {
  const obj = camelize(raw) as { count?: number; results?: T[] } | T[];
  if (Array.isArray(obj)) return { count: obj.length, results: obj };
  return { count: obj.count ?? 0, results: obj.results ?? [] };
}

// ---------------------------------------------------------------------------
// company
// ---------------------------------------------------------------------------

type SupplierCompanyPatch = Partial<Omit<SupplierCompany, "id" | "createdAt">>;

const supplierCompany = {
  async get(): Promise<SupplierCompany> {
    const raw = await apiFetch<unknown>("/api/supplier/company/");
    return camelize(raw) as SupplierCompany;
  },
  async patch(payload: SupplierCompanyPatch): Promise<SupplierCompany> {
    const raw = await apiFetch<unknown>("/api/supplier/company/", {
      method: "PATCH",
      body: snakeify(payload) as Record<string, unknown>,
    });
    return camelize(raw) as SupplierCompany;
  },
};

// ---------------------------------------------------------------------------
// stores (customer network)
// ---------------------------------------------------------------------------

export interface SupplierStoresListParams {
  status?: string;
  region?: string;
  search?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
}

export interface SupplierStoreCreateInput {
  stir: string;
  phone: string;
  name: string;
  region?: string;
  district?: string;
  director?: string;
  creditLimit?: number;
}

export type SupplierStorePatch = Partial<
  Omit<SupplierStore, "id" | "supplierId" | "storeId" | "joinedAt">
>;

const stores = {
  async list(params: SupplierStoresListParams = {}): Promise<ListResult<SupplierStore>> {
    const raw = await apiFetch<unknown>("/api/supplier/stores/", { query: params });
    return asList<SupplierStore>(raw);
  },
  async create(input: SupplierStoreCreateInput): Promise<SupplierStore> {
    const raw = await apiFetch<unknown>("/api/supplier/stores/", {
      method: "POST",
      body: snakeify(input) as Record<string, unknown>,
    });
    return camelize(raw) as SupplierStore;
  },
  async get(id: string): Promise<SupplierStore> {
    const raw = await apiFetch<unknown>(`/api/supplier/stores/${id}/`);
    return camelize(raw) as SupplierStore;
  },
  async update(id: string, patch: SupplierStorePatch): Promise<SupplierStore> {
    const raw = await apiFetch<unknown>(`/api/supplier/stores/${id}/`, {
      method: "PATCH",
      body: snakeify(patch) as Record<string, unknown>,
    });
    return camelize(raw) as SupplierStore;
  },
  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/supplier/stores/${id}/`, { method: "DELETE" });
  },
  async updateCreditLimit(id: string, limit: number): Promise<SupplierStore> {
    const raw = await apiFetch<unknown>(
      `/api/supplier/stores/${id}/credit-limit/`,
      { method: "POST", body: { limit } },
    );
    return camelize(raw) as SupplierStore;
  },
};

// ---------------------------------------------------------------------------
// products
// ---------------------------------------------------------------------------

export interface SupplierProductsListParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export type SupplierProductCreateInput = Omit<
  SupplierProduct,
  "id" | "supplierId" | "monthlySales" | "trendPercent"
>;
export type SupplierProductPatch = Partial<
  Omit<SupplierProduct, "id" | "supplierId">
>;

const supplierProducts = {
  async list(
    params: SupplierProductsListParams = {},
  ): Promise<ListResult<SupplierProduct>> {
    const raw = await apiFetch<unknown>("/api/supplier/products/", { query: params });
    return asList<SupplierProduct>(raw);
  },
  async create(input: SupplierProductCreateInput): Promise<SupplierProduct> {
    const raw = await apiFetch<unknown>("/api/supplier/products/", {
      method: "POST",
      body: snakeify(input) as Record<string, unknown>,
    });
    return camelize(raw) as SupplierProduct;
  },
  async get(id: string): Promise<SupplierProduct> {
    const raw = await apiFetch<unknown>(`/api/supplier/products/${id}/`);
    return camelize(raw) as SupplierProduct;
  },
  async update(id: string, patch: SupplierProductPatch): Promise<SupplierProduct> {
    const raw = await apiFetch<unknown>(`/api/supplier/products/${id}/`, {
      method: "PATCH",
      body: snakeify(patch) as Record<string, unknown>,
    });
    return camelize(raw) as SupplierProduct;
  },
  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/supplier/products/${id}/`, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------------------
// invoices (outgoing from supplier to store)
// ---------------------------------------------------------------------------

export interface InvoicesListParams {
  status?: string;
  store?: string;
  search?: string;
  from?: string;
  to?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
}

export interface CreateInvoiceInput {
  storeId: string;
  items: OutgoingInvoiceItem[];
  dueDate?: string;
  trackingNote?: string;
}

const invoices = {
  async list(params: InvoicesListParams = {}): Promise<ListResult<OutgoingInvoice>> {
    const raw = await apiFetch<unknown>("/api/supplier/invoices/", { query: params });
    return asList<OutgoingInvoice>(raw);
  },
  async create(input: CreateInvoiceInput): Promise<OutgoingInvoice> {
    const raw = await apiFetch<unknown>("/api/supplier/invoices/", {
      method: "POST",
      body: snakeify(input) as Record<string, unknown>,
    });
    return camelize(raw) as OutgoingInvoice;
  },
  async get(id: string): Promise<OutgoingInvoice> {
    const raw = await apiFetch<unknown>(`/api/supplier/invoices/${id}/`);
    return camelize(raw) as OutgoingInvoice;
  },
  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/supplier/invoices/${id}/`, { method: "DELETE" });
  },
  async markDelivered(id: string, trackingNote?: string): Promise<OutgoingInvoice> {
    const raw = await apiFetch<unknown>(
      `/api/supplier/invoices/${id}/mark-delivered/`,
      {
        method: "POST",
        body: trackingNote ? { tracking_note: trackingNote } : null,
      },
    );
    return camelize(raw) as OutgoingInvoice;
  },
  async markPaid(id: string, method: PaymentMethod): Promise<OutgoingInvoice> {
    const raw = await apiFetch<unknown>(
      `/api/supplier/invoices/${id}/mark-paid/`,
      { method: "POST", body: { method } },
    );
    return camelize(raw) as OutgoingInvoice;
  },
};

// ---------------------------------------------------------------------------
// orders (incoming from store to supplier)
// ---------------------------------------------------------------------------

export interface OrdersListParams {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

const orders = {
  async list(params: OrdersListParams = {}): Promise<ListResult<IncomingOrder>> {
    const raw = await apiFetch<unknown>("/api/supplier/orders/", { query: params });
    return asList<IncomingOrder>(raw);
  },
  async get(id: string): Promise<IncomingOrder> {
    const raw = await apiFetch<unknown>(`/api/supplier/orders/${id}/`);
    return camelize(raw) as IncomingOrder;
  },
  async accept(id: string): Promise<IncomingOrder> {
    const raw = await apiFetch<unknown>(`/api/supplier/orders/${id}/accept/`, {
      method: "POST",
    });
    return camelize(raw) as IncomingOrder;
  },
  async reject(id: string, reason: string): Promise<IncomingOrder> {
    const raw = await apiFetch<unknown>(`/api/supplier/orders/${id}/reject/`, {
      method: "POST",
      body: { reason },
    });
    return camelize(raw) as IncomingOrder;
  },
};

// ---------------------------------------------------------------------------
// payments
// ---------------------------------------------------------------------------

export type AgingBucketKey = "0-30" | "31-60" | "61-90" | "90+";

export interface PaymentsListParams {
  status?: string;
  /** Aging bucket — narrower type "0-30" | "31-60" | "61-90" | "90+" is enforced server-side. */
  aging?: AgingBucketKey | string;
  search?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
}

export interface AgingBucket {
  label: string;
  count: number;
  sum: number;
}

const payments = {
  async list(params: PaymentsListParams = {}): Promise<ListResult<PaymentRecord>> {
    const raw = await apiFetch<unknown>("/api/supplier/payments/", { query: params });
    return asList<PaymentRecord>(raw);
  },
  async aging(): Promise<{ buckets: AgingBucket[] }> {
    const raw = await apiFetch<unknown>("/api/supplier/payments/aging/");
    return camelize(raw) as { buckets: AgingBucket[] };
  },
};

// ---------------------------------------------------------------------------
// demand-signals
// ---------------------------------------------------------------------------

export interface DemandSignalsListParams {
  region?: string;
  hotness?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
}

export type DemandSignalCreateInput = Omit<DemandSignal, "id">;
export type DemandSignalPatch = Partial<Omit<DemandSignal, "id">>;

const demandSignals = {
  async list(
    params: DemandSignalsListParams = {},
  ): Promise<ListResult<DemandSignal>> {
    const raw = await apiFetch<unknown>("/api/supplier/demand-signals/", {
      query: params,
    });
    return asList<DemandSignal>(raw);
  },
  async create(input: DemandSignalCreateInput): Promise<DemandSignal> {
    const raw = await apiFetch<unknown>("/api/supplier/demand-signals/", {
      method: "POST",
      body: snakeify(input) as Record<string, unknown>,
    });
    return camelize(raw) as DemandSignal;
  },
  async update(id: string, patch: DemandSignalPatch): Promise<DemandSignal> {
    const raw = await apiFetch<unknown>(
      `/api/supplier/demand-signals/${id}/`,
      {
        method: "PATCH",
        body: snakeify(patch) as Record<string, unknown>,
      },
    );
    return camelize(raw) as DemandSignal;
  },
  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/supplier/demand-signals/${id}/`, {
      method: "DELETE",
    });
  },
};

// ---------------------------------------------------------------------------
// routes
// ---------------------------------------------------------------------------

export interface RoutesListParams {
  limit?: number;
  offset?: number;
}

export type RouteCreateInput = Omit<DeliveryRoute, "id" | "supplierId">;
export type RoutePatch = Partial<Omit<DeliveryRoute, "id" | "supplierId">>;

const routes = {
  async list(params: RoutesListParams = {}): Promise<ListResult<DeliveryRoute>> {
    const raw = await apiFetch<unknown>("/api/supplier/routes/", { query: params });
    return asList<DeliveryRoute>(raw);
  },
  async create(input: RouteCreateInput): Promise<DeliveryRoute> {
    const raw = await apiFetch<unknown>("/api/supplier/routes/", {
      method: "POST",
      body: snakeify(input) as Record<string, unknown>,
    });
    return camelize(raw) as DeliveryRoute;
  },
  async get(id: string): Promise<DeliveryRoute> {
    const raw = await apiFetch<unknown>(`/api/supplier/routes/${id}/`);
    return camelize(raw) as DeliveryRoute;
  },
  async update(id: string, patch: RoutePatch): Promise<DeliveryRoute> {
    const raw = await apiFetch<unknown>(`/api/supplier/routes/${id}/`, {
      method: "PATCH",
      body: snakeify(patch) as Record<string, unknown>,
    });
    return camelize(raw) as DeliveryRoute;
  },
  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/supplier/routes/${id}/`, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------------------
// kpi
// ---------------------------------------------------------------------------

export interface SupplierKpiDashboard {
  activeStores: number;
  totalStores: number;
  todayInvoices: number;
  outstandingPayments: number;
  monthlyRevenue: number;
}

const kpi = {
  async dashboard(): Promise<SupplierKpiDashboard> {
    const raw = await apiFetch<unknown>("/api/supplier/kpi/dashboard/");
    return camelize(raw) as SupplierKpiDashboard;
  },
};

// ---------------------------------------------------------------------------
// insights
// ---------------------------------------------------------------------------

export interface SupplierInsights {
  churnRisk: Array<{ storeId: string; storeName: string; reason: string }>;
  growthCandidates: Array<{ storeId: string; storeName: string; growthPercent: number }>;
  overdue: Array<{ storeId: string; storeName: string; amount: number; days: number }>;
  risingRegion?: { region: string; growthPercent: number };
}

const insights = {
  async get(): Promise<SupplierInsights> {
    const raw = await apiFetch<unknown>("/api/supplier/insights/");
    return camelize(raw) as SupplierInsights;
  },
};

// ---------------------------------------------------------------------------
// public namespace
// ---------------------------------------------------------------------------

export const supplierPortal = {
  company: supplierCompany,
  stores,
  products: supplierProducts,
  invoices,
  orders,
  payments,
  demandSignals,
  routes,
  kpi,
  insights,
};
