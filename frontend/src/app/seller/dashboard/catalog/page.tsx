"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus, Package, ImagePlus, Edit2, MoreVertical, Eye, Trash2, Copy, Link2, Share2,
  AlertCircle, AlertTriangle, CheckCircle2, Tag, SlidersHorizontal, Layers,
  MessageCircle, Download, X, Sparkles,
} from "lucide-react";
import { shareLink } from "@/lib/share";
import QRCode from "qrcode";
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
  const [savingPriceId, setSavingPriceId] = useState<number | null>(null);
  const [promotionTarget, setPromotionTarget] = useState<ApiProduct | "store" | null>(null);
  const [promotionSuccess, setPromotionSuccess] = useState(false);

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
              setPromotionTarget(publishedProduct);
              setPromotionSuccess(true);
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

  async function handlePriceUpdate(product: ApiProduct, price: number) {
    setSavingPriceId(product.id);
    try {
      const updated = await products.update(product.id, { price });
      setProductList((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      toast(`Price for "${product.name}" updated.`, "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not update that price.", "error");
      throw err;
    } finally {
      setSavingPriceId(null);
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
          {/* Page intro — makes explicit that the grid below isn't just an
              internal list, it's what buyers actually see when they open
              this shop. */}
          <p className="text-sm text-text-muted -mb-1">
            This is your catalog — the photos, names, and prices below are exactly what buyers see when they open your shop.
          </p>

          <PromotionCenter
            storeName={storeName}
            storeLink={storeLink}
            caption={storeCaption}
            productCount={productList.length}
            onCopyLink={copyStoreLink}
            onShare={shareStore}
            onOpenPoster={() => setPromotionTarget("store")}
            onToast={(message) => toast(message, "success")}
          />

          {/* Quick category filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <button
              type="button"
              onClick={() => selectOnlyCategory(null)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors",
                selectedCategoryIds.size === 0 ? "bg-role-dark text-white shadow-sm" : "bg-white border border-slate-200 text-text-secondary"
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
                    "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors",
                    active ? "bg-role-dark text-white shadow-sm" : "bg-white border border-slate-200 text-text-secondary"
                  )}
                >
                  {category.name} · {categoryCounts.get(category.id) ?? 0}
                </button>
              );
            })}
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
              <div className="flex items-center gap-1.5 text-text-muted">
                <Layers size={14} aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Items</span>
              </div>
              <p className="text-2xl font-black text-text-primary mt-1.5 tabular-nums">{productList.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
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
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-text-muted flex flex-col items-center justify-center min-h-[300px]">
              <Package size={40} className="text-slate-300 mb-3" />
              <p className="text-body font-bold text-text-secondary">Nothing here yet</p>
              <p className="text-caption text-text-muted mt-1">Add your first product to start.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center text-text-muted">
              <p className="text-body font-bold text-text-secondary">No products match this filter</p>
              <button type="button" onClick={clearFilters} className="text-sm font-bold text-role mt-1.5 hover:opacity-80">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storePath={storePath}
                  storeLink={storeLink}
                  storeName={storeName}
                  onShare={() => {
                    setPromotionSuccess(false);
                    setPromotionTarget(product);
                  }}
                  menuOpen={openMenuId === product.id}
                  onOpenMenu={() => setOpenMenuId(product.id)}
                  onCloseMenu={() => setOpenMenuId(null)}
                  onEdit={() => router.push(`/seller/dashboard/catalog/new?id=${product.id}`)}
                  savingPrice={savingPriceId === product.id}
                  onSavePrice={(price) => handlePriceUpdate(product, price)}
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
        className="fixed right-5 bottom-24 lg:bottom-8 z-30 w-14 h-14 rounded-full bg-role-dark text-white shadow-[0_12px_24px_-6px_rgb(var(--role)/0.5)] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <Plus size={26} strokeWidth={2.5} />
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
      {promotionTarget && (
        <PromotionDialog
          target={promotionTarget}
          storeName={storeName}
          storeLink={storeLink}
          username={user?.username ?? ""}
          onClose={() => {
            setPromotionTarget(null);
            setPromotionSuccess(false);
          }}
          onToast={(message) => toast(message, "success")}
          success={promotionSuccess}
        />
      )}
    </AppShell>
  );
}

interface ProductCardProps {
  product: ApiProduct;
  storePath: string;
  storeLink: string;
  storeName: string;
  menuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onEdit: () => void;
  onShare: () => void;
  savingPrice: boolean;
  onSavePrice: (price: number) => Promise<void>;
  onDelete: () => void;
}

function ProductCard({ product, storePath, storeLink, storeName, menuOpen, onOpenMenu, onCloseMenu, onEdit, onShare, savingPrice, onSavePrice, onDelete }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(String(product.price));
  const [priceError, setPriceError] = useState<string | null>(null);
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
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden flex flex-col">
      {/* Photo — seller-only page, but the image itself is the same asset buyers see */}
      <button type="button" onClick={onEdit} className="relative aspect-[4/3] bg-dark-secondary overflow-hidden text-left">
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
      </button>

      {/* Info — stock quantity and edit controls are seller-only: this whole
          page lives under /seller/dashboard, which buyers can't reach, and
          the buyer-facing store page renders a separate, simpler card. */}
      <div className="p-3.5 flex-1 flex flex-col gap-2.5">
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
            {editingPrice ? (
              <form
                className="flex items-end gap-1.5"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const nextPrice = Number(priceInput);
                  if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
                    setPriceError("Enter a price above 0.");
                    return;
                  }
                  setPriceError(null);
                  try {
                    await onSavePrice(nextPrice);
                    setEditingPrice(false);
                  } catch {
                    // The parent toast contains the API error; keep the editor open.
                  }
                }}
              >
                <label htmlFor={`price-${product.id}`} className="sr-only">Price in KES</label>
                <input
                  id={`price-${product.id}`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={priceInput}
                  onChange={(event) => {
                    setPriceInput(event.target.value);
                    setPriceError(null);
                  }}
                  disabled={savingPrice}
                  className="w-24 h-9 rounded-lg border border-role/40 px-2 text-right text-sm font-bold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-role"
                />
                <button type="submit" disabled={savingPrice} className="h-9 rounded-lg bg-role-dark px-2.5 text-xs font-bold text-white disabled:opacity-50">
                  {savingPrice ? "Saving…" : "Save"}
                </button>
              </form>
            ) : (
              <>
                <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Price</p>
                <button
                  type="button"
                  onClick={() => {
                    setPriceInput(String(product.price));
                    setPriceError(null);
                    setEditingPrice(true);
                  }}
                  className="text-sm font-black text-role tabular-nums hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-role rounded"
                  aria-label={`Edit price for ${product.name}`}
                >
                  {fmtKES(product.price)}
                </button>
              </>
            )}
            {priceError && <p className="text-[10px] font-semibold text-error mt-1">{priceError}</p>}
          </div>
        </div>

        <div className="relative flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-role-soft text-role-dark font-bold text-sm py-2.5 hover:opacity-80 transition-opacity"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            type="button"
            onClick={onShare}
            aria-label={`Share ${product.name}`}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-role-dark text-white font-bold text-sm py-2.5 hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Share2 size={14} /> Share
          </button>
          <button
            type="button"
            onClick={menuOpen ? onCloseMenu : onOpenMenu}
            aria-label="More options"
            className="shrink-0 w-10 h-10 rounded-xl bg-role-soft text-role-dark flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={onCloseMenu} aria-hidden="true" />
              <div className="absolute right-0 bottom-full mb-2 z-50 w-44 rounded-xl border border-slate-100 bg-white shadow-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    onCloseMenu();
                    window.open(storePath, "_blank");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-slate-50 hover:text-text-primary transition-colors"
                >
                  <Eye size={15} /> View in my shop
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCloseMenu();
                    shareLink({
                      title: product.name,
                      text: `${product.name} — ${fmtKES(product.price)} at ${storeName}. Check it out:`,
                      url: storeLink,
                    });
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-slate-50 hover:text-text-primary transition-colors"
                >
                  <Share2 size={15} /> Share to social media
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
    </div>
  );
}

