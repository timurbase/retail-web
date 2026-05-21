"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { navMain, navAi, navAnalytics, type NavItem } from "./nav-items";

function NavSection({
  label,
  items,
  currentPath,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  currentPath: string;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <div className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 font-mono">
        {label}
      </div>
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? currentPath === "/dashboard"
            : currentPath.startsWith(item.href);
        const Icon = item.icon;
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
            {item.badge !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold font-mono leading-none",
                  item.badgeColor === "emerald" && "bg-emerald-600 text-white",
                  item.badgeColor === "amber" && "bg-amber-600 text-white"
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

interface SidebarContentProps {
  /** Called on link click — used by mobile drawer to close itself. */
  onNavigate?: () => void;
}

/**
 * Inner content of the sidebar — shared by the desktop <Sidebar /> and the
 * mobile drawer. Renders brand + nav + user footer; the wrapper supplies the
 * positioning/size.
 */
export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Brand */}
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10 hover:bg-white/5 transition-colors"
      >
        <div className="size-8 grid place-items-center rounded-md bg-emerald-600 font-mono text-sm font-bold">
          RF
        </div>
        <div>
          <div className="text-[15px] font-bold leading-none">RetailFlow</div>
          <div className="text-[10px] text-white/60 font-mono mt-0.5">AI · v0.1</div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <NavSection label="Asosiy" items={navMain} currentPath={pathname} onNavigate={onNavigate} />
        <NavSection label="AI" items={navAi} currentPath={pathname} onNavigate={onNavigate} />
        <NavSection label="Analitika" items={navAnalytics} currentPath={pathname} onNavigate={onNavigate} />
      </nav>

      {/* User — link to /profil + logout */}
      <div className="mx-3 mb-3 mt-2 flex items-stretch gap-1.5">
        <Link
          href="/profil"
          onClick={onNavigate}
          className={cn(
            "flex flex-1 items-center gap-2.5 rounded-md px-3 py-2.5 transition-colors",
            pathname.startsWith("/profil")
              ? "bg-white/10"
              : "bg-white/5 hover:bg-white/10"
          )}
        >
          <div className="size-8 grid place-items-center rounded-full bg-emerald-600 text-xs font-bold shrink-0">
            AK
          </div>
          <div className="text-xs min-w-0 flex-1">
            <div className="font-semibold leading-none truncate">Aziz Karimov</div>
            <div className="text-white/50 mt-1 truncate">Omborchi</div>
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

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-navy-900 text-white">
      <SidebarContent />
    </aside>
  );
}
