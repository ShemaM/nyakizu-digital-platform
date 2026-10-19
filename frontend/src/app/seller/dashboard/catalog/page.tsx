"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus, Package, ImagePlus, Edit2, MoreVertical, Eye, Trash2, Copy, Link2, Share2,
  AlertCircle, AlertTriangle, CheckCircle2, Tag, SlidersHorizontal, Layers,
  MessageCircle, X,
} from "lucide-react";
import { shareLink } from "@/lib/share";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { Dialog } from "@/components/ui/Dialog";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/Toast";
import { ProductFilterDrawer } from "@/components/products/ProductFilterDrawer";
import { products, categories, ApiError, fmtKES, type ApiProduct, type ApiCategory } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { isLowStock } from "@/lib/inventory";
import { cn } from "@/lib/cn";

const PAGE_TITLE = "My Products";

export default function SellerCatalogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [productList, setProductList] = useState<ApiProduct[]>([]);
  const [categoryList, setCategoryList] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [nameQuery, setNameQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [shareProductTarget, setShareProductTarget] = useState<ApiProduct | null>(null);
  const [isJustPublished, setIsJustPublished] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [productsData, categoriesData] = await Promise.all([products.mine(), categories.list()]);
      setProductList(productsData);
      setCategoryList(categoriesData);
      const publishedId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("published") : null;
      if (publishedId) {
        const publishedProduct = productsData.find((product) => String(product.id) === publishedId);
        if (publishedProduct) {
          setShareProductTarget(publishedProduct);
          setIsJustPublished(true);
        }
      }
    } catch (err) {
      console.error("Catalog load error:", err);
      setError(err instanceof ApiError ? err.message : "We could not load your products.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────
  const categoryCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const product of productList) {
      if (product.category == null) continue;
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return counts;
  }, [productList]);

  // Quick pill row: only categories this seller actually stocks, so it
  // doesn't fill up with every platform-wide category on day one.
  const pillCategories = useMemo(
    () =>
      categoryList
        .filter((c) => (categoryCounts.get(c.id) ?? 0) > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categoryList, categoryCounts]
  );

  const lowStockCount = useMemo(() => productList.filter(isLowStock).length, [productList]);

  const filteredProducts = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return productList.filter((product) => {
      if (q && !product.name.toLowerCase().includes(q)) return false;
      if (selectedCategoryIds.size > 0 && (product.category == null || !selectedCategoryIds.has(product.category))) {
        return false;
      }
      return true;
    });
  }, [productList, nameQuery, selectedCategoryIds]);

  const activeFilterCount = selectedCategoryIds.size + (nameQuery.trim() ? 1 : 0);

  function toggleCategory(id: number) {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectOnlyCategory(id: number | null) {
    setSelectedCategoryIds(id === null ? new Set() : new Set([id]));
  }

  function clearFilters() {
    setNameQuery("");
    setSelectedCategoryIds(new Set());
  }

  async function handleCreateCategory(name: string) {
    // Reuse an existing category (case-insensitively) instead of creating a
    // near-duplicate — "cables" and "Cables" should be the same bucket.
    const existing = categoryList.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      selectOnlyCategory(existing.id);
      toast(`"${existing.name}" already exists — selected it.`, "info");
      return;
    }
    try {
      const created = await categories.create(name);
      setCategoryList((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      selectOnlyCategory(created.id);
      toast(`Category "${created.name}" added.`, "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not add that category.", "error");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await products.delete(deleteTarget.id);
      setProductList((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast(`"${deleteTarget.name}" deleted.`, "success");
      setDeleteTarget(null);
    } catch {
      toast("Could not delete that product.", "error");
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell title={PAGE_TITLE}>
        <PageSkeleton showKPIs={true} listCount={4} />
      </AppShell>
    );
  }

  const storePath = `/store/${user?.username ?? ""}`;
  const storeLink = typeof window !== "undefined" ? `${window.location.origin}${storePath}` : storePath;
  const storeName = user?.seller_profile?.store_name || user?.full_name || "My Nyakizu Store";
  const storeCaption = `🛍 Visit my Nyakizu Store\n\nBrowse quality products and order directly online.\n\n📦 Products available now.\n🔗 Shop here:\n${storeLink}\n\n#NyakizuMarketplace`;

  function copyStoreLink() {
    navigator.clipboard?.writeText(storeLink);
    toast("Shop link copied.", "success");
  }

  function shareStore() {
    shareLink({ title: storeName, text: storeCaption, url: storeLink });
  }

  return (
    <AppShell
      title={PAGE_TITLE}
      headerRight={
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          aria-label="Filter products"
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-slate-100 transition-colors"
        >
          <SlidersHorizontal size={19} />
          {activeFilterCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-role" aria-hidden="true" />
          )}
        </button>
      }
    >
      <Section spacing="md">
        <Container size="xl" className="space-y-5 pb-24">
          <StoreShareBar
            storeLink={storeLink}
            productCount={productList.filter((product) => product.status === "available").length}
            onCopyLink={copyStoreLink}
            onShare={shareStore}
          />

          {/* Quick category filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <button
              type="button"
              onClick={() => selectOnlyCategory(null)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all",
                selectedCategoryIds.size === 0
                  ? "bg-brand-gold text-slate-950 shadow-sm"
                  : "bg-white dark:bg-dark-secondary border border-slate-200 dark:border-dark-accent text-text-secondary hover:text-text-primary"
              )}
            >
              All
            </button>
            {pillCategories.map((category) => {
              const active = selectedCategoryIds.size === 1 && selectedCategoryIds.has(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectOnlyCategory(category.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all",
                    active
                      ? "bg-brand-gold text-slate-950 shadow-sm"
                      : "bg-white dark:bg-dark-secondary border border-slate-200 dark:border-dark-accent text-text-secondary hover:text-text-primary"
                  )}
                >
                  {category.name} · {categoryCounts.get(category.id) ?? 0}
                </button>
              );
            })}
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-2 divide-x divide-border border-y border-border">
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 text-text-muted">
                <Layers size={14} aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Items</span>
              </div>
              <p className="text-2xl font-black text-text-primary mt-1.5 tabular-nums">{productList.length}</p>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 text-warning">
                <AlertTriangle size={14} aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider">Low Stock</span>
              </div>
              <p className="text-2xl font-black text-text-primary mt-1.5 tabular-nums">{lowStockCount}</p>
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error rounded-xl p-4 text-caption font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Products */}
          {productList.length === 0 ? (
            <div className="bg-white dark:bg-dark-secondary border border-slate-200 dark:border-dark-accent rounded-2xl p-12 text-center text-text-muted flex flex-col items-center justify-center min-h-[300px]">
              <Package size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-body font-bold text-text-secondary">Nothing here yet</p>
              <p className="text-caption text-text-muted mt-1">Add your first product to start.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-dark-secondary border border-slate-200 dark:border-dark-accent rounded-2xl p-10 text-center text-text-muted">
              <p className="text-body font-bold text-text-secondary">No products match this filter</p>
              <button type="button" onClick={clearFilters} className="text-sm font-bold text-brand-gold mt-1.5 hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-dark-accent border-y border-slate-200 dark:border-dark-accent">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storePath={storePath}
                  onShare={() => setShareProductTarget(product)}
                  menuOpen={openMenuId === product.id}
                  onOpenMenu={() => setOpenMenuId(product.id)}
                  onCloseMenu={() => setOpenMenuId(null)}
                  onEdit={() => router.push(`/seller/dashboard/catalog/new?id=${product.id}`)}
                  onDelete={() => {
                    setOpenMenuId(null);
                    setDeleteTarget(product);
                  }}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* Floating add button */}
      <button
        type="button"
        onClick={() => router.push("/seller/dashboard/catalog/new")}
        aria-label="Add a product"
        className="fixed right-5 bottom-24 lg:bottom-8 z-30 w-14 h-14 rounded-full bg-brand-gold text-slate-950 font-black shadow-lg shadow-amber-500/30 flex items-center justify-center hover:bg-brand-gold-dark active:scale-95 transition-all"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <ProductFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        categoryList={categoryList}
        categoryCounts={categoryCounts}
        nameQuery={nameQuery}
        onNameQueryChange={setNameQuery}
        selectedCategoryIds={selectedCategoryIds}
        onToggleCategory={toggleCategory}
        onClear={clearFilters}
        onCreateCategory={handleCreateCategory}
      />

      <Dialog
        open={deleteTarget != null}
        title="Delete this product?"
        message={deleteTarget ? `"${deleteTarget.name}" will be removed from your shop. This can't be undone.` : undefined}
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        variant="destructive"
        confirmDisabled={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {shareProductTarget && (
        <ProductShareModal
          product={shareProductTarget}
          storeName={storeName}
          username={user?.username ?? ""}
          onClose={() => {
            setShareProductTarget(null);
            setIsJustPublished(false);
          }}
          onToast={(message) => toast(message, "success")}
          isJustPublished={isJustPublished}
        />
      )}
    </AppShell>
  );
}

interface ProductCardProps {
  product: ApiProduct;
  storePath: string;
  menuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}

function ProductCard({ product, storePath, menuOpen, onOpenMenu, onCloseMenu, onEdit, onShare, onDelete }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const lowStock = isLowStock(product);

  const status =
    product.status === "out_of_stock"
      ? { label: "Sold Out", classes: "bg-error text-white" }
      : product.status === "draft"
      ? { label: "Hidden", classes: "bg-slate-700 text-white" }
      : lowStock
      ? { label: "Low Stock", classes: "bg-warning text-white" }
      : { label: "In Stock", classes: "bg-success text-white" };

  return (
    <article className="flex items-start gap-4 py-4 sm:gap-5">
      {/* Photo — seller-only page, but the image itself is the same asset buyers see */}
      <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl bg-slate-100 dark:bg-dark-deepest overflow-hidden">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-text-muted">
            <ImagePlus size={26} />
            <span className="text-xs font-bold">Add a photo</span>
          </div>
        )}
        <span className={cn("absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm", status.classes)}>
          {status.label === "In Stock" && <CheckCircle2 size={12} />}
          {status.label === "Low Stock" && <AlertTriangle size={12} />}
          {status.label}
        </span>
      </div>

      {/* Info — stock quantity and edit controls are seller-only: this whole
          page lives under /seller/dashboard, which buyers can't reach, and
          the buyer-facing store page renders a separate, simpler card. */}
      <div className="min-w-0 flex-1 flex flex-col gap-2.5">
        {product.category_name && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted">
            <Tag size={12} aria-hidden="true" /> {product.category_name}
          </span>
        )}
        <h3 className="text-body font-bold text-text-primary leading-snug line-clamp-2">{product.name}</h3>

        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Current Stock</p>
            <p className="text-sm font-bold text-text-primary tabular-nums">{product.stock_quantity ?? 0} units</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Price</p>
            <p className="text-sm font-black text-brand-gold tabular-nums">{fmtKES(product.price)}</p>
          </div>
        </div>

        <div className="relative flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-tertiary dark:hover:bg-dark-accent text-slate-800 dark:text-text-primary font-bold text-sm py-2.5 transition-colors"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            type="button"
            onClick={menuOpen ? onCloseMenu : onOpenMenu}
            aria-label="More options"
            className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-tertiary dark:hover:bg-dark-accent text-slate-700 dark:text-text-secondary flex items-center justify-center transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={onCloseMenu} aria-hidden="true" />
              <div className="absolute right-0 bottom-full mb-2 z-50 w-48 rounded-xl border border-slate-200 dark:border-dark-accent bg-white dark:bg-dark-card shadow-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    onCloseMenu();
                    window.open(`${storePath}#product-${product.id}`, "_blank");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-slate-50 dark:hover:bg-dark-tertiary hover:text-text-primary transition-colors"
                >
                  <Eye size={15} /> View in shop
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCloseMenu();
                    onShare();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-slate-50 dark:hover:bg-dark-tertiary hover:text-text-primary transition-colors"
                >
                  <Share2 size={15} /> Share product
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-error hover:bg-error/5 transition-colors"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function StoreShareBar({
  storeLink,
  productCount,
  onCopyLink,
  onShare,
}: {
  storeLink: string;
  productCount: number;
  onCopyLink: () => void;
  onShare: () => void;
}) {
  return (
    <section className="border-y border-slate-200 dark:border-dark-accent py-4 sm:py-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 font-bold text-success">
              <CheckCircle2 size={13} /> {productCount} {productCount === 1 ? "product" : "products"}
            </span>
            <span>in your shop</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-text-primary mt-2">Your shop is ready to share</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">Buyers can browse your catalog and order online.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={storeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-dark-accent bg-slate-50 dark:bg-dark-tertiary px-3.5 py-2 text-xs font-bold text-text-primary hover:bg-slate-100 dark:hover:bg-dark-accent transition-colors"
          >
            <Eye size={14} /> Preview Shop
          </a>
        </div>
      </div>

      <div className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-dark-accent bg-slate-50 dark:bg-dark-deepest px-3.5 py-2.5 min-w-0">
          <Link2 size={15} className="text-brand-gold shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-text-primary truncate select-all">
            {storeLink}
          </span>
          <button
            type="button"
            onClick={onCopyLink}
            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-brand-gold hover:underline shrink-0"
          >
            <Copy size={13} /> Copy
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onShare}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition-transform active:scale-95"
          >
            <Share2 size={15} /> Share shop
          </button>
        </div>
      </div>
    </section>
  );
}

function ProductShareModal({
  product,
  storeName,
  username,
  onClose,
  onToast,
  isJustPublished = false,
}: {
  product: ApiProduct;
  storeName: string;
  username: string;
  onClose: () => void;
  onToast: (msg: string) => void;
  isJustPublished?: boolean;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.nyakizudigital.me";
  const productUrl = `${origin}/store/${username}#product-${product.id}`;

  const shareText = `📦 *${product.name}*\n💰 Price: ${fmtKES(product.price)}\n🏪 Store: ${storeName}\n\n🛒 Order or view details here:\n${productUrl}`;

  const handleCopyLink = async () => {
    await navigator.clipboard?.writeText(productUrl);
    onToast("Product link copied to clipboard!");
  };

  const handleCopyMessage = async () => {
    await navigator.clipboard?.writeText(shareText);
    onToast("Product details and link copied!");
  };

  const handleWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleDeviceShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl,
        });
        return;
      } catch {
        // user cancelled or unsupported
      }
    }
    handleWhatsApp();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-share-title"
        className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-dark-accent bg-white dark:bg-dark-secondary p-5 sm:p-6 text-text-primary shadow-2xl animate-scale-in"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            {isJustPublished && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                <CheckCircle2 size={13} /> Product Published Successfully
              </span>
            )}
            <h2 id="product-share-title" className="text-lg sm:text-xl font-bold text-text-primary">
              Share Product with Buyers
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Buyers can tap this link to view specifications and order immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="mt-4 rounded-xl border border-slate-200 dark:border-dark-accent bg-slate-50 dark:bg-dark-tertiary/60 p-3.5 flex gap-3.5 items-center">
          <div className="relative w-16 h-16 rounded-lg bg-dark-secondary overflow-hidden shrink-0 border border-slate-200 dark:border-dark-accent">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                <Package size={22} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide truncate">
              {product.category_name || storeName}
            </p>
            <p className="text-sm font-bold text-text-primary truncate">{product.name}</p>
            <p className="text-base font-black text-brand-gold mt-0.5">{fmtKES(product.price)}</p>
          </div>
        </div>

        {/* Shareable Link Bar */}
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-dark-accent bg-white dark:bg-dark-deepest px-3.5 py-2 text-xs">
          <Link2 size={14} className="text-brand-gold shrink-0" />
          <span className="flex-1 truncate font-mono text-text-secondary select-all">{productUrl}</span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-brand-gold font-bold hover:underline shrink-0 flex items-center gap-1"
          >
            <Copy size={12} /> Copy Link
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3 text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
          >
            <MessageCircle size={17} /> Share to WhatsApp
          </button>
          <button
            type="button"
            onClick={handleDeviceShare}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-slate-950 py-3 text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
          >
            <Share2 size={17} /> Share Product
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-dark-accent">
          <button
            type="button"
            onClick={handleCopyMessage}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary py-1"
          >
            <Copy size={13} /> Copy formatted text
          </button>
          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-gold hover:underline py-1"
          >
            <Eye size={13} /> Preview in store
          </a>
        </div>
      </div>
    </div>
  );
}
