"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  AlertTriangle,
  Warehouse,
  ListTree,
  Truck,
  BarChart3,
  FileSearch,
  Settings,
  Sparkles,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navMain = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hujjatlar", label: "Hujjatlar", icon: Inbox, badge: 12, badgeColor: "emerald" as const },
  { href: "/review-queue", label: "Review Queue", icon: AlertTriangle, badge: 5, badgeColor: "amber" as const },
  { href: "/ombor", label: "Ombor", icon: Warehouse },
  { href: "/nomenklatura", label: "Nomenklatura", icon: ListTree },
  { href: "/yetkazib-beruvchilar", label: "Yetkazib beruvchilar", icon: Truck },
];

const navAi = [
  { href: "/insights", label: "AI Insights", icon: Sparkles, badge: 3, badgeColor: "emerald" as const },
  { href: "/distributor", label: "Distribyutor portal", icon: Network },
];

const navAnalytics = [
  { href: "/hisobotlar", label: "Hisobotlar", icon: BarChart3 },
  { href: "/audit-log", label: "Audit log", icon: FileSearch },
  { href: "/sozlamalar", label: "Sozlamalar", icon: Settings },
];

function NavSection({
  label,
  items,
  currentPath,
}: {
  label: string;
  items: typeof navMain;
  currentPath: string;
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-navy-900 text-white">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="size-8 grid place-items-center rounded-md bg-emerald-600 font-mono text-sm font-bold">
          RF
        </div>
        <div>
          <div className="text-[15px] font-bold leading-none">RetailFlow</div>
          <div className="text-[10px] text-white/60 font-mono mt-0.5">AI · v0.1</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <NavSection label="Asosiy" items={navMain} currentPath={pathname} />
        <NavSection label="AI" items={navAi} currentPath={pathname} />
        <NavSection label="Analitika" items={navAnalytics} currentPath={pathname} />
      </nav>

      {/* User */}
      <div className="mx-3 mb-3 mt-2 flex items-center gap-2.5 rounded-md bg-white/5 px-3 py-2.5">
        <div className="size-8 grid place-items-center rounded-full bg-emerald-600 text-xs font-bold">
          AK
        </div>
        <div className="text-xs">
          <div className="font-semibold leading-none">Aziz Karimov</div>
          <div className="text-white/50 mt-1">Omborchi</div>
        </div>
      </div>
    </aside>
  );
}
