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
      className="fixed bottom-0 left-0 right-0 z-40 bg-dark-secondary border-t border-dark-accent shadow-xl lg:hidden"
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
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 min-h-14"
            >
              <span
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-150",
                  active ? "bg-role-dark" : ""
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} className={active ? "text-white" : "text-white/50"} aria-hidden="true" />
              </span>
              <span className={cn("text-xs", active ? "font-bold text-white" : "font-medium text-white/50")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
