/**
 * Server-only auth cookie helpers.
 *
 * Cookies:
 *  - rf_access   httpOnly, sameSite=lax, 30min
 *  - rf_refresh  httpOnly, sameSite=lax, 14d
 *  - rf_claims   httpOnly, sameSite=lax, mirrors access lifetime
 *
 * `rf_claims` carries a JSON copy of the JWT payload (decode-only, not verified)
 * so `proxy.ts` can route-gate without decoding JWT in edge runtime.
 */

import "server-only";
import { cookies } from "next/headers";

export interface AuthClaims {
  user_id: string;
  /** Selected portal for the current session. */
  active_portal?: "store" | "supplier" | "soliq";
  /** Active tenant (supplier company OR store) — current preferred field. */
  active_tenant_id?: string;
  /** Legacy alias used by `/auth/select-store` responses. */
  active_store_id?: string;
  role?: string;
}

const ACCESS = "rf_access";
const REFRESH = "rf_refresh";
const CLAIMS = "rf_claims";

const ACCESS_MAX_AGE = 60 * 30; // 30 min
const REFRESH_MAX_AGE = 60 * 60 * 24 * 14; // 14 d

const COOKIE_BASE = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

/**
 * Decode the JWT payload without verifying the signature. Backend rejects
 * forged tokens — this is only used to mirror claims into rf_claims for
 * fast read in proxy.ts.
 */
export function decodeJwtPayload(token: string): AuthClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf-8");
    const parsed = JSON.parse(json) as Record<string, unknown>;

    const user_id =
      (parsed.user_id as string | undefined) ??
      (parsed.sub as string | undefined) ??
      (parsed.uid as string | undefined);
    if (!user_id) return null;

    return {
      user_id,
      active_portal: parsed.active_portal as AuthClaims["active_portal"],
      active_tenant_id: parsed.active_tenant_id as string | undefined,
      active_store_id: parsed.active_store_id as string | undefined,
      role: parsed.role as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function setAuthCookies(
  access: string,
  refresh: string,
  claims?: AuthClaims | null,
): Promise<void> {
  const jar = await cookies();
  const effectiveClaims = claims ?? decodeJwtPayload(access);

  jar.set(ACCESS, access, { ...COOKIE_BASE, maxAge: ACCESS_MAX_AGE });
  jar.set(REFRESH, refresh, { ...COOKIE_BASE, maxAge: REFRESH_MAX_AGE });
  if (effectiveClaims) {
    jar.set(CLAIMS, JSON.stringify(effectiveClaims), {
      ...COOKIE_BASE,
      maxAge: ACCESS_MAX_AGE,
    });
  }
}

/** Refresh the access token only (without a new refresh token). */
export async function rotateAccessCookie(
  access: string,
  refresh?: string,
  claims?: AuthClaims | null,
): Promise<void> {
  const jar = await cookies();
  const effectiveClaims = claims ?? decodeJwtPayload(access);
  jar.set(ACCESS, access, { ...COOKIE_BASE, maxAge: ACCESS_MAX_AGE });
  if (refresh) {
    jar.set(REFRESH, refresh, { ...COOKIE_BASE, maxAge: REFRESH_MAX_AGE });
  }
  if (effectiveClaims) {
    jar.set(CLAIMS, JSON.stringify(effectiveClaims), {
      ...COOKIE_BASE,
      maxAge: ACCESS_MAX_AGE,
    });
  }
}

export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS);
  jar.delete(REFRESH);
  jar.delete(CLAIMS);
}

export async function readAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACCESS)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFRESH)?.value ?? null;
}

export async function readClaims(): Promise<AuthClaims | null> {
  const jar = await cookies();
  const raw = jar.get(CLAIMS)?.value;
  if (!raw) {
    // Fall back to decoding from access token if claims cookie missing.
    const access = jar.get(ACCESS)?.value;
    return access ? decodeJwtPayload(access) : null;
  }
  try {
    return JSON.parse(raw) as AuthClaims;
  } catch {
    return null;
  }
}

export const COOKIE_NAMES = {
  ACCESS,
  REFRESH,
  CLAIMS,
} as const;
