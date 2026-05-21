"use server";

import { revalidatePath } from "next/cache";
import * as store from "../store";
import type { MxikSuggestion } from "../types";

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

export async function approveDocumentAction(id: string) {
  const ok = store.approveDocument(id);
  revalidateAll(id);
  return { ok };
}

export async function rejectDocumentAction(id: string, reason?: string) {
  const ok = store.rejectDocument(id, reason);
  revalidateAll(id);
  return { ok };
}

export async function deleteDocumentAction(id: string) {
  const ok = store.deleteDocument(id);
  revalidateAll();
  return { ok };
}

export async function approveRowAction(docId: string, rowId: string) {
  const ok = store.approveRow(docId, rowId);
  revalidateAll(docId);
  return { ok };
}

export async function rejectRowAction(docId: string, rowId: string, reason?: string) {
  const ok = store.rejectRow(docId, rowId, reason);
  revalidateAll(docId);
  return { ok };
}

export async function updateRowMxikAction(
  docId: string,
  rowId: string,
  mxik: MxikSuggestion
) {
  const ok = store.updateRowMxik(docId, rowId, mxik);
  revalidateAll(docId);
  return { ok };
}

export async function selectVariantAction(
  docId: string,
  rowId: string,
  variantCode: string
) {
  const ok = store.selectVariant(docId, rowId, variantCode);
  revalidateAll(docId);
  return { ok };
}

export async function bulkApproveHighConfidenceAction(docId: string) {
  const count = store.bulkApproveHighConfidence(docId);
  revalidateAll(docId);
  return { ok: true, count };
}
