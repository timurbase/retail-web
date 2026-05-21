"use server";

import { revalidatePath } from "next/cache";
import * as store from "../store";
import type { Product } from "../types";

function revalidate() {
  revalidatePath("/nomenklatura");
  revalidatePath("/ombor");
  revalidatePath("/dashboard");
  revalidatePath("/audit-log");
  revalidatePath("/hisobotlar");
}

export async function createProductAction(
  data: Omit<Product, "id" | "storeId" | "lastReceivedAt">
) {
  const p = store.createProduct(data);
  revalidate();
  return { ok: true, product: p };
}

export async function updateProductAction(
  id: string,
  patch: Partial<Omit<Product, "id" | "storeId">>
) {
  const p = store.updateProduct(id, patch);
  revalidate();
  return { ok: !!p, product: p };
}

export async function deleteProductAction(id: string) {
  const ok = store.deleteProduct(id);
  revalidate();
  return { ok };
}
