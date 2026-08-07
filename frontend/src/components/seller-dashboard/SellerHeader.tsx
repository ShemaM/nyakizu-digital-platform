import Link from "next/link";
import { Plus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

interface SellerHeaderProps {
  shopName: string;
  sellerName: string;
  location: string;
  status: string;
  avatarUrl?: string | null;
}

export function SellerHeader({ shopName, sellerName, location, status, avatarUrl }: SellerHeaderProps) {
  const firstName = sellerName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const isApproved = status.toLowerCase() === "approved";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[rgb(var(--role))] to-[rgb(var(--role)/0.78)] p-6 sm:p-8 shadow-[0_12px_32px_-8px_rgb(var(--role)/0.4)]">
      <span className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10" aria-hidden="true" />
      <span className="absolute right-16 bottom-[-3rem] w-28 h-28 rounded-full bg-white/10" aria-hidden="true" />

      <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar name={sellerName} imageUrl={avatarUrl} size="xl" className="ring-2 ring-white/40" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/70">
              {greeting}, {firstName}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 truncate">{shopName}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-white/15 px-2.5 py-1 rounded-full">
                <span className={cn("w-1.5 h-1.5 rounded-full", isApproved ? "bg-emerald-300" : "bg-amber-300")} aria-hidden="true" />
                {isApproved ? "Active store" : status}
              </span>
              <span className="text-sm text-white/80">{location}</span>
            </div>
          </div>
        </div>

        <Link
          href="/seller/dashboard/catalog/new"
          className="inline-flex items-center justify-center gap-1.5 shrink-0 bg-white text-role font-semibold text-sm px-5 py-3 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} /> Add Product
        </Link>
      </div>
    </div>
  );
}
