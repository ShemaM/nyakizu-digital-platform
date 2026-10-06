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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map(({ label, description, href, Icon, primary }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-col items-center text-center gap-2 rounded-2xl border p-4 sm:p-5 transition-all active:scale-[0.98]",
            primary
              ? "bg-brand-gold text-slate-950 font-bold border-transparent hover:bg-brand-gold-dark shadow-md"
              : "bg-dark-card text-text-primary border-dark-accent shadow-sm hover:border-brand-gold/40 hover:bg-dark-tertiary"
          )}
        >
          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center", primary ? "bg-slate-950/15" : "bg-brand-gold/15")}>
            <Icon className={cn("w-5 h-5", primary ? "text-slate-950" : "text-brand-gold")} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">{label}</p>
            <p className={cn("text-xs mt-0.5", primary ? "text-slate-950/80 font-medium" : "text-text-muted")}>{description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};