function PromotionCenter({
  storeName, storeLink, caption, productCount, onCopyLink, onShare, onOpenPoster, onToast,
}: {
  storeName: string; storeLink: string; caption: string; productCount: number;
  onCopyLink: () => void; onShare: () => void; onOpenPoster: () => void; onToast: (message: string) => void;
}) {
  const copyCaption = async () => {
    await navigator.clipboard?.writeText(caption);
    onToast("Store caption copied.");
  };
  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeLink)}`, "_blank", "noopener,noreferrer");
  };
  return (
    <section className="overflow-hidden rounded-2xl border border-role/20 bg-gradient-to-br from-role-soft via-card to-card shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-role-dark"><Sparkles size={15} /> Promote your store</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">Turn {storeName} into sales.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Share your catalog where your customers already are. Buyers can preview your store and order without downloading an app.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card/80 p-4 sm:min-w-56">
            <div><p className="text-2xl font-black tabular-nums text-foreground">{productCount}</p><p className="text-xs font-bold text-muted-foreground">Products live</p></div>
            <div><p className="text-2xl font-black tabular-nums text-warning">{productCount === 0 ? 0 : "✓"}</p><p className="text-xs font-bold text-muted-foreground">Ready to share</p></div>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-border bg-background/80 p-2">
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5"><Link2 size={16} className="shrink-0 text-role" /><span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{storeLink}</span><button type="button" onClick={onCopyLink} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-role-dark px-3 text-xs font-black text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"><Copy size={14} /> Copy link</button></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button type="button" onClick={onShare} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#168c4a] px-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"><MessageCircle size={17} /> WhatsApp</button>
          <button type="button" onClick={onCopyLink} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-black text-foreground transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"><Copy size={17} /> Copy link</button>
          <button type="button" onClick={shareFacebook} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-black text-foreground transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"><span className="flex h-5 w-5 items-center justify-center rounded bg-[#1877f2] text-xs font-black text-white">f</span> Facebook</button>
          <button type="button" onClick={onOpenPoster} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-black text-foreground transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"><Download size={17} /> Poster</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" onClick={copyCaption} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-role-dark hover:underline focus-visible:ring-2 focus-visible:ring-ring"><Copy size={14} /> Copy marketing caption</button><span className="text-xs text-muted-foreground">WhatsApp-first, ready to paste anywhere</span></div>
      </div>
    </section>
  );
}

function PromotionDialog({
  target, storeName, storeLink, username, onClose, onToast, success = false,
}: {
  target: ApiProduct | "store"; storeName: string; storeLink: string; username: string;
  onClose: () => void; onToast: (message: string) => void; success?: boolean;
}) {
  const [format, setFormat] = useState<"story" | "square">("story");
  const [qrSrc, setQrSrc] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [sharingPoster, setSharingPoster] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const product = target === "store" ? null : target;
  const url = product ? `${window.location.origin}/store/${username}#product-${product.id}` : storeLink;
  const caption = product
    ? `✨ ${product.name}\n\n💰 ${fmtKES(product.price)}\n📦 Available Now\n\n🛒 Order here:\n${url}\n\n#NyakizuMarketplace`
    : `🛍 Visit my Nyakizu Store\n\nBrowse quality products and order directly online.\n\n📦 Products available now.\n🔗 Shop here:\n${url}\n\n#NyakizuMarketplace`;

  useEffect(() => {
    QRCode.toDataURL(url, { width: 240, margin: 1, color: { dark: "#111827", light: "#ffffff" } }).then(setQrSrc).catch(() => setQrSrc(""));
  }, [url]);

  const copy = async (text: string, message: string) => {
    await navigator.clipboard?.writeText(text);
    onToast(message);
  };
  const facebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  const shareToWhatsAppStatus = async () => {
    if (!posterRef.current) return;
    setSharingPoster(true);
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const canvas = await html2canvas(posterRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Poster image could not be created.");

      const file = new File([blob], `${product ? "product" : "store"}-status.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: product?.name || storeName, text: caption });
        onToast("Poster ready to share. Choose WhatsApp, then My status.");
        return;
      }

      // WhatsApp's web intent cannot attach an image. Keep the fallback useful:
      // save the poster locally and open a pre-filled caption/link.
      const download = document.createElement("a");
      download.download = file.name;
      download.href = URL.createObjectURL(blob);
      download.click();
      URL.revokeObjectURL(download.href);
      window.location.href = `https://wa.me/?text=${encodeURIComponent(`${caption}`)}`;
      onToast("Poster downloaded. Attach it in WhatsApp Status.");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      onToast("Could not prepare the WhatsApp Status poster. Try Download poster instead.");
    } finally {
      setSharingPoster(false);
    }
  };
  const downloadPoster = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const canvas = await html2canvas(posterRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const link = document.createElement("a");
      link.download = `${product ? "product" : "store"}-poster.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      onToast("Poster downloaded.");
    } catch {
      onToast("Could not create the poster. Please try again.");
    } finally {
      setDownloading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="promotion-title" className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4"><div>{success && <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-success"><CheckCircle2 size={14} /> Product published successfully</p>}<p className="text-xs font-black uppercase tracking-widest text-role">Promotion center</p><h2 id="promotion-title" className="mt-1 text-xl font-black text-foreground">{success ? "Get your first customer now." : product ? "Share product" : "Promote your store"}</h2><p className="mt-1 text-sm text-muted-foreground">Ready-made assets for WhatsApp, Facebook, Instagram Stories, and print.</p></div><button type="button" onClick={onClose} aria-label="Close promotion center" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><X size={19} /></button></div>
        <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2"><button type="button" onClick={shareToWhatsAppStatus} disabled={sharingPoster || !qrSrc} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#168c4a] px-3 text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"><MessageCircle size={17} /> {sharingPoster ? "Preparing..." : "WhatsApp Status"}</button><button type="button" onClick={facebook} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-black text-foreground focus-visible:ring-2 focus-visible:ring-ring"><span className="flex h-5 w-5 items-center justify-center rounded bg-[#1877f2] text-xs font-black text-white">f</span> Facebook</button></div>
            <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => copy(caption, product ? "Product caption copied." : "Store caption copied.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-bold text-foreground focus-visible:ring-2 focus-visible:ring-ring"><Copy size={16} /> Copy caption</button><button type="button" onClick={() => copy(url, product ? "Product link copied." : "Store link copied.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-bold text-foreground focus-visible:ring-2 focus-visible:ring-ring"><Link2 size={16} /> Copy link</button></div>
            <div className="rounded-xl border border-border bg-background p-4"><p className="mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground">Generated caption</p><p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{caption}</p></div>
            <div className="flex items-center gap-2"><p className="text-xs font-bold text-muted-foreground">Poster format</p><button type="button" onClick={() => setFormat("story")} className={cn("min-h-10 rounded-lg border px-3 text-xs font-bold", format === "story" ? "border-role bg-role-soft text-role-dark" : "border-border text-muted-foreground")}>Story</button><button type="button" onClick={() => setFormat("square")} className={cn("min-h-10 rounded-lg border px-3 text-xs font-bold", format === "square" ? "border-role bg-role-soft text-role-dark" : "border-border text-muted-foreground")}>Square</button></div>
            <button type="button" onClick={downloadPoster} disabled={downloading || !qrSrc} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-role-dark px-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-ring"><Download size={17} /> {downloading ? "Creating poster..." : "Download poster"}</button>
            {success && product && <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><Eye size={16} /> View product</a>}
          </div>
          <div ref={posterRef} className={cn("relative mx-auto flex w-full max-w-[15rem] flex-col items-center justify-between overflow-hidden rounded-xl bg-white p-5 text-center text-slate-950 shadow-lg", format === "story" ? "aspect-[9/16]" : "aspect-square")}><div className="absolute inset-0 bg-gradient-to-b from-[#fff8dd] via-white to-[#f3ead0]" /><div className="relative z-10 flex h-full w-full flex-col items-center justify-between"><div><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">N</div><p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#a86e00]">Nyakizu Marketplace</p></div>{product?.image_url ? <img src={product.image_url} alt="" crossOrigin="anonymous" className="h-28 w-full rounded-lg object-cover" /> : <div className="flex h-28 w-full items-center justify-center rounded-lg bg-slate-950 text-4xl font-black text-white">{storeName.charAt(0).toUpperCase()}</div>}<div><p className="text-lg font-black leading-tight">{product ? product.name : storeName}</p>{product ? <p className="mt-2 text-xl font-black text-[#a86e00]">{fmtKES(product.price)}</p> : <p className="mt-2 text-xs font-bold text-slate-600">Shop {productCountLabel(target)} products online</p>}</div>{qrSrc && <img src={qrSrc} alt="QR code" className="h-24 w-24 rounded bg-white p-1" />}<div><p className="text-[10px] font-black uppercase tracking-wider text-slate-700">Scan to order</p><p className="mt-1 max-w-full truncate text-[9px] text-slate-500">{url.replace(/^https?:\/\//, "")}</p></div></div></div>
        </div>
      </div>
    </div>
  );
}

function productCountLabel(target: ApiProduct | "store") {
  return target === "store" ? "your" : "this";
}
