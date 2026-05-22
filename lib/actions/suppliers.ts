"use server";

import { revalidatePath } from "next/cache";
import { suppliers, ApiError } from "@/lib/api";
import type { Supplier } from "../types";

function revalidate() {
  revalidatePath("/yetkazib-beruvchilar");
  revalidatePath("/hujjatlar");
  revalidatePath("/dashboard");
  revalidatePath("/audit-log");
}

export async function createSupplierAction(
  data: Omit<Supplier, "id" | "storeId" | "orgId">,
) {
  try {
    const s = await suppliers.create(data);
    revalidate();
    return { ok: true as const, supplier: s };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "Yetkazib beruvchi qo'shilmadi" };
  }
}

export async function updateSupplierAction(
  id: string,
  patch: Partial<Omit<Supplier, "id" | "storeId">>,
) {
  try {
    const s = await suppliers.update(id, patch);
    revalidate();
    return { ok: true as const, supplier: s };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "Tahrirlashda xato" };
  }
}

export async function deleteSupplierAction(id: string) {
  try {
    await suppliers.remove(id);
    revalidate();
    return { ok: true as const };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false as const, error: e.message, code: e.code };
    }
    return { ok: false as const, error: "O'chirishda xato" };
  }
}
