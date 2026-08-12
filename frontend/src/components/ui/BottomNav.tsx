"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { navLinksForRole, activeNavHref } from "@/lib/nav-config";

export function BottomNav() {
  const { user } = useAuth();
  const links = navLinksForRole(user?.role);
  const pathname = usePathname();
  const currentActiveHref = activeNavHref(pathname, links);

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-100 bg-white/95 shadow-[0_-8px_24px_-4px_rgba(20,18,14,0.10)] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg px-1 py-1">
        {links.map(({ href, label, Icon }) => {
          const active = href === currentActiveHref;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 min-h-11 transition-colors duration-150",
                active ? "text-role" : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} aria-hidden="true" />
              <span className={cn("text-xs font-medium", active && "font-bold")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
