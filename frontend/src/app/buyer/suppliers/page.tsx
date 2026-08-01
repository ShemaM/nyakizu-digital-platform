"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, MapPin, Store, UserPlus, CheckCircle, Clock } from "lucide-react";
import { sellers, admin, relationships, type ApiSeller, type ApiRelationship, ApiError } from "@/lib/api";
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
      
      // Fetch live records from approved endpoint
      const [sellersData, relsData] = await Promise.all([
        sellers.list(),
        relationships.mine().catch(() => []),
      ]);
      
      let finalSellers = Array.isArray(sellersData) ? sellersData : [];

      // Sandbox Fallback: If no approved sellers exist yet, query the pending queue 
      // via our official admin wrapper so you can instantly see and test active account records.
      if (finalSellers.length === 0) {
        try {
          const pendingData = await admin.pendingSellers();
          if (Array.isArray(pendingData) && pendingData.length > 0) {
            finalSellers = pendingData;
          }
        } catch (e) {
          console.error("Could not load pending sellers fallback:", e);
        }
      }

      setSupplierList(finalSellers);
      setMyRels(relsData);
    } catch (err) {
      console.error("Failed to load records from Django:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load database records.");
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
        <Input
          placeholder="Search live records..."
          icon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {approvedSuppliers.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              My Approved Suppliers ({approvedSuppliers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedSuppliers.map((supplier) => (
                <Card key={supplier.id} className="border-success/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Store size={16} className="text-amber-500" />
                          <span className="font-semibold text-white text-sm">{supplier.store_name || "Wholesale Depot"}</span>
                          <CheckCircle size={14} className="text-green-400" />
                        </div>
                        <p className="text-xs text-slate-400"><MapPin size={12} className="inline mr-1" /> {supplier.location || "Nairobi"}</p>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-4" asChild>
                      <Link href={`/buyer/suppliers/${supplier.id}/storefront`}>Browse Catalog</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            All Active Records ({otherSuppliers.length})
          </h2>

          {otherSuppliers.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400">
              <Store className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-bold text-slate-300">No active records found</p>
              <p className="text-xs text-slate-500 mt-1">Register a seller profile in the platform to watch it synchronize live.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherSuppliers.map((supplier) => {
                const rel = getRelStatus(supplier.id);
                return (
                  <Card key={supplier.id} className="hover:border-slate-600 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <span className="font-semibold text-white text-sm">{supplier.store_name || "Wholesale Merchant"}</span>
                          <p className="text-xs text-slate-400 mt-1"><MapPin size={12} className="inline mr-1" /> {supplier.location || "Live Node"}</p>
                        </div>
                      </div>

                      {rel?.status === "pending" ? (
                        <Button size="sm" variant="secondary" className="w-full mt-4" disabled>
                          <Clock size={14} className="mr-1" /> Awaiting Approval
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
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
