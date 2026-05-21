"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: "light" | "dark";
}

const Ctx = createContext<ThemeCtx | null>(null);

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

const STORAGE_KEY = "retailflow.theme";

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with "system" to match SSR (the inline head script handles the
  // actual class on <html> before paint to avoid flash).
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // On mount: read localStorage and adopt it.
  useEffect(() => {
    setThemeState(readInitialTheme());
  }, []);

  // Apply theme to <html> and track system changes if "system".
  useEffect(() => {
    const apply = (t: "light" | "dark") => {
      setResolved(t);
      const html = document.documentElement;
      if (t === "dark") html.classList.add("dark");
      else html.classList.remove("dark");
    };

    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mql.matches ? "dark" : "light");
      const handler = (e: MediaQueryListEvent) =>
        apply(e.matches ? "dark" : "light");
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    apply(theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore quota/private mode */
    }
  };

  return (
    <Ctx.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </Ctx.Provider>
  );
}
