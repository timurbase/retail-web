"use server";

import { revalidatePath } from "next/cache";
import { company, ApiError } from "@/lib/api";
import type { CompanyInfo } from "../types";

function revalidate() {
  revalidatePath("/sozlamalar");
  revalidatePath("/audit-log");
}

export async function updateCompanyAction(
  patch: Partial<Omit<CompanyInfo, "storeId">>,
) {
  try {
    const c = await company.patch(patch);
    revalidate();
    return { ok: true as const, company: c };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "Saqlashda xato" };
  }
}
