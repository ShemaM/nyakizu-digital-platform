"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ArrowRight, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { Card, CardSection } from "@/components/ui/Card";
import { orders, products, relationships, type ApiOrder, type ApiProduct, type ApiRelationship, ApiError, parsePrice } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

import { SellerHeader } from "@/components/seller-dashboard/SellerHeader";
import { QuickActions } from "@/components/seller-dashboard/QuickActions";
import { RecentOrders } from "@/components/seller-dashboard/RecentOrders";
import { SalesInsights } from "@/components/seller-dashboard/SalesInsights";
import { PendingApprovalView } from "@/components/seller-dashboard/PendingApprovalView";
import { GetStartedView } from "@/components/seller-dashboard/GetStartedView";
import { SellerDashboardHeader } from "@/components/seller-dashboard/SellerDashboardHeader";
import {
  CustomerIntelligence,
  InventoryInsights,
  OrderPipeline,
  RevenueAnalytics,
  SellerMetrics,
} from "@/components/seller-dashboard/SellerAnalytics";
import { useAutoPoll } from "@/lib/useAutoPoll";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [orderList, setOrderList] = useState<ApiOrder[]>([]);
  const [productList, setProductList] = useState<ApiProduct[]>([]);
  const [relationshipList, setRelationshipList] = useState<ApiRelationship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData(false);
  }, []);

  useAutoPoll(() => loadDashboardData(true), { intervalMs: 6000 });

  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);

      const [ordersData, productsData, relationsData] = await Promise.all([
        orders.sellerList().catch(() => []),
        products.mine().catch(() => []),
        relationships.mine().catch(() => []),
      ]);

      setOrderList(Array.isArray(ordersData) ? ordersData : []);
      setProductList(Array.isArray(productsData) ? productsData : []);
      setRelationshipList(Array.isArray(relationsData) ? relationsData : []);
    } catch (err) {
      if (!silent) {
        console.error("Dashboard fetch error:", err);
        setError(err instanceof ApiError ? err.message : "We could not load your dashboard. Please try again.");
      }
    } finally {
      if (!silent) setIsLoading(false);
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
        <div className="bg-error/10 border border-error/20 rounded-2xl p-6 text-center m-4 sm:m-6">
          <p className="text-error font-medium mb-3">{error}</p>
          <button
            onClick={() => loadDashboardData(false)}
            className="flex items-center gap-1.5 text-xs font-semibold text-error hover:text-error/80 cursor-pointer mx-auto bg-error/10 px-4 py-2 rounded-lg"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </AppShell>
    );
  }

  // ── Not yet approved: nothing to report, so don't report it ─────────────
  // A shop that can't yet receive orders or buyer requests has nothing real
  // to show in "New Orders: 0" / "Buyer Requests: 0" — those read as broken,
  // not as "you haven't started." Show what's actually true instead.
  const approvalStatus = (user?.seller_profile?.approval_status || "").toLowerCase();
  if (approvalStatus && approvalStatus !== "approved") {
    return (
      <AppShell title="Dashboard">
        <Section spacing="md">
          <Container size="xl" className="space-y-8 sm:space-y-10">
            <SellerHeader
              shopName={user?.seller_profile?.shop_name || user?.seller_profile?.store_name || "Nyakizu Shop"}
              sellerName={user?.full_name || user?.username || "Seller"}
              status={approvalStatus}
              location={user?.seller_profile?.location}
              phoneNumber={user?.phone_number}
            />

            {approvalStatus === "pending" ? (
              <PendingApprovalView productCount={productList.length} username={user?.username || ""} />
            ) : (
              <Card className="border-error/20 bg-error/5">
                <CardSection className="flex flex-col items-center text-center py-8 sm:py-10">
                  <span className="flex items-center justify-center w-14 h-14 rounded-full bg-error/15 text-error mb-4">
                    <AlertTriangle size={28} />
                  </span>
                  <p className="text-lg font-black text-text-primary">
                    {approvalStatus === "rejected" ? "Your shop wasn't approved" : "We need a bit more information"}
                  </p>
                  <p className="text-sm text-text-secondary mt-1.5 max-w-sm">
                    {user?.seller_profile?.approval_note ||
                      (approvalStatus === "rejected"
                        ? "Contact support to find out what to fix and try again."
                        : "Our team needs more details before your shop can go live. Contact support for what's missing.")}
                  </p>
                  <Link
                    href="/help"
                    className="inline-flex items-center gap-1 text-sm font-bold text-role-dark hover:opacity-80 mt-4"
                  >
                    Get help <ArrowRight size={14} />
                  </Link>
                </CardSection>
              </Card>
            )}
          </Container>
        </Section>
      </AppShell>
    );
  }

  // ── Approved, but nothing has happened yet ───────────────────────────────
  // Not gated on product count: even with products listed, every number on
  // the real dashboard is still a meaningless zero until a buyer's actually
  // involved — the first order or the first buyer relationship is the real
  // signal this shop has "started," not the catalog size.
  if (orderList.length === 0 && relationshipList.length === 0 && productList.length === 0) {
    const sellerProfile = user?.seller_profile;
    const hasPaymentMethod = Boolean(
      sellerProfile?.mpesa_till_number ||
        sellerProfile?.mpesa_pochi_number ||
        sellerProfile?.mpesa_paybill_number ||
        sellerProfile?.mpesa_send_money_number
    );

    return (
      <AppShell title="Dashboard">
        <Section spacing="md">
          <Container size="xl" className="space-y-8 sm:space-y-10">
            <SellerHeader
              shopName={sellerProfile?.shop_name || sellerProfile?.store_name || "Nyakizu Shop"}
              sellerName={user?.full_name || user?.username || "Seller"}
              status={approvalStatus}
              location={sellerProfile?.location}
              phoneNumber={user?.phone_number}
            />
            <GetStartedView
              productCount={productList.length}
              hasAvatar={Boolean(user?.avatar_url)}
              hasPaymentMethod={hasPaymentMethod}
              username={user?.username || ""}
            />
          </Container>
        </Section>
      </AppShell>
    );
  }

  // ── Local Calculations ──────────────────────────────────────────────────
  const recentOrders = [...orderList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const todayRevenue = orderList
    .filter((order) => new Date(order.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, order) => sum + parsePrice(order.amount_paid ?? 0), 0);

  return (
    <AppShell title="Dashboard">
      <Section spacing="md">
        <Container size="xl" className="space-y-8 sm:space-y-10">
          <SellerDashboardHeader
            sellerName={user?.full_name || user?.username || "Seller"}
            todayRevenue={todayRevenue}
            orders={orderList}
            products={productList}
            relationships={relationshipList}
            query={searchQuery}
            onQueryChange={setSearchQuery}
          />

          <div>
            <SectionHeading eyebrow="Action center" title="Move your shop forward" />
            <QuickActions />
          </div>

          <SellerMetrics orders={orderList} products={productList} relationships={relationshipList} />

          <RevenueAnalytics orders={orderList} />

          <OrderPipeline orders={orderList} />

          <InventoryInsights
            products={productList}
            onProductUpdated={(updated) =>
              setProductList((current) => current.map((product) => (product.id === updated.id ? updated : product)))
            }
          />

          <CustomerIntelligence orders={orderList} relationships={relationshipList} />

          {/* Recent orders */}
          <div>
            <SectionHeading
              title="Recent orders"
              action={
                <Link href="/seller/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-bold text-role-dark hover:opacity-80">
                  View all orders <ArrowRight size={14} />
                </Link>
              }
            />
            <RecentOrders orders={recentOrders} />
          </div>

          {/* Sales insights */}
          <div>
            <SectionHeading title="Sales" description="Pick a day to see who bought and how much." />
            <SalesInsights orders={orderList} />
          </div>
        </Container>
      </Section>
    </AppShell>
  );
}
