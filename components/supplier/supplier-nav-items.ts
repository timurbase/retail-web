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

export interface SupplierNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  badgeColor?: BadgeColor;
}

export const supplierNavMain: SupplierNavItem[] = [
  { href: "/supplier/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/supplier/do-konlar", label: "Do'konlar", icon: Store, badge: 38, badgeColor: "emerald" },
  { href: "/supplier/hujjatlar", label: "Hujjatlar", icon: FileText },
  { href: "/supplier/mahsulotlar", label: "Mahsulot katalog", icon: Package },
];

export const supplierNavSales: SupplierNavItem[] = [
  { href: "/supplier/talab", label: "Talab", icon: TrendingUp, badge: 9, badgeColor: "emerald" },
  { href: "/supplier/buyurtmalar", label: "Buyurtmalar", icon: ShoppingCart, badge: 12, badgeColor: "amber" },
  { href: "/supplier/to-lovlar", label: "To'lovlar", icon: CreditCard, badge: 28, badgeColor: "red" },
  { href: "/supplier/logistika", label: "Logistika", icon: Truck },
];

export const supplierNavAnalytics: SupplierNavItem[] = [
  { href: "/supplier/insights", label: "AI Insights", icon: Sparkles, badge: 5, badgeColor: "emerald" },
  { href: "/supplier/hisobotlar", label: "Hisobotlar", icon: BarChart3 },
  { href: "/supplier/audit-log", label: "Audit log", icon: FileSearch },
];

export const supplierNavProfile: SupplierNavItem[] = [
  { href: "/supplier/sozlamalar", label: "Sozlamalar", icon: Settings },
];
