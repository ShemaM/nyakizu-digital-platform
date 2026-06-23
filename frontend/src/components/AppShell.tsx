"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store, ClipboardList, BookOpen, User, LayoutDashboard,
  Package, ShoppingBag, ShieldCheck, Tag,
  LogOut, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { BottomNav } from "./ui/BottomNav";
import { useAuth } from "@/lib/auth-context";

const BUYER_LINKS = [
  { href: "/buyer/suppliers", label: "Suppliers", Icon: Store, activeBg: "bg-blue-500/18", activeText: "text-white", dot: "bg-blue-300" },
  { href: "/buyer/lists/new", label: "New Order", Icon: ClipboardList, activeBg: "bg-violet-500/18", activeText: "text-white", dot: "bg-violet-300" },
  { href: "/buyer/debts", label: "Payments", Icon: BookOpen, activeBg: "bg-amber-500/18", activeText: "text-white", dot: "bg-amber-300" },
  { href: "/buyer/account", label: "Account", Icon: User, activeBg: "bg-white/12", activeText: "text-white", dot: "bg-white/60" },
];

const SELLER_LINKS = [
  { href: "/seller/dashboard", label: "Home", Icon: LayoutDashboard, activeBg: "bg-blue-500/18", activeText: "text-white", dot: "bg-blue-300" },
  { href: "/seller/catalog", label: "Products", Icon: Package, activeBg: "bg-green-500/18", activeText: "text-white", dot: "bg-green-300" },
  { href: "/seller/orders", label: "Orders", Icon: ShoppingBag, activeBg: "bg-violet-500/18", activeText: "text-white", dot: "bg-violet-300" },
  { href: "/seller/ledger", label: "Payments", Icon: BookOpen, activeBg: "bg-amber-500/18", activeText: "text-white", dot: "bg-amber-300" },
];

const ADMIN_LINKS = [
  { href: "/admin/verify", label: "Verify", Icon: ShieldCheck, activeBg: "bg-blue-500/18", activeText: "text-white", dot: "bg-blue-300" },
  { href: "/admin/taxonomy", label: "Categories", Icon: Tag, activeBg: "bg-green-500/18", activeText: "text-white", dot: "bg-green-300" },
];

const NAV_BY_ROLE: Record<string, typeof BUYER_LINKS> = {
  buyer: BUYER_LINKS,
  seller: SELLER_LINKS,
  admin: ADMIN_LINKS,
};

interface AppShellProps {
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  showLogo?: boolean;
}

export function AppShell({ title, children, headerRight, showLogo = false }: AppShellProps) {
  const { user, logout, isLoading, role } = useAuth();
  const pathname = usePathname();
  const links = NAV_BY_ROLE[role ?? "buyer"] ?? BUYER_LINKS;

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-56 shrink-0 flex-col border-r border-slate-200/80 bg-slate-950 md:flex lg:w-64">
        <div className="border-b border-white/10 px-5 py-5">
          <Logo size="sm" inverted />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map(({ href, label, Icon, activeBg, activeText }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                  active
                    ? cn(activeBg, activeText)
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={13} className="text-white/50" />}
              </Link>
            );
          })}
        </nav>

        {!isLoading && user && (
          <div className="space-y-3 border-t border-white/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white ring-1 ring-white/10">
                {(user.full_name || user.username)?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">{user.full_name || user.username}</p>
                <p className="text-[10px] capitalize text-slate-400">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        )}
      </aside>

      <div className="flex flex-1 flex-col md:ml-56 lg:ml-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-xl sm:px-6">
          {showLogo ? (
            <Logo size="sm" />
          ) : (
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Workspace</p>
              <h1 className="truncate text-base font-extrabold text-slate-950">{title}</h1>
            </div>
          )}

          <div className="ml-4 flex shrink-0 items-center gap-2">
            {headerRight}

            {!isLoading && user && (
              <button
                onClick={logout}
                title="Sign out"
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 md:hidden"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-8 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-4">{children}</div>
        </main>
      </div>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
