import Link from "next/link";
import { Plus, Package, ShoppingBag, Users, BookOpen, Settings, type LucideIcon } from "lucide-react";
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
  { label: "My Products", description: "See and edit what you sell", href: "/seller/dashboard/catalog", Icon: Package },
  { label: "Orders", description: "See and pack orders", href: "/seller/dashboard/orders", Icon: ShoppingBag },
  { label: "Buyers", description: "Approve buyer requests", href: "/seller/dashboard/buyers", Icon: Users },
  { label: "Payments", description: "Money owed and paid", href: "/seller/dashboard/ledger", Icon: BookOpen },
  { label: "My Account", description: "Your shop details", href: "/seller/dashboard/account", Icon: Settings },
];

export const QuickActions: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {ACTIONS.map(({ label, description, href, Icon, primary }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-col items-center text-center gap-2 rounded-2xl border p-4 sm:p-5 transition-all active:scale-[0.98]",
            primary
              ? "bg-role text-white border-transparent hover:opacity-90 shadow-md"
              : "bg-white text-text-primary border-slate-100 shadow-sm hover:border-role/30 hover:bg-role-soft/40"
          )}
        >
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", primary ? "bg-white/20" : "bg-role-soft")}>
            <Icon className={cn("w-5 h-5", primary ? "text-white" : "text-role")} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">{label}</p>
            <p className={cn("text-xs mt-0.5", primary ? "text-white/80" : "text-text-muted")}>{description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};
