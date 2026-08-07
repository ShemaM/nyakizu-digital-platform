"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { admin, type ApiOrder, fmtKES, ApiError } from "@/lib/api";
import { getStatusLabel, getStatusVariant } from "@/lib/order-status";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ShoppingBag, RefreshCw, Search } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "submitted", label: getStatusLabel("submitted") },
  { value: "sourcing", label: getStatusLabel("sourcing") },
  { value: "locked", label: getStatusLabel("locked") },
  { value: "debt_active", label: getStatusLabel("debt_active") },
  { value: "cleared", label: getStatusLabel("cleared") },
  { value: "cancelled", label: getStatusLabel("cancelled") },
];

export default function AdminOrdersPage() {
  const [orderList, setOrderList] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await admin.orderList(statusFilter || undefined);
      setOrderList(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = orderList.filter((o) => {
    const s = search.toLowerCase();
    return (
      String(o.id).includes(s) ||
      (o.buyer_username || "").toLowerCase().includes(s)
    );
  });

  const stats = {
    total: orderList.length,
    submitted: orderList.filter((o) => o.status === "submitted").length,
    sourcing: orderList.filter((o) => o.status === "sourcing").length,
    locked: orderList.filter((o) => o.status === "locked").length,
    debt: orderList.filter((o) => o.status === "debt_active").length,
    cleared: orderList.filter((o) => o.status === "cleared").length,
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Orders">
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingScreen />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Orders">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadOrders} size="sm">Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Orders">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total", value: stats.total },
            { label: getStatusLabel("submitted"), value: stats.submitted },
            { label: getStatusLabel("sourcing"), value: stats.sourcing },
            { label: getStatusLabel("locked"), value: stats.locked },
            { label: getStatusLabel("debt_active"), value: stats.debt },
            { label: getStatusLabel("cleared"), value: stats.cleared },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-text-primary">{value}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search order ID or buyer..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map(({ value, label }) => (
              <button
                key={value || "all"}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                  statusFilter === value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-text-muted hover:text-text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={loadOrders}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
        </div>

        {/* Orders */}
        <div className="space-y-3">
          {filtered.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">Order #{order.id}</span>
                      <Badge variant={getStatusVariant(order.status)} className="text-xs">
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary">
                      Buyer: {order.buyer_username || "—"} • {order.items?.length ?? 0} items
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(order.created_at).toLocaleDateString("en-KE")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-role text-lg">{fmtKES(order.total_price)}</p>
                    {order.final_total && order.final_total !== order.total_price && (
                      <p className="text-xs text-text-muted">Final: {fmtKES(order.final_total)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">No orders found.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
