import { Sidebar, type SidebarUser } from "@/components/layout/sidebar";
import type { SidebarBadges } from "@/components/layout/nav-items";
import { buildSidebarUser } from "@/lib/sidebar-helpers";
import { AIHelper } from "@/components/ai-helper/ai-helper";
import { auth, documents, products } from "@/lib/api";
import { readClaims } from "@/lib/api/auth-cookies";

interface LayoutData {
  user?: SidebarUser;
  badges: SidebarBadges;
}

/**
 * Loads identity + live sidebar badge counts once per request. Each piece
 * is independently fault-tolerant — a partial backend outage downgrades to
 * a placeholder rather than crashing the layout.
 */
async function loadLayoutData(): Promise<LayoutData> {
  const claims = await readClaims().catch(() => null);

  const [meRes, docStatsRes, criticalProductsRes] = await Promise.allSettled([
    auth.me() as Promise<{
      user?: { full_name?: string; phone?: string };
      memberships?: Array<{ role?: string; tenant_id?: string }>;
    }>,
    documents.stats(),
    products.list({ lowStock: true, limit: 1 }),
  ]);

  let user: SidebarUser | undefined;
  if (meRes.status === "fulfilled" && meRes.value?.user) {
    const activeMembership = meRes.value.memberships?.find(
      (m) => m.tenant_id === claims?.active_tenant_id,
    );
    user = buildSidebarUser({
      fullName: meRes.value.user.full_name,
      phone: meRes.value.user.phone,
      role: activeMembership?.role ?? claims?.role,
    });
  }

  const badges: SidebarBadges = {};
  if (docStatsRes.status === "fulfilled") {
    const stats = docStatsRes.value;
    if (stats.newToday > 0)
      badges["/hujjatlar"] = { count: stats.newToday, color: "emerald" };
    if (stats.reviewQueue > 0)
      badges["/review-queue"] = { count: stats.reviewQueue, color: "amber" };
  }
  if (criticalProductsRes.status === "fulfilled") {
    const lowStockCount = criticalProductsRes.value.count;
    if (lowStockCount > 0)
      badges["/ombor"] = { count: lowStockCount, color: "red" };
  }

  return { user, badges };
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, badges } = await loadLayoutData();
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} badges={badges} />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      <AIHelper />
    </div>
  );
}
