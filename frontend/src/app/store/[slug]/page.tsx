import Link from "next/link";
import { ArrowRight, Copy, MapPin, ShoppingBag, Store } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getSellerBySlug, PRODUCTS, formatDate } from "@/lib/dummy-data";
import { StoreProducts } from "./StoreProducts";

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seller = getSellerBySlug(slug);

  if (!seller || seller.approvalStatus !== "approved") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="app-panel max-w-sm rounded-lg p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Store size={22} />
          </div>
          <p className="mt-4 text-lg font-black text-slate-950">Store not found</p>
          <p className="mt-1 text-sm text-slate-500">This store link is not active.</p>
          <Link href="/" className="mt-5 inline-flex text-sm font-bold text-blue-700 hover:underline">
            Go back home
          </Link>
        </div>
      </main>
    );
  }

  const storeUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3003"}/store/${slug}`;
  const storeProducts = PRODUCTS.filter((p) => p.sellerId === seller.id);

  return (
    <main className="min-h-screen bg-surface text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
              Sign in
            </Link>
            <Link href="/register" className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-800">
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
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                  <Store size={14} />
                  Approved wholesaler
                </div>
                <h1 className="text-3xl font-black tracking-normal sm:text-4xl">{seller.storeName}</h1>
                <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-slate-300">
                  <MapPin size={14} />
                  <span>{seller.location}</span>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{seller.description}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">Member since {formatDate(seller.joinedDate)}</p>
              </div>
              <div className="grid gap-2 sm:min-w-64">
                <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700">
                  Sign in to order
                  <ArrowRight size={16} />
                </Link>
                <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15">
                  Create account
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="min-w-0 flex-1 truncate font-mono text-xs text-slate-500">{storeUrl}</p>
              <Copy size={14} className="shrink-0 text-slate-400" />
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              You need an approved buyer account before placing orders with this seller.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <StoreProducts products={storeProducts} />
        </div>

        <div className="py-8 text-center">
          <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:bg-blue-700">
            <ShoppingBag size={16} />
            Create account to order
          </Link>
        </div>
      </section>
    </main>
  );
}
