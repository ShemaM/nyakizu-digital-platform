"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, ChevronRight, Store, UserPlus, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CategoryFilter } from "@/components/CategoryFilter";
import { sellers, products, categories, relationships, type ApiSeller, type ApiProduct, type ApiCategory, type ApiRelationship, fmtKES, ApiError } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function StorefrontPage() {
  const params = useParams();
  const sellerId = params.id ? parseInt(params.id as string) : undefined;

  const [seller, setSeller] = useState<ApiSeller | null>(null);
  const [productList, setProductList] = useState<ApiProduct[]>([]);
  const [categoryList, setCategoryList] = useState<ApiCategory[]>([]);
  const [myRel, setMyRel] = useState<ApiRelationship | undefined>(undefined);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (sellerId) {
      loadStorefront();
    } else {
      setError("No seller specified.");
      setIsLoading(false);
    }
  }, [sellerId]);

  const loadStorefront = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [sellerData, productsData, catsData, relsData] = await Promise.all([
        sellers.get(sellerId!),
        products.list({ seller: sellerId }),
        categories.list(),
        relationships.mine().catch(() => []),
      ]);

      setSeller(sellerData);
      setProductList(productsData.filter((p) => p.status !== "draft"));
      setCategoryList(catsData);
      setMyRel(relsData.find((r) => r.seller_id === sellerId));
    } catch (err) {
      console.error("Failed to load storefront:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load storefront.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!sellerId) return;
    try {
      setRequesting(true);
      await relationships.requestAccess(sellerId);
      const relsData = await relationships.mine();
      setMyRel(relsData.find((r) => r.seller_id === sellerId));
    } catch (err) {
      console.error("Request failed:", err);
      alert(err instanceof ApiError ? err.message : "Request failed.");
    } finally {
      setRequesting(false);
    }
  };

  // Only show categories that have products for this seller
  const availableCats = categoryList.filter((cat) =>
    productList.some((p) => p.category === cat.id)
  );

  const filteredProducts = activeCat
    ? productList.filter((p) => p.category === activeCat)
    : productList;

  // Group by category
  const grouped = availableCats
    .filter((cat) => !activeCat || cat.id === activeCat)
    .map((cat) => {
      const catProducts = filteredProducts.filter((p) => p.category === cat.id);
      if (catProducts.length === 0) return null;
      return { cat, products: catProducts };
    })
    .filter(Boolean) as { cat: ApiCategory; products: ApiProduct[] }[];

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-KE", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const isApproved = myRel?.status === "approved";
  const isPending = myRel?.status === "pending";
  const isDenied = myRel?.status === "denied";

  if (isLoading) {
    return (
      <AppShell title="Storefront">
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingScreen />
        </div>
      </AppShell>
    );
  }

  if (error || !seller) {
    return (
      <AppShell title="Storefront">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-error text-sm">{error || "Seller not found."}</p>
          <Button onClick={loadStorefront} size="sm">Retry</Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/buyer/suppliers">Back to Suppliers</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={seller.store_name}
      headerRight={
        isApproved ? (
          <Link href={`/buyer/lists/new?id=${seller.id}`}>
            <Button size="sm" className="rounded-lg">
              + New order
            </Button>
          </Link>
        ) : null
      }
    >
      <div className="space-y-4 p-4">
        {/* Store info */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl px-4 py-3 space-y-1">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin size={12} />
            <span>{seller.location || "Nairobi"}</span>
          </div>
          {seller.store_description && (
            <p className="text-xs text-slate-400">{seller.store_description}</p>
          )}
          <p className="text-xs text-slate-500">
            Member since {formatDate(seller.created_at)}
          </p>
        </div>

        {/* Access Banner */}
        {!isApproved && (
          <div className={`rounded-xl px-4 py-3 space-y-2 ${
            isPending
              ? "bg-warning/10 border border-warning/30"
              : isDenied
              ? "bg-error/10 border border-error/30"
              : "bg-info/10 border border-info/30"
          }`}>
            <div className="flex items-center gap-2">
              {isPending ? (
                <Clock size={16} className="text-warning" />
              ) : isDenied ? (
                <Store size={16} className="text-error" />
              ) : (
                <Store size={16} className="text-info" />
              )}
              <p className={`text-sm font-medium ${
                isPending ? "text-warning" : isDenied ? "text-error" : "text-info"
              }`}>
                {isPending
                  ? "Your access request is pending approval."
                  : isDenied
                  ? "Your access request was denied."
                  : "You need access to place orders from this store."}
              </p>
            </div>
            {!isPending && !isDenied && (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleRequest}
                loading={requesting}
              >
                <UserPlus size={14} className="mr-1" /> Request Access
              </Button>
            )}
            {isPending && (
              <Button size="sm" variant="secondary" className="w-full" disabled>
                <Clock size={14} className="mr-1" /> Awaiting Approval
              </Button>
            )}
          </div>
        )}

        {/* Category filter */}
        {availableCats.length > 0 && (
          <div className="sticky top-[53px] z-20 bg-dark-primary -mx-4 px-4 py-2 border-b border-slate-800/50">
            <CategoryFilter
              categories={availableCats.map((c) => ({ id: String(c.id), name: c.name }))}
              active={activeCat ? String(activeCat) : null}
              onChange={(id) => setActiveCat(id ? parseInt(id) : null)}
            />
          </div>
        )}

        {/* Products */}
        {grouped.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-sm">No products available right now.</p>
          </div>
        ) : (
          grouped.map(({ cat, products }) => (
            <section key={cat.id} className="space-y-3">
              <div className="flex items-center gap-2 px-1 pt-1">
                <ChevronRight size={14} className="text-brand-gold" />
                <span className="text-sm font-extrabold text-white">{cat.name}</span>
                <span className="text-xs text-slate-500">({products.length})</span>
              </div>

              <div className="space-y-2">
                {products.map((p) => (
                  <Card key={p.id}>
                    <div className="flex items-start gap-3 p-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                        <Package size={18} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white leading-snug">
                          {p.name}
                        </p>
                        {p.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {p.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                          <span className="text-sm font-bold text-brand-gold">
                            {fmtKES(p.price)}
                          </span>
                          <Badge
                            variant={
                              p.availability_label === "available"
                                ? "success"
                                : p.availability_label === "can_be_sourced"
                                ? "warning"
                                : "error"
                            }
                            className="text-xs"
                          >
                            {p.availability_label === "available"
                              ? "Available"
                              : p.availability_label === "can_be_sourced"
                              ? "Can be sourced"
                              : "Not available"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </AppShell>
  );
}
