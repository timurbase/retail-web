import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: { value: string; direction: "up" | "down" | "warn" };
  valueClassName?: string;
}

const TrendIcon: Record<"up" | "down" | "warn", LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  warn: AlertTriangle,
};

const trendColor: Record<"up" | "down" | "warn", string> = {
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-red-600 dark:text-red-400",
  warn: "text-amber-600 dark:text-amber-300",
};

export function KpiCard({ label, value, trend, valueClassName }: KpiCardProps) {
  const Icon = trend ? TrendIcon[trend.direction] : null;
  return (
    <div className="rounded-md border border-border bg-surface-card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 font-mono text-3xl font-bold leading-none tracking-tight text-ink-900",
          valueClassName
        )}
      >
        {value}
      </div>
      {trend && Icon && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-[11px] font-medium",
            trendColor[trend.direction]
          )}
        >
          <Icon className="size-3" />
          {trend.value}
        </div>
      )}
    </div>
  );
}
