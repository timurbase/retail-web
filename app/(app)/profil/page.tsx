import { auth } from "@/lib/api";
import { ProfilView } from "@/components/profil/profil-view";
import { notFound } from "next/navigation";
import type { User, UserRole } from "@/lib/types";

export default async function ProfilPage() {
  let user: User | null = null;
  try {
    const me = await auth.me();
    // auth.me() returns a thin AuthUser + memberships; synthesize a domain User
    // for the existing ProfilView (which expects the broader shape).
    const activeStoreId =
      (me as unknown as { active_store_id?: string; activeStoreId?: string }).activeStoreId ??
      (me as unknown as { active_store_id?: string }).active_store_id ??
      "";
    const activeMembership = me.memberships.find(
      (m) => m.tenantId === activeStoreId,
    ) ?? me.memberships[0];
    const role = (activeMembership?.role ?? "omborchi") as UserRole;
    user = {
      id: me.user.id,
      storeId: activeStoreId,
      orgId: null,
      fullName: me.user.fullName ?? me.user.phone,
      email: me.user.email ?? "",
      phone: me.user.phone,
      role,
      status: "active",
      lastLogin: null,
      createdAt: new Date().toISOString(),
    };
  } catch {
    notFound();
  }
  if (!user) notFound();
  return <ProfilView user={user} />;
}
