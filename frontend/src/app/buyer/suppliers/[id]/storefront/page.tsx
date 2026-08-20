"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, MapPin, ChevronRight, ChevronDown, Store, UserPlus, Clock, Phone, Mail, Plus, BadgeCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardSection } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { sellers, products, categories, relationships, type ApiSeller, type ApiProduct, type ApiCategory, type ApiRelationship, fmtKES, ApiError } from "@/lib/api";
import { CardSkeleton, ListSkeleton } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/Toast";

export default function StorefrontPage() {
  const params = useParams();
  const sellerId = params.id ? parseInt(params.id as string) : undefined;
  const { toast } = useToast();

  const [seller, setSeller] = useState<ApiSeller | null>(null);
  const [productList, setProductList] = useState<ApiProduct[]>([]);
  const [categoryList, setCategoryList] = useState<ApiCategory[]>([]);
  const [myRel, setMyRel] = useState<ApiRelationship | undefined>(undefined);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [showProducts, setShowProducts] = useState(false);
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
        sellers.get(String(sellerId)),
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
      setError(err instanceof ApiError ? err.message : "We couldn't load this store. Please try again.");
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
      toast(err instanceof ApiError ? err.message : "Request failed.", "error");
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

  // category is optional on a product (Product.category is null=True at the
  // model level, and the seller's Add Product form doesn't require picking
  // one) — without this, any product a seller listed without a category
  // would never appear in any group above and would be completely invisible
  // here, with no error or empty state hinting why. Shown as its own "Other"
  // section, never inside a specific category filter.
  const uncategorizedProducts = !activeCat ? productList.filter((p) => p.category == null) : [];

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
      <AppShell title="Store">
        <div className="space-y-4 p-4">
          <CardSkeleton showAvatar lines={2} />
          <ListSkeleton count={4} showAvatar lines={0} />
        </div>
      </AppShell>
    );
  }

  if (error || !seller) {
    return (
      <AppShell title="Store">
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

  const shopName = seller.store_name || seller.shop_name || "Store";

  return (
    <AppShell title={shopName}>
      <div className="space-y-4 p-4">
        {/* Shop identity + contact — the buyer's first stop before browsing:
            who this seller is, how to reach them, and how long they've
            traded, with ordering one tap away once approved. */}
        <Card className="overflow-hidden">
          <CardSection className="flex items-center gap-3 pb-3">
            <Avatar name={shopName} imageUrl={seller.user?.avatar_url} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-black text-text-primary truncate">{shopName}</p>
              {seller.approval_status === "approved" && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-success mt-0.5">
                  <BadgeCheck size={13} /> Verified Seller
                </span>
              )}
            </div>
          </CardSection>

          <CardSection className="border-t border-slate-100 space-y-2 pt-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin size={14} className="text-role shrink-0" />
              <span>{seller.location || "Nairobi"}</span>
            </div>

            {/* Contact details are private until the seller approves this buyer — same rule as the account page's privacy note. */}
            {isApproved && seller.user?.phone_number && (
              <a
                href={`tel:${seller.user.phone_number}`}
                className="flex items-center gap-2 text-sm font-bold text-role hover:opacity-80"
              >
                <Phone size={14} className="shrink-0" /> {seller.user.phone_number}
              </a>
            )}
            {isApproved && seller.user?.email && (
              <a
                href={`mailto:${seller.user.email}`}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
              >
                <Mail size={14} className="shrink-0" /> {seller.user.email}
              </a>
            )}

            {seller.store_description && (
              <p className="text-xs text-text-muted leading-relaxed pt-1">{seller.store_description}</p>
            )}
          </CardSection>

          <CardSection className="border-t border-slate-100 flex items-center justify-between gap-3 pt-3">
            <span className="text-xs font-semibold text-text-muted">
              Member since {formatDate(seller.created_at)}
            </span>
            {isApproved && (
              <Link href={`/buyer/lists/new?id=${seller.id}`}>
                <Button variant="role" size="sm" className="rounded-full gap-1">
                  <Plus size={14} /> New Order
                </Button>
              </Link>
            )}
          </CardSection>
        </Card>

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
                  ? "Waiting for the seller to approve you."
                  : isDenied
                  ? "This seller said no to your request."
                  : "Ask this seller to let you buy here."}
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
                <UserPlus size={14} className="mr-1" /> Join
              </Button>
            )}
            {isPending && (
              <Button size="sm" variant="secondary" className="w-full" disabled>
                <Clock size={14} className="mr-1" /> Waiting for Seller
              </Button>
            )}
          </div>
        )}

        {/* Products stay tucked away until asked for — the buyer sees the
            seller's profile first, uncluttered, and opts into browsing. */}
        {!showProducts ? (
          <button
            type="button"
            onClick={() => setShowProducts(true)}
            className="w-full flex items-center justify-between gap-3 rounded-2xl bg-role-dark px-5 py-4 text-left shadow-[0_8px_20px_-8px_rgb(var(--role)/0.5)] hover:opacity-95 active:scale-[0.99] transition-all"
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Package size={18} className="text-white" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black text-white">View Products</span>
                <span className="block text-xs text-white/75 font-semibold mt-0.5 truncate">
                  {productList.length} item{productList.length !== 1 ? "s" : ""} in this shop
                </span>
              </span>
            </span>
            <ChevronRight size={18} className="text-white shrink-0" />
          </button>
        ) : (
          <>
            {/* Category filter */}
            {availableCats.length > 0 && (
              <div className="sticky top-[53px] z-20 bg-dark-primary -mx-4 px-4 py-2 border-b border-slate-100">
                <CategoryFilter
                  categories={availableCats.map((c) => ({ id: String(c.id), name: c.name }))}
                  active={activeCat ? String(activeCat) : null}
                  onChange={(id) => setActiveCat(id ? parseInt(id) : null)}
                />
              </div>
            )}

            {/* Products */}
            {grouped.length === 0 && uncategorizedProducts.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No products available right now.</p>
              </div>
            ) : (
              <>
                {grouped.map(({ cat, products }) => (
                  <section key={cat.id} className="space-y-3">
                    <div className="flex items-center gap-2 px-1 pt-1">
                      <ChevronRight size={14} className="text-role" />
                      <span className="text-sm font-extrabold text-text-primary">{cat.name}</span>
                      <span className="text-xs font-bold text-role">({products.length})</span>
                    </div>

                    <div className="space-y-2">
                      {products.map((p) => (
                        <ProductRow key={p.id} product={p} />
                      ))}
                    </div>
                  </section>
                ))}

                {uncategorizedProducts.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 px-1 pt-1">
                      <ChevronRight size={14} className="text-role" />
                      <span className="text-sm font-extrabold text-text-primary">Other</span>
                      <span className="text-xs font-bold text-role">({uncategorizedProducts.length})</span>
                    </div>

                    <div className="space-y-2">
                      {uncategorizedProducts.map((p) => (
                        <ProductRow key={p.id} product={p} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => setShowProducts(false)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-secondary py-2"
            >
              <ChevronDown size={14} className="rotate-180" /> Hide Products
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}

function ProductRow({ product }: { product: ApiProduct }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Card>
      <div className="flex items-start gap-3 p-3">
        <div className="relative w-10 h-10 rounded-xl bg-violet-50 overflow-hidden flex items-center justify-center shrink-0">
          {product.image_url && !imageFailed ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              unoptimized
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Package size={18} className="text-violet-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-text-primary leading-snug">
            {product.name}
          </p>
          {product.description && (
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
            <span className="text-sm font-bold text-role">
              {fmtKES(product.price)}
            </span>
            <Badge
              variant={
                product.availability_label === "available"
                  ? "success"
                  : product.availability_label === "can_be_sourced"
                  ? "warning"
                  : "error"
              }
              className="text-xs"
            >
              {product.availability_label === "available"
                ? "Available"
                : product.availability_label === "can_be_sourced"
                ? "Can be sourced"
                : "Not available"}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
