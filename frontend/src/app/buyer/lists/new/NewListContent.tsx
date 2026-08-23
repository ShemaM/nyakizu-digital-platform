"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CloudOff, RefreshCw, CheckCircle, Store, ChevronRight, SlidersHorizontal, ShoppingCart, X } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Avatar } from "@/components/ui/Avatar";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { ListSkeleton } from "@/components/ui/LoadingState";
import { NoDataEmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { ProductFilterDrawer } from "@/components/products/ProductFilterDrawer";
import { BuyerProductCard } from "@/components/buyer/BuyerProductCard";
import { CartPanel, type CartItem } from "@/components/buyer/CartPanel";
import { products, categories, orders, relationships, type ApiProduct, type ApiCategory, type ApiRelationship, ApiError, fmtKES, parsePrice } from "@/lib/api";
import { offlineDB } from "@/lib/offline-db";
import { cn } from "@/lib/cn";

// After this many failed attempts in a row, stop retrying an order
// automatically when the connection comes back — it's probably failing for
// a real reason (an item no longer available, etc.), not a bad connection.
// "Send now" still always tries it again: that's the user explicitly asking.
const MAX_AUTO_RETRIES = 3;

/**
 * Shown when /buyer/lists/new is opened with no ?id= — happens whenever a
 * buyer starts an order from the dashboard hero/quick-action instead of a
 * supplier's storefront. Rather than dead-ending on an error, it resolves
 * (or lets the buyer pick) the right supplier and forwards to this same
 * page with ?id= set.
 */
function SupplierPicker() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<ApiRelationship[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    relationships.mine().then((list) => {
      if (cancelled) return;
      const approved = list.filter((r) => r.status === "approved");
      if (approved.length === 1) {
        router.replace(`/buyer/lists/new?id=${approved[0].seller_id}`);
        return;
      }
      setSuppliers(approved);
    });
    return () => { cancelled = true; };
  }, [router]);

  if (suppliers === null) {
    return (
      <AppShell title="New Order">
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
          <ListSkeleton count={3} showAvatar lines={1} />
        </div>
      </AppShell>
    );
  }

  if (suppliers.length === 0) {
    return (
      <AppShell title="New Order">
        <div className="p-4 sm:p-6 max-w-2xl mx-auto text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-role-soft flex items-center justify-center mx-auto mb-3">
            <Store className="w-6 h-6 text-role" />
          </div>
          <p className="text-body-lg font-semibold text-text-primary">Find your suppliers first</p>
          <p className="text-body text-text-muted mt-1 max-w-sm mx-auto">
            You need a supplier before you can send an order. Browse suppliers and ask to join a shop.
          </p>
          <Button asChild className="mt-5">
            <Link href="/buyer/suppliers">Browse Suppliers</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="New Order">
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-3">
        <h2 className="text-label px-1">Who is this order for?</h2>
        {suppliers.map((rel) => (
          <Link
            key={rel.id}
            href={`/buyer/lists/new?id=${rel.seller_id}`}
            className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 hover:border-role/30 hover:bg-role-soft transition-all"
          >
            <Avatar name={rel.seller_name} size="md" />
            <span className="flex-1 min-w-0 text-body font-semibold text-text-primary truncate">{rel.seller_name}</span>
            <ChevronRight size={18} className="text-text-muted shrink-0" />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

function productKey(productId: number) {
  return `p-${productId}`;
}

let customItemSeq = 0;
function nextCustomKey() {
  customItemSeq += 1;
  return `c-${Date.now()}-${customItemSeq}`;
}

export function NewListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const sellerId = searchParams.get("id")
    ? parseInt(searchParams.get("id")!)
    : undefined;

  const [productList, setProductList] = useState<ApiProduct[]>([]);
  const [categoryList, setCategoryList] = useState<ApiCategory[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done" | "failed">("idle");
  const [pendingCount, setPendingCount] = useState(0);
  const [stuckCount, setStuckCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [nameQuery, setNameQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (sellerId) {
      loadProducts();
    } else {
      setIsLoading(false);
    }
  }, [sellerId]);

  // Track online/offline status
  useEffect(() => {
    function onOnline() { setIsOnline(true); }
    function onOffline() { setIsOnline(false); }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Auto-sync when coming back online. manual=true (the "Send now" button)
  // also retries orders that already failed and hit the auto-retry cap —
  // otherwise a stuck order had no way to ever leave the queue.
  const syncQueued = useCallback(async (manual = false) => {
    if (!isOnline) return;
    const queued = await offlineDB.getQueuedOrders();
    const pending = queued.filter(
      (q) => q.status === "pending" || (q.status === "failed" && (manual || (q.retryCount ?? 0) < MAX_AUTO_RETRIES))
    );
    if (pending.length === 0) return;

    setSyncStatus("syncing");
    for (const order of pending) {
      try {
        await offlineDB.updateQueuedStatus(order.id, "syncing");
        await orders.create({
          items: order.items,
          seller_id: order.sellerId,
          buyer_notes: order.buyer_notes,
        });
        await offlineDB.updateQueuedStatus(order.id, "synced");
        await offlineDB.removeQueued(order.id);
      } catch (err) {
        console.error("Sync failed for order:", order.id, err);
        await offlineDB.updateQueuedStatus(order.id, "failed", err instanceof ApiError ? err.message : "Could not send.");
      }
    }
    setSyncStatus("done");
    setTimeout(() => setSyncStatus("idle"), 3000);
    updatePendingCount();
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) {
      syncQueued();
    }
  }, [isOnline, syncQueued]);

  const updatePendingCount = async () => {
    const queued = await offlineDB.getQueuedOrders();
    setPendingCount(queued.filter((q) => q.status === "pending" || q.status === "failed").length);
    setStuckCount(queued.filter((q) => q.status === "failed" && (q.retryCount ?? 0) >= MAX_AUTO_RETRIES).length);
  };

  useEffect(() => {
    updatePendingCount();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [allProducts, catsData] = await Promise.all([
        products.list({ seller: sellerId }),
        categories.list(),
      ]);
      // Only truly in-stock items are browsable — anything the seller
      // doesn't currently stock goes through "ask us to source it" instead
      // of showing as an orderable-but-unavailable catalog card.
      const availableProducts = allProducts.filter((p) => p.availability_label === "available");
      setProductList(availableProducts);
      setCategoryList(catsData);

      // Load draft from IndexedDB
      if (sellerId) {
        const draft = await offlineDB.getDraft(sellerId);
        if (draft) {
          if (Array.isArray(draft.items)) {
            const mappedItems: CartItem[] = draft.items.map((di: any) => {
              if (di.product_id != null) {
                const prod = availableProducts.find((p) => p.id === di.product_id);
                return {
                  key: productKey(di.product_id),
                  productId: di.product_id,
                  name: prod ? prod.name : "Unknown Product",
                  price: prod ? parsePrice(prod.price) : 0,
                  qty: di.quantity || di.qty || 1,
                  imageUrl: prod?.image_url ?? null,
                };
              }
              return {
                key: nextCustomKey(),
                name: di.custom_name || "Item to source",
                price: null,
                qty: di.quantity || di.qty || 1,
              };
            });
            setItems(mappedItems);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("We couldn't load products. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  function adjust(product: ApiProduct, delta: number) {
    const key = productKey(product.id);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter((i) => i.key !== key);
        return prev.map((i) => (i.key === key ? { ...i, qty: newQty } : i));
      }
      if (delta > 0) {
        return [...prev, { key, productId: product.id, name: product.name, price: parsePrice(product.price), qty: 1, imageUrl: product.image_url ?? null }];
      }
      return prev;
    });
  }

  function adjustByKey(key: string, delta: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (!existing) return prev;
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter((i) => i.key !== key);
      return prev.map((i) => (i.key === key ? { ...i, qty: newQty } : i));
    });
  }

  function addSourcingItem(name: string, qty: number) {
    setItems((prev) => [...prev, { key: nextCustomKey(), name, price: null, qty }]);
  }

  function getQty(productId: number) {
    return items.find((i) => i.key === productKey(productId))?.qty ?? 0;
  }

  const total = items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const hasUnpriced = items.some((i) => i.price == null);

  // ── Filtering ─────────────────────────────────────────────────────────
  const categoryCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const product of productList) {
      if (product.category == null) continue;
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return counts;
  }, [productList]);

  const pillCategories = useMemo(
    () =>
      categoryList
        .filter((c) => (categoryCounts.get(c.id) ?? 0) > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categoryList, categoryCounts]
  );

  const filteredProducts = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return productList.filter((product) => {
      if (q && !product.name.toLowerCase().includes(q)) return false;
      if (selectedCategoryIds.size > 0 && (product.category == null || !selectedCategoryIds.has(product.category))) {
        return false;
      }
      return true;
    });
  }, [productList, nameQuery, selectedCategoryIds]);

  const activeFilterCount = selectedCategoryIds.size + (nameQuery.trim() ? 1 : 0);

  function toggleCategory(id: number) {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectOnlyCategory(id: number | null) {
    setSelectedCategoryIds(id === null ? new Set() : new Set([id]));
  }

  function clearFilters() {
    setNameQuery("");
    setSelectedCategoryIds(new Set());
  }

  async function handleConfirmSubmit() {
    try {
      setSubmitting(true);

      const orderData = {
        items: items.map((item) =>
          item.productId != null
            ? { product_id: item.productId, quantity: item.qty }
            : { custom_name: item.name, quantity: item.qty }
        ),
        seller_id: sellerId!,
      };

      if (!isOnline) {
        // Queue for sync when back online
        await offlineDB.queueOrder({
          sellerId: sellerId!,
          items: orderData.items,
        });
        await offlineDB.deleteDraft(sellerId!);
        setConfirmOpen(false);
        setCartOpen(false);
        setItems([]);
        await updatePendingCount();
        toast("You are offline. Your order has been saved and will be sent automatically when you reconnect.", "info");
        return;
      }

      const order = await orders.create(orderData);
      setConfirmOpen(false);
      setCartOpen(false);
      await offlineDB.deleteDraft(sellerId!);
      router.push(`/buyer/orders/${order.id}`);
    } catch (err) {
      console.error("Failed to create order:", err);
      if (err instanceof ApiError) {
        toast(err.message, "error");
      } else {
        toast("We couldn't send your order. Please try again.", "error");
      }
      setSubmitting(false);
    }
  }

  // Persist drafts to IndexedDB
  useEffect(() => {
    if (!sellerId) return;
    const draftItems = items.map((item) =>
      item.productId != null
        ? { product_id: item.productId, quantity: item.qty }
        : { custom_name: item.name, quantity: item.qty }
    );
    offlineDB.saveDraft(sellerId, {
      sellerId,
      items: draftItems as any,
      updatedAt: Date.now(),
    }).catch(() => {});
  }, [items, sellerId]);

  if (!sellerId) {
    return <SupplierPicker />;
  }

  if (isLoading) {
    return (
      <AppShell title="New Order">
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
          <ListSkeleton count={5} showAvatar={false} lines={2} />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="New Order">
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
          <NoDataEmptyState onActionClick={loadProducts} />
        </div>
      </AppShell>
    );
  }

  if (productList.length === 0) {
    return (
      <AppShell title="New Order">
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
          <NoDataEmptyState />
        </div>
      </AppShell>
    );
  }

  const cartPanelProps = {
    items,
    total,
    hasUnpriced,
    onIncrease: (key: string) => adjustByKey(key, 1),
    onDecrease: (key: string) => adjustByKey(key, -1),
    onAddSourcingItem: addSourcingItem,
    onSubmit: () => setConfirmOpen(true),
    submitting,
    isOnline,
  };

  return (
    <AppShell
      title="New Order"
      headerRight={
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          aria-label="Filter products"
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-slate-100 transition-colors"
        >
          <SlidersHorizontal size={19} />
          {activeFilterCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-role" aria-hidden="true" />
          )}
        </button>
      }
    >
      {/* Split screen on wide viewports — product grid on the left, an
          always-visible cart on the right, like a real storefront checkout.
          On phones the cart collapses into a floating bar + bottom sheet
          instead, since there's no room for two columns. */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-6 lg:items-start lg:p-6 lg:max-w-6xl lg:mx-auto">
        {/* pb-16 is *additional* clearance on top of AppShell's own pb-20 on
            <main> (which already clears the bottom nav) — just enough extra
            to keep the floating cart bar off the last row, not a second full
            nav-height's worth stacked on top of it. */}
        <div className="p-4 sm:p-6 lg:p-0 space-y-5 max-w-2xl lg:max-w-none mx-auto lg:mx-0 pb-16 lg:pb-0">
          {/* Offline banner */}
          {!isOnline && (
            <InlineBanner tone="saved" icon={CloudOff}>
              You are offline. Your list is saved on this phone and will send when you are back online.
            </InlineBanner>
          )}

          {/* Sync status */}
          {syncStatus === "syncing" && (
            <InlineBanner tone="info" icon={RefreshCw}>Sending saved orders...</InlineBanner>
          )}
          {syncStatus === "done" && (
            <InlineBanner tone="success" icon={CheckCircle}>Orders sent!</InlineBanner>
          )}

          {/* Pending orders count */}
          {pendingCount > 0 && (
            <div className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2.5 border",
              stuckCount > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-100 border-slate-200"
            )}>
              <CloudOff size={14} className="text-text-muted shrink-0" />
              <p className="text-xs text-text-secondary">
                {stuckCount > 0
                  ? `${stuckCount} order${stuckCount !== 1 ? "s" : ""} did not send. Tap Send now to try again.`
                  : `${pendingCount} order${pendingCount !== 1 ? "s" : ""} waiting to send.`}
              </p>
              <Button variant="ghost" size="sm" className="ml-auto text-xs h-6 px-2" onClick={() => syncQueued(true)} disabled={!isOnline}>
                <RefreshCw size={12} className="mr-1" /> Send now
              </Button>
            </div>
          )}

          {/* Quick category filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <button
              type="button"
              onClick={() => selectOnlyCategory(null)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors",
                selectedCategoryIds.size === 0 ? "bg-role-dark text-white shadow-sm" : "bg-white border border-slate-200 text-text-secondary"
              )}
            >
              All
            </button>
            {pillCategories.map((category) => {
              const active = selectedCategoryIds.size === 1 && selectedCategoryIds.has(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectOnlyCategory(category.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors",
                    active ? "bg-role-dark text-white shadow-sm" : "bg-white border border-slate-200 text-text-secondary"
                  )}
                >
                  {category.name} · {categoryCounts.get(category.id) ?? 0}
                </button>
              );
            })}
          </div>

          {/* Products */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center text-text-muted">
              <p className="text-body font-bold text-text-secondary">No products match this filter</p>
              <button type="button" onClick={clearFilters} className="text-sm font-bold text-role mt-1.5 hover:opacity-80">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <BuyerProductCard
                  key={product.id}
                  product={product}
                  qty={getQty(product.id)}
                  onIncrease={() => adjust(product, 1)}
                  onDecrease={() => adjust(product, -1)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop/tablet cart — sticky alongside the grid */}
        <div className="hidden lg:block sticky top-24 bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
          <h2 className="text-lg font-black text-text-primary mb-1">Your Order</h2>
          <CartPanel {...cartPanelProps} />
        </div>
      </div>

      {/* Mobile — floating summary bar opens a bottom-sheet cart */}
      {(itemCount > 0) && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="lg:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-4 right-4 z-30 flex items-center justify-between gap-3 rounded-2xl bg-role-dark px-5 py-4 shadow-[0_12px_24px_-6px_rgb(var(--role)/0.5)]"
        >
          <span className="flex items-center gap-2 text-white font-bold text-sm">
            <ShoppingCart size={18} />
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
          <span className="text-white font-black tabular-nums">{fmtKES(total)}</span>
          <span className="text-white/90 text-xs font-bold underline underline-offset-2">View order</span>
        </button>
      )}

      {/* A sourcing-only cart (no priced items yet) still needs a way in on mobile */}
      {itemCount === 0 && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="lg:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] right-4 z-30 flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-3 shadow-lg text-sm font-bold text-text-secondary"
        >
          <ShoppingCart size={16} /> Cart
        </button>
      )}

      {cartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
            className="relative w-full max-h-[85vh] flex flex-col bg-white rounded-t-3xl shadow-2xl animate-scale-in overflow-hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-200" aria-hidden="true" />
            <div className="flex items-center justify-between px-5 pt-6 pb-3 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-black text-text-primary">Your Order</h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              <CartPanel {...cartPanelProps} />
            </div>
          </div>
        </div>
      )}

      <ProductFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        categoryList={categoryList}
        categoryCounts={categoryCounts}
        nameQuery={nameQuery}
        onNameQueryChange={setNameQuery}
        selectedCategoryIds={selectedCategoryIds}
        onToggleCategory={toggleCategory}
        onClear={clearFilters}
      />

      <Dialog
        open={confirmOpen}
        title={isOnline ? "Send this order?" : "Save this order?"}
        message={
          isOnline
            ? "Once you send it, you cannot change the list. The seller will check it and confirm the final price."
            : "You are offline. This order will be saved on your phone and sent automatically when you reconnect."
        }
        confirmLabel={submitting ? "Sending…" : isOnline ? "Yes, send it" : "Yes, save it"}
        onConfirm={() => {
          if (!submitting) void handleConfirmSubmit();
        }}
        onCancel={() => setConfirmOpen(false)}
      >
        <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 px-3 py-2 text-body">
              <span className="text-text-primary truncate">{item.qty}× {item.name}</span>
              <span className="text-text-secondary font-semibold shrink-0">
                {item.price != null ? fmtKES(item.price * item.qty) : "To be priced"}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-baseline pt-1">
          <span className="text-body text-text-muted">Total</span>
          <span className="text-title font-bold text-role">{fmtKES(total)}</span>
        </div>
      </Dialog>
    </AppShell>
  );
}
