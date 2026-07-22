"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Minus, CloudOff, RefreshCw, CheckCircle } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { ListSkeleton } from "@/components/ui/LoadingState";
import { NoDataEmptyState } from "@/components/ui/EmptyState";
import { products, orders, type ApiProduct, ApiError, fmtKES, parsePrice } from "@/lib/api";
import { offlineDB } from "@/lib/offline-db";

interface LineItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
}

export default function NewListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      setError("No seller specified. Please select a supplier first.");
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
          if (Array.isArray(draft.items)) setItems(draft.items as LineItem[]);
          if (typeof draft.buyer_notes === "string") setSourcingNotes(draft.buyer_notes);
        }
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load products. Please try again.");
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
        alert("You are offline. Your order has been saved and will be sent automatically when you reconnect.");
        return;
      }

      const order = await orders.create(orderData);
      setConfirmOpen(false);
      await offlineDB.deleteDraft(sellerId!);
      router.push(`/buyer/orders/${order.id}`);
    } catch (err) {
      console.error("Failed to create order:", err);
      if (err instanceof ApiError) {
        alert(err.message);
      } else {
        alert("Failed to create order. Please try again.");
      }
      setSubmitting(false);
    }
  }

  function getAvailabilityBadge(product: ApiProduct) {
    if (product.status === "available") return "available";
    if (product.availability_label === "can_be_sourced") return "can_be_sourced";
    return "not_available";
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

  if (isLoading) {
    return (
      <AppShell title="New Order">
        <ListSkeleton count={5} showAvatar={false} lines={2} />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="New Order">
        <NoDataEmptyState onActionClick={loadProducts} />
      </AppShell>
    );
  }

  if (productList.length === 0) {
    return (
      <AppShell title="New Order">
        <NoDataEmptyState />
      </AppShell>
    );
  }

  return (
    <AppShell title="New Order">
      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <CloudOff size={14} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700">
            You are offline — your list is saved on this phone and will sync when back online.
          </p>
        </div>
      )}

      {/* Sync status */}
      {syncStatus === "syncing" && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
          <RefreshCw size={14} className="text-blue-500 shrink-0 animate-spin" />
          <p className="text-xs text-blue-700">Syncing queued orders...</p>
        </div>
      )}
      {syncStatus === "done" && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
          <CheckCircle size={14} className="text-green-500 shrink-0" />
          <p className="text-xs text-green-700">Orders synced successfully!</p>
        </div>
      )}

      {/* Pending orders count */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5">
          <CloudOff size={14} className="text-slate-400 shrink-0" />
          <p className="text-xs text-slate-300">
            {pendingCount} order{pendingCount !== 1 ? "s" : ""} waiting to sync.
          </p>
          <Button variant="ghost" size="sm" className="ml-auto text-xs h-6 px-2" onClick={syncQueued} disabled={!isOnline}>
            <RefreshCw size={12} className="mr-1" /> Sync now
          </Button>
        </div>
      )}

      {/* Product list */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">
          Products
        </h2>
        {productList.map((product) => {
          const qty = getQty(product.id);
          const isOos = product.status === "out_of_stock";
          const availability = getAvailabilityBadge(product);

          return (
            <div
              key={product.id}
              className={`bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 ${isOos ? "opacity-60" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-gray-900">{fmtKES(product.price)}</span>
                  <Badge variant={availability} />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {qty > 0 && (
                  <>
                    <button
                      onClick={() => adjust(product, -1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{qty}</span>
                  </>
                )}
                <button
                  onClick={() => !isOos && adjust(product, 1)}
                  disabled={isOos}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed shadow-sm"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Special requests */}
      <section className="space-y-1.5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">
          Special requests
        </h2>
        <textarea
          value={sourcingNotes}
          onChange={(e) => setSourcingNotes(e.target.value)}
          placeholder="Hari ikintu gihariye ushaka? Andika hano... e.g. 'I need the cable in white only' or 'Can you find iPhone 15 cases for me?'"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
        />
      </section>

      {/* Summary + submit */}
      {items.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 space-y-3">
          <div className="space-y-1.5">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate pr-4">{i.name} × {i.qty}</span>
                <span className="font-semibold shrink-0">{fmtKES(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-blue-200 pt-2">
            <span className="text-gray-700">Total (estimate)</span>
            <span className="text-blue-700">{fmtKES(total)}</span>
          </div>
          <p className="text-xs text-blue-600">
            Note: the final price may change after the wholesaler checks everything.
          </p>
          <Button
            className="w-full rounded-xl"
            size="lg"
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
          >
            {submitting ? "Sending..." : isOnline ? "Send this order" : "Queue order (offline)"}
          </Button>
        </div>
      )}

      <Dialog
        open={confirmOpen}
        title={isOnline ? "Send this order?" : "Queue this order?"}
        message={
          isOnline
            ? "Once you send it, you cannot change the list. The wholesaler will review it and confirm the final price."
            : "You are offline. This order will be saved to your device and sent automatically when you reconnect."
        }
        confirmLabel={submitting ? "Sending…" : isOnline ? "Yes, send it" : "Yes, save it"}
        onConfirm={() => {
          if (!submitting) void handleConfirmSubmit();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppShell>
  );
}
