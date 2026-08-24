"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ArrowRight, ShoppingBag, Wallet, Layers, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { Card, CardSection } from "@/components/ui/Card";
import { orders, products, relationships, type ApiOrder, type ApiProduct, type ApiRelationship, ApiError, fmtKES, parsePrice } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

import { SellerHeader } from "@/components/seller-dashboard/SellerHeader";
import { ShopStats } from "@/components/seller-dashboard/ShopStats";
import { PendingActivity } from "@/components/seller-dashboard/PendingActivity";
import { MetricCard } from "@/components/seller-dashboard/MetricCard";
import { QuickActions } from "@/components/seller-dashboard/QuickActions";
import { RecentOrders } from "@/components/seller-dashboard/RecentOrders";
import { SalesInsights } from "@/components/seller-dashboard/SalesInsights";
import { PendingApprovalView } from "@/components/seller-dashboard/PendingApprovalView";
import { GetStartedView } from "@/components/seller-dashboard/GetStartedView";

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
        <div className="bg-error/10 border border-error/20 rounded-2xl p-6 text-center m-4 sm:m-6">
          <p className="text-error font-medium mb-3">{error}</p>
          <button
            onClick={loadDashboardData}
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
  if (orderList.length === 0 && relationshipList.length === 0) {
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
            <SectionHeading eyebrow="Shortcuts" title="Manage your shop" />
            <QuickActions />
          </div>

          {/* Key metrics — "how's business", further down since it's context
              rather than something to act on. Always shown, at a stable
              position, so the dashboard's layout doesn't shift with data. */}
          <div>
            <SectionHeading eyebrow="Overview" title="Business overview" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard Icon={ShoppingBag} label="In Progress" value={String(ordersPending)} hint="Submitted or being packed" />
              <MetricCard Icon={Wallet} label="Money Made" value={fmtKES(totalRevenue)} hint="Collected so far, all time" tone="success" />
              <MetricCard Icon={Layers} label="Products Live" value={String(activeProducts)} hint={`${totalProducts} total, ${draftProducts} hidden`} />
            </div>
          </div>

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
