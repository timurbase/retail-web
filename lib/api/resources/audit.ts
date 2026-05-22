/**
 * Audit log resource — read-only.
 */

import "server-only";
import { apiFetch } from "../client";
import { camelize } from "../transform";
import type { AuditEntry } from "@/lib/types";

export interface AuditListParams {
  action?: string;
  objectType?: string;
  actor?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AuditListResult {
  count: number;
  results: AuditEntry[];
}

function toQueryParams(p: AuditListParams): Record<string, string | number | undefined> {
  return {
    action: p.action,
    object_type: p.objectType,
    actor: p.actor,
    from_date: p.fromDate,
    to_date: p.toDate,
    search: p.search,
    limit: p.limit,
    offset: p.offset,
  };
}

export const audit = {
  async list(params: AuditListParams = {}): Promise<AuditListResult> {
    const raw = await apiFetch<unknown>("/api/audit-log/", {
      query: toQueryParams(params),
    });
    const obj = camelize(raw) as
      | { count?: number; results?: AuditEntry[] }
      | AuditEntry[];
    if (Array.isArray(obj)) return { count: obj.length, results: obj };
    return { count: obj.count ?? 0, results: obj.results ?? [] };
  },
};
