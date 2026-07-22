"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Lock, MessageSquare, Printer, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardSection } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/LoadingState";
import { NoDataEmptyState } from "@/components/ui/EmptyState";
import { orders, type ApiOrder, ApiError, fmtKES, parsePrice } from "@/lib/api";

function getStatusVariant(status: string): "default" | "success" | "warning" | "error" | "info" | "outline" {
  const map: Record<string, "default" | "success" | "warning" | "error" | "info" | "outline"> = {
    submitted:   "warning",
    sourcing:    "info",
    locked:      "default",
    debt_active: "error",
    cleared:     "success",
    cancelled:   "error",
    pending:     "warning",
    draft:       "outline",
  };
  return map[status] || "default";
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    submitted:   "New",
    sourcing:    "Sourcing",
    locked:      "Locked",
    debt_active: "Debt",
    cleared:     "Cleared",
    cancelled:   "Cancelled",
    pending:     "Pending",
    draft:       "Draft",
  };
  return map[status] || status;
}

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
      const orderData = await orders.get(orderId);
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to load order:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("en-KE", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const calculateBalance = () => {
    if (!order) return 0;
    return parsePrice(order.total_price);
  };

  const balance = calculateBalance();

  if (isLoading) {
    return (
      <AppShell title="Order Details">
        <CardSkeleton lines={4} showAvatar={false} />
      </AppShell>
    );
  }

  if (error || !order) {
    return (
      <AppShell title="Order Details">
        <NoDataEmptyState onActionClick={loadOrder} />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Order — ${order.buyer_username || "#" + order.id}`}
      headerRight={
        <Link href={`/receipt/${order.id}`} target="_blank">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white cursor-pointer">
            <Printer size={14} /> Receipt
          </button>
        </Link>
      }
    >
      {/* Locked notice */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
        <Lock size={13} className="text-gray-400 shrink-0" />
        <p className="text-xs text-gray-500">
          This order has been submitted and cannot be changed.
        </p>
      </div>

      {/* Order summary */}
      <Card>
        <div className="flex items-start justify-between">
          <Badge variant={getStatusVariant(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
          <Link href={`/receipt/${order.id}`} target="_blank"
            className="text-xs text-blue-500 hover:underline flex items-center gap-1">
            <Printer size={11} /> Print receipt
          </Link>
        </div>

        {/* Timeline */}
        <CardSection>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Timeline</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-gray-400">
                <Clock size={11} /> Order created
              </span>
              <span className="text-gray-700 font-medium">{formatDateTime(order.created_at)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-gray-400">
                <Clock size={11} /> Last updated
              </span>
              <span className="text-gray-700 font-medium">{formatDateTime(order.updated_at)}</span>
            </div>
          </div>
        </CardSection>

        {/* Items */}
        <CardSection>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Items</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start gap-3 text-sm">
                <div className="min-w-0 flex-1">
                  <span className="text-gray-800 leading-snug">{item.product_name || `Product #${item.product_id}`}</span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-gray-400">{fmtKES(item.unit_price)} × {item.quantity}</p>
                  <p className="font-semibold text-gray-900">{fmtKES(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardSection>

        {/* Totals */}
        <CardSection>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order total</span>
            <span className="font-semibold">{fmtKES(order.total_price)}</span>
          </div>
        </CardSection>
      </Card>

      {/* Buyer notes */}
      {order.buyer_notes && (
        <Card>
          <div className="flex items-start gap-2">
            <MessageSquare size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Your notes</p>
              <p className="text-sm text-gray-700 mt-1">{order.buyer_notes}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Delivery address */}
      {order.delivery_address && (
        <Card>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Delivery Address</p>
          <p className="text-sm text-gray-700">{order.delivery_address}</p>
        </Card>
      )}
    </AppShell>
  );
}
