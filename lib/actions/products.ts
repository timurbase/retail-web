"use server";

import { revalidatePath } from "next/cache";
import { products, ApiError } from "@/lib/api";
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
  data: Omit<Product, "id" | "storeId" | "lastReceivedAt">,
) {
  try {
    const p = await products.create(data);
    revalidate();
    return { ok: true as const, product: p };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "Mahsulot qo'shilmadi" };
  }
}

export async function updateProductAction(
  id: string,
  patch: Partial<Omit<Product, "id" | "storeId">>,
) {
  try {
    const p = await products.update(id, patch);
    revalidate();
    return { ok: true as const, product: p };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "Tahrirlashda xato" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await products.remove(id);
    revalidate();
    return { ok: true as const };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "O'chirishda xato" };
  }
}

export async function adjustStockAction(
  id: string,
  kind: StockMovementKind,
  qty: number,
  reason?: string,
) {
  try {
    const p = await products.adjustStock(id, { kind, qty, reason });
    revalidate();
    return { ok: true as const, product: p };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "Ombor harakatini saqlashda xato" };
  }
}
