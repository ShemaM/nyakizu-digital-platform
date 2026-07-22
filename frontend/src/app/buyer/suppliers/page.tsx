"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, MapPin, Store, UserPlus, CheckCircle, Clock, XCircle } from "lucide-react";
import { sellers, relationships, type ApiSeller, type ApiRelationship, ApiError } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function BuyerSuppliersPage() {
  const [supplierList, setSupplierList] = useState<ApiSeller[]>([]);
  const [myRels, setMyRels] = useState<ApiRelationship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [sellersData, relsData] = await Promise.all([
        sellers.list(),
        relationships.mine().catch(() => []),
      ]);
      setSupplierList(sellersData);
      setMyRels(relsData);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load suppliers.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRelStatus = (sellerId: number): ApiRelationship | undefined => {
    return myRels.find((r) => r.seller_id === sellerId);
  };

  const handleRequest = async (sellerId: number) => {
    try {
      setRequestingId(sellerId);
      await relationships.requestAccess(sellerId);
      // Refresh relationships
      const relsData = await relationships.mine();
      setMyRels(relsData);
    } catch (err) {
      console.error("Request failed:", err);
      alert(err instanceof ApiError ? err.message : "Request failed.");
    } finally {
      setRequestingId(null);
    }
  };

  const filtered = supplierList.filter((s) =>
    s.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.location && s.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.categories || []).some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const approvedSuppliers = filtered.filter((s) => getRelStatus(s.id)?.status === "approved");
  const otherSuppliers = filtered.filter((s) => getRelStatus(s.id)?.status !== "approved");

  if (isLoading) {
    return (
      <DashboardLayout title="Suppliers">
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingScreen />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Suppliers">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadData} size="sm">Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Suppliers">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Search */}
        <Input
          placeholder="Search suppliers or products..."
          icon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* My Suppliers */}
        {approvedSuppliers.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                My Suppliers ({approvedSuppliers.length})
              </h2>
              <Badge variant="success" className="text-xs">Approved</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedSuppliers.map((supplier) => (
                <Card key={supplier.id} className="border-success/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Store size={16} className="text-brand-gold" />
                          <span className="font-semibold text-white text-sm">{supplier.store_name}</span>
                          <CheckCircle size={14} className="text-success" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={12} /> {supplier.location || "Nairobi"}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-4" asChild>
                      <Link href={`/buyer/suppliers/${supplier.id}/storefront`}>
                        Browse Catalog
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Other Suppliers */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            All Suppliers ({otherSuppliers.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherSuppliers.map((supplier) => {
              const rel = getRelStatus(supplier.id);
              return (
                <Card key={supplier.id} className="hover:border-slate-600 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{supplier.store_name}</span>
                          {rel?.status === "pending" && <Badge variant="warning" className="text-xs"><Clock size={11} className="mr-1" /> Pending</Badge>}
                          {rel?.status === "denied" && <Badge variant="error" className="text-xs"><XCircle size={11} className="mr-1" /> Denied</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={12} /> {supplier.location || "Nairobi"}
                        </div>
                        {(supplier.categories || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(supplier.categories || []).slice(0, 3).map((cat) => (
                              <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {rel?.status === "approved" ? (
                      <Button size="sm" className="w-full mt-4" asChild>
                        <Link href={`/buyer/suppliers/${supplier.id}/storefront`}>
                          Browse Catalog
                        </Link>
                      </Button>
                    ) : rel?.status === "pending" ? (
                      <Button size="sm" variant="secondary" className="w-full mt-4" disabled>
                        <Clock size={14} className="mr-1" /> Awaiting Approval
                      </Button>
                    ) : rel?.status === "denied" ? (
                      <Button size="sm" variant="ghost" className="w-full mt-4 text-error" disabled>
                        <XCircle size={14} className="mr-1" /> Access Denied
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => handleRequest(supplier.id)}
                        loading={requestingId === supplier.id}
                      >
                        <UserPlus size={14} className="mr-1" /> Request Access
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Store className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">No suppliers found.</p>
              {searchQuery && <p className="text-xs mt-1">Try a different search term.</p>}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
