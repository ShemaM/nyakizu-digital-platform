import Link from "next/link";
import { Clock3, Package, Settings, Share2, Check, ArrowRight, Lock } from "lucide-react";
import { CopyStoreLink } from "@/app/store/[slug]/CopyStoreLink";
import { SITE_URL } from "@/lib/seo";

interface PendingApprovalViewProps {
  /** How many products the seller has already listed — drives the "Add products" step's checked state. */
  productCount: number;
  username: string;
}

/**
 * What a brand-new, not-yet-approved seller sees instead of the real
 * dashboard. There's nothing to report yet — no orders, no buyers, no
 * money — so showing those as empty summaries just reads as "this app is
 * broken" rather than "you haven't started." This replaces that with what's
 * actually true right now: you're waiting on review, and here's what to do
 * with the time.
 */
export function PendingApprovalView({ productCount, username }: PendingApprovalViewProps) {
  const hasProducts = productCount > 0;
  const storeUrl = `${SITE_URL}/store/${username}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center border-y border-warning/30 py-8 text-center sm:py-10">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-warning/15 text-warning mb-4">
            <Clock3 size={28} />
          </span>
          <p className="text-lg font-black text-text-primary">Your shop is being reviewed</p>
          <p className="text-sm text-text-secondary mt-1.5 max-w-sm">
            Our team checks every new shop before it goes live. We&apos;ll email you the moment you&apos;re approved
            — no need to keep checking back.
          </p>
      </div>

      <div>
        <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-3">
          While you wait
        </p>

        <div className="divide-y divide-dark-accent border-y border-dark-accent">
          {/* Step 1 — actionable now, tracked against real product count */}
          <div className="flex items-center gap-4 py-4">
              <span
                className={
                  "flex items-center justify-center w-10 h-10 rounded-full shrink-0 " +
                  (hasProducts ? "bg-success/15 text-success" : "bg-role-soft text-role-dark")
                }
              >
                {hasProducts ? <Check size={18} /> : <Package size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-primary">
                  {hasProducts ? `${productCount} product${productCount === 1 ? "" : "s"} added` : "Add your products"}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {hasProducts
                    ? "Keep adding — buyers will see everything you've listed as soon as you're approved."
                    : "List what you sell now, so your shop is ready to go the moment it's approved."}
                </p>
              </div>
              <Link
                href="/seller/dashboard/catalog/new"
                className="flex items-center gap-1 text-sm font-bold text-role-dark hover:opacity-80 shrink-0"
              >
                {hasProducts ? "Add more" : "Add now"} <ArrowRight size={14} />
              </Link>
          </div>

          {/* Step 2 — actionable now */}
          <div className="flex items-center gap-4 py-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-role-soft text-role-dark shrink-0">
                <Settings size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-primary">Finish your shop details</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Add how buyers should pay you (M-Pesa till, paybill, etc.) so payments go smoothly later.
                </p>
              </div>
              <Link
                href="/seller/dashboard/account"
                className="flex items-center gap-1 text-sm font-bold text-role-dark hover:opacity-80 shrink-0"
              >
                Open <ArrowRight size={14} />
              </Link>
          </div>

          {/* Step 3 — locked until approved: the store literally isn't
              visible to buyers yet, so sharing it now would just 404. */}
          <div className="flex items-center gap-4 py-4 opacity-60">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-text-muted shrink-0">
                <Lock size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-primary">Share your store with buyers</p>
                <p className="text-xs text-text-muted mt-0.5">Unlocks once your shop is approved.</p>
              </div>
              <Share2 size={16} className="text-text-muted shrink-0" />
          </div>
        </div>
      </div>

      {/* Their store link, ready to copy the moment they're approved —
          shown now (not gated behind the lock above) so it's one less
          thing to hunt for later. */}
      <div className="border-y border-dark-accent py-4">
          <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2">Your store link</p>
          <p className="text-xs text-text-muted mb-3">This is ready — save it now, share it once you're approved.</p>
          <CopyStoreLink url={storeUrl} />
      </div>
    </div>
  );
}
