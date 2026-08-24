import Link from "next/link";
import { Package, Image as ImageIcon, Wallet, Share2, Check, ArrowRight } from "lucide-react";
import { Card, CardSection } from "@/components/ui/Card";
import { CopyStoreLink } from "@/app/store/[slug]/CopyStoreLink";
import { SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/cn";

interface GetStartedViewProps {
  productCount: number;
  hasAvatar: boolean;
  hasPaymentMethod: boolean;
  username: string;
}

function ChecklistCard({
  done,
  Icon,
  title,
  description,
  href,
  cta,
}: {
  done: boolean;
  Icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Card>
      <CardSection className="flex items-center gap-4 py-4">
        <span
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
            done ? "bg-success/15 text-success" : "bg-role-soft text-role-dark"
          )}
        >
          {done ? <Check size={18} /> : <Icon size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-text-primary">{title}</p>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
        <Link href={href} className="flex items-center gap-1 text-sm font-bold text-role-dark hover:opacity-80 shrink-0">
          {cta} <ArrowRight size={14} />
        </Link>
      </CardSection>
    </Card>
  );
}

/**
 * What an approved seller sees once they're live but haven't done anything
 * yet — zero products, zero buyers, zero orders. Every number on the real
 * dashboard would read as zero at this point regardless of whether they've
 * added products, since the real signal that a shop has "started" is buyer
 * activity, not catalog size — so this stays up until the first order or
 * first buyer relationship exists, not just until products get added.
 */
export function GetStartedView({ productCount, hasAvatar, hasPaymentMethod, username }: GetStartedViewProps) {
  const hasProducts = productCount > 0;
  const storeUrl = `${SITE_URL}/store/${username}`;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Let&apos;s get your shop started
        </p>
        <p className="text-sm text-text-secondary mt-1.5 max-w-md">
          You&apos;re approved and live. A few quick steps and buyers can start finding and ordering from you.
        </p>
      </div>

      <div className="space-y-3">
        <ChecklistCard
          done={hasProducts}
          Icon={Package}
          title={hasProducts ? `${productCount} product${productCount === 1 ? "" : "s"} added` : "Add your first product"}
          description={
            hasProducts
              ? "Add more any time — buyers see everything you've listed."
              : "The most important step — buyers can't order what isn't listed yet."
          }
          href="/seller/dashboard/catalog/new"
          cta={hasProducts ? "Add more" : "Add now"}
        />

        <ChecklistCard
          done={hasAvatar}
          Icon={ImageIcon}
          title="Add a shop photo"
          description="Shops with a photo feel more trustworthy to new buyers."
          href="/seller/dashboard/account"
          cta={hasAvatar ? "Change" : "Add now"}
        />

        <ChecklistCard
          done={hasPaymentMethod}
          Icon={Wallet}
          title="Set up how buyers pay you"
          description="Add your M-Pesa till, pochi, or paybill so payments go smoothly."
          href="/seller/dashboard/account"
          cta={hasPaymentMethod ? "Edit" : "Add now"}
        />

        {/* Unlocked — unlike the pending-approval checklist, an approved
            store is real and requestable right now. Not gated on products,
            just nudged toward doing that first. */}
        <Card>
          <CardSection className="flex items-center gap-4 py-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-role-soft text-role-dark shrink-0">
              <Share2 size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-text-primary">Share your store with buyers</p>
              <p className="text-xs text-text-muted mt-0.5">
                {hasProducts
                  ? "Send your store link to buyers you already know and trust."
                  : "Works best once you've added a product or two to show off."}
              </p>
            </div>
          </CardSection>
        </Card>
      </div>

      <Card variant="outlined">
        <CardSection>
          <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2">Your store link</p>
          <CopyStoreLink url={storeUrl} />
        </CardSection>
      </Card>
    </div>
  );
}
