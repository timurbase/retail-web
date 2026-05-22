/**
 * Products resource — store catalog.
 */

import "server-only";
import { apiFetch } from "../client";
import { camelize, snakeify } from "../transform";
import type { Product, MxikSuggestion } from "@/lib/types";

export interface ProductsListParams {
  hasMxik?: boolean;
  lowStock?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ProductsListResult {
  count: number;
  results: Product[];
}

export type ProductCreateInput = Omit<Product, "id" | "storeId" | "lastReceivedAt">;
export type ProductPatch = Partial<Omit<Product, "id" | "storeId">>;

export type StockAdjustKind = "kirim" | "chiqim" | "inventarizatsiya";

export interface StockAdjustInput {
  kind: StockAdjustKind;
  qty: number;
  reason?: string;
}

export interface ProductStats {
  total: number;
  critical: number;
  atMin: number;
  ok: number;
  withMxik: number;
  withoutMxik: number;
}

function asListResult(raw: unknown): ProductsListResult {
  const obj = camelize(raw) as { count?: number; results?: Product[] } | Product[];
  if (Array.isArray(obj)) return { count: obj.length, results: obj };
  return { count: obj.count ?? 0, results: obj.results ?? [] };
}

export const products = {
  async list(params: ProductsListParams = {}): Promise<ProductsListResult> {
    // hasMxik / lowStock arrive as camelCase from callers but DRF expects snake_case query keys.
    const query: Record<string, string | number | boolean | undefined> = {
      has_mxik: params.hasMxik,
      low_stock: params.lowStock,
      search: params.search,
      limit: params.limit,
      offset: params.offset,
    };
    const raw = await apiFetch<unknown>("/api/products/", { query });
    return asListResult(raw);
  },

  async create(input: ProductCreateInput): Promise<Product> {
    const raw = await apiFetch<unknown>("/api/products/", {
      method: "POST",
      body: snakeify(input) as Record<string, unknown>,
    });
    return camelize(raw) as Product;
  },

  async get(id: string): Promise<Product> {
    const raw = await apiFetch<unknown>(`/api/products/${id}/`);
    return camelize(raw) as Product;
  },

  async update(id: string, patch: ProductPatch): Promise<Product> {
    const raw = await apiFetch<unknown>(`/api/products/${id}/`, {
      method: "PATCH",
      body: snakeify(patch) as Record<string, unknown>,
    });
    return camelize(raw) as Product;
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/products/${id}/`, { method: "DELETE" });
  },

  async adjustStock(id: string, input: StockAdjustInput): Promise<Product> {
    const raw = await apiFetch<unknown>(`/api/products/${id}/stock-adjust/`, {
      method: "POST",
      body: snakeify(input) as Record<string, unknown>,
    });
    return camelize(raw) as Product;
  },

  async stats(): Promise<ProductStats> {
    const raw = await apiFetch<unknown>("/api/products/stats/");
    return camelize(raw) as ProductStats;
  },

  async mxikSearch(q: string, limit = 10): Promise<MxikSuggestion[]> {
    const raw = await apiFetch<unknown>("/api/mxik/", {
      query: { q, limit },
    });
    const arr = camelize(raw) as MxikSuggestion[] | { results?: MxikSuggestion[] };
    if (Array.isArray(arr)) return arr;
    return arr.results ?? [];
  },
};
