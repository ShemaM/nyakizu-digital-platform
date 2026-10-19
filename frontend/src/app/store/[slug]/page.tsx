import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Package, ShieldCheck, Store } from "lucide-react";
import { LogoLockup } from "@/components/Logo";
import { StoreMark } from "@/components/ui/StoreMark";
import { sellers, products } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import { StoreProducts } from "./StoreProducts";
import { CopyStoreLink } from "./CopyStoreLink";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const matches = await sellers.list({ username: slug });
  const seller = matches[0];

  if (!seller) {
    return { title: "Store not found", robots: { index: false, follow: false } };
  }

  const title = `${seller.store_name} — Wholesale Phone Accessories in ${seller.location || "Nairobi"}`;
  const description =
    seller.store_description ||
    `Shop wholesale phone accessories from ${seller.store_name}, an approved Nyakizu seller in ${seller.location || "Nairobi"}.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/store/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/store/${slug}`, type: "website" },
  };
}

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const matches = await sellers.list({ username: slug });
  const seller = matches[0];

  if (!seller) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-dark-primary px-6">
        <div className="rounded-2xl border border-dark-accent bg-dark-card max-w-sm p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-dark-tertiary text-text-muted">
            <Store size={22} />
          </div>
          <p className="mt-4 text-title font-black text-text-primary">Store not found</p>
          <p className="mt-1 text-body text-text-secondary">This store link is not active.</p>
          <Link href="/" className="mt-5 inline-flex text-body font-bold text-brand-gold hover:underline">
            Go back home
          </Link>
        </div>
      </main>
    );
  }

  const storeUrl = `${SITE_URL}/store/${slug}`;
  const storeProducts = await products.list({ seller: seller.id });
  const joinedDate = new Date(seller.created_at).toLocaleDateString("en-KE", { month: "long", year: "numeric" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: seller.store_name,
    url: storeUrl,
    description: seller.store_description || undefined,
    address: seller.location ? { "@type": "PostalAddress", addressLocality: seller.location, addressCountry: "KE" } : undefined,
  };

  return (
    <main className="min-h-screen bg-dark-primary text-text-primary">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- JSON-LD, but store_name/description/location are
        // seller-controlled free text, so `<` is escaped below to block a `</script>` breakout (stored XSS).
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="sticky top-0 z-30 border-b border-dark-accent bg-dark-secondary/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Nyakizu home" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
            <LogoLockup size="sm" className="text-text-primary" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-bold text-text-secondary transition hover:bg-dark-tertiary hover:text-text-primary">
              Sign in
            </Link>
            <Link href="/register" className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-brand-gold-dark">
              Create account
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-9">
        <div className="overflow-hidden rounded-3xl border border-dark-accent bg-dark-card shadow-card">
          <div className="relative overflow-hidden bg-dark-secondary p-5 text-text-primary sm:p-8">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 620px 300px at 100% 0%, rgba(245,158,11,0.13), transparent 65%)",
              }}
            />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4 sm:items-center sm:gap-5">
                <StoreMark name={seller.store_name || "Store"} size="lg" className="ring-4 ring-dark-card shadow-md" />
                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                    <ShieldCheck size={14} /> Verified seller
                  </div>
                  <h1 className="text-2xl font-black leading-tight tracking-tight text-text-primary sm:text-3xl">{seller.store_name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-text-secondary">
                    {seller.location && <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{seller.location}</span>}
                    <span className="text-text-muted">Selling on Nyakizu since {joinedDate}</span>
                  </div>
                  {seller.store_description && (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">{seller.store_description}</p>
                  )}
                </div>
              </div>
              <div className="relative grid shrink-0 gap-2 sm:w-52">
                <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-brand-gold-dark shadow-sm">
                  Sign in to order
                  <ArrowRight size={16} />
                </Link>
                <p className="text-center text-xs text-text-muted">Buyer account required to place an order</p>
                <Link href="/register" className="inline-flex items-center justify-center rounded-xl border border-dark-accent bg-dark-card px-4 py-2.5 text-sm font-bold text-text-primary transition hover:bg-dark-tertiary">
                  Join Nyakizu
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-dark-accent bg-dark-card p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Package size={16} className="text-brand-gold" />
              <span><strong className="text-text-primary">{storeProducts.length}</strong> products in this catalog</span>
            </div>
            <div className="w-full sm:max-w-md"><CopyStoreLink url={storeUrl} /></div>
          </div>
        </div>

        <div className="mt-9">
          <StoreProducts products={storeProducts} />
        </div>
      </section>
    </main>
  );
}
