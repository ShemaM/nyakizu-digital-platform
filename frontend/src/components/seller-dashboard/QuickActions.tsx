import Link from "next/link";
import { Plus, ShoppingBag, Users, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface ShortcutAction {
  label: string;
  description: string;
  href: string;
  Icon: LucideIcon;
  primary?: boolean;
}

const ACTIONS: ShortcutAction[] = [
  { label: "Add Product", description: "List a new item", href: "/seller/dashboard/catalog/new", Icon: Plus, primary: true },
  { label: "Process Orders", description: "Pack and deliver", href: "/seller/dashboard/orders", Icon: ShoppingBag },
  { label: "Confirm Payments", description: "Update your ledger", href: "/seller/dashboard/ledger", Icon: Wallet },
  { label: "Manage Buyers", description: "Approve requests", href: "/seller/dashboard/buyers", Icon: Users },
];

export const QuickActions: React.FC = () => {
  return (
    <div className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
      {ACTIONS.map(({ label, description, href, Icon, primary }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "group flex items-center gap-4 py-4 text-left transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring sm:px-4 sm:first:pl-0",
            primary
              ? "text-brand-gold"
              : "text-text-primary"
          )}
        >
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", primary ? "bg-brand-gold/15" : "bg-dark-secondary")}>
            <Icon className={cn("w-5 h-5", primary ? "text-brand-gold" : "text-text-secondary")} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight">{label}</p>
            <p className="mt-0.5 text-xs text-text-muted">{description}</p>
          </div>
          <span className="text-xs font-bold text-text-muted transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      ))}
    </div>
  );
};
