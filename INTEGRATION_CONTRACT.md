# Frontend ↔ Backend Integration Contract

Generated 2026-05-21 — Sprint 2 integration spec. Agents A/B/C/D read this and
work against the same contract so their work composes without rework.

Backend base URL in dev: `http://127.0.0.1:8000`.
Frontend env: `NEXT_PUBLIC_API_BASE_URL` (read by `lib/api/client.ts`).

---

## 1. `lib/api/` shape (built by Agent A)

```
lib/api/
├── client.ts             // apiFetch<T>(path, init) — bearer auth, 401→refresh
├── auth-cookies.ts       // httpOnly cookie storage (server-only)
├── errors.ts             // ApiError class
├── types.ts              // generated via `openapi-typescript /api/schema/`
├── resources/
│   ├── auth.ts           // sendOtp / verifyOtp / register / selectStore /
│   │                     //   selectSupplier / refresh / logout / me
│   ├── company.ts        // get / patch
│   ├── users.ts          // list / invite / update / remove / toggleStatus
│   ├── suppliers.ts      // list / create / get / update / remove / lookupStir
│   ├── products.ts       // list / create / get / update / remove /
│   │                     //   adjustStock / stats / mxikSearch
│   ├── documents.ts      // list / get / createManual / approve / reject /
│   │                     //   remove / bulkApproveHighConfidence /
│   │                     //   approveRow / rejectRow / updateRowMxik /
│   │                     //   selectVariant / stats
│   ├── audit.ts          // list (filters)
│   └── supplier-portal/
│       ├── company.ts    // get / patch (own SupplierCompany)
│       ├── stores.ts     // list / create / get / update / remove /
│       │                 //   updateCreditLimit
│       ├── products.ts   // list / create / update / remove
│       ├── invoices.ts   // list / create / get / remove / markDelivered /
│       │                 //   markPaid
│       ├── orders.ts     // list / get / accept / reject
│       ├── payments.ts   // list / aging
│       ├── demandSignals.ts // list / create / update / remove
│       ├── routes.ts     // list / create / get / update / remove
│       ├── kpi.ts        // dashboard
│       └── insights.ts   // get
└── index.ts              // re-export
```

### `apiFetch<T>` signature

```ts
export type Json = Record<string, unknown> | unknown[] | null;

export interface ApiInit extends Omit<RequestInit, "body"> {
  body?: Json;
  /** Skip auth header (used by send-otp etc). Default false. */
  anonymous?: boolean;
}

export async function apiFetch<T>(path: string, init?: ApiInit): Promise<T>;
```

Behaviour:
1. Prepend `process.env.NEXT_PUBLIC_API_BASE_URL` (default `http://127.0.0.1:8000`).
2. JSON-encode body, set `Content-Type: application/json`.
3. Read access token from cookie (`rf_access`); if missing and not anonymous → throw.
4. On 401: call `/api/auth/refresh/` with `rf_refresh` cookie, retry once, update cookies.
5. On non-2xx: throw `ApiError(status, errorBody)`.
6. Return parsed JSON typed as `T`.

### `auth-cookies.ts` (server-only)

Uses Next.js `cookies()` from `next/headers`. Three helpers:

```ts
setAuthCookies(access: string, refresh: string, activeTenant?: AuthClaims): void
clearAuthCookies(): void
readAccessToken(): string | null
readClaims(): AuthClaims | null  // decode-and-trust JWT payload (no signature check on client side; backend verifies)
```

Cookie names:
- `rf_access` (httpOnly, sameSite=lax, 30min) — access token
- `rf_refresh` (httpOnly, sameSite=lax, 14d) — refresh token
- `rf_claims` (httpOnly, sameSite=lax, mirrors access lifetime) — JSON `{user_id, active_portal, active_tenant_id, role}` for middleware route gates without JWT decode

### `errors.ts`

```ts
export class ApiError extends Error {
  status: number;
  code?: string;        // backend `code` field if present (e.g. "no_user", "stir_taken")
  fields?: Record<string, string[]>;  // serializer field errors
  constructor(status: number, body: { error?: string; code?: string; [k: string]: any });
}
```

---

## 2. Backend endpoints — quick reference

All paths under `/api/`. JWT bearer required unless noted.

