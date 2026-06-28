"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Clock, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ListSkeleton } from "@/components/ui/LoadingState";
import { NoSuppliersEmptyState } from "@/components/ui/EmptyState";
import { sellers, type SellerProfile, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// Type for relationship status (this would come from API in production)
type RelationshipStatus = "pending" | "approved" | "denied" | "none";

interface SellerWithRelationship extends SellerProfile {
  relationshipStatus: RelationshipStatus;
}

export default function MySuppliersPage() {
  const { user } = useAuth();
  const [sellerList, setSellerList] = useState<SellerWithRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const allSellers = await sellers.list();
      
      // Transform sellers to include relationship status
      // In production, this would come from a dedicated relationships endpoint
      const sellersWithRelationship: SellerWithRelationship[] = allSellers.map(seller => ({
        ...seller,
        relationshipStatus: "none" as RelationshipStatus, // Default status
      }));
      
      setSellerList(sellersWithRelationship);
    } catch (err) {
      console.error("Failed to load sellers:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load suppliers. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSeller = async (sellerId: number) => {
    try {
      await sellers.requestAccess(sellerId);

      // Update local state to reflect pending status
      setSellerList((prev) =>
        prev.map((seller) =>
          seller.id === sellerId ? { ...seller, relationshipStatus: "pending" } : seller
        )
      );
    } catch (err) {
      console.error("Failed to request seller access:", err);
      if (err instanceof ApiError) {
        alert(err.message);
      } else {
        alert("Failed to request access. Please try again.");
      }
    }
  };

  // Filter sellers by relationship status
  const mySuppliers = sellerList.filter(s => s.relationshipStatus === "approved" || s.relationshipStatus === "pending" || s.relationshipStatus === "denied");
  const otherSellers = sellerList.filter(s => s.relationshipStatus === "none" && s.approval_status === "approved");

  if (isLoading) {
    return (
      <AppShell title="Suppliers" showLogo>
        <ListSkeleton count={5} showAvatar={true} lines={2} />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Suppliers" showLogo>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-medium mb-3">{error}</p>
          <Button onClick={loadSellers} size="sm" className="gap-1.5">
            <ArrowRight size={14} /> Try Again
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Suppliers" showLogo>

      {/* ── My suppliers ─────────────────────────────────────────────────── */}
      {mySuppliers.length > 0 && (
        <section className="space-y-2 animate-fade-in-up">
          <div className="flex items-center gap-2 px-0.5">
            <div className="w-1 h-4 bg-blue-600 rounded-full" />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Wholesalers you work with
            </h2>
          </div>

          {mySuppliers.map((seller) => (
            <div
              key={seller.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.07)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar name={seller.store_name} size="md" />

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{seller.store_name}</span>
                    <Badge status={seller.relationshipStatus as any} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} />
                    <span>{seller.location}</span>
                  </div>
                  {seller.relationshipStatus === "pending" && (
                    <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                      <Clock size={10} />
                      Waiting for approval
                    </p>
                  )}
                  {seller.relationshipStatus === "denied" && (
                    <p className="text-xs text-red-500 mt-1">
                      This wholesaler did not approve your request.
                    </p>
                  )}
                </div>

                {/* Action */}
                {seller.relationshipStatus === "approved" && (
                  <Link href={`/buyer/suppliers/${seller.id}/storefront`} className="shrink-0 mt-0.5">
                    <Button size="sm" className="gap-1.5">
                      Open shop
                      <ArrowRight size={12} />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Other sellers ────────────────────────────────────────────────── */}
      {otherSellers.length > 0 && (
        <section className="space-y-2 animate-fade-in-up delay-100">
          <div className="flex items-center gap-2 px-0.5 mt-1">
            <div className="w-1 h-4 bg-gray-300 rounded-full" />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Other wholesalers you can join
            </h2>
          </div>

          {otherSellers.map((seller) => (
            <div
              key={seller.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.07)]"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar name={seller.store_name} size="md" className="opacity-70" />

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-bold text-gray-900 text-sm">{seller.store_name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} />
                    <span>{seller.location}</span>
                  </div>
                  {seller.store_description && (
                    <p className="text-xs text-gray-500 line-clamp-1">{seller.store_description}</p>
                  )}
                </div>

                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="shrink-0 mt-0.5 gap-1"
                  onClick={() => handleJoinSeller(seller.id)}
                >
                  <Plus size={12} />
                  Join
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Empty state */}
      {mySuppliers.length === 0 && otherSellers.length === 0 && (
        <NoSuppliersEmptyState onActionClick={loadSellers} />
      )}
    </AppShell>
  );
}
