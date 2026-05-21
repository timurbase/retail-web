"use server";

import { revalidatePath } from "next/cache";
import * as store from "../store";
import type { Supplier } from "../types";

function revalidate() {
  revalidatePath("/yetkazib-beruvchilar");
  revalidatePath("/hujjatlar");
  revalidatePath("/dashboard");
  revalidatePath("/audit-log");
}

export async function createSupplierAction(
  data: Omit<Supplier, "id" | "storeId" | "orgId">
) {
  const s = store.createSupplier(data);
  revalidate();
  return { ok: true, supplier: s };
}

export async function updateSupplierAction(
  id: string,
  patch: Partial<Omit<Supplier, "id" | "storeId">>
) {
  const s = store.updateSupplier(id, patch);
  revalidate();
  return { ok: !!s, supplier: s };
}

export async function deleteSupplierAction(id: string) {
  const ok = store.deleteSupplier(id);
  revalidate();
  return { ok };
}
