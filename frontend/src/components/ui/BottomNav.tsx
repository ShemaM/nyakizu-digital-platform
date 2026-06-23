"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store, ClipboardList, BookOpen, User, LayoutDashboard,
  Package, ShoppingBag, ShieldCheck, Tag,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useRole } from "@/lib/auth-context";

const BUYER_LINKS = [
  { href: "/buyer/suppliers", label: "Suppliers", Icon: Store,          activeColor: "text-blue-600",   activeBg: "bg-blue-50"   },
  { href: "/buyer/lists/new", label: "New Order", Icon: ClipboardList,  activeColor: "text-violet-600", activeBg: "bg-violet-50" },
  { href: "/buyer/debts",     label: "Payments",  Icon: BookOpen,       activeColor: "text-amber-600",  activeBg: "bg-amber-50"  },
  { href: "/buyer/account",   label: "Account",   Icon: User,           activeColor: "text-gray-700",   activeBg: "bg-gray-100"  },
];

const SELLER_LINKS = [
  { href: "/seller/dashboard", label: "Home",     Icon: LayoutDashboard, activeColor: "text-blue-600",   activeBg: "bg-blue-50"   },
  { href: "/seller/catalog",   label: "Products", Icon: Package,         activeColor: "text-green-600",  activeBg: "bg-green-50"  },
  { href: "/seller/orders",    label: "Orders",   Icon: ShoppingBag,     activeColor: "text-violet-600", activeBg: "bg-violet-50" },
  { href: "/seller/ledger",    label: "Payments", Icon: BookOpen,        activeColor: "text-amber-600",  activeBg: "bg-amber-50"  },
];

const ADMIN_LINKS = [
  { href: "/admin/verify",   label: "Verify",     Icon: ShieldCheck, activeColor: "text-blue-600",  activeBg: "bg-blue-50"  },
  { href: "/admin/taxonomy", label: "Categories", Icon: Tag,         activeColor: "text-green-600", activeBg: "bg-green-50" },
];

const NAV_BY_ROLE: Record<string, typeof BUYER_LINKS> = {
  buyer: BUYER_LINKS,
  seller: SELLER_LINKS,
  admin: ADMIN_LINKS,
};

export function BottomNav() {
  const { role } = useRole();
  const pathname  = usePathname();
  const links     = NAV_BY_ROLE[role] ?? BUYER_LINKS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/90 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg px-1 py-1.5">
        {links.map(({ href, label, Icon, activeColor, activeBg }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 rounded-lg py-1 transition-all duration-200",
                active ? activeColor : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div
                className={cn(
                  "rounded-lg p-1.5 transition-all duration-200",
                  active ? activeBg : "bg-transparent"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={cn("text-[10px] font-medium", active && "font-bold")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
