"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CloudOff, RefreshCw, CheckCircle, Store, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { ListSkeleton } from "@/components/ui/LoadingState";
import { NoDataEmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { products, orders, relationships, type ApiProduct, type ApiRelationship, ApiError, fmtKES, parsePrice } from "@/lib/api";
import { offlineDB } from "@/lib/offline-db";
import { cn } from "@/lib/cn";

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

interface LineItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
}

export function NewListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const sellerId = searchParams.get("id")
    ? parseInt(searchParams.get("id")!)
    : undefined;

  const [productList, setProductList] = useState<ApiProduct[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [sourcingNotes, setSourcingNotes] = useState("");
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done" | "failed">("idle");
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Auto-sync when coming back online
  const syncQueued = useCallback(async () => {
    if (!isOnline) return;
    const queued = await offlineDB.getQueuedOrders();
    const pending = queued.filter((q) => q.status === "pending");
    if (pending.length === 0) return;

    setSyncStatus("syncing");
    for (const order of pending) {
      try {
        await offlineDB.updateQueuedStatus(order.id, "syncing");
        await orders.create({
          items: order.items,
          buyer_notes: order.buyer_notes,
        });
        await offlineDB.updateQueuedStatus(order.id, "synced");
        await offlineDB.removeQueued(order.id);
      } catch (err) {
        console.error("Sync failed for order:", order.id, err);
        await offlineDB.updateQueuedStatus(order.id, "failed", err instanceof ApiError ? err.message : "Sync failed");
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
  };

  useEffect(() => {
    updatePendingCount();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allProducts = await products.list({ seller: sellerId });
      const availableProducts = allProducts.filter(
        (p) => p.status !== "out_of_stock" && p.status !== "draft"
      );
      setProductList(availableProducts);

      // Load draft from IndexedDB
      if (sellerId) {
        const draft = await offlineDB.getDraft(sellerId);
        if (draft) {
          if (Array.isArray(draft.items)) {
              const mappedItems: LineItem[] = draft.items.map((di: any) => {
                const prod = availableProducts.find(p => p.id === di.product_id);
                return {
                  productId: di.product_id,
                  name: prod ? prod.name : "Unknown Product",
                  price: prod ? (typeof prod.price === "string" ? parseFloat(prod.price) : prod.price) : 0,
                  qty: di.quantity || di.qty || 1
                };
              });
              setItems(mappedItems);
            }
          if (typeof draft.buyer_notes === "string") setSourcingNotes(draft.buyer_notes);
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
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter((i) => i.productId !== product.id);
        return prev.map((i) => i.productId === product.id ? { ...i, qty: newQty } : i);
      }
      if (delta > 0) return [...prev, { productId: product.id, name: product.name, price: parsePrice(product.price), qty: 1 }];
      return prev;
    });
  }

  function getQty(productId: number) {
    return items.find((i) => i.productId === productId)?.qty ?? 0;
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  async function handleConfirmSubmit() {
    try {
      setSubmitting(true);

      const orderData = {
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.qty,
        })),
        buyer_notes: sourcingNotes,
      };

      if (!isOnline) {
        // Queue for sync when back online
        await offlineDB.queueOrder({
          sellerId: sellerId!,
          items: orderData.items,
          buyer_notes: orderData.buyer_notes,
        });
        await offlineDB.deleteDraft(sellerId!);
        setConfirmOpen(false);
        setItems([]);
        setSourcingNotes("");
        await updatePendingCount();
        toast("You are offline. Your order has been saved and will be sent automatically when you reconnect.", "info");
        return;
      }

      const order = await orders.create(orderData);
      setConfirmOpen(false);
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

  function getAvailabilityBadge(product: ApiProduct): { variant: "success" | "warning" | "error"; label: string } {
    if (product.status === "available") return { variant: "success", label: "Available" };
    if (product.availability_label === "can_be_sourced") return { variant: "warning", label: "Can be sourced" };
    return { variant: "error", label: "Not available" };
  }

  // Persist drafts to IndexedDB
  useEffect(() => {
    if (!sellerId) return;
    offlineDB.saveDraft(sellerId, {
      sellerId,
      items: items as any,
      buyer_notes: sourcingNotes,
      updatedAt: Date.now(),
    }).catch(() => {});
  }, [items, sourcingNotes, sellerId]);

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

  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <AppShell title="New Order">
      <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto pb-40">
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
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5">
            <CloudOff size={14} className="text-text-muted shrink-0" />
            <p className="text-xs text-text-secondary">
              {pendingCount} order{pendingCount !== 1 ? "s" : ""} waiting to send.
            </p>
            <Button variant="ghost" size="sm" className="ml-auto text-xs h-6 px-2" onClick={syncQueued} disabled={!isOnline}>
              <RefreshCw size={12} className="mr-1" /> Send now
            </Button>
          </div>
        )}

        {/* Product list */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-label">Products</h2>
            {itemCount > 0 && (
              <span className="text-xs font-bold text-role">
                {itemCount} item{itemCount !== 1 ? "s" : ""} added
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {productList.map((product) => {
              const qty = getQty(product.id);
              const isOos = product.status === "out_of_stock";
              const availability = getAvailabilityBadge(product);
              const selected = qty > 0;

              return (
                <div
                  key={product.id}
                  className={cn(
                    "bg-white border rounded-2xl p-4 flex items-center gap-3 transition-all",
                    "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)]",
                    isOos && "opacity-60",
                    selected ? "border-role/30 ring-1 ring-role/10" : "border-slate-100"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary leading-snug">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-bold text-role">{fmtKES(product.price)}</span>
                      <Badge variant={availability.variant}>{availability.label}</Badge>
                    </div>
                  </div>
                  <QuantityStepper
                    qty={qty}
                    onDecrease={() => adjust(product, -1)}
                    onIncrease={() => !isOos && adjust(product, 1)}
                    disabled={isOos}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Special requests */}
        <section className="space-y-2">
          <h2 className="text-label px-1">
            Special requests
          </h2>
          <textarea
            value={sourcingNotes}
            onChange={(e) => setSourcingNotes(e.target.value)}
            placeholder="Hari ikintu gihariye ushaka? Andika hano... e.g. 'I need the cable in white only' or 'Can you find iPhone 15 cases for me?'"
            rows={3}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-info bg-white resize-none shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          />
        </section>
      </div>

      {/* Summary + submit — pinned above the bottom nav so it's always reachable */}
      {items.length > 0 && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] lg:bottom-0 left-0 right-0 z-30 border-t border-role/15 bg-white/95 backdrop-blur-sm shadow-[0_-8px_24px_-4px_rgba(15,23,42,0.12)]">
          <div className="max-w-2xl mx-auto p-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-text-muted">
                {itemCount} item{itemCount !== 1 ? "s" : ""} · estimated total
              </span>
              <span className="text-lg font-bold text-role">{fmtKES(total)}</span>
            </div>
            <Button
              className="w-full rounded-xl"
              size="lg"
              onClick={() => setConfirmOpen(true)}
              disabled={submitting}
            >
              {submitting ? "Sending..." : isOnline ? "Send this order" : "Save order (offline)"}
            </Button>
          </div>
        </div>
      )}

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
            <div key={item.productId} className="flex items-center justify-between gap-3 px-3 py-2 text-body">
              <span className="text-text-primary truncate">{item.qty}× {item.name}</span>
              <span className="text-text-secondary font-semibold shrink-0">{fmtKES(item.price * item.qty)}</span>
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
