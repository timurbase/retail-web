"use server";

/**
 * Auth server actions — boundary between client auth pages and the backend.
 *
 * Pages NEVER call `apiFetch` or resource modules directly; they invoke
 * these `*Action` functions. Cookies are set/cleared here so they always
 * propagate through Next's response.
 *
 * Naming + behaviour follows INTEGRATION_CONTRACT.md §4 (auth flow).
 */

import { redirect } from "next/navigation";
import { auth, users } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import {
  setAuthCookies,
  clearAuthCookies,
  readClaims,
  type AuthClaims,
} from "@/lib/api/auth-cookies";

// ===================== TYPES =====================

export type OtpPurpose = "login" | "register" | "reset";

export interface ActionOk {
  ok: true;
}

export interface ActionErr {
  ok: false;
  error: string;
  /** Backend error code (e.g. "no_user", "invalid", "too_many_attempts"). */
  code?: string;
  /** Field-level validation errors from DRF. */
  fields?: Record<string, string[]>;
}

export interface SendOtpResult extends ActionOk {
  /** Seconds until the OTP expires (informational, drives resend countdown). */
  ttl?: number;
  phone?: string;
}

/**
 * Membership shape — accepts BOTH snake_case (raw from verify-otp) and
 * camelCase (from `auth.me()` which goes through `camelize`).
 */
export type Membership = {
  id?: string;
  // snake_case (raw)
  store_id?: string;
  tenant_id?: string;
  store_name?: string;
  is_active?: boolean;
  // camelCase (camelized)
  storeId?: string;
  tenantId?: string;
  storeName?: string;
  isActive?: boolean;
  // nested objects (whichever the backend chooses)
  store?: { id?: string; name?: string };
  supplier?: { id?: string; name?: string };
  portal?: "store" | "supplier" | "soliq";
  role?: string;
  name?: string;
  [k: string]: unknown;
};

export interface VerifyOtpResult extends ActionOk {
  memberships: Membership[];
  active_store_id?: string | null;
  active_tenant_id?: string | null;
  /** Portal that the freshly-issued token selected, if any. */
  active_portal?: "store" | "supplier" | "soliq" | null;
  user?: { id?: string; phone?: string; full_name?: string } | null;
}

export interface RegisterResult extends ActionOk {
  active_store_id?: string | null;
  active_tenant_id?: string | null;
  active_portal?: "store" | "supplier" | "soliq" | null;
}

export interface SelectResult extends ActionOk {
  active_portal: "store" | "supplier";
  active_id: string;
  role?: string;
}

export interface InviteSummary extends ActionOk {
  succeeded: number;
  failed: { phone: string; error: string }[];
}

// ===================== HELPERS =====================

function fromError(e: unknown, fallback: string): ActionErr {
  if (e instanceof ApiError) {
    return {
      ok: false,
      error: e.message || fallback,
      code: e.code,
      fields: e.fields,
    };
  }
  if (e instanceof Error) return { ok: false, error: e.message || fallback };
  return { ok: false, error: fallback };
}

/**
 * Backend accepts both "901234567" (9 digits) and "+998901234567".
 * Normalise to e164 form for consistency.
 */
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 12 && digits.startsWith("998")) return `+${digits}`;
  if (raw.startsWith("+")) return raw;
  return digits ? `+${digits}` : raw;
}

interface VerifyOtpBackendResponse {
  access?: string;
  refresh?: string;
  user?: { id?: string; phone?: string; full_name?: string };
  memberships?: Membership[];
  active_store_id?: string | null;
  active_tenant_id?: string | null;
  active_portal?: "store" | "supplier" | "soliq" | null;
}

interface SelectBackendResponse {
  access?: string;
  refresh?: string;
  active_store_id?: string | null;
  active_tenant_id?: string | null;
  active_portal?: "store" | "supplier";
  role?: string;
}

// ===================== ACTIONS =====================

export async function sendOtpAction(
  phone: string,
  purpose: OtpPurpose,
): Promise<SendOtpResult | ActionErr> {
  try {
    const res = (await auth.sendOtp({
      phone: normalisePhone(phone),
      purpose,
    })) as { ttl?: number; phone?: string } | null;
    return { ok: true, ttl: res?.ttl, phone: res?.phone };
  } catch (e) {
    return fromError(e, "SMS yuborishda xatolik. Qayta urinib ko'ring.");
  }
}

