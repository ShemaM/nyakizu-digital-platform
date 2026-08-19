"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Download, MapPin, Mail } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardSection } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OrderTracker } from "@/components/ui/OrderTracker";
import { CardSkeleton } from "@/components/ui/LoadingState";
import { NoDataEmptyState } from "@/components/ui/EmptyState";
import { orders, type ApiOrder, ApiError, fmtKES, parsePrice } from "@/lib/api";
import { getStatusLabel, orderTimelineSteps, hasUnpricedItems, buyerStatusExplanation } from "@/lib/order-status";
import { cn } from "@/lib/cn";
import { PaymentClaimCard } from "@/components/buyer/PaymentClaimCard";
import { DebtDateCard } from "@/components/buyer/DebtDateCard";

export default function SubmittedOrderPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNaN(orderId)) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const orderData = await orders.get(id);
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to load order:", err);
      setError(err instanceof ApiError ? err.message : "We couldn't load your order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Your Order">
        <div className="p-4 sm:p-6">
          <CardSkeleton lines={4} showAvatar={false} />
        </div>
      </AppShell>
    );
  }

  if (error || !order) {
    return (
      <AppShell title="Your Order">
        <div className="p-4 sm:p-6">
          <NoDataEmptyState onActionClick={loadOrder} />
        </div>
      </AppShell>
    );
  }

  const displayTotal = order.final_total ?? order.total_price;
  // Sourcing lines have no price yet, so total_price only ever sums the
  // known items — showing it as a plain "estimate" would silently pretend
  // those lines cost nothing. The real total only exists once the seller
  // prices everything and locks it.
  const pendingPricing = order.final_total == null && hasUnpricedItems(order.items);
  const pendingCount = order.items.filter((i) => i.unit_price == null && !i.not_found).length;
  const canPay = order.status === "locked" || order.status === "debt_active";
  const balance = parsePrice(order.balance ?? Number(displayTotal) - parsePrice(order.amount_paid ?? 0));
  const statusExplanation = buyerStatusExplanation(order.status, order.seller_store_name || "");

  return (
    <AppShell
      title={`Order #${order.id}`}
      headerRight={
        <Link href={`/receipt/orders/${order.id}`} target="_blank">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-role hover:opacity-80 cursor-pointer">
            <Download size={14} /> Receipt
          </button>
        </Link>
      }
    >
      <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto">
        {/* Tracker — the main thing a buyer opens this page to see */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[rgb(var(--role))] to-[rgb(var(--role)/0.8)] p-6 shadow-[0_12px_32px_-8px_rgb(var(--role)/0.4)]">
          <span className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
          <div className="relative flex items-start justify-between mb-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Order #{order.id}</p>
              {pendingPricing ? (
                <>
                  <p className="text-xl sm:text-2xl font-bold text-white mt-1">Price pending</p>
                  <p className="text-xs text-white/70 mt-0.5">Seller is pricing sourced items</p>
                </>
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{fmtKES(displayTotal)}</p>
              )}
            </div>
            <Badge className="bg-white/15 text-white border-0">
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="p-5 sm:p-6 pb-4">
            <OrderTracker steps={orderTimelineSteps(order.status, order.status_history)} />
          </CardContent>
          <div className="flex items-center gap-2 px-5 sm:px-6 pb-4">
            <Mail size={12} className="text-text-muted shrink-0" />
            <p className="text-[11px] text-text-muted">We&apos;ll email you the moment your order moves to the next step.</p>
          </div>
        </Card>

        {/* What's happening, in plain words, and whether the buyer needs to
            do anything right now — the thing a first-time buyer actually
            wants to know after sending an order. */}
        {statusExplanation.body && (
          <div className="rounded-2xl bg-role-soft border border-role/15 p-4 sm:p-5">
            <p className="text-sm font-bold text-role">{statusExplanation.headline}</p>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">{statusExplanation.body}</p>
          </div>
        )}

        {/* Items */}
        <Card>
          <CardContent className="p-5 sm:p-6">
            <p className="text-label mb-3">What you ordered</p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <span className={cn("text-text-primary leading-snug", item.not_found && "line-through text-text-muted")}>
                      {item.product_name || `Product #${item.product_id}`}
                    </span>
                    {item.not_found ? (
                      <span className="block mt-0.5 text-xs font-bold text-error">Not found — talk to the seller</span>
                    ) : (
                      item.is_sourcing && (
                        <span className={cn("block mt-0.5 text-xs font-bold", item.unit_price != null ? "text-success" : "text-warning")}>
                          {item.unit_price != null ? "Sourced" : "Sourcing"}
                        </span>
                      )
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {item.not_found ? (
                      <p className="text-xs font-bold text-error">Not found</p>
                    ) : item.unit_price == null ? (
                      <p className="text-xs font-bold text-warning">To be priced</p>
                    ) : (
                      <>
                        <p className="text-xs text-text-muted">{fmtKES(item.unit_price)} × {item.quantity}</p>
                        <p className="font-semibold text-text-primary">{fmtKES(item.subtotal)}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          <CardSection>
            {pendingPricing ? (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Priced items so far</span>
                  <span className="font-semibold text-text-primary">{fmtKES(displayTotal)}</span>
                </div>
                <p className="text-xs text-warning font-semibold">
                  + {pendingCount} item{pendingCount !== 1 ? "s" : ""} still {pendingCount !== 1 ? "need" : "needs"} a price from the seller
                </p>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">
                  {order.final_total != null ? "Confirmed price" : "Estimated price"}
                </span>
                <span className="font-semibold text-text-primary">{fmtKES(displayTotal)}</span>
              </div>
            )}
          </CardSection>

          <div className="px-6 pb-5 sm:px-8">
            <p className="text-xs text-text-muted">
              You can&apos;t change items after sending an order. If something is wrong, talk to the seller directly.
            </p>
          </div>
        </Card>

        {/* Pay + tell the seller */}
        {canPay && <PaymentClaimCard order={order} balance={balance} onOrderUpdated={setOrder} />}

        {/* A debt (not just an unpaid order) is when we ask about a payment date */}
        {order.status === "debt_active" && <DebtDateCard order={order} onOrderUpdated={setOrder} />}

        {/* Delivery address */}
        {order.delivery_address && (
          <Card>
            <CardContent className="p-5 sm:p-6 flex items-start gap-2">
              <MapPin size={14} className="text-text-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-label">Where to bring it</p>
                <p className="text-sm text-text-secondary mt-1">{order.delivery_address}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