### Auth (anonymous + authenticated)
```
POST   /auth/send-otp/         {phone, purpose} → {phone, ttl}
POST   /auth/verify-otp/       {phone, code, purpose} → {access, refresh, user, memberships, active_store_id}
POST   /auth/register/         {stir, company_name, full_name, ...} → {access, refresh, user, memberships, active_store_id}
POST   /auth/select-store/     {store_id} → {access, refresh, active_store_id, role}
POST   /auth/select-supplier/  {tenant_id} → {access, refresh, active_tenant_id, role}
POST   /auth/refresh/          {refresh} → {access, refresh?}
POST   /auth/logout/           {refresh} → 200
GET    /auth/me/               → {user, memberships, active_store_id}
GET    /auth/users/            list members of active store (admin)
POST   /auth/users/invite/     {phone, full_name?, email?, role} → membership
PATCH  /auth/users/{id}/       partial update
DELETE /auth/users/{id}/
POST   /auth/users/{id}/toggle-status/
```

### Store portal (active_portal=store)
```
GET    /company/                              GET company info (all members)
PATCH  /company/                              update (admin only)

GET    /suppliers/?verified=&search=          list + filter
POST   /suppliers/                            create (admin, omborchi)
GET    /suppliers/{id}/, PATCH, DELETE
GET    /suppliers/lookup-stir/?stir=          Soliq.uz mock

GET    /products/?has_mxik=&low_stock=&search=
POST   /products/, GET/PATCH/DELETE /products/{id}/
POST   /products/{id}/stock-adjust/   {kind, qty, reason?}
GET    /products/stats/               → {total, critical, atMin, ok, withMxik, withoutMxik}
GET    /mxik/?q=&limit=10             typeahead suggestions

GET    /documents/?status=&supplier=&source=&search=
POST   /documents/manual/             {supplier_id, number, date, rows[]}
GET    /documents/{id}/, DELETE
POST   /documents/{id}/approve/       posts StockMovements for mapped rows
POST   /documents/{id}/reject/        {reason?}
POST   /documents/{id}/bulk-approve-high-confidence/
POST   /documents/{doc}/rows/{row}/approve/
POST   /documents/{doc}/rows/{row}/reject/   {reason?}
PATCH  /documents/{doc}/rows/{row}/mxik/     {code, name, confidence}
POST   /documents/{doc}/rows/{row}/select-variant/  {code}
GET    /documents/stats/              → {newToday, reviewQueue, autoApprovalRate, totalRows, approvedRows}

GET    /audit-log/?action=&object_type=&actor=&from_date=&to_date=&search=
```

### Supplier portal (active_portal=supplier)
```
GET    /supplier/company/, PATCH
GET    /supplier/stores/?status=&region=&search=&ordering=
POST   /supplier/stores/, GET/PATCH/DELETE /supplier/stores/{id}/
POST   /supplier/stores/{id}/credit-limit/   {limit}

GET    /supplier/products/?category=&search=
POST   /supplier/products/, full CRUD

GET    /supplier/invoices/?status=&store=&search=&from=&to=&ordering=
POST   /supplier/invoices/   {store_id, items[], due_date?, tracking_note?}
GET    /supplier/invoices/{id}/, DELETE (draft/cancelled only)
POST   /supplier/invoices/{id}/mark-delivered/   {tracking_note?}
POST   /supplier/invoices/{id}/mark-paid/        {method}

GET    /supplier/orders/?status=&search=
GET    /supplier/orders/{id}/
POST   /supplier/orders/{id}/accept/
POST   /supplier/orders/{id}/reject/   {reason}

GET    /supplier/payments/?status=&aging=0-30|31-60|61-90|90+&search=&ordering=
GET    /supplier/payments/aging/   → {buckets: [{label, count, sum}]}

GET    /supplier/demand-signals/?region=&hotness=&ordering=-trend_percent
POST   /supplier/demand-signals/, full CRUD

GET    /supplier/routes/, POST, GET/PATCH/DELETE {id}

GET    /supplier/kpi/dashboard/    → {active_stores, total_stores, today_invoices, outstanding_payments, monthly_revenue}
GET    /supplier/insights/         → {churn_risk, growth_candidates, overdue, rising_region}
```

---

## 3. Response shapes — quirks to handle

- Backend uses **snake_case** for fields (e.g. `current_stock`, `last_received_at`). Frontend types use **camelCase**. Resource modules **must transform both ways** — define a `to*` (server→client) and `from*` (client→server) mapper per entity. Keep transforms in `lib/api/resources/*.ts` next to the resource.
- List endpoints use DRF `LimitOffsetPagination` → `{count, next, previous, results}`. Resource list helpers return `{count, results: T[]}`.
- Error envelope from backend: `{error: string, code?: string}` for custom errors; `{field: ["..."]}` for serializer field errors. `ApiError` normalises both.
- Date fields:
  - Plain dates (`document.date`, `due_date`) — ISO `YYYY-MM-DD`.
  - Timestamps — ISO 8601 with timezone (e.g. `2026-05-21T08:42:00+05:00`).

