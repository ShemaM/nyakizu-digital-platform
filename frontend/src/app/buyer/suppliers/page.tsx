"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Search, MapPin, Store, UserPlus, Clock } from "lucide-react";
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

      setSupplierList(Array.isArray(sellersData) ? sellersData : []);
      setMyRels(relsData);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      setError(err instanceof ApiError ? err.message : "We couldn't load suppliers. Please try again.");
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
      const relsData = await relationships.mine().catch(() => []);
      setMyRels(relsData);
    } catch (err) {
      console.error("Access request failed:", err);
    } finally {
      setRequestingId(null);
    }
  };

  const filtered = supplierList.filter((s) =>
    (s.store_name || "Unnamed Store").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.location && s.location.toLowerCase().includes(searchQuery.toLowerCase()))
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

  return (
    <DashboardLayout title="Suppliers">
      <div className="space-y-6 p-4 sm:p-6">
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        <Input
          placeholder="Search suppliers..."
          icon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {approvedSuppliers.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-label">
              My Suppliers ({approvedSuppliers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedSuppliers.map((supplier) => (
                <Card key={supplier.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-role-soft flex items-center justify-center shrink-0">
                          <Store size={16} className="text-role" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary text-sm truncate">{supplier.store_name || "Wholesale Depot"}</p>
                          <p className="text-xs text-text-muted"><MapPin size={12} className="inline mr-1" /> {supplier.location || "Nairobi"}</p>
                        </div>
                      </div>
                      <Badge variant="success">Approved</Badge>
                    </div>
                    <Button variant="role" size="sm" className="w-full mt-4" asChild>
                      <Link href={`/buyer/suppliers/${supplier.id}/storefront`}>Visit Shop</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-label">
            Other Suppliers{otherSuppliers.length > 0 ? ` (${otherSuppliers.length})` : ""}
          </h2>

          {otherSuppliers.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl text-text-muted">
              <Store className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-bold text-text-secondary">No suppliers found</p>
              <p className="text-xs text-text-muted mt-1">New suppliers will show up here when they join Nyakizu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherSuppliers.map((supplier) => {
                const rel = getRelStatus(supplier.id);
                return (
                  <Card key={supplier.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Store size={16} className="text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary text-sm truncate">{supplier.store_name || "Wholesale Store"}</p>
                          <p className="text-xs text-text-muted mt-0.5"><MapPin size={12} className="inline mr-1" /> {supplier.location || "Nairobi"}</p>
                        </div>
                      </div>

                      {rel?.status === "pending" ? (
                        <Button size="sm" variant="secondary" className="w-full mt-4" disabled>
                          <Clock size={14} className="mr-1" /> Waiting for Seller
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => handleRequest(supplier.id)}
                          loading={requestingId === supplier.id}
                        >
                          <UserPlus size={14} className="mr-1" /> Join
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
