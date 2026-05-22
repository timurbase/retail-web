"use server";

// TODO(backend): insights endpoints (dismiss/act/dismissAll) not yet exposed.
// Keep the in-memory store fallback until the backend ships /api/insights/*.

import { revalidatePath } from "next/cache";
import * as store from "../store";

function revalidate() {
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  revalidatePath("/audit-log");
}

export async function dismissInsightAction(id: string) {
  const ok = store.dismissInsight(id);
  revalidate();
  return { ok };
}

export async function actOnInsightAction(id: string) {
  const ok = store.actOnInsight(id);
  revalidate();
  return { ok };
}

export async function dismissAllInsightsAction() {
  const count = store.dismissAllInsights();
  revalidate();
  return { ok: true, count };
}
