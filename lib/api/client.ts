/**
 * apiFetch — server-only HTTP client for the RetailFlow API.
 *
 * Behaviour (per INTEGRATION_CONTRACT §1):
 *  1. Prepend NEXT_PUBLIC_API_BASE_URL (default http://127.0.0.1:8000).
 *  2. JSON-encode body, set Content-Type: application/json.
 *  3. Read access token from rf_access cookie unless `anonymous: true`.
 *  4. On 401: call /api/auth/refresh/ with rf_refresh, swap cookies, retry once.
 *  5. On non-2xx: throw ApiError(status, errorBody).
 *  6. Return parsed JSON typed as T.
 *
 * Client components never call this directly — they invoke server actions
 * that call this from the server side.
 */

import "server-only";
import { ApiError, type ApiErrorBody } from "./errors";
import {
  readAccessToken,
  readRefreshToken,
  rotateAccessCookie,
  clearAuthCookies,
} from "./auth-cookies";

export type Json = Record<string, unknown> | unknown[] | null;

export interface ApiInit extends Omit<RequestInit, "body"> {
  /** JSON-encodable body. */
  body?: Json;
  /** Skip Authorization header (used by send-otp, verify-otp, register, refresh). */
  anonymous?: boolean;
  /** Skip the 401-refresh retry loop (used internally by refresh itself). */
  skipRefresh?: boolean;
  /** Query params appended to the URL. Values are stringified; nullish skipped. */
  query?: Record<string, string | number | boolean | undefined | null> | object;
}

const DEFAULT_BASE = "http://127.0.0.1:8000";

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE;
}

function buildUrl(path: string, query?: ApiInit["query"]): string {
  const url = new URL(
    path.startsWith("http") ? path : `${baseUrl().replace(/\/$/, "")}${path}`,
  );
  if (query) {
    for (const [k, v] of Object.entries(query as Record<string, unknown>)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function parseResponse(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

interface RefreshResponse {
  access?: string;
  refresh?: string;
}

async function attemptRefresh(): Promise<boolean> {
  const refresh = await readRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(buildUrl("/api/auth/refresh/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const body = (await parseResponse(res)) as RefreshResponse | null;
    if (!body || !body.access) return false;
    await rotateAccessCookie(body.access, body.refresh);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: ApiInit = {},
): Promise<T> {
  const { body, anonymous, skipRefresh, query, headers, ...rest } = init;

  const reqHeaders = new Headers(headers);
  if (!reqHeaders.has("Accept")) reqHeaders.set("Accept", "application/json");
  if (body !== undefined && !reqHeaders.has("Content-Type")) {
    reqHeaders.set("Content-Type", "application/json");
  }

  if (!anonymous) {
    const token = await readAccessToken();
    if (token) {
      reqHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = buildUrl(path, query);
  const requestInit: RequestInit = {
    cache: "no-store",
    ...rest,
    headers: reqHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  };

  let res = await fetch(url, requestInit);

  if (res.status === 401 && !anonymous && !skipRefresh) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      // Re-read access token (cookie was rotated).
      const token = await readAccessToken();
      if (token) reqHeaders.set("Authorization", `Bearer ${token}`);
      res = await fetch(url, { ...requestInit, headers: reqHeaders });
    } else {
      // Refresh failed — clear cookies so the next page load redirects to /login.
      await clearAuthCookies();
    }
  }

  const parsed = await parseResponse(res);

  if (!res.ok) {
    throw new ApiError(res.status, parsed as ApiErrorBody | string | null);
  }

  return parsed as T;
}
