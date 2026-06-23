"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Loader2,
  Package,
  PackageSearch,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";
import {
  normalizeList,
  products,
  Product,
  stores,
  Store as StoreType,
} from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

type LoadState = "idle" | "loading" | "ready" | "error";

export function MarketplaceClient() {
  const [query, setQuery] = useState("");
  const [storesState, setStoresState] = useState<LoadState>("idle");
  const [productsState, setProductsState] = useState<LoadState>("idle");
  const [sellerRows, setSellerRows] = useState<StoreType[]>([]);
  const [productRows, setProductRows] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStoresState("loading");
    setProductsState("loading");
    setError("");

    Promise.allSettled([stores.list(), products.list()])
      .then(([sellerResult, productResult]) => {
        if (!active) return;

        if (sellerResult.status === "fulfilled") {
          setSellerRows(sellerResult.value.results);
          setStoresState("ready");
        } else {
          setStoresState("error");
          setError(sellerResult.reason instanceof Error ? sellerResult.reason.message : "Stores could not be loaded.");
        }

        if (productResult.status === "fulfilled") {
          setProductRows(productResult.value.results);
          setProductsState("ready");
        } else {
          setProductsState("error");
          setError(productResult.reason instanceof Error ? productResult.reason.message : "Products could not be loaded.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredStores = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return sellerRows;
    return sellerRows.filter((store) =>
      [store.store_name, store.location, store.store_description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value)),
    );
  }, [query, sellerRows]);

  const filteredProducts = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return productRows;
    return productRows.filter((product) =>
      [product.name, product.description, product.category_name, product.seller_username]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(value)),
    );
  }, [query, productRows]);

  const loading = storesState === "loading" || productsState === "loading";
  const failed = storesState === "error" && productsState === "error";

  return (
    <section className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="space-y-6">
        <div className="rounded-lg border border-line bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-normal text-brand">
                Trusted supplier network
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-normal text-ink sm:text-4xl">
                Browse real stores and products from your Nyakizu backend.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
                The interface starts from the trade workflow: verified sellers,
                private stock records, structured orders, payment references,
                and credit follow-up.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/register/seller"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-black text-white shadow-sm transition hover:bg-brand-dark"
              >
                <Store size={16} />
                Create store
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-black text-ink shadow-sm transition hover:border-brand hover:text-brand"
              >
                Open dashboard
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search real stores, products, categories, or sellers"
                className="h-11 w-full rounded-md border border-line bg-surface pl-10 pr-3 text-sm font-medium text-ink outline-none transition focus:border-brand focus:bg-white"
              />
            </label>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-ink px-4 text-sm font-black text-white shadow-sm"
            >
              Sign in
            </Link>
          </div>
        </div>

        {failed ? (
          <EmptyState
            icon={PackageSearch}
            title="Backend data could not be loaded"
            message={error || "Check that the Django backend is running and NEXT_PUBLIC_API_URL points to it."}
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <DataPanel
              title="Verified Stores"
              icon={ShieldCheck}
              loading={storesState === "loading"}
              count={filteredStores.length}
              emptyTitle="No stores yet"
              emptyMessage="Create seller accounts and approve stores in the backend. They will appear here automatically."
            >
              <div className="grid gap-3">
                {filteredStores.map((store) => (
                  <article key={store.id} className="rounded-lg border border-line bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-ink">{store.store_name}</h3>
                        <p className="mt-1 text-sm text-body">{store.location || "Location not set"}</p>
                      </div>
                      <StatusBadge value={store.approval_status} />
                    </div>
                    {store.store_description ? (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-body">
                        {store.store_description}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </DataPanel>

            <DataPanel
              title="Product Catalog"
              icon={Package}
              loading={productsState === "loading"}
              count={filteredProducts.length}
              emptyTitle="No products yet"
              emptyMessage="Add products through the backend or seller tools. This screen will not invent catalog items."
            >
              <div className="grid gap-3">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="rounded-lg border border-line bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-ink">{product.name}</h3>
                        <p className="mt-1 text-sm text-body">
                          {product.category_name || "Uncategorized"} · {product.seller_username}
                        </p>
                      </div>
                      <StatusBadge value={product.status} />
                    </div>
                    <p className="mt-3 font-mono text-sm font-black text-ink">
                      KSh {product.price}
                    </p>
                  </article>
                ))}
              </div>
            </DataPanel>
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-line bg-ink p-5 text-white shadow-sm">
          <p className="text-xs font-black uppercase tracking-normal text-teal-200">
            Operator workflow
          </p>
          <div className="mt-5 space-y-4">
            {[
              ["Verify sellers", "Admin approves trusted wholesalers before they trade."],
              ["Publish catalog", "Sellers manage private stock and buyer-facing availability."],
              ["Record trade", "Orders, M-Pesa references, and credit balances stay together."],
            ].map(([title, description]) => (
              <div key={title} className="flex gap-3">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/10">
                  <ClipboardList size={14} />
                </span>
                <div>
                  <h3 className="text-sm font-black">{title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-300">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black text-ink">Current records</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Stores" value={normalizeList<StoreType>(sellerRows).length} />
            <Metric label="Products" value={normalizeList<Product>(productRows).length} />
          </div>
          {loading ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-body">
              <Loader2 size={14} className="animate-spin" />
              Loading backend records
            </p>
          ) : null}
        </div>
      </aside>
    </section>
  );
}

function DataPanel({
  title,
  icon: Icon,
  loading,
  count,
  emptyTitle,
  emptyMessage,
  children,
}: {
  title: string;
  icon: typeof Store;
  loading: boolean;
  count: number;
  emptyTitle: string;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-normal text-ink">
          <Icon size={17} className="text-brand" />
          {title}
        </h2>
        <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-black text-body">
          {count}
        </span>
      </div>
      {loading ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      ) : count > 0 ? (
        children
      ) : (
        <EmptyState icon={PackageSearch} title={emptyTitle} message={emptyMessage} />
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <p className="text-xs font-bold uppercase tracking-normal text-body">{label}</p>
      <p className="mt-2 font-mono text-2xl font-black text-ink">{value}</p>
    </div>
  );
}
