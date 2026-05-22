"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  supplierNavMain,
  supplierNavSales,
  supplierNavAnalytics,
  supplierNavProfile,
  type SupplierNavItem,
  type SidebarBadges as SupplierBadges,
} from "./supplier-nav-items";

export type { SupplierBadges as SupplierSidebarBadges };

export interface SupplierSidebarUser {
  /** Full name (e.g. "Asror Tursunov") or company name fallback. */
  fullName: string;
  /** Localised role label (e.g. "Distribyutor admin"). */
  roleLabel: string;
  /** Two-letter avatar initials. */
  initials: string;
}

const FALLBACK_SUPPLIER_USER: SupplierSidebarUser = {
  fullName: "Distribyutor",
  roleLabel: "Hisob",
  initials: "?",
};

function NavSection({
  label,
  items,
  currentPath,
  onNavigate,
  badges,
}: {
  label: string;
  items: SupplierNavItem[];
  currentPath: string;
  onNavigate?: () => void;
  badges?: SupplierBadges;
}) {
  return (
    <div>
      <div className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 font-mono">
        {label}
      </div>
      {items.map((item) => {
        const isActive =
          item.href === "/supplier/dashboard"
            ? currentPath === "/supplier/dashboard"
            : currentPath.startsWith(item.href);
        const Icon = item.icon;
        const badge = badges?.[item.href];
        const showBadge = badge && badge.count > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "mb-0.5 flex items-center justify-between rounded-sm px-3 py-2 text-[13px] font-medium transition-colors",
              isActive
                ? "bg-navy-700 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="size-4" />
              {item.label}
            </span>
            {showBadge && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold font-mono leading-none",
                  badge.color === "emerald" && "bg-emerald-600 text-white",
                  badge.color === "amber" && "bg-amber-600 text-white",
                  badge.color === "red" && "bg-red-600 text-white"
                )}
              >
                {badge.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

interface SupplierSidebarContentProps {
  /** Called on link click — used by mobile drawer to close itself. */
  onNavigate?: () => void;
  /** Real logged-in supplier-side user. Falls back to a placeholder. */
  user?: SupplierSidebarUser;
  /** Live badge counts keyed by route. */
  badges?: SupplierBadges;
}

/**
 * Inner content of the supplier sidebar — shared by the desktop
 * <SupplierSidebar /> and the mobile drawer. The wrapper supplies positioning.
 */
export function SupplierSidebarContent({
  onNavigate,
  user,
  badges,
}: SupplierSidebarContentProps) {
  const pathname = usePathname();
  const u = user ?? FALLBACK_SUPPLIER_USER;

  return (
    <>
      {/* Brand */}
      <Link
        href="/supplier/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10 hover:bg-white/5 transition-colors"
      >
        <div className="relative size-9 grid place-items-center rounded-md bg-emerald-600 font-mono text-sm font-bold">
          RF
          <span className="absolute -bottom-1 -right-1 rounded-full bg-navy-700 px-1 py-0.5 text-[8px] font-mono font-bold leading-none">
            🚚
          </span>
        </div>
        <div>
          <div className="text-[15px] font-bold leading-none">RetailFlow</div>
          <div className="text-[10px] text-emerald-300 font-mono mt-0.5 uppercase tracking-wider">
            Supplier · BETA
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <NavSection
          label="Asosiy"
          items={supplierNavMain}
          currentPath={pathname}
          onNavigate={onNavigate}
          badges={badges}
        />
        <NavSection
          label="Sotuv"
          items={supplierNavSales}
          currentPath={pathname}
          onNavigate={onNavigate}
          badges={badges}
        />
        <NavSection
          label="Analitika"
          items={supplierNavAnalytics}
          currentPath={pathname}
          onNavigate={onNavigate}
          badges={badges}
        />
        <NavSection
          label="Profil"
          items={supplierNavProfile}
          currentPath={pathname}
          onNavigate={onNavigate}
          badges={badges}
        />
      </nav>

      {/* User — supplier company info + logout */}
      <div className="mx-3 mb-3 mt-2 flex items-stretch gap-1.5">
        <Link
          href="/supplier/sozlamalar"
          onClick={onNavigate}
          className={cn(
            "flex flex-1 items-center gap-2.5 rounded-md px-3 py-2.5 transition-colors",
            pathname.startsWith("/supplier/sozlamalar")
              ? "bg-white/10"
              : "bg-white/5 hover:bg-white/10"
          )}
        >
          <div className="size-8 grid place-items-center rounded-full bg-emerald-600 text-xs font-bold shrink-0">
            {u.initials}
          </div>
          <div className="text-xs min-w-0 flex-1">
            <div className="font-semibold leading-none truncate">{u.fullName}</div>
            <div className="text-white/50 mt-1 truncate">{u.roleLabel}</div>
          </div>
        </Link>
        <Link
          href="/login"
          onClick={onNavigate}
          aria-label="Chiqish"
          title="Chiqish"
          className="grid w-9 shrink-0 place-items-center rounded-md bg-white/5 text-white/60 transition-colors hover:bg-red-600/20 hover:text-red-300"
        >
          <LogOut className="size-4" />
        </Link>
      </div>
    </>
  );
}

export function SupplierSidebar({
  user,
  badges,
}: {
  user?: SupplierSidebarUser;
  badges?: SupplierBadges;
}) {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-navy-900 text-white">
      <SupplierSidebarContent user={user} badges={badges} />
    </aside>
  );
}
