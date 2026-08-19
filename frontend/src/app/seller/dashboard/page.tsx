"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ArrowRight, ShoppingBag, Wallet, Layers } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { orders, products, relationships, type ApiOrder, type ApiProduct, type ApiRelationship, ApiError, fmtKES, parsePrice } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

import { SellerHeader } from "@/components/seller-dashboard/SellerHeader";
import { ShopStats } from "@/components/seller-dashboard/ShopStats";
import { PendingActivity } from "@/components/seller-dashboard/PendingActivity";
import { MetricCard } from "@/components/seller-dashboard/MetricCard";
import { QuickActions } from "@/components/seller-dashboard/QuickActions";
import { RecentOrders } from "@/components/seller-dashboard/RecentOrders";
import { SalesInsights } from "@/components/seller-dashboard/SalesInsights";
import { ProductSummary } from "@/components/seller-dashboard/ProductSummary";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [orderList, setOrderList] = useState<ApiOrder[]>([]);
  const [productList, setProductList] = useState<ApiProduct[]>([]);
  const [relationshipList, setRelationshipList] = useState<ApiRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [ordersData, productsData, relationsData] = await Promise.all([
        orders.sellerList(),
        products.mine(),
        relationships.mine(),
      ]);

      setOrderList(ordersData);
      setProductList(productsData);
      setRelationshipList(relationsData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err instanceof ApiError ? err.message : "We could not load your dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Dashboard">
        <PageSkeleton showKPIs={true} listCount={3} />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center m-4 sm:m-6">
          <p className="text-red-700 font-medium mb-3">{error}</p>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800 cursor-pointer mx-auto bg-red-100 px-4 py-2 rounded-lg"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </AppShell>
    );
  }

  // ── Local Calculations ──────────────────────────────────────────────────
  const totalProducts = productList.length;
  const activeProducts = productList.filter((p) => p.status === "available").length;
  const draftProducts = productList.filter((p) => p.status === "draft").length;

  const newOrders = orderList.filter((o) => o.status === "submitted").length;
  const ordersPending = orderList.filter((o) => ["submitted", "sourcing"].includes(o.status)).length;

  const moneyOwed = orderList
    .filter((o) => o.status === "debt_active")
    .reduce((sum, o) => sum + parsePrice(o.balance ?? parsePrice(o.final_total ?? o.total_price) - parsePrice(o.amount_paid ?? 0)), 0);

  const totalRevenue = orderList.reduce((sum, o) => sum + parsePrice(o.amount_paid ?? 0), 0);

  const newBuyerRequests = relationshipList.filter((r) => r.status === "pending").length;

  const recentOrders = [...orderList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <AppShell title="Dashboard">
      <Section spacing="md">
        <Container size="xl" className="space-y-8 sm:space-y-10">
          {/* Greeting — plain text, no card chrome, like a native app's home screen */}
          <SellerHeader
            shopName={user?.seller_profile?.shop_name || user?.seller_profile?.store_name || "Nyakizu Shop"}
            sellerName={user?.full_name || user?.username || "Seller"}
            status={user?.seller_profile?.approval_status || "Approved"}
            location={user?.seller_profile?.location}
            phoneNumber={user?.phone_number}
          />

          {/* What needs your attention — no heading, position alone says "act on this first" */}
          <ShopStats newOrders={newOrders} newBuyerRequests={newBuyerRequests} moneyOwed={moneyOwed} />

          {/* Pending activity — every open order and buyer request, split by
              who has to act on it next: you, or the buyer. */}
          <div>
            <SectionHeading
              title="Pending activity"
              description="What's waiting on you, and what's waiting on your buyers."
            />
            <PendingActivity orders={orderList} relationships={relationshipList} />
          </div>

          {/* Shortcuts */}
          <div>
            <SectionHeading
              eyebrow="Shortcuts"
              title="Manage your shop"
              description="Quick links to what you use most."
            />
            <QuickActions />
          </div>

          {/* Key metrics — "how's business", further down since it's context
              rather than something to act on. Always shown, at a stable
              position, so the dashboard's layout doesn't shift with data. */}
          <div>
            <SectionHeading
              eyebrow="Overview"
              title="Business overview"
              description="How orders, money, and stock look right now."
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard Icon={ShoppingBag} label="Orders Pending" value={String(ordersPending)} hint="Submitted or being packed" />
              <MetricCard Icon={Wallet} label="Money Made" value={fmtKES(totalRevenue)} hint="Collected so far, all time" tone="success" />
              <MetricCard Icon={Layers} label="Products Live" value={String(activeProducts)} hint={`${totalProducts} total, ${draftProducts} hidden`} />
            </div>
          </div>

          {/* Recent orders */}
          <div>
            <SectionHeading
              title="Recent orders"
              description="Your last 5 orders, newest first — tap one to open it, or the receipt icon for its invoice."
              action={
                <Link href="/seller/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-bold text-role hover:opacity-80">
                  View all orders <ArrowRight size={14} />
                </Link>
              }
            />
            <RecentOrders orders={recentOrders} />
          </div>

          {/* Sales insights */}
          <div>
            <SectionHeading title="Sales" description="How sales look by day, and who's buying." />
            <SalesInsights orders={orderList} />
          </div>

          {/* Catalog snapshot */}
          <div>
            <SectionHeading title="Your products" description="How your product list looks right now." />
            <ProductSummary total={totalProducts} active={activeProducts} draft={draftProducts} />
          </div>
        </Container>
      </Section>
    </AppShell>
  );
}
