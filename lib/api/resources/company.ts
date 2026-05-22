/**
 * Company resource — single record per store; current member's tenant.
 */

import "server-only";
import { apiFetch } from "../client";
import { camelize, snakeify } from "../transform";
import type { CompanyInfo } from "@/lib/types";

type CompanyPatch = Partial<Omit<CompanyInfo, "storeId">>;

export const company = {
  async get(): Promise<CompanyInfo> {
    const raw = await apiFetch<unknown>("/api/company/");
    return camelize(raw) as CompanyInfo;
  },

  async patch(patch: CompanyPatch): Promise<CompanyInfo> {
    const raw = await apiFetch<unknown>("/api/company/", {
      method: "PATCH",
      body: snakeify(patch) as Record<string, unknown>,
    });
    return camelize(raw) as CompanyInfo;
  },
};
