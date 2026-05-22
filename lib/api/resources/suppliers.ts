/**
 * Suppliers resource (store-portal view) — vendors the store buys from.
 */

import "server-only";
import { apiFetch } from "../client";
import { camelize, snakeify } from "../transform";
import type { Supplier } from "@/lib/types";

export interface SuppliersListParams {
  verified?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SuppliersListResult {
  count: number;
  results: Supplier[];
}

export type SupplierCreateInput = Omit<Supplier, "id" | "storeId" | "orgId">;
export type SupplierPatch = Partial<Omit<Supplier, "id" | "storeId" | "orgId">>;

export interface StirLookupResult {
  stir: string;
  name: string;
  director?: string;
  address?: string;
  activity?: string;
  verified: boolean;
  source?: string;
}

function asListResult(raw: unknown): SuppliersListResult {
  const obj = camelize(raw) as { count?: number; results?: Supplier[] } | Supplier[];
  if (Array.isArray(obj)) return { count: obj.length, results: obj };
  return { count: obj.count ?? 0, results: obj.results ?? [] };
}

export const suppliers = {
  async list(params: SuppliersListParams = {}): Promise<SuppliersListResult> {
    const raw = await apiFetch<unknown>("/api/suppliers/", { query: params });
    return asListResult(raw);
  },

  async create(input: SupplierCreateInput): Promise<Supplier> {
    const raw = await apiFetch<unknown>("/api/suppliers/", {
      method: "POST",
      body: snakeify(input) as Record<string, unknown>,
    });
    return camelize(raw) as Supplier;
  },

  async get(id: string): Promise<Supplier> {
    const raw = await apiFetch<unknown>(`/api/suppliers/${id}/`);
    return camelize(raw) as Supplier;
  },

  async update(id: string, patch: SupplierPatch): Promise<Supplier> {
    const raw = await apiFetch<unknown>(`/api/suppliers/${id}/`, {
      method: "PATCH",
      body: snakeify(patch) as Record<string, unknown>,
    });
    return camelize(raw) as Supplier;
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/suppliers/${id}/`, { method: "DELETE" });
  },

  async lookupStir(stir: string): Promise<StirLookupResult> {
    const raw = await apiFetch<unknown>("/api/suppliers/lookup-stir/", {
      query: { stir },
    });
    return camelize(raw) as StirLookupResult;
  },
};
