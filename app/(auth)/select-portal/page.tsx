import Link from "next/link";
import { redirect } from "next/navigation";
import { Store, Truck, ShieldCheck, ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { auth } from "@/lib/api";
import { readClaims } from "@/lib/api/auth-cookies";
import {
  selectStoreAction,
  selectSupplierAction,
  type Membership,
} from "@/lib/actions/auth";

// Local view onto auth.me() — typed loosely so we accept both the camelized
// Membership shape from the resource and any raw snake_case fields.
interface MeResponseLike {
  user?: { id?: string; phone?: string; full_name?: string } | null;
  memberships?: Membership[];
  activeStoreId?: string | null;
  activeTenantId?: string | null;
  active_store_id?: string | null;
  active_tenant_id?: string | null;
}

function membershipPortal(m: Membership): "store" | "supplier" | "soliq" {
  if (m.portal) return m.portal;
  if (m.supplier || m.tenant_id || m.tenantId) return "supplier";
  return "store";
}

function membershipName(m: Membership): string {
  return (
    m.store_name ??
    m.storeName ??
    m.name ??
    m.store?.name ??
    m.supplier?.name ??
    (m.id as string | undefined) ??
    "—"
  );
}

function membershipId(m: Membership): string | undefined {
  return (
    m.store_id ??
    m.storeId ??
    m.store?.id ??
    m.tenant_id ??
    m.tenantId ??
    m.supplier?.id ??
    (m.id as string | undefined)
  );
}

function portalIcon(portal: "store" | "supplier" | "soliq") {
  if (portal === "supplier") return Truck;
  if (portal === "soliq") return ShieldCheck;
  return Store;
}

function portalLabel(portal: "store" | "supplier" | "soliq") {
  if (portal === "supplier") return "Ta'minotchi portali";
  if (portal === "soliq") return "Soliq portali";
  return "Korxona portali";
}

async function handleSelect(formData: FormData) {
  "use server";
  const portal = String(formData.get("portal") || "");
  const id = String(formData.get("id") || "");
  if (!id) redirect("/login");

  if (portal === "supplier") {
    const res = await selectSupplierAction(id);
    if (!res.ok) redirect("/login");
    redirect("/supplier/dashboard");
  } else {
    const res = await selectStoreAction(id);
    if (!res.ok) redirect("/login");
    redirect("/dashboard");
  }
}

export default async function SelectPortalPage() {
  const claims = await readClaims();
  if (!claims) redirect("/login");

  let memberships: Membership[] = [];
  try {
    const me = (await auth.me()) as unknown as MeResponseLike;
    memberships = (me?.memberships ?? []) as Membership[];
  } catch {
    redirect("/login");
  }

  if (memberships.length === 0) {
    redirect("/register");
  }

  if (memberships.length === 1) {
    const m = memberships[0];
    const portal = membershipPortal(m);
    const id = membershipId(m);
    if (id) {
      if (portal === "supplier") {
        const sel = await selectSupplierAction(id);
        if (sel.ok) redirect("/supplier/dashboard");
      } else {
        const sel = await selectStoreAction(id);
        if (sel.ok) redirect("/dashboard");
      }
    }
    redirect("/login");
  }

  return (
    <div className="w-full max-w-[480px]">
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          Qaysi portalga kirasiz?
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
          Telefon raqamingizga bir nechta hisob biriktirilgan. Davom etish uchun birini tanlang.
        </p>
      </div>

      <Card className="shadow-md">
        <div className="space-y-3 p-6">
          {memberships.map((m, idx) => {
            const portal = membershipPortal(m);
            const id = membershipId(m) ?? "";
            const Icon = portalIcon(portal);
            return (
              <form
                key={(id || "row") + idx}
                action={handleSelect}
                className="contents"
              >
                <input type="hidden" name="portal" value={portal} />
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  disabled={!id}
                  className="group flex w-full items-center gap-4 rounded-md border border-border bg-surface-card p-4 text-left transition-colors hover:border-navy-700 hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-md bg-ink-100 text-ink-700 transition-colors group-hover:bg-navy-700 group-hover:text-white">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-ink-900">
                      {membershipName(m)}
                    </div>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-ink-600">
                      {portalLabel(portal)}
                      {m.role && (
                        <>
                          <span className="mx-1.5 text-ink-300">·</span>
                          <span className="font-mono uppercase tracking-wide text-ink-500">
                            {m.role}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-ink-400 transition-colors group-hover:text-navy-700" />
                </button>
              </form>
            );
          })}
        </div>
      </Card>

      <p className="mt-6 text-center text-[13px] text-ink-600">
        Boshqa hisob bilan kirish kerakmi?{" "}
        <Link
          href="/login"
          className="font-semibold text-navy-700 dark:text-navy-300 hover:text-navy-600"
        >
          Kirish sahifasiga qaytish →
        </Link>
      </p>
    </div>
  );
}
