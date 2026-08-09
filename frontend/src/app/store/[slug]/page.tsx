import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Copy, MapPin, ShoppingBag, Store } from "lucide-react";
import { Logo } from "@/components/Logo";
import { sellers, products } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import { StoreProducts } from "./StoreProducts";

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
      <main className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="app-panel max-w-sm rounded-lg p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Store size={22} />
          </div>
          <p className="mt-4 text-title font-black text-slate-950">Store not found</p>
          <p className="mt-1 text-body text-slate-500">This store link is not active.</p>
          <Link href="/" className="mt-5 inline-flex text-body font-bold text-blue-700 hover:underline">
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
    <main className="min-h-screen bg-surface text-slate-950">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- JSON-LD, but store_name/description/location are
        // seller-controlled free text, so `<` is escaped below to block a `</script>` breakout (stored XSS).
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-3 py-2 text-body font-bold text-slate-700 transition hover:bg-slate-100">
              Sign in
            </Link>
            <Link href="/register" className="rounded-lg bg-slate-950 px-3 py-2 text-body font-bold text-white transition hover:bg-slate-800">
              Join
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="app-panel overflow-hidden rounded-lg">
          <div className="bg-slate-950 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-caption font-bold text-slate-200">
                  <Store size={14} />
                  Approved wholesaler
                </div>
                <h1 className="text-display font-black tracking-normal">{seller.store_name}</h1>
                <div className="mt-3 flex items-center gap-1 text-body font-semibold text-slate-300">
                  <MapPin size={14} />
                  <span>{seller.location}</span>
                </div>
                {seller.store_description && (
                  <p className="mt-3 max-w-2xl text-body leading-6 text-slate-300">{seller.store_description}</p>
                )}
                <p className="mt-2 text-caption font-bold text-slate-500">Trading since {joinedDate}</p>
              </div>
              <div className="grid gap-2 sm:min-w-64">
                <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-body font-black text-white transition hover:bg-blue-700">
                  Sign in to order
                  <ArrowRight size={16} />
                </Link>
                <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-3 text-body font-black text-white transition hover:bg-white/15">
                  Create account
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="min-w-0 flex-1 truncate font-mono text-caption text-slate-500">{storeUrl}</p>
              <Copy size={14} className="shrink-0 text-slate-400" />
            </div>
            <p className="mt-2 text-center text-caption text-slate-500">
              You need an approved buyer account before placing orders with this seller.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <StoreProducts products={storeProducts} />
        </div>

        <div className="py-8 text-center">
          <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-body font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:bg-blue-700">
            <ShoppingBag size={16} />
            Create account to order
          </Link>
        </div>
      </section>
    </main>
  );
}
