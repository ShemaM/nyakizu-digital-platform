"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
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
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const links = navLinksForRole(user?.role);
  const currentActiveHref = activeNavHref(pathname, links);

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
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex items-center gap-4 min-w-0">
            {/* Always present and always a link — every logged-in page needs
                an obvious way back to the public site, not just the pages
                that remembered to opt in. (An admin who lands here straight
                from Google sign-in, for instance, has no other way out.) */}
            <Link href="/" className="shrink-0 hover:opacity-80 transition-opacity" aria-label="Nyakizu home">
              <Logo size="md" />
            </Link>
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
                        ? "bg-role-soft text-role"
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
            {user && <ProfileMenu user={user} onLogout={handleLogout} />}
          </div>
        </div>
      </header>

      {/* Main content — bottom padding clears the fixed BottomNav (shown below lg) */}
      <main className={cn("flex-1 w-full min-w-0 overflow-auto", user && "pb-20 lg:pb-0")}>
        <div className="min-w-0 w-full">{children}</div>
      </main>

      {user && <BottomNav />}
    </div>
  );
}