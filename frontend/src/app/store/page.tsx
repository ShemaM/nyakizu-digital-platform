import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Store } from "lucide-react";
import { Logo } from "@/components/Logo";
import { sellers } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse stores",
  description: "Browse approved wholesale sellers on Nyakizu.",
  alternates: { canonical: `${SITE_URL}/store` },
};

export default async function StoreDirectoryPage() {
  const storeList = await sellers.list();

  return (
    <main className="min-h-screen bg-surface text-slate-950">
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
        <div className="mb-6">
          <h1 className="text-display font-black tracking-normal">Stores</h1>
          <p className="mt-1 text-body text-slate-500">Approved wholesale sellers on Nyakizu.</p>
        </div>

        {storeList.length === 0 ? (
          <div className="app-panel rounded-lg p-8 text-center">
            <Store size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-body text-slate-500">No stores are live yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {storeList.map((seller) => (
              <Link
                key={seller.id}
                href={`/store/${seller.username}`}
                className="app-panel flex items-center gap-3 rounded-lg p-4 transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Store size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-bold text-slate-950">
                    {seller.store_name || seller.shop_name || seller.username}
                  </p>
                  {(seller.location || seller.shop_location) && (
                    <div className="mt-0.5 flex items-center gap-1 text-caption text-slate-500">
                      <MapPin size={12} />
                      <span className="truncate">{seller.location || seller.shop_location}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
