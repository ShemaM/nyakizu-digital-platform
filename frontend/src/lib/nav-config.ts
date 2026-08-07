import {
  Store, ClipboardList, BookOpen, User, LayoutDashboard,
  Package, ShoppingBag, Users,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  Icon: LucideIcon;
}

const BUYER_LINKS: NavLink[] = [
  { href: "/buyer", label: "Home", Icon: LayoutDashboard },
  { href: "/buyer/suppliers", label: "Suppliers", Icon: Store },
  { href: "/buyer/lists/new", label: "New Order", Icon: ClipboardList },
  { href: "/buyer/debts", label: "Payments", Icon: BookOpen },
  { href: "/buyer/account", label: "Account", Icon: User },
];

const SELLER_LINKS: NavLink[] = [
  { href: "/seller/dashboard", label: "Home", Icon: LayoutDashboard },
  { href: "/seller/dashboard/catalog", label: "Products", Icon: Package },
  { href: "/seller/dashboard/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/seller/dashboard/buyers", label: "Buyers", Icon: Users },
  { href: "/seller/dashboard/ledger", label: "Payments", Icon: BookOpen },
];

// Admins are redirected straight to the Django admin (a different origin)
// on login — there's no in-app admin surface, so no nav links for them.
export const NAV_BY_ROLE: Record<string, NavLink[]> = {
  buyer: BUYER_LINKS,
  seller: SELLER_LINKS,
};

export function navLinksForRole(role?: string | null): NavLink[] {
  return NAV_BY_ROLE[role ?? "buyer"] ?? BUYER_LINKS;
}

/**
 * Picks the single best-matching nav link for the current path. A plain
 * `pathname.startsWith(href)` breaks when one link's href (e.g. a "Home"
 * link at "/buyer") is itself a prefix of every sibling link — it would
 * show as active on every page. Instead we match on path-segment
 * boundaries and prefer the longest (most specific) match.
 */
export function activeNavHref(pathname: string, links: NavLink[]): string | undefined {
  return links
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
