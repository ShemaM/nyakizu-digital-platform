"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus, Package, ImagePlus, Edit2, MoreVertical, Eye, Trash2, Copy, Link2, Share2,
  AlertCircle, AlertTriangle, CheckCircle2, Tag, SlidersHorizontal, Layers,
} from "lucide-react";
import { shareLink } from "@/lib/share";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { Card, CardSection } from "@/components/ui/Card";
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

  function copyStoreLink() {
    navigator.clipboard?.writeText(storeLink);
    toast("Shop link copied.", "success");
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

          {/* Shop link */}
          <Card className="overflow-hidden">
            <CardSection className="pb-0">
              <div className="flex items-center gap-2 text-role font-black text-xs uppercase tracking-wide">
                <Link2 size={14} /> Your Shop Link
              </div>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                Share this on WhatsApp or social media — anyone who opens it can browse and order from your shop, no app needed.
              </p>
            </CardSection>
            <CardSection className="pt-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-1.5 py-1.5">
                <span className="flex-1 min-w-0 text-sm font-semibold text-text-secondary truncate">{storeLink}</span>
                <button
                  type="button"
                  onClick={copyStoreLink}
                  className="shrink-0 flex items-center gap-1.5 bg-role-dark text-white text-xs font-bold rounded-lg px-3 py-2 hover:opacity-90 transition-opacity"
                >
                  <Copy size={13} /> Copy
                </button>
              </div>
            </CardSection>
          </Card>

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
                  storeName={user?.seller_profile?.store_name || "my shop"}
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
  onDelete: () => void;
}

function ProductCard({ product, storePath, storeLink, storeName, menuOpen, onOpenMenu, onCloseMenu, onEdit, onDelete }: ProductCardProps) {
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
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Price</p>
            <p className="text-sm font-black text-role tabular-nums">{fmtKES(product.price)}</p>
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
