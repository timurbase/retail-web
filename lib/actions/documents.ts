"use server";

import { revalidatePath } from "next/cache";
import { documents, ApiError } from "@/lib/api";
import type { MxikSuggestion } from "../types";
import type { ManualDocInput as StoreManualDocInput } from "../store";

const REVALIDATE_PATHS = [
  "/dashboard",
  "/hujjatlar",
  "/review-queue",
  "/audit-log",
  "/hisobotlar",
];

function revalidateAll(docId?: string) {
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  if (docId) revalidatePath(`/hujjatlar/${docId}`);
}

function err(e: unknown, fallback: string) {
  if (e instanceof ApiError) {
    return { ok: false as const, error: e.message, code: e.code };
  }
  return { ok: false as const, error: fallback };
}

export async function approveDocumentAction(id: string) {
  try {
    await documents.approve(id);
    revalidateAll(id);
    return { ok: true as const };
  } catch (e) {
    return err(e, "Hujjat tasdiqlanmadi");
  }
}

export async function rejectDocumentAction(id: string, reason?: string) {
  try {
    await documents.reject(id, reason);
    revalidateAll(id);
    return { ok: true as const };
  } catch (e) {
    return err(e, "Hujjat rad etilmadi");
  }
}

export async function deleteDocumentAction(id: string) {
  try {
    await documents.remove(id);
    revalidateAll();
    return { ok: true as const };
  } catch (e) {
    return err(e, "Hujjat o'chirilmadi");
  }
}

export async function approveRowAction(docId: string, rowId: string) {
  try {
    await documents.approveRow(docId, rowId);
    revalidateAll(docId);
    return { ok: true as const };
  } catch (e) {
    return err(e, "Qator tasdiqlanmadi");
  }
}

export async function rejectRowAction(
  docId: string,
  rowId: string,
  reason?: string,
) {
  try {
    await documents.rejectRow(docId, rowId, reason);
    revalidateAll(docId);
    return { ok: true as const };
  } catch (e) {
    return err(e, "Qator rad etilmadi");
  }
}

export async function updateRowMxikAction(
  docId: string,
  rowId: string,
  mxik: MxikSuggestion,
) {
  try {
    await documents.updateRowMxik(docId, rowId, mxik);
    revalidateAll(docId);
    return { ok: true as const };
  } catch (e) {
    return err(e, "MXIK saqlanmadi");
  }
}

export async function selectVariantAction(
  docId: string,
  rowId: string,
  variantCode: string,
) {
  try {
    await documents.selectVariant(docId, rowId, variantCode);
    revalidateAll(docId);
    return { ok: true as const };
  } catch (e) {
    return err(e, "Variant tanlanmadi");
  }
}

export async function bulkApproveHighConfidenceAction(docId: string) {
  try {
    const r = await documents.bulkApproveHighConfidence(docId);
    revalidateAll(docId);
    return { ok: true as const, count: r.count };
  } catch (e) {
    return err(e, "Bulk tasdiqlash bajarilmadi");
  }
}

export async function createManualDocumentAction(input: StoreManualDocInput) {
  try {
    const doc = await documents.createManual({
      supplierId: input.supplierId,
      number: input.number,
      date: input.date,
      rows: input.rows.map((r) => ({
        rawName: r.rawName,
        mxik: r.mxik,
        unit: r.unit,
        quantity: r.quantity,
        price: r.price,
        mappedProductId: r.mappedProductId ?? null,
      })),
    });
    revalidateAll(doc?.id);
    return { ok: true as const, document: doc };
  } catch (e) {
    return err(e, "Hujjat yaratilmadi");
  }
}
