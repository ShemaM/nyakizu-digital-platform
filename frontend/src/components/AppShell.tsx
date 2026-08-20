"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileMenu } from "@/components/ui/ProfileMenu";
import { useAuth } from "@/lib/auth-context";
import { navLinksForRole, activeNavHref } from "@/lib/nav-config";
import { cn } from "@/lib/cn";

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
    if (!roleMismatch || !user) return;
    if (inSellerSection) {
      router.replace(user.role === "buyer" ? "/buyer" : "/login");
    } else if (inBuyerSection) {
      router.replace(user.role === "seller" ? "/seller/dashboard" : "/login");
    }
  }, [roleMismatch, user, inSellerSection, inBuyerSection, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div
      data-role={user?.role ?? "buyer"}
      className="min-h-screen w-full min-w-0 bg-dark-primary flex flex-col"
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm"
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
                        : "text-text-muted hover:text-text-primary hover:bg-slate-100"
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
            {user && (user.role === "seller" || user.role === "buyer") && <NotificationBell />}
          </div>
        </div>
      </header>

      {/* Main content — bottom padding clears the fixed BottomNav (shown below lg) */}
      <main className={cn("flex-1 w-full min-w-0 overflow-auto", user && "pb-20 lg:pb-0")}>
        <div className="min-w-0 w-full">{roleMismatch ? null : children}</div>
      </main>

      {user && <BottomNav />}
    </div>
  );
}