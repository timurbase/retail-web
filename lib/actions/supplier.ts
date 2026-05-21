"use server";

import { revalidatePath } from "next/cache";
import * as store from "../store";
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

// ============================================================
// Stores (customer network)
// ============================================================

export async function inviteStoreAction(input: InviteStoreInput) {
  const s = store.inviteStore(input);
  revalidate();
  return { ok: true, store: s };
}

export async function updateCreditLimitAction(id: string, limit: number) {
  const s = store.updateStoreCreditLimit(id, limit);
  revalidate(`/supplier/do-konlar/${id}`);
  return { ok: !!s, store: s };
}

// ============================================================
// Invoices
// ============================================================

export async function createInvoiceAction(input: CreateOutgoingInvoiceInput) {
  const inv = store.createOutgoingInvoice(input);
  revalidate(inv ? `/supplier/hujjatlar/${inv.id}` : undefined);
  return { ok: !!inv, invoice: inv };
}

export async function markInvoiceDeliveredAction(id: string) {
  const ok = store.markInvoiceDelivered(id);
  revalidate(`/supplier/hujjatlar/${id}`);
  return { ok };
}

export async function markInvoicePaidAction(id: string, method: PaymentMethod) {
  const ok = store.markInvoicePaid(id, method);
  revalidate(`/supplier/hujjatlar/${id}`);
  return { ok };
}

export async function bulkSendInvoicesAction(invoices: CreateOutgoingInvoiceInput[]) {
  const result = store.bulkSendInvoices(invoices);
  revalidate();
  return result;
}

// ============================================================
// Orders (incoming from stores)
// ============================================================

export async function acceptOrderAction(id: string) {
  const ok = store.acceptIncomingOrder(id);
  revalidate(`/supplier/buyurtmalar/${id}`);
  return { ok };
}

export async function rejectOrderAction(id: string, reason: string) {
  const ok = store.rejectIncomingOrder(id, reason);
  revalidate(`/supplier/buyurtmalar/${id}`);
  return { ok };
}
