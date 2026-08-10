"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList, AlertCircle, RefreshCw, Clock, MapPin } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { orders, fmtKES, type ApiOrder } from "@/lib/api";
import { getStatusLabel, getStatusVariant } from "@/lib/order-status";

export default function SellerOrdersPage() {
  const [orderList, setOrderList] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orders.sellerList();
      setOrderList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Orders load error:", err);
      setError(err?.message || "We could not load your orders.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Orders">
        <PageSkeleton showKPIs={false} listCount={4} />
      </AppShell>
    );
  }

  const newCount = orderList.filter((o) => o.status === "submitted").length;

  return (
    <AppShell title="Orders">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          <SectionHeading
            eyebrow="Orders"
            title="Orders from your buyers"
            description={
              newCount > 0
                ? `${newCount} new order${newCount !== 1 ? "s" : ""} waiting for you to start packing.`
                : "See and manage every order your buyers have sent you."
            }
            action={
              <Button variant="outline" size="lg" onClick={loadOrders} className="gap-2">
                <RefreshCw size={16} /> Refresh
              </Button>
            }
          />

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-4 text-caption font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Orders Stack */}
          {orderList.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-text-muted flex flex-col items-center justify-center min-h-[300px]">
              <ClipboardList size={40} className="text-slate-300 mb-3" />
              <p className="text-body font-bold text-text-secondary">No orders yet</p>
              <p className="text-caption text-text-muted mt-1">When buyers order from you, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {orderList.map((order) => (
                <Link
                  key={order.id}
                  href={`/seller/dashboard/orders/${order.id}/fulfill`}
                  className="block bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:border-role/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <Avatar name={order.buyer_username || "?"} size="lg" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-body font-black text-text-primary truncate">{order.buyer_username || "Unknown buyer"}</span>
                        <Badge variant={getStatusVariant(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-text-muted">
                        <MapPin size={12} className="text-role shrink-0" />
                        <span className="truncate">{order.delivery_address || "No location provided"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3">
                    <span className="text-caption font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                      <Clock size={12} /> {order.created_at ? new Date(order.created_at).toLocaleDateString("en-KE") : "Recent"}
                    </span>
                    <span className="text-body-lg font-black text-role">{fmtKES(order.final_total ?? order.total_price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </AppShell>
  );
}
