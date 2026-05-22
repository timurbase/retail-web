/**
 * Documents resource — invoices the store receives from suppliers.
 *
 * The store can:
 *  - list/get/approve/reject/delete whole documents,
 *  - approve/reject/edit individual rows,
 *  - bulk-approve high-confidence rows.
 *
 * Row mutations all go through a single backend route:
 *   POST/PATCH /api/documents/{doc_id}/rows/{row_id}/{verb}/
 */

import "server-only";
import { apiFetch } from "../client";
import { camelize, snakeify } from "../transform";
import type {
  RetailDocument,
  MxikSuggestion,
} from "@/lib/types";

export interface DocumentsListParams {
  status?: string;
  supplier?: string;
  source?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface DocumentsListResult {
  count: number;
  results: RetailDocument[];
}

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
  date: string;
  rows: ManualDocRowInput[];
}

export interface DocumentStats {
  newToday: number;
  reviewQueue: number;
  autoApprovalRate: number;
  totalRows: number;
  approvedRows: number;
}

function asListResult(raw: unknown): DocumentsListResult {
  const obj = camelize(raw) as
    | { count?: number; results?: RetailDocument[] }
    | RetailDocument[];
  if (Array.isArray(obj)) return { count: obj.length, results: obj };
  return { count: obj.count ?? 0, results: obj.results ?? [] };
}

export const documents = {
  async list(params: DocumentsListParams = {}): Promise<DocumentsListResult> {
    const raw = await apiFetch<unknown>("/api/documents/", { query: params });
    return asListResult(raw);
  },

  async get(id: string): Promise<RetailDocument> {
    const raw = await apiFetch<unknown>(`/api/documents/${id}/`);
    return camelize(raw) as RetailDocument;
  },

  async createManual(payload: ManualDocInput): Promise<RetailDocument> {
    const raw = await apiFetch<unknown>("/api/documents/manual/", {
      method: "POST",
      body: snakeify(payload) as Record<string, unknown>,
    });
    return camelize(raw) as RetailDocument;
  },

  async approve(id: string): Promise<RetailDocument> {
    const raw = await apiFetch<unknown>(`/api/documents/${id}/approve/`, {
      method: "POST",
    });
    return camelize(raw) as RetailDocument;
  },

  async reject(id: string, reason?: string): Promise<RetailDocument> {
    const raw = await apiFetch<unknown>(`/api/documents/${id}/reject/`, {
      method: "POST",
      body: reason ? { reason } : null,
    });
    return camelize(raw) as RetailDocument;
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/documents/${id}/`, { method: "DELETE" });
  },

  async bulkApproveHighConfidence(id: string): Promise<{ count: number }> {
    const raw = await apiFetch<unknown>(
      `/api/documents/${id}/bulk-approve-high-confidence/`,
      { method: "POST" },
    );
    return camelize(raw) as { count: number };
  },

  async approveRow(docId: string, rowId: string): Promise<void> {
    await apiFetch<void>(
      `/api/documents/${docId}/rows/${rowId}/approve/`,
      { method: "POST" },
    );
  },

  async rejectRow(docId: string, rowId: string, reason?: string): Promise<void> {
    await apiFetch<void>(
      `/api/documents/${docId}/rows/${rowId}/reject/`,
      { method: "POST", body: reason ? { reason } : null },
    );
  },

  async updateRowMxik(
    docId: string,
    rowId: string,
    mxik: MxikSuggestion,
  ): Promise<void> {
    await apiFetch<void>(
      `/api/documents/${docId}/rows/${rowId}/mxik/`,
      {
        method: "PATCH",
        body: snakeify(mxik) as Record<string, unknown>,
      },
    );
  },

  async selectVariant(
    docId: string,
    rowId: string,
    code: string,
  ): Promise<void> {
    await apiFetch<void>(
      `/api/documents/${docId}/rows/${rowId}/select-variant/`,
      { method: "POST", body: { code } },
    );
  },

  async stats(): Promise<DocumentStats> {
    const raw = await apiFetch<unknown>("/api/documents/stats/");
    return camelize(raw) as DocumentStats;
  },
};
