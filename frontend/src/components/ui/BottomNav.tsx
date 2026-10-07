"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { navLinksForRole, activeNavHref } from "@/lib/nav-config";
import { Plus, User } from "lucide-react";

export function BottomNav() {
  const { user } = useAuth();
  const links = user?.role === "seller"
    ? [
        { href: "/seller/dashboard", label: "Home", Icon: navLinksForRole("seller")[0].Icon },
        { href: "/seller/dashboard/orders", label: "Orders", Icon: navLinksForRole("seller")[2].Icon },
        { href: "/seller/dashboard/catalog/new", label: "Add", Icon: Plus },
        { href: "/seller/dashboard/ledger", label: "Sales", Icon: navLinksForRole("seller")[4].Icon },
        { href: "/seller/dashboard/account", label: "Account", Icon: User },
      ]
    : navLinksForRole(user?.role);
  const pathname = usePathname();
  const currentActiveHref = activeNavHref(pathname, links);

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-dark-secondary/95 backdrop-blur-md border-t border-slate-200 dark:border-dark-accent shadow-lg dark:shadow-2xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg px-2 py-1.5">
        {links.map(({ href, label, Icon }) => {
          const active = href === currentActiveHref;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1 min-h-14 group"
            >
              <span
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150",
                  active
                    ? "bg-brand-gold text-slate-950 shadow-md shadow-amber-500/25"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60"
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? "text-slate-950" : "currentColor"}
                  aria-hidden="true"
                />
              </span>
              <span
                className={cn(
                  "text-[11px] leading-tight transition-colors",
                  active
                    ? "font-bold text-slate-950 dark:text-amber-400"
                    : "font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
