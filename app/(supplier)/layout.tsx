import {
  SupplierSidebar,
  type SupplierSidebarUser,
  type SupplierSidebarBadges,
} from "@/components/supplier/supplier-sidebar";
import { buildSupplierSidebarUser } from "@/lib/sidebar-helpers";
import { AIHelper } from "@/components/ai-helper/ai-helper";
import { auth, supplierPortal } from "@/lib/api";
import { readClaims } from "@/lib/api/auth-cookies";

interface LayoutData {
  user?: SupplierSidebarUser;
  badges: SupplierSidebarBadges;
}

/**
 * Loads identity + live supplier sidebar badge counts once per request.
 * Pending orders, overdue payments, and rising demand signals each map
 * to a badge so operators see urgency at a glance.
 */
async function loadLayoutData(): Promise<LayoutData> {
  const claims = await readClaims().catch(() => null);

  const [meRes, companyRes, ordersRes, paymentsRes, demandRes] =
    await Promise.allSettled([
      auth.me() as Promise<{
        user?: { full_name?: string; phone?: string };
        memberships?: Array<{ role?: string; tenant_id?: string }>;
      }>,
      supplierPortal.company.get() as Promise<{ name?: string } | null>,
      supplierPortal.orders.list({ status: "pending", limit: 1 }),
      supplierPortal.payments.list({ status: "overdue", limit: 1 }),
      supplierPortal.demandSignals.list({ hotness: "rising", limit: 1 }),
    ]);

  let user: SupplierSidebarUser | undefined;
  if (meRes.status === "fulfilled" && meRes.value?.user) {
    const activeMembership = meRes.value.memberships?.find(
      (m) => m.tenant_id === claims?.active_tenant_id,
    );
    user = buildSupplierSidebarUser({
      fullName: meRes.value.user.full_name,
      phone: meRes.value.user.phone,
      role: activeMembership?.role ?? claims?.role,
      companyName:
        companyRes.status === "fulfilled" ? companyRes.value?.name : undefined,
    });
  }

  const badges: SupplierSidebarBadges = {};
  if (ordersRes.status === "fulfilled" && ordersRes.value.count > 0) {
    badges["/supplier/buyurtmalar"] = {
      count: ordersRes.value.count,
      color: "amber",
    };
  }
  if (paymentsRes.status === "fulfilled" && paymentsRes.value.count > 0) {
    badges["/supplier/to-lovlar"] = {
      count: paymentsRes.value.count,
      color: "red",
    };
  }
  if (demandRes.status === "fulfilled" && demandRes.value.count > 0) {
    badges["/supplier/talab"] = {
      count: demandRes.value.count,
      color: "emerald",
    };
  }

  return { user, badges };
}

export default async function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, badges } = await loadLayoutData();
  return (
    <div className="flex h-screen overflow-hidden">
      <SupplierSidebar user={user} badges={badges} />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      <AIHelper />
    </div>
  );
}
