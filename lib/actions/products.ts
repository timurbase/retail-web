"use server";

import { revalidatePath } from "next/cache";
import * as store from "../store";
import type { Product } from "../types";
import type { StockMovementKind } from "../store";

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

export async function adjustStockAction(
  id: string,
  kind: StockMovementKind,
  qty: number,
  reason?: string
) {
  const p = store.adjustStock(id, kind, qty, reason);
  revalidate();
  return { ok: !!p, product: p };
}