/**
 * Verify OTP and (if the response carries tokens) set the auth cookies.
 *
 * After this returns, the caller decides where to route based on
 * `memberships` + the role the user picked on the login form.
 */
export async function verifyOtpAction(
  phone: string,
  code: string,
  purpose: OtpPurpose,
): Promise<VerifyOtpResult | ActionErr> {
  try {
    const res = (await auth.verifyOtp({
      phone: normalisePhone(phone),
      code,
      purpose,
    })) as VerifyOtpBackendResponse;

    if (res?.access && res?.refresh) {
      await setAuthCookies(res.access, res.refresh);
    }

    return {
      ok: true,
      memberships: res?.memberships ?? [],
      active_store_id: res?.active_store_id ?? null,
      active_tenant_id: res?.active_tenant_id ?? null,
      active_portal: res?.active_portal ?? null,
      user: res?.user ?? null,
    };
  } catch (e) {
    return fromError(e, "Tasdiqlash kodi noto'g'ri yoki muddati o'tgan.");
  }
}

/**
 * Finalize store registration after a `purpose=register` verify-otp.
 * Caller MUST be authenticated (verify-otp set cookies).
 */
export async function registerAction(input: {
  stir: string;
  company_name: string;
  full_name: string;
  director?: string;
  address?: string;
  email?: string;
  region?: string;
  district?: string;
}): Promise<RegisterResult | ActionErr> {
  try {
    const res = (await auth.register(input)) as VerifyOtpBackendResponse;
    if (res?.access && res?.refresh) {
      await setAuthCookies(res.access, res.refresh);
    }
    return {
      ok: true,
      active_store_id: res?.active_store_id ?? null,
      active_tenant_id: res?.active_tenant_id ?? null,
      active_portal: res?.active_portal ?? "store",
    };
  } catch (e) {
    return fromError(e, "Hisob yaratishda xatolik. Qayta urinib ko'ring.");
  }
}

export async function selectStoreAction(
  storeId: string,
): Promise<SelectResult | ActionErr> {
  try {
    const res = (await auth.selectStore({ store_id: storeId })) as SelectBackendResponse;
    if (res?.access && res?.refresh) {
      await setAuthCookies(res.access, res.refresh);
    }
    return {
      ok: true,
      active_portal: "store",
      active_id: res?.active_store_id ?? storeId,
      role: res?.role,
    };
  } catch (e) {
    return fromError(e, "Korxonani tanlashda xatolik.");
  }
}

export async function selectSupplierAction(
  tenantId: string,
): Promise<SelectResult | ActionErr> {
  try {
    const res = (await auth.selectSupplier({ supplier_id: tenantId })) as SelectBackendResponse;
    if (res?.access && res?.refresh) {
      await setAuthCookies(res.access, res.refresh);
    }
    return {
      ok: true,
      active_portal: "supplier",
      active_id: res?.active_tenant_id ?? tenantId,
      role: res?.role,
    };
  } catch (e) {
    return fromError(e, "Ta'minotchini tanlashda xatolik.");
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await auth.logout();
  } catch {
    // Best-effort — local cookies are the source of truth client-side.
  }
  await clearAuthCookies();
  redirect("/login");
}

export async function getClaimsAction(): Promise<AuthClaims | null> {
  return readClaims();
}

/**
 * Bulk-invite team members during onboarding. Skips empty rows; keeps going
 * on per-row failures so the user gets a single summary.
 */
export async function inviteTeamAction(
  invites: { phone: string; full_name?: string; email?: string; role: string }[],
): Promise<InviteSummary | ActionErr> {
  const cleaned = invites.filter((i) => (i.phone || i.email)?.trim());
  if (cleaned.length === 0) return { ok: true, succeeded: 0, failed: [] };

  let succeeded = 0;
  const failed: { phone: string; error: string }[] = [];

  for (const row of cleaned) {
    try {
      // Forms collect emails today; backend wants a phone. If only an email is
      // supplied, derive a placeholder so the call doesn't fail — backend will
      // reject obviously-bad input via field errors.
      const phoneOrEmail = row.phone?.trim() || row.email?.trim() || "";
      const payload: Record<string, string> = {
        phone: normalisePhone(phoneOrEmail),
        role: row.role,
      };
      if (row.full_name) payload.full_name = row.full_name;
      if (row.email) payload.email = row.email;
      await users.invite(payload);
      succeeded += 1;
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Noma'lum xato";
      failed.push({ phone: row.phone || row.email || "—", error: msg });
    }
  }

  return { ok: true, succeeded, failed };
}
