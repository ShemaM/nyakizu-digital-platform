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
      className="fixed bottom-0 left-0 right-0 z-40 bg-text-primary shadow-[0_-8px_24px_-4px_rgba(20,18,14,0.25)] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg px-2 py-2">
        {links.map(({ href, label, Icon }) => {
          const active = href === currentActiveHref;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1 min-h-11"
            >
              <span
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-150",
                  active ? "bg-role-dark" : ""
                )}
              >
                <Icon size={19} strokeWidth={active ? 2.5 : 1.8} className={active ? "text-white" : "text-white/50"} aria-hidden="true" />
              </span>
              <span className={cn("text-[11px]", active ? "font-bold text-white" : "font-medium text-white/50")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
