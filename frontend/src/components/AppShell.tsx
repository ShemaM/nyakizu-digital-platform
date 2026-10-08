"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileMenu } from "@/components/ui/ProfileMenu";
import { useAuth } from "@/lib/auth-context";
import { navLinksForRole, activeNavHref } from "@/lib/nav-config";
import { cn } from "@/lib/cn";
import { Moon, Sun } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  title: string;
  headerRight?: ReactNode;
}

export function AppShell({
  children,
  title,
  headerRight,
}: AppShellProps) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const links = navLinksForRole(user?.role);
  const currentActiveHref = activeNavHref(pathname, links);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("dark");
  const darkMode = themeMode === "dark" || (themeMode === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const saved = window.localStorage.getItem("nyakizu-theme") as "light" | "dark" | "system" | null;
    const initialMode = saved || "dark";
    setThemeMode(initialMode);
    document.documentElement.classList.toggle("dark", initialMode !== "light");
  }, []);

  function toggleDarkMode() {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("nyakizu-theme", next);
  }

  // A buyer landing on /seller/* (or vice versa) — a stale bookmark, a
  // shared device, a link typed by hand — used to just hit the backend's
  // role check and surface a raw "Only approved sellers can..." error.
  // Bounce them to their own dashboard instead of letting that happen.
  //
  // The backend already rejects the wrong role on every endpoint, so this
  // was never an actual data leak — but `children` (the page, with its own
  // data-fetching effects) used to mount and start fetching in the same
  // tick as this redirect, before router.replace() resolved. `roleMismatch`
  // is computed during render, not inside the effect, specifically so we
  // can withhold `children` from the tree below until it clears — the
  // mismatched page's effects then never get a chance to fire at all.
  const inSellerSection = pathname.startsWith("/seller");
  const inBuyerSection = pathname.startsWith("/buyer");
  const roleMismatch =
    !isLoading &&
    !!user &&
    ((inSellerSection && user.role !== "seller") || (inBuyerSection && user.role !== "buyer"));

  useEffect(() => {
    if (isLoading) return;

    if (!user && (inSellerSection || inBuyerSection)) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!roleMismatch || !user) return;
    if (inSellerSection) {
      router.replace(user.role === "buyer" ? "/buyer" : "/login");
    } else if (inBuyerSection) {
      router.replace(user.role === "seller" ? "/seller/dashboard" : "/login");
    }
  }, [isLoading, roleMismatch, user, inSellerSection, inBuyerSection, pathname, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div
      data-role={user?.role ?? "buyer"}
      className="min-h-screen w-full min-w-0 bg-dark-primary flex flex-col text-text-primary"
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-dark-accent bg-dark-secondary/95 backdrop-blur-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-3 min-w-0">
            {user && <ProfileMenu user={user} onLogout={handleLogout} />}
            <h1 className="text-title-lg font-bold text-text-primary truncate">{title}</h1>
          </div>

          {/* Desktop nav — only past lg; below that, BottomNav is the primary
              nav (99%+ of traffic is phones, so it should never have to
              compete for space with a title/user chip in the header). */}
          {user && (
            <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
              {links.map(({ href, label, Icon }) => {
                const active = href === currentActiveHref;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2.5 text-body-lg font-medium transition-colors duration-150",
                      active
                        ? "bg-role-soft text-role-dark"
                        : "text-text-muted hover:text-text-primary hover:bg-dark-tertiary"
                    )}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 1.8} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {headerRight}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={`Theme: ${themeMode}. Activate to switch theme`}
              title={`Theme: ${themeMode}`}
              className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition hover:bg-dark-tertiary hover:text-text-primary"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user && (user.role === "seller" || user.role === "buyer") && <NotificationBell />}
          </div>
        </div>
      </header>

      {/* Main content — bottom padding clears the fixed BottomNav (shown below
          lg). BottomNav's real rendered height is ~92px (its icon circle,
          label, and padding stack taller than any single Tailwind spacing
          step) — pb-24 (96px) covers that with a few px to spare. */}
      <main className={cn("flex-1 w-full min-w-0 overflow-auto", user && "pb-24 lg:pb-0")}>
        <div className="min-w-0 w-full">{roleMismatch ? null : children}</div>
      </main>

      {user && <BottomNav />}
    </div>
  );
}