"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Printer, MapPin } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardSection } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Timeline } from "@/components/ui/Timeline";
import { CardSkeleton } from "@/components/ui/LoadingState";
import { NoDataEmptyState } from "@/components/ui/EmptyState";
import { orders, type ApiOrder, ApiError, fmtKES } from "@/lib/api";
import { getStatusLabel, orderTimelineSteps } from "@/lib/order-status";

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

  return (
    <AppShell
      title={`Order #${order.id}`}
      headerRight={
        <Link href={`/receipt/orders/${order.id}`} target="_blank">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-role hover:opacity-80 cursor-pointer">
            <Printer size={14} /> Receipt
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
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{fmtKES(displayTotal)}</p>
            </div>
            <Badge className="bg-white/15 text-white border-0">
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <Timeline steps={orderTimelineSteps(order.status, order.status_history)} />
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardContent className="p-5 sm:p-6">
            <p className="text-label mb-3">What you ordered</p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <span className="text-text-primary leading-snug">{item.product_name || `Product #${item.product_id}`}</span>
                    {item.is_sourcing && (
                      <span className="block mt-0.5 text-xs font-bold text-warning">Seller is sourcing this</span>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-text-muted">{fmtKES(item.unit_price)} × {item.quantity}</p>
                    <p className="font-semibold text-text-primary">{fmtKES(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          <CardSection>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">
                {order.final_total != null ? "Confirmed price" : "Estimated price"}
              </span>
              <span className="font-semibold text-text-primary">{fmtKES(displayTotal)}</span>
            </div>
          </CardSection>

          <div className="px-6 pb-5 sm:px-8">
            <p className="text-xs text-text-muted">
              You can&apos;t change items after sending an order. If something is wrong, talk to the seller directly.
            </p>
          </div>
        </Card>

        {/* Buyer notes */}
        {order.buyer_notes && (
          <Card>
            <CardContent className="p-5 sm:p-6 flex items-start gap-2">
              <MessageSquare size={14} className="text-text-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-label">Your notes</p>
                <p className="text-sm text-text-secondary mt-1">{order.buyer_notes}</p>
              </div>
            </CardContent>
          </Card>
        )}

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
