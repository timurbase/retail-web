"use server";

import { revalidatePath } from "next/cache";
import * as store from "../store";
import type { AuditAction } from "../types";

function revalidate() {
  revalidatePath("/sozlamalar");
  revalidatePath("/audit-log");
}

interface LogIntegrationInput {
  action: AuditAction;
  integrationId: string;
  integrationLabel: string;
  details?: string;
}

/**
 * Lightweight audit-only action for integration buttons.
 * Integrations live as a static config in the UI — no DB row yet — but we still
 * want every mutation (configure/disconnect/sync) to land in the audit log so
 * Auditor / Admin roles can see who changed integration state.
 */
export async function logIntegrationAction(input: LogIntegrationInput) {
  store.logIntegrationEvent(
    input.action,
    input.integrationId,
    input.integrationLabel,
    input.details
  );
  revalidate();
  return { ok: true };
}
