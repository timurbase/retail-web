import {
  LayoutDashboard,
  Store,
  FileText,
  Package,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Truck,
  Sparkles,
  BarChart3,
  FileSearch,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type BadgeColor = "emerald" | "amber" | "red";

/** Badge map keyed by route href. Counts of 0 are skipped at render time. */
export type SidebarBadges = Record<string, { count: number; color: BadgeColor }>;

export interface SupplierNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const supplierNavMain: SupplierNavItem[] = [
  { href: "/supplier/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/supplier/do-konlar", label: "Do'konlar", icon: Store },
  { href: "/supplier/hujjatlar", label: "Hujjatlar", icon: FileText },
  { href: "/supplier/mahsulotlar", label: "Mahsulot katalog", icon: Package },
];

export const supplierNavSales: SupplierNavItem[] = [
  { href: "/supplier/talab", label: "Talab", icon: TrendingUp },
  { href: "/supplier/buyurtmalar", label: "Buyurtmalar", icon: ShoppingCart },
  { href: "/supplier/to-lovlar", label: "To'lovlar", icon: CreditCard },
  { href: "/supplier/logistika", label: "Logistika", icon: Truck },
];

export const supplierNavAnalytics: SupplierNavItem[] = [
  { href: "/supplier/insights", label: "AI Insights", icon: Sparkles },
  { href: "/supplier/hisobotlar", label: "Hisobotlar", icon: BarChart3 },
  { href: "/supplier/audit-log", label: "Audit log", icon: FileSearch },
];

export const supplierNavProfile: SupplierNavItem[] = [
  { href: "/supplier/sozlamalar", label: "Sozlamalar", icon: Settings },
];
