"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { orders, products, relationships, ApiError, parsePrice } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// Import new simple sub-components
import { SellerHeader } from "@/components/seller-dashboard/SellerHeader";
import { ShopStats } from "@/components/seller-dashboard/ShopStats";
import { QuickActions } from "@/components/seller-dashboard/QuickActions";
import { RecentOrders } from "@/components/seller-dashboard/RecentOrders";
import { ProductSummary } from "@/components/seller-dashboard/ProductSummary";
import { BuyerSummary } from "@/components/seller-dashboard/BuyerSummary";
import { MoneySummary } from "@/components/seller-dashboard/MoneySummary";

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

      // Concurrent data fetching from authentic lib modules
      const [ordersData, productsData, relationsData] = await Promise.all([
        orders.sellerList(),
        products.mine(),
        relationships.mine(),
      ]);

      setOrderList(Array.isArray(ordersData) ? ordersData : (ordersData?.results || ordersData?.orders || []));
      setProductList(Array.isArray(productsData) ? productsData : (productsData?.results || productsData?.products || []));
      setRelationshipList(Array.isArray(relationsData) ? relationsData : (relationsData?.results || relationsData?.relationships || []));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Dashboard" showLogo>
        <PageSkeleton showKPIs={true} listCount={3} />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Dashboard" showLogo>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
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
    .reduce((sum, o) => sum + parsePrice(o.total_price), 0);
    
  const paidMoney = orderList
    .filter((o) => o.status === "cleared")
    .reduce((sum, o) => sum + parsePrice(o.total_price), 0);

  const totalBuyers = relationshipList.filter((r) => r.status === "approved" || r.status === "active").length;
  const newBuyerRequests = relationshipList.filter((r) => r.status === "pending").length;

  const recentOrders = [...orderList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <AppShell title="Dashboard" showLogo>
      <div className="space-y-6">
        {/* Section 1: Shop Header */}
        <SellerHeader
          shopName={user?.seller_profile?.shop_name || user?.seller_profile?.store_name || "Nyakizu Shop"}
          sellerName={user?.full_name || user?.username || "Seller"}
          location={user?.seller_profile?.approval_note || "Nairobi"}
          status={user?.seller_profile?.approval_status || "Approved"}
        />

        {/* Section 2: Shop Summary */}
        <ShopStats
          totalProducts={totalProducts}
          newOrders={newOrders}
          moneyOwed={moneyOwed}
          totalBuyers={totalBuyers}
        />

        {/* Section 3: Quick Buttons */}
        <QuickActions />

        {/* Split Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Section 4: Recent Orders (Spans left/center columns) */}
          <div className="lg:col-span-2">
            <RecentOrders orders={recentOrders} />
          </div>

          {/* Sidebar Modules (Right Column) */}
          <div className="space-y-6">
            {/* Section 5: Product Summary */}
            <ProductSummary total={totalProducts} active={activeProducts} draft={draftProducts} />

            {/* Section 6: Buyer Section */}
            <BuyerSummary newRequests={newBuyerRequests} myBuyers={totalBuyers} />

            {/* Section 7: Money Section */}
            <MoneySummary moneyOwed={moneyOwed} paidMoney={paidMoney} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