---

## 4. Auth flow

### Login (store or supplier)
```
1. Frontend POST /api/auth/send-otp/ {phone, purpose:"login"}
2. UI shows OTP input
3. Frontend POST /api/auth/verify-otp/ {phone, code, purpose:"login"}
4. Response includes memberships[] and active_store_id (auto-selected if single membership)
5. setAuthCookies(access, refresh, claims)
6. If memberships.length === 1 → router.push based on portal
7. Else → /select-portal page (lists memberships, calls select-store or select-supplier)
```

### Register (store)
```
1-3. Same as login but purpose:"register"
4. verify-otp returns user but memberships=[]
5. UI shows wizard step 2+ (STIR, company info, OTP done)
6. POST /api/auth/register/ {stir, company_name, full_name, ...}
7. Response gives active_store_id; setAuthCookies; router.push("/onboarding")
```

### Register (supplier) — for now, route to manual STIR onboarding endpoint TBD; Agent A leaves a TODO stub since backend doesn't expose it yet. Agent B keeps the supplier register wizard collecting data and submits to a placeholder `/api/auth/register-supplier/` (which Agent A adds as a backend issue note).

### Forgot password — `purpose:"reset"` send-otp + verify-otp; new password endpoint TBD on backend — Agent B leaves a clear TODO.

### Middleware route map

```
/login, /register, /forgot-password         — public
/                                            — marketing layout (auth not required but if logged in, redirect to dashboard)
/onboarding                                  — auth required, portal=store
/(app)/*                                     — auth required, portal=store; if portal=supplier → redirect /supplier/dashboard
/(supplier)/*                                — auth required, portal=supplier; if portal=store → redirect /dashboard
/admin/*                                     — backend, ignore
```

Middleware reads `rf_claims` cookie (no signature check; backend rejects forged tokens anyway). If missing or wrong portal → redirect.

---

## 5. Server Action layer

Existing `lib/actions/*.ts` files (8 of them) are kept and converted:

```ts
// before:
export async function createProductAction(data) {
  const p = store.createProduct(data);
  revalidate();
  return { ok: true, product: p };
}

// after:
"use server";
import { products } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createProductAction(data) {
  try {
    const p = await products.create(data);
    revalidatePath("/nomenklatura");
    return { ok: true, product: p };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : "Xato" };
  }
}
```

This way every existing modal/form that calls `<action>Action(...)` keeps working unchanged. Only the action body swaps.

---

## 6. Page-level changes

Pages currently do:
```ts
import { getProducts } from "@/lib/store";
export default function NomenklaturaPage() {
  const products = getProducts();  // sync
  ...
}
```

Become:
```ts
import { products as productsApi } from "@/lib/api";
export default async function NomenklaturaPage() {
  const { results: products } = await productsApi.list();
  ...
}
```

Pages must become `async` and remove the `getProducts()` import. Mock seeds in `lib/store.ts` and `lib/mock-data.ts` and `lib/supplier-seed.ts` stay for now (used by review-queue / insights / demand-signals seeding via backend Django fixtures — backend can be seeded separately).

---

## 7. Acceptance criteria (verifiable)

Per agent, the following must pass at completion:

- `bunx tsc --noEmit` clean
- `bunx next build` succeeds (or `dev` boots without runtime error on a route walk)
- A logged-in user can:
  - Register → land on dashboard
  - Login (store admin) → see real `/api/company/` data
  - Create product → reload → product persists (real backend round-trip)
  - Stock-adjust → audit log shows entry
  - Supplier admin can list stores from `/api/supplier/stores/`
- A logged-out user hitting `/dashboard` is redirected to `/login`
- A store admin hitting `/supplier/dashboard` is redirected to `/dashboard`

---

## 8. Out of scope (this sprint)

- Real-time WebSocket / SSE
- File upload (Excel / PDF / photo) — keep current mock buttons with toast
- pgvector MXIK matching — stub seed list already in place
- Soliq.uz live STIR lookup — mock for "3"-prefixed STIRs
- Eskiz.uz SMS — console only; OTP appears in backend log

---

This file is the agreed contract for Sprint 2 integration. Agents must not
silently diverge from the resource shapes / cookie names / route map above.
If a discrepancy is unavoidable, the agent notes it in their final report.
