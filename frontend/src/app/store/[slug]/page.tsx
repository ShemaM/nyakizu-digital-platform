import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Store } from "lucide-react";
import { Logo } from "@/components/Logo";
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
      <header className="border-b border-dark-accent bg-dark-secondary/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-3 py-2 text-body font-bold text-text-secondary transition hover:bg-dark-tertiary hover:text-text-primary">
              Sign in
            </Link>
            <Link href="/register" className="rounded-lg bg-brand-gold px-3 py-2 text-body font-bold text-slate-950 transition hover:bg-brand-gold-dark">
              Join
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-dark-accent bg-dark-card shadow-card">
          <div className="relative overflow-hidden bg-dark-deepest p-6 text-text-primary sm:p-8">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 600px 400px at 90% -10%, rgba(245,158,11,0.15), transparent 60%)",
              }}
            />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex gap-4">
                <StoreMark
                  name={seller.store_name || "Store"}
                  imageUrl={seller.user?.avatar_url}
                  size="xl"
                />
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-gold/15 border border-brand-gold/30 px-3 py-1 text-caption font-bold text-brand-gold">
                    <Store size={14} />
                    Approved wholesaler
                  </div>
                  <h1 className="text-display font-black tracking-normal text-text-primary">{seller.store_name}</h1>
                  <div className="mt-3 flex items-center gap-1 text-body font-semibold text-text-secondary">
                    <MapPin size={14} />
                    <span>{seller.location}</span>
                  </div>
                  {seller.store_description && (
                    <p className="mt-3 max-w-2xl text-body leading-6 text-text-secondary">{seller.store_description}</p>
                  )}
                  <p className="mt-2 text-caption font-bold text-text-muted">Trading since {joinedDate}</p>
                </div>
              </div>
              <div className="relative grid gap-2 sm:min-w-64">
                <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-4 py-3 text-body font-bold text-slate-950 transition hover:bg-brand-gold-dark shadow-sm">
                  Sign in to order
                  <ArrowRight size={16} />
                </Link>
                <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-dark-tertiary border border-dark-accent px-4 py-3 text-body font-bold text-text-primary transition hover:bg-dark-tertiary/80">
                  Create account
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-dark-accent bg-dark-secondary p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <CopyStoreLink url={storeUrl} />
            <p className="shrink-0 text-center text-caption text-text-muted sm:text-right">
              Sign in as an approved buyer to order.
            </p>
          </div>
        </div>

        <div className="mt-6 mb-8">
          <StoreProducts products={storeProducts} />
        </div>
      </section>
    </main>
  );
}
