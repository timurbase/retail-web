import { cn } from "@/lib/utils";
import { Check, AlertTriangle, X } from "lucide-react";
import type { ConfidenceLevel } from "@/lib/types";

interface ConfidenceBadgeProps {
  score: number; // 0..1
  showPercent?: boolean;
  className?: string;
}

function levelOf(score: number): ConfidenceLevel {
  if (score >= 0.9) return "high";
  if (score >= 0.6) return "mid";
  return "low";
}

const levelStyles: Record<ConfidenceLevel, string> = {
  high: "bg-emerald-50 text-emerald-700 border-emerald-600",
  mid: "bg-amber-50 text-amber-600 border-amber-600",
  low: "bg-red-50 text-red-700 border-red-600",
};

const Icon = {
  high: Check,
  mid: AlertTriangle,
  low: X,
};

export function ConfidenceBadge({ score, showPercent = true, className }: ConfidenceBadgeProps) {
  const level = levelOf(score);
  const Glyph = Icon[level];
  const percent = Math.round(score * 100);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold",
        levelStyles[level],
        className
      )}
    >
      <Glyph className="size-3" strokeWidth={2.5} />
      {showPercent && <span>{percent}%</span>}
    </span>
  );
}
