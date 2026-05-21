import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, mono, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-sm text-ink-900",
        "placeholder:text-ink-400",
        "focus:outline-2 focus:outline-navy-700 focus:-outline-offset-1 focus:border-navy-700",
        mono && "font-mono",
        className
      )}
      {...props}
    />
  );
});

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5",
        className
      )}
    >
      {children}
    </label>
  );
}
