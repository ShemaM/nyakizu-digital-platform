"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = window.localStorage.getItem("nyakizu-theme");
    const isDark = saved ? saved === "dark" : true;
    setThemeMode(isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("nyakizu-theme", next);
  };

  const isDark = themeMode === "dark";

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full border border-dark-accent bg-dark-secondary/80 text-text-muted",
          size === "sm" ? "h-9 w-9" : "h-9 w-9 sm:h-11 sm:w-11",
          className
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "group relative flex items-center justify-center rounded-full border border-dark-accent bg-dark-secondary/80 text-text-secondary transition hover:border-brand-gold/50 hover:bg-dark-tertiary hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40 active:scale-95",
        size === "sm" ? "h-9 w-9" : "h-9 w-9 sm:h-11 sm:w-11",
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-brand-gold transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-text-secondary transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
}
