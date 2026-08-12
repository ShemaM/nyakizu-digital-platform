import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Store } from "lucide-react";
import { LandingHeader, LandingFooter, Container, Section } from "@/components/layouts";
import { sellers, type ApiSeller } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse stores",
  description: "Browse approved wholesale sellers on Nyakizu.",
  alternates: { canonical: `${SITE_URL}/store` },
};

// The list endpoint nests username under `user.username`, not as a
// top-level field, despite what the ApiSeller type implies (see the same
// note in sitemap.ts) — checking both keeps store links from 404ing.
function usernameOf(seller: ApiSeller): string | undefined {
  return seller.user?.username || seller.username;
}

export default async function StoreDirectoryPage() {
  const storeList = await sellers.list();
  const linkableStores = storeList.filter((seller) => Boolean(usernameOf(seller)));

  return (
    <div className="min-h-screen bg-white text-text-primary">
      <LandingHeader />

      <Section spacing="lg" className="pt-32 sm:pt-40">
        <Container size="lg">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-gold-dark">Browse</p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
              Stores on Nyakizu
            </h1>
            <p className="mt-4 text-text-secondary text-xl leading-relaxed max-w-2xl mx-auto">
              Every store here is an approved wholesaler. Browse freely — sign in only when you're
              ready to place an order.
            </p>
          </div>

          {linkableStores.length === 0 ? (
            <div className="rounded-2xl border border-dark-accent bg-dark-secondary p-10 sm:p-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold-subtle">
                <Store className="h-6 w-6 text-brand-gold-dark" aria-hidden="true" />
              </div>
              <p className="mt-4 text-lg font-bold text-text-primary">No stores are live yet</p>
              <p className="mt-1 text-text-secondary">Check back soon — new stores go live as they're approved.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {linkableStores.map((seller) => {
                const storeLabel = seller.store_name || seller.shop_name || usernameOf(seller);
                const storeLocation = seller.location || seller.shop_location;
                return (
                  <Link
                    key={seller.id}
                    href={`/store/${usernameOf(seller)}`}
                    className="group relative flex flex-col gap-4 rounded-2xl border border-dark-accent bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-gold/50 hover:shadow-[0_16px_32px_-12px_rgba(20,18,14,0.12)]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold-subtle">
                        <Store className="h-5 w-5 text-brand-gold-dark" aria-hidden="true" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        <ShieldCheck size={12} aria-hidden="true" />
                        Approved
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-text-primary">{storeLabel}</h2>
                      {storeLocation && (
                        <div className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
                          <MapPin size={13} className="shrink-0" aria-hidden="true" />
                          <span className="truncate">{storeLocation}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto flex items-center gap-1 text-sm font-bold text-brand-gold-dark opacity-0 transition-opacity group-hover:opacity-100">
                      Visit store
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-14 rounded-2xl bg-text-primary p-6 sm:p-10 text-center">
            <h2 className="text-2xl font-bold text-white">Selling wholesale phone accessories?</h2>
            <p className="mt-1.5 text-white/70 max-w-md mx-auto">
              List your store on Nyakizu, free — approved sellers show up here automatically.
            </p>
            <Link
              href="/register"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-3 text-sm font-black text-text-primary transition hover:bg-brand-gold-dark"
            >
              Create your store
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}
