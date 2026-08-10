"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Package, ImagePlus, Edit2, Eye, AlertCircle, Copy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/Toast";
import { products, ApiError, fmtKES, type ApiProduct } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const PAGE_TITLE = "My Products";

export default function SellerCatalogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [productList, setProductList] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await products.mine();
      setProductList(data);
    } catch (err) {
      console.error("Catalog load error:", err);
      setError(err instanceof ApiError ? err.message : "We could not load your products.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "available": return "success";
      case "draft": return "outline";
      case "out_of_stock": return "error";
      default: return "default";
    }
  };

  const STATUS_LABELS: Record<string, string> = {
    available: "In stock",
    draft: "Hidden",
    out_of_stock: "Sold out",
  };

  const UNCATEGORIZED = "Uncategorized";

  // Group products by category name so the page reads like a real catalog
  // instead of one long flat grid — status stays visible as a badge per
  // card rather than as a top-level filter.
  const categoryGroups = productList.reduce<Map<string, ApiProduct[]>>((groups, product) => {
    const key = product.category_name || UNCATEGORIZED;
    const existing = groups.get(key);
    if (existing) existing.push(product);
    else groups.set(key, [product]);
    return groups;
  }, new Map());

  const sortedCategoryNames = [...categoryGroups.keys()].sort((a, b) => {
    if (a === UNCATEGORIZED) return 1;
    if (b === UNCATEGORIZED) return -1;
    return a.localeCompare(b);
  });

  if (isLoading) {
    return (
      <AppShell title={PAGE_TITLE}>
        <PageSkeleton showKPIs={false} listCount={4} />
      </AppShell>
    );
  }

  const storePath = `/store/${user?.username ?? ""}`;
  const storeLink = typeof window !== "undefined" ? `${window.location.origin}${storePath}` : storePath;
  const productsWithoutPhoto = productList.filter((p) => !p.image_url).length;

  function copyStoreLink() {
    navigator.clipboard?.writeText(storeLink);
    toast("Shop link copied.", "success");
  }

  return (
    <AppShell title={PAGE_TITLE}>
      <Section spacing="md">
        <Container size="xl" className="space-y-8">
          {/* Store link banner */}
          <button
            onClick={copyStoreLink}
            className="w-full flex items-center justify-between gap-4 bg-blue-600 text-white rounded-2xl px-5 py-4 text-left hover:bg-blue-500 transition-colors cursor-pointer"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-100">Your shop link. Share it with buyers.</p>
              <p className="text-body sm:text-body-lg font-semibold truncate mt-0.5">{storeLink}</p>
            </div>
            <span className="shrink-0 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 text-sm font-bold">
              <Copy size={16} /> Copy
            </span>
          </button>

          <SectionHeading
            eyebrow="Products"
            title="What you sell"
            description={
              productList.length > 0
                ? `${productList.length} product${productList.length !== 1 ? "s" : ""}. Buyers can see them.`
                : "Add your first product. Then buyers can see it."
            }
            action={
              <Button onClick={() => router.push("/seller/dashboard/catalog/new")} variant="role" size="lg" className="gap-2 w-full sm:w-auto">
                <Plus size={18} /> Add a Product
              </Button>
            }
          />

          {productsWithoutPhoto > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
              <ImagePlus size={20} className="text-amber-600 shrink-0" />
              <p className="text-body text-amber-800">
                <strong>{productsWithoutPhoto}</strong> product{productsWithoutPhoto !== 1 ? "s" : ""} still {productsWithoutPhoto !== 1 ? "have" : "has"} no photo. Add a photo so buyers trust you more.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-4 text-caption font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Products, grouped by category */}
          {productList.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-text-muted flex flex-col items-center justify-center min-h-[300px]">
              <Package size={40} className="text-slate-300 mb-3" />
              <p className="text-body font-bold text-text-secondary">Nothing here yet</p>
              <p className="text-caption text-text-muted mt-1">Add your first product to start.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedCategoryNames.map((categoryName) => {
                const categoryProducts = categoryGroups.get(categoryName)!;
                return (
                  <div key={categoryName}>
                    <div className="flex items-baseline gap-2.5 mb-3.5">
                      <h3 className="text-lg font-black text-text-primary">{categoryName}</h3>
                      <span className="text-caption font-bold text-text-muted">
                        {categoryProducts.length} item{categoryProducts.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                      {categoryProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          storePath={storePath}
                          statusVariant={getStatusBadgeVariant(product.status)}
                          statusLabel={STATUS_LABELS[product.status] ?? product.status}
                          onOpen={() => router.push(`/seller/dashboard/catalog/new?id=${product.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </Section>
    </AppShell>
  );
}

interface ProductCardProps {
  product: ApiProduct;
  storePath: string;
  statusVariant: "success" | "outline" | "error" | "default";
  statusLabel: string;
  onOpen: () => void;
}

function ProductCard({ product, storePath, statusVariant, statusLabel, onOpen }: ProductCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="text-left bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:border-slate-200 hover:shadow-lg transition-all group cursor-pointer"
    >
      {/* Photo */}
      <div className="relative aspect-square bg-dark-secondary overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-text-muted">
            <ImagePlus size={26} className="group-hover:text-role transition-colors" />
            <span className="text-xs font-bold">Add a photo</span>
          </div>
        )}
        <span className="absolute top-2.5 left-2.5">
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </span>
      </div>

      {/* Info */}
      <div className="p-3.5 flex-1 flex flex-col gap-2">
        <h3 className="text-body font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-role transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
          <span className="text-body-lg font-black text-role">{fmtKES(product.price)}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(storePath, "_blank");
              }}
              className="p-2 bg-dark-secondary hover:bg-slate-200 border border-slate-200 text-text-secondary rounded-lg transition-colors cursor-pointer"
              title="See your shop"
              aria-label="See your shop"
            >
              <Eye size={14} />
            </button>
            <span
              className="p-2 bg-dark-secondary border border-slate-200 text-text-secondary rounded-lg"
              aria-hidden="true"
            >
              <Edit2 size={14} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
