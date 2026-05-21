"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "./theme-provider";

const LABELS: Record<Theme, string> = {
  light: "Yorug'",
  dark: "Qorong'i",
  system: "Tizim",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next: Theme =
    theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;
  const label = `Mavzu: ${LABELS[theme]} (keyingisi: ${LABELS[next]})`;
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={label}
      aria-label={label}
      className="grid size-8 place-items-center rounded-sm border border-border text-ink-600 transition-colors hover:bg-ink-100"
    >
      <Icon className="size-4" />
    </button>
  );
}
