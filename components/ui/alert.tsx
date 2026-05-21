import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import type { HTMLAttributes } from "react";

type AlertVariant = "success" | "warning" | "error" | "info";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const styles: Record<AlertVariant, { bg: string; border: string; text: string; Icon: typeof Info }> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-l-emerald-600",
    text: "text-emerald-700 dark:text-emerald-300",
    Icon: CheckCircle2,
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-l-amber-600",
    text: "text-amber-600 dark:text-amber-300",
    Icon: AlertTriangle,
  },
  error: {
    bg: "bg-red-50",
    border: "border-l-red-600",
    text: "text-red-700 dark:text-red-300",
    Icon: XCircle,
  },
  info: {
    bg: "bg-navy-50",
    border: "border-l-navy-700",
    text: "text-navy-700 dark:text-navy-300",
    Icon: Info,
  },
};

export function Alert({ variant = "info", className, children, ...props }: AlertProps) {
  const { bg, border, text, Icon } = styles[variant];
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border-l-4 px-4 py-3 text-sm",
        bg,
        border,
        text,
        className
      )}
      {...props}
    >
      <Icon className="size-4 shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
