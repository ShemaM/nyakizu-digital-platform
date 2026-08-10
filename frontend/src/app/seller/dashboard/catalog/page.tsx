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
  const [filterStatus, setFilterStatus] = useState<string>("all");

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

  const filteredProducts = productList.filter((product) => {
    if (filterStatus === "all") return true;
    return product.status === filterStatus;
  });

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
    draft: "Hidden draft",
    out_of_stock: "Sold out",
  };

  const FILTERS: { value: string; label: string }[] = [
    { value: "all", label: "All" },
    { value: "available", label: "In stock" },
    { value: "draft", label: "Hidden draft" },
    { value: "out_of_stock", label: "Sold out" },
  ];

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
              <p className="text-xs font-bold uppercase tracking-wide text-blue-100">Your shop link — share it with buyers</p>
              <p className="text-body sm:text-body-lg font-semibold truncate mt-0.5">{storeLink}</p>
            </div>
            <span className="shrink-0 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 text-sm font-bold">
              <Copy size={16} /> Copy
            </span>
          </button>

          <SectionHeading
            eyebrow="Products"
            title="What you're selling"
            description={
              productList.length > 0
                ? `${productList.length} product${productList.length !== 1 ? "s" : ""} listed for buyers to see.`
                : "Add your first product so buyers can see what you sell."
            }
            action={
              <Button onClick={() => router.push("/seller/dashboard/catalog/new")} variant="role" size="lg" className="gap-2">
                <Plus size={18} /> Add a Product
              </Button>
            }
          />

          {productsWithoutPhoto > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
              <ImagePlus size={20} className="text-amber-600 shrink-0" />
              <p className="text-body text-amber-800">
                <strong>{productsWithoutPhoto}</strong> product{productsWithoutPhoto !== 1 ? "s" : ""} still {productsWithoutPhoto !== 1 ? "have" : "has"} no photo. Buyers trust items with a real photo more — tap a product below to add one.
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterStatus(value)}
                aria-pressed={filterStatus === value}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all shrink-0 ${
                  filterStatus === value
                    ? "bg-slate-900 text-white border-slate-900 shadow"
                    : "bg-white text-text-muted border-slate-200 hover:text-text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-4 text-caption font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-text-muted flex flex-col items-center justify-center min-h-[300px]">
              <Package size={40} className="text-slate-300 mb-3" />
              <p className="text-body font-bold text-text-secondary">Nothing here yet</p>
              <p className="text-caption text-text-muted mt-1">Try a different tab above, or add a new product.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/seller/dashboard/catalog/new?id=${product.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/seller/dashboard/catalog/new?id=${product.id}`);
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
                      <Badge variant={getStatusBadgeVariant(product.status)}>
                        {STATUS_LABELS[product.status] ?? product.status}
                      </Badge>
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-3.5 flex-1 flex flex-col gap-2">
                    <h3 className="text-body font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-role transition-colors">
                      {product.name}
                    </h3>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                      <span className="text-body-lg font-black text-role">
                        {fmtKES(product.price)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(storePath, "_blank");
                          }}
                          className="p-2 bg-dark-secondary hover:bg-slate-200 border border-slate-200 text-text-secondary rounded-lg transition-colors cursor-pointer"
                          title="See how buyers see your shop"
                          aria-label="See how buyers see your shop"
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
              ))}
            </div>
          )}
        </Container>
      </Section>
    </AppShell>
  );
}
