/**
 * Auth resource — login / register / portal selection.
 *
 * All endpoints under /api/auth/. send-otp, verify-otp, register, refresh
 * are anonymous (no Bearer token required). Everything else requires auth.
 *
 * Auth endpoint payloads aren't in the OpenAPI schema (FBVs without
 * serializers) — typed inline here based on backend implementation.
 */

import "server-only";
import { apiFetch } from "../client";
import { camelize, snakeify } from "../transform";
import {
  setAuthCookies,
  clearAuthCookies,
  readRefreshToken,
  type AuthClaims,
} from "../auth-cookies";

type OtpPurpose = "login" | "register" | "reset";

export interface Membership {
  /** Unique key — `store:<id>` or `supplier:<tenant>`. */
  id: string;
  portal: "store" | "supplier" | "soliq";
  /** Tenant ID (store or supplier company). */
  tenantId: string;
  /** Legacy: store ID when portal=store. */
  storeId?: string;
  /** Human-readable label (company name). */
  name: string;
  role: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  fullName?: string;
  email?: string;
}

export interface SendOtpResponse {
  phone: string;
  ttl: number;
}

export interface VerifyOtpResponse {
  access: string;
  refresh: string;
  user: AuthUser;
  memberships: Membership[];
  activeStoreId?: string | null;
  activeTenantId?: string | null;
}

export interface RegisterStoreInput {
  stir: string;
  company_name: string;
  full_name: string;
  activity?: string;
  director?: string;
  address?: string;
  /** Phone is read from the verified OTP context server-side, but accepted if present. */
  phone?: string;
}

/**
 * Loosely-typed shape returned by /api/auth/me/.
 * Snake_case keys preserved as backend sends them; consumers may also access
 * arbitrary keys (the index signature on the returned type permits this).
 */
export interface MeResponse {
  user: AuthUser & { full_name?: string; fullName?: string };
  memberships: Array<Membership & {
    tenant_id?: string;
    store_id?: string;
    is_active?: boolean;
    [k: string]: unknown;
  }>;
  active_store_id?: string | null;
  activeStoreId?: string | null;
  active_tenant_id?: string | null;
  activeTenantId?: string | null;
  active_portal?: AuthClaims["active_portal"];
  activePortal?: AuthClaims["active_portal"];
}

/** Type-safe camelize wrapper for resource responses. */
function fromServer<T>(value: unknown): T {
  return camelize(value) as T;
}

export const auth = {
  async sendOtp(input: {
    phone: string;
    purpose: OtpPurpose;
  }): Promise<Record<string, unknown>> {
    const raw = (await apiFetch<unknown>("/api/auth/send-otp/", {
      method: "POST",
      anonymous: true,
      body: snakeify(input) as Record<string, unknown>,
    })) as Record<string, unknown> | null;
    return raw ?? {};
  },

  /**
   * Returns the raw backend body (snake_case keys preserved).
   * On success, sets auth cookies if access+refresh present.
   */
  async verifyOtp(input: {
    phone: string;
    code: string;
    purpose: OtpPurpose;
  }): Promise<Record<string, unknown>> {
    const raw = (await apiFetch<unknown>("/api/auth/verify-otp/", {
      method: "POST",
      anonymous: true,
      body: snakeify(input) as Record<string, unknown>,
    })) as Record<string, unknown>;
    const access = raw?.access as string | undefined;
    const refresh = raw?.refresh as string | undefined;
    if (access && refresh) {
      await setAuthCookies(access, refresh);
    }
    return raw ?? {};
  },

  async register(
    input: RegisterStoreInput | Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const raw = (await apiFetch<unknown>("/api/auth/register/", {
      method: "POST",
      anonymous: true,
      body: snakeify(input) as Record<string, unknown>,
    })) as Record<string, unknown>;
    const access = raw?.access as string | undefined;
    const refresh = raw?.refresh as string | undefined;
    if (access && refresh) {
      await setAuthCookies(access, refresh);
    }
    return raw ?? {};
  },

  /**
   * Select a store. Accepts either a bare store id or `{store_id: ...}`.
   * Returns the raw backend response (snake_case fields preserved) so
   * callers that need `access_token`-style access don't lose information.
   */
  async selectStore(
    input: string | { store_id: string },
  ): Promise<Record<string, unknown>> {
    const body = typeof input === "string" ? { store_id: input } : input;
    const raw = (await apiFetch<unknown>("/api/auth/select-store/", {
      method: "POST",
      body,
    })) as Record<string, unknown>;
    const access = raw?.access as string | undefined;
    const refresh = raw?.refresh as string | undefined;
    if (access && refresh) {
      await setAuthCookies(access, refresh);
    }
    return raw ?? {};
  },

  async selectSupplier(
    input: string | { supplier_id: string },
  ): Promise<Record<string, unknown>> {
    const body = typeof input === "string" ? { supplier_id: input } : input;
    const raw = (await apiFetch<unknown>("/api/auth/select-supplier/", {
      method: "POST",
      body,
    })) as Record<string, unknown>;
    const access = raw?.access as string | undefined;
    const refresh = raw?.refresh as string | undefined;
    if (access && refresh) {
      await setAuthCookies(access, refresh);
    }
    return raw ?? {};
  },

  /**
   * Returns the raw backend body (snake_case preserved) so existing callers
   * that destructure `tenant_id` / `active_store_id` / etc. continue to work.
   * Typed loosely on purpose; cast at the call site if needed.
   */
  async me(): Promise<MeResponse & Record<string, unknown>> {
    const raw = (await apiFetch<unknown>("/api/auth/me/")) as Record<string, unknown>;
    return (raw ?? {}) as MeResponse & Record<string, unknown>;
  },

  async logout(): Promise<void> {
    const refresh = await readRefreshToken();
    try {
      if (refresh) {
        await apiFetch("/api/auth/logout/", {
          method: "POST",
          body: { refresh },
        });
      }
    } catch {
      // Best-effort: even if backend rejects, we still clear local cookies.
    } finally {
      await clearAuthCookies();
    }
  },

  /** Explicit refresh — `apiFetch` does this automatically on 401. */
  async refresh(): Promise<{ access: string; refresh?: string }> {
    const refresh = await readRefreshToken();
    if (!refresh) throw new Error("No refresh token");
    const raw = await apiFetch<{ access: string; refresh?: string }>(
      "/api/auth/refresh/",
      {
        method: "POST",
        anonymous: true,
        skipRefresh: true,
        body: { refresh },
      },
    );
    if (raw.access) {
      await setAuthCookies(raw.access, raw.refresh ?? refresh);
    }
    return raw;
  },
};
