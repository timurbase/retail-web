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
  ClipboardCheck,
  PackageCheck,
  Search,
  type LucideIcon,
} from "lucide-react";

export type BadgeColor = "emerald" | "amber" | "red";

/** Badge map keyed by route href. Counts of 0 are skipped at render time. */
export type SidebarBadges = Record<string, { count: number; color: BadgeColor }>;

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navMain: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hujjatlar", label: "Hujjatlar", icon: Inbox },
  { href: "/review-queue", label: "Review Queue", icon: AlertTriangle },
  { href: "/ombor", label: "Ombor", icon: Warehouse },
  { href: "/inventarizatsiya", label: "Inventarizatsiya", icon: ClipboardCheck },
  { href: "/buyurtmalar", label: "Buyurtmalar", icon: PackageCheck },
  { href: "/nomenklatura", label: "Nomenklatura", icon: ListTree },
  { href: "/mxik-search", label: "MXIK katalog", icon: Search },
  { href: "/yetkazib-beruvchilar", label: "Yetkazib beruvchilar", icon: Truck },
];

export const navAi: NavItem[] = [
  { href: "/insights", label: "AI Insights", icon: Sparkles },
  { href: "/distributor", label: "Distribyutor portal", icon: Network },
];

export const navAnalytics: NavItem[] = [
  { href: "/hisobotlar", label: "Hisobotlar", icon: BarChart3 },
  { href: "/audit-log", label: "Audit log", icon: FileSearch },
  { href: "/sozlamalar", label: "Sozlamalar", icon: Settings },
];
