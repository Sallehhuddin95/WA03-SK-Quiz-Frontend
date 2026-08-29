"use client";

import { useSyncExternalStore, type ReactNode } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "sk-quiz-theme";
const listeners = new Set<() => void>();

function readTheme(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage may be unavailable; the class toggle is still applied.
  }
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useTheme(): ThemeContextValue {
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    () => "light" as Theme
  );

  const setTheme = (next: Theme) => {
    applyTheme(next);
    listeners.forEach((listener) => listener());
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggleTheme };
}
