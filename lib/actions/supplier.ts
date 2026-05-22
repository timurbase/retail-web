"use server";

import { revalidatePath } from "next/cache";
import { supplierPortal, ApiError } from "@/lib/api";
import type { PaymentMethod } from "../types";
import type {
  CreateOutgoingInvoiceInput,
  InviteStoreInput,
} from "../store";

const REVALIDATE_PATHS = [
  "/supplier/dashboard",
  "/supplier/do-konlar",
  "/supplier/hujjatlar",
  "/supplier/to-lovlar",
  "/supplier/buyurtmalar",
  "/supplier/audit-log",
];

function revalidate(extra?: string) {
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  if (extra) revalidatePath(extra);
}

function err(e: unknown, fallback: string) {
  if (e instanceof ApiError) {
    return { ok: false as const, error: e.message, code: e.code };
  }
  return { ok: false as const, error: fallback };
}

// ============================================================
// Stores (customer network)
// ============================================================

export async function inviteStoreAction(input: InviteStoreInput) {
  try {
    const s = await supplierPortal.stores.create({
      stir: input.stir,
      phone: input.phone,
      name: input.name,
      region: input.region,
      district: input.district,
      director: input.director,
      creditLimit: input.creditLimit,
    });
    revalidate();
    return { ok: true as const, store: s };
  } catch (e) {
    return err(e, "Do'kon taklif qilinmadi");
  }
}

export async function updateCreditLimitAction(id: string, limit: number) {
  try {
    const s = await supplierPortal.stores.updateCreditLimit(id, limit);
    revalidate(`/supplier/do-konlar/${id}`);
    return { ok: true as const, store: s };
  } catch (e) {
    return err(e, "Kredit limiti o'zgartirilmadi");
  }
}

// ============================================================
// Invoices
// ============================================================

export async function createInvoiceAction(input: CreateOutgoingInvoiceInput) {
  try {
    const inv = await supplierPortal.invoices.create({
      storeId: input.storeId,
      items: input.items,
      dueDate: input.dueDate,
      trackingNote: input.trackingNote,
    });
    revalidate(`/supplier/hujjatlar/${inv.id}`);
    return { ok: true as const, invoice: inv };
  } catch (e) {
    return err(e, "Hujjat yaratilmadi");
  }
}

export async function markInvoiceDeliveredAction(id: string) {
  try {
    await supplierPortal.invoices.markDelivered(id);
    revalidate(`/supplier/hujjatlar/${id}`);
    return { ok: true as const };
  } catch (e) {
    return err(e, "Yetkazib berish belgilanmadi");
  }
}

export async function markInvoicePaidAction(id: string, method: PaymentMethod) {
  try {
    await supplierPortal.invoices.markPaid(id, method);
    revalidate(`/supplier/hujjatlar/${id}`);
    return { ok: true as const };
  } catch (e) {
    return err(e, "To'lov belgilanmadi");
  }
}

export async function bulkSendInvoicesAction(
  inputs: CreateOutgoingInvoiceInput[],
) {
  let count = 0;
  const failures: string[] = [];
  for (const input of inputs) {
    try {
      await supplierPortal.invoices.create({
        storeId: input.storeId,
        items: input.items,
        dueDate: input.dueDate,
        trackingNote: input.trackingNote,
      });
      count++;
    } catch (e) {
      if (e instanceof ApiError) failures.push(e.message);
      else failures.push("Noma'lum xato");
    }
  }
  revalidate();
  return {
    ok: failures.length === 0,
    count,
    total: inputs.length,
    failures,
  };
}

// ============================================================
// Orders (incoming from stores)
// ============================================================

export async function acceptOrderAction(id: string) {
  try {
    await supplierPortal.orders.accept(id);
    revalidate(`/supplier/buyurtmalar/${id}`);
    return { ok: true as const };
  } catch (e) {
    return err(e, "Buyurtma qabul qilinmadi");
  }
}

export async function rejectOrderAction(id: string, reason: string) {
  try {
    await supplierPortal.orders.reject(id, reason);
    revalidate(`/supplier/buyurtmalar/${id}`);
    return { ok: true as const };
  } catch (e) {
    return err(e, "Buyurtma rad etilmadi");
  }
}
