"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthIdentity, type Theme } from "@/components/AuthIdentity";

const THEME_STORAGE_KEY = "dealix_theme";
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const identity = useAuthIdentity();
  const [theme, setThemeState] = useState<Theme>(identity.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    identity.updateIdentity({ theme: nextTheme });
    void supabase?.from("profiles").update({ theme: nextTheme }).eq("id", identity.userId);
  }, [identity]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("Theme controls require the authenticated app shell.");
  return theme;
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "light"}
      className={`theme-toggle inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition duration-200 active:scale-[0.98] ${compact ? "w-full justify-between" : ""}`}
    >
      <span aria-hidden="true" className="theme-toggle-track"><span className="theme-toggle-thumb">{theme === "dark" ? "☾" : "☀"}</span></span>
      <span>{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
