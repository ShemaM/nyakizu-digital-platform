"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  CreditCard,
  Loader2,
  Package,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import {
  auth,
  normalizeList,
  orders,
  Order,
  products,
  Product,
  stores,
  Store as StoreType,
  User,
} from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [sellerRows, setSellerRows] = useState<StoreType[]>([]);
  const [productRows, setProductRows] = useState<Product[]>([]);
  const [orderRows, setOrderRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const current = await auth.me();
        if (!active) return;
        setUser(current);

        const requests: Promise<unknown>[] = [orders.list()];
        if (current.role === "seller") requests.push(products.mine());
        if (current.role === "admin" || current.role === "buyer") requests.push(stores.list());

        const results = await Promise.allSettled(requests);
        if (!active) return;

        const orderResult = results[0];
        if (orderResult.status === "fulfilled") {
          setOrderRows(normalizeList<Order>(orderResult.value as { results: Order[] } | Order[]));
        }

        if (current.role === "seller") {
          const productResult = results[1];
          if (productResult?.status === "fulfilled") {
            setProductRows(normalizeList<Product>(productResult.value as { results: Product[] } | Product[]));
          }
        }

        if (current.role === "admin" || current.role === "buyer") {
          const storeResult = results[1];
          if (storeResult?.status === "fulfilled") {
            setSellerRows((storeResult.value as { results: StoreType[] }).results);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Dashboard could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const title = useMemo(() => {
    if (!user) return "Workspace";
    if (user.role === "seller") return "Seller workspace";
    if (user.role === "admin") return "Admin workspace";
    return "Buyer workspace";
  }, [user]);

  if (loading) {
    return (
      <main className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl place-items-center px-4">
        <div className="inline-flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm font-bold text-body shadow-sm">
          <Loader2 size={17} className="animate-spin text-brand" />
          Loading your workspace
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          icon={ShieldCheck}
          title="Sign in required"
          message={error}
          action={
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-black text-white"
            >
              Go to sign in
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100dvh-4rem)] max-w-7xl px-4 py-6 sm:px-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-brand">
              {user?.role}
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-normal text-ink">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-body">
              Manage the records already saved in your backend. Empty sections
              mean no data has been created yet.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-surface px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-normal text-body">Signed in as</p>
            <p className="mt-1 text-sm font-black text-ink">{user?.full_name || user?.username}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={ClipboardList} label="Orders" value={orderRows.length} />
        <Metric icon={Package} label="My products" value={productRows.length} />
        <Metric icon={Store} label="Stores" value={sellerRows.length} />
        <Metric icon={CreditCard} label="Credit records" value={0} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          {user?.role === "seller" ? (
            <Panel title="My Products" icon={Package}>
              {productRows.length ? (
                <div className="overflow-hidden rounded-lg border border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface text-xs uppercase text-body">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line bg-white">
                      {productRows.map((product) => (
                        <tr key={product.id}>
                          <td className="px-4 py-3 font-bold text-ink">{product.name}</td>
                          <td className="px-4 py-3 text-body">{product.category_name || "Uncategorized"}</td>
                          <td className="px-4 py-3 font-mono font-bold text-ink">KSh {product.price}</td>
                          <td className="px-4 py-3"><StatusBadge value={product.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={Package}
                  title="No products created"
                  message="Create products through the backend or seller product tools. No placeholder inventory is shown here."
                />
              )}
            </Panel>
          ) : (
            <Panel title={user?.role === "admin" ? "Seller Verification" : "Trusted Stores"} icon={Store}>
              {sellerRows.length ? (
                <div className="grid gap-3">
                  {sellerRows.map((store) => (
                    <article key={store.id} className="rounded-lg border border-line bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black text-ink">{store.store_name}</h3>
                          <p className="mt-1 text-sm text-body">{store.location || "Location not set"}</p>
                        </div>
                        <StatusBadge value={store.approval_status} />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Store}
                  title="No seller records"
                  message="Once stores are created and returned by the backend, they will be listed here."
                />
              )}
            </Panel>
          )}

          <Panel title="Orders" icon={ClipboardList}>
            {orderRows.length ? (
              <div className="grid gap-3">
                {orderRows.map((order) => (
                  <article key={order.id} className="rounded-lg border border-line bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-mono text-sm font-black text-ink">Order #{order.id}</h3>
                        <p className="mt-1 text-sm text-body">{order.created_at || "Date not provided"}</p>
                      </div>
                      <StatusBadge value={order.status} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No orders yet"
                message="Orders created through the backend will appear here for the signed-in user."
              />
            )}
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel title="Next Records To Create" icon={Users}>
            <div className="space-y-3 text-sm leading-6 text-body">
              <p>1. Register and verify real users.</p>
              <p>2. Create seller stores and approve trusted wholesalers.</p>
              <p>3. Add actual products, then place test orders.</p>
              <p>4. Record real payment references and credit balances when those backend tools are ready.</p>
            </div>
          </Panel>
        </aside>
      </section>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-normal text-body">{label}</p>
        <Icon size={17} className="text-brand" />
      </div>
      <p className="mt-3 font-mono text-3xl font-black text-ink">{value}</p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Package;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
      <h2 className="mb-4 inline-flex items-center gap-2 text-sm font-black uppercase tracking-normal text-ink">
        <Icon size={17} className="text-brand" />
        {title}
      </h2>
      {children}
    </section>
  );
}
