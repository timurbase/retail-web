"use server";

import { revalidatePath } from "next/cache";
import * as store from "../store";
import type { CompanyInfo } from "../types";

function revalidate() {
  revalidatePath("/sozlamalar");
  revalidatePath("/audit-log");
}

export async function updateCompanyAction(
  patch: Partial<Omit<CompanyInfo, "storeId">>
) {
  const c = store.updateCompany(patch);
  revalidate();
  return { ok: true, company: c };
}
