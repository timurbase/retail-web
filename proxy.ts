/**
 * Route gate / proxy (Next.js 16 — formerly `middleware.ts`).
 *
 * Reads `rf_claims` cookie (httpOnly, set by lib/api/auth-cookies.ts after
 * verify-otp / select-store / select-supplier). No signature check here —
 * backend rejects forged JWTs on every request.
 *
 * Rules:
 *  - Public routes always pass.
 *  - Unauthenticated visit to private route → /login?next=<pathname>.
 *  - active_portal="store" hitting a supplier-only route → /dashboard.
 *  - active_portal="supplier" hitting a store-only route → /supplier/dashboard.
 *  - Authenticated user with no portal claim (signed up but didn't pick one)
 *    → /login (Agent B's /select-portal page is TODO).
 *
 * The matcher excludes _next/*, /api/*, and static files for performance.
 */

import { NextResponse, type NextRequest } from "next/server";

const CLAIMS_COOKIE = "rf_claims";

// Routes that anyone can visit (no auth required).
// Note: the matcher already excludes `/api/*`, so we don't list them here.
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/about",
  "/blog",
  "/yordam",
  "/maxfiylik",
  "/oferta",
  "/shartlar",
  "/status",
  "/bog-lanish",
];

// Routes accessible only when active_portal === "supplier".
const SUPPLIER_PREFIXES = ["/supplier"];

// Routes accessible only when active_portal === "store".
// Mirrors app/(app)/* directories. Listed explicitly so a sibling route
// added under app/(supplier)/* doesn't accidentally match a store prefix.
const STORE_PREFIXES = [
  "/dashboard",
  "/hujjatlar",
  "/review-queue",
  "/ombor",
  "/nomenklatura",
  "/yetkazib-beruvchilar",
  "/insights",
  "/audit-log",
  "/sozlamalar",
  "/hisobotlar",
  "/buyurtmalar",
  "/inventarizatsiya",
  "/mxik-search",
  "/notifications",
  "/profil",
  "/qidirish",
  "/onboarding",
  "/distributor",
];

interface SimpleClaims {
  user_id?: string;
  active_portal?: "store" | "supplier" | "soliq";
  active_tenant_id?: string;
  active_store_id?: string;
}

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function readClaims(req: NextRequest): SimpleClaims | null {
  const raw = req.cookies.get(CLAIMS_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SimpleClaims;
  } catch {
    return null;
  }
}

function redirect(req: NextRequest, dest: string, preserveNext?: boolean): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = dest;
  url.search = "";
  if (preserveNext && req.nextUrl.pathname !== "/") {
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  }
  return NextResponse.redirect(url);
}

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const claims = readClaims(req);

  // Public route — always pass. If authenticated and on /login, send them home.
  if (isPublic(pathname)) {
    if (claims?.active_portal && (pathname === "/login" || pathname === "/register")) {
      return redirect(
        req,
        claims.active_portal === "supplier" ? "/supplier/dashboard" : "/dashboard",
      );
    }
    return NextResponse.next();
  }

  // Below this point: route requires auth.
  if (!claims?.user_id) {
    return redirect(req, "/login", true);
  }

  // Portal claim missing — user authenticated but hasn't selected a tenant.
  // Agent B will build /select-portal; until then route to /login.
  if (!claims.active_portal) {
    return redirect(req, "/login");
  }

  const wantsSupplier = matchesPrefix(pathname, SUPPLIER_PREFIXES);
  const wantsStore = matchesPrefix(pathname, STORE_PREFIXES);

  if (wantsSupplier && claims.active_portal !== "supplier") {
    return redirect(req, "/dashboard");
  }
  if (wantsStore && claims.active_portal === "supplier") {
    return redirect(req, "/supplier/dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except: api, _next internals, favicon, common static assets.
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpe?g|gif|svg|webp|ico|css|js|woff2?)$).*)",
  ],
};
