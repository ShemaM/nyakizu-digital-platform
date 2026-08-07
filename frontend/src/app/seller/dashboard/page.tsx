"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { orders, products, relationships, ApiError, parsePrice } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

import { SellerHeader } from "@/components/seller-dashboard/SellerHeader";
import { ShopStats } from "@/components/seller-dashboard/ShopStats";
import { QuickActions } from "@/components/seller-dashboard/QuickActions";
import { RecentOrders } from "@/components/seller-dashboard/RecentOrders";
import { ProductSummary } from "@/components/seller-dashboard/ProductSummary";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [orderList, setOrderList] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);
  const [relationshipList, setRelationshipList] = useState<any[]>([]);
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

  const moneyOwed = orderList
    .filter((o) => o.status === "debt_active")
    .reduce((sum, o) => {
      const balance = o.balance != null
        ? parsePrice(o.balance)
        : parsePrice(o.final_total ?? o.total_price) - parsePrice(o.amount_paid ?? 0);
      return sum + balance;
    }, 0);

  const newBuyerRequests = relationshipList.filter((r) => r.status === "pending").length;

  const recentOrders = [...orderList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <AppShell title="Dashboard">
      <Section spacing="md">
        <Container size="xl" className="space-y-10">
          {/* Greeting hero */}
          <SellerHeader
            shopName={user?.seller_profile?.shop_name || user?.seller_profile?.store_name || "Nyakizu Shop"}
            sellerName={user?.full_name || user?.username || "Seller"}
            location={user?.seller_profile?.location || "Location not set"}
            status={user?.seller_profile?.approval_status || "Approved"}
            avatarUrl={user?.avatar_url}
          />

          {/* What needs your attention */}
          <div>
            <SectionHeading
              eyebrow="Overview"
              title="What needs your attention"
              description="New orders, buyer requests, and money owed — all in one place."
            />
            <ShopStats newOrders={newOrders} newBuyerRequests={newBuyerRequests} moneyOwed={moneyOwed} />
          </div>

          {/* Shortcuts */}
          <div>
            <SectionHeading
              eyebrow="Shortcuts"
              title="Manage your shop"
              description="Jump straight to the tools you use most."
            />
            <QuickActions />
          </div>

          {/* Recent orders */}
          <div>
            <SectionHeading
              title="Recent orders"
              description="Your last 5 orders, newest first."
              action={
                <Link href="/seller/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-bold text-role hover:opacity-80">
                  See all <ArrowRight size={14} />
                </Link>
              }
            />
            <RecentOrders orders={recentOrders} />
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
