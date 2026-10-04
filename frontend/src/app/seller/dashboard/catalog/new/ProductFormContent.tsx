"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle, ArrowLeft, Camera, Check, ImagePlus, Link2, Pencil,
  Search, Star, Trash2, Upload,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { categories, products, type ApiCategory } from "@/lib/api";
import { cn } from "@/lib/cn";

const VISIBILITY_OPTIONS = [
  { value: "available", title: "Publish now", helper: "Buyers can see and order this product." },
  { value: "draft", title: "Save as draft", helper: "Only you can see it until you are ready." },
  { value: "out_of_stock", title: "Out of stock", helper: "Buyers can see it, but cannot order yet." },
] as const;

type Photo = { id: string; file?: File; url: string };

export function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryList, setCategoryList] = useState<ApiCategory[]>([]);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [selectedValueIds, setSelectedValueIds] = useState<Record<number, number>>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", price: "", stock_quantity: "", description: "", status: "available",
  });

  useEffect(() => {
    categories.list().then(setCategoryList).catch(() => setError("Could not load categories. Please try again."));
  }, []);

  useEffect(() => {
    if (!editId) return;
    products.mine().then((list) => {
      const existing = list.find((product) => String(product.id) === editId);
      if (existing) {
        setFormData({
          name: existing.name,
          price: String(existing.price),
          stock_quantity: existing.stock_quantity == null ? "" : String(existing.stock_quantity),
          description: existing.description || "",
          status: existing.status,
        });
        if (existing.category) setCategoryId(existing.category);
        if (existing.image_url) {
          const photo = { id: "existing-cover", url: existing.image_url };
          setPhotos([photo]);
          setCoverId(photo.id);
        }
        if (existing.attribute_values?.length) {
          const values: Record<number, number> = {};
          for (const category of categoryList) {
            for (const attribute of category.attributes || []) {
              const match = attribute.values.find((value) => existing.attribute_values?.some((selected) => selected.id === value.id));
              if (match) values[attribute.id] = match.id;
            }
          }
          setSelectedValueIds(values);
        }
      }
      setIsLoading(false);
    }).catch(() => {
      setError("Could not load this product. Please try again.");
      setIsLoading(false);
    });
  }, [editId, categoryList]);

  const selectedCategory = categoryList.find((category) => category.id === categoryId) || null;
  const filteredCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();
    return categoryList.filter((category) => !query || category.name.toLowerCase().includes(query));
  }, [categoryList, categoryQuery]);
  const cover = photos.find((photo) => photo.id === coverId) || photos[0];
  const selectedVariantSummary = Object.entries(selectedValueIds).map(([attributeId, valueId]) => {
    const attribute = selectedCategory?.attributes?.find((item) => item.id === Number(attributeId));
    return attribute?.values.find((value) => value.id === valueId)?.value;
  }).filter(Boolean).join(", ");

  function setPhotoFiles(files: FileList | File[]) {
    setImageError(null);
    const additions = Array.from(files).filter((file) => file.type.startsWith("image/")).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`, file, url: URL.createObjectURL(file),
    }));
    if (!additions.length) {
      setImageError("Choose an image file.");
      return;
    }
    setPhotos((current) => {
      const next = [...current, ...additions].slice(0, 6);
      if (!coverId) setCoverId(next[0].id);
      return next;
    });
  }

  function useImageLink() {
    const value = linkInput.trim();
    try { new URL(value); } catch { setImageError("That doesn't look like a valid image link."); return; }
    const photo = { id: `link-${Date.now()}`, url: value };
    setPhotos((current) => [...current.filter((item) => item.file), photo].slice(0, 6));
    setCoverId(photo.id);
    setLinkInput("");
    setImageError(null);
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
    if (coverId === id) setCoverId(photos.find((photo) => photo.id !== id)?.id || null);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving) return;
    if (!formData.name.trim() || !formData.price || !categoryId) {
      setError(!formData.name.trim() ? "Add a product name." : !categoryId ? "Choose a category before publishing." : "Add a valid price.");
      return;
    }
    const coverPhoto = photos.find((photo) => photo.id === coverId) || photos[0];
    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity, 10) : 0,
      description: formData.description.trim(),
      status: formData.status,
      category: categoryId,
    };
    const attributeValueIds = Object.values(selectedValueIds);
    if (attributeValueIds.length) payload.attribute_value_ids = attributeValueIds;
    if (coverPhoto && !coverPhoto.file) payload.image_source_url = coverPhoto.url;
    try {
      setIsSaving(true);
      setError(null);
      if (isEditing) await products.update(Number(editId), payload, coverPhoto?.file || null);
      else await products.create(payload, coverPhoto?.file || null);
      router.refresh();
      router.push("/seller/dashboard/catalog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this product. Please try again.");
      setIsSaving(false);
    }
  }

  if (isLoading) return <AppShell title={isEditing ? "Edit Product" : "Add Product"}><PageSkeleton showKPIs={false} listCount={1} /></AppShell>;

  return (
    <AppShell title={isEditing ? "Edit Product" : "Add Product"}>
      <div className="mx-auto max-w-6xl space-y-5 pb-24">
        <button type="button" onClick={() => router.push("/seller/dashboard/catalog")} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Back to products</button>
        <div><p className="text-xs font-bold uppercase tracking-wider text-role">{isEditing ? "Product editor" : "Quick publish"}</p><h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{isEditing ? "Edit product" : "Add a product"}</h1><p className="mt-1 text-sm text-muted-foreground">Add the essentials, preview the listing, and publish in under a minute.</p></div>
        {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 p-4 text-sm font-semibold text-error"><AlertCircle size={17} /> {error}</div>}

        <form onSubmit={handleSave} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-5"><h2 className="text-lg font-black text-foreground">Product details</h2><p className="text-sm text-muted-foreground">Only the essentials buyers need to decide.</p></div>
              <div className="space-y-4">
                <div><label htmlFor="product-name" className="mb-1.5 block text-sm font-bold text-foreground">Product name <span className="text-error">*</span></label><input id="product-name" autoFocus required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="e.g. iPhone 13 Pro Clear Case" className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none focus:border-role focus:ring-2 focus:ring-role/20" /></div>
                <div><label htmlFor="category-search" className="mb-1.5 block text-sm font-bold text-foreground">Category <span className="text-error">*</span></label><div className="relative"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input id="category-search" value={categoryQuery} onChange={(event) => setCategoryQuery(event.target.value)} placeholder="Search categories..." className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-role focus:ring-2 focus:ring-role/20" /></div><div className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto">{filteredCategories.map((category) => <button key={category.id} type="button" onClick={() => { setCategoryId(category.id); setSelectedValueIds({}); }} className={cn("min-h-10 rounded-lg border px-3 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-ring", categoryId === category.id ? "border-role bg-role-dark text-white" : "border-border bg-background text-muted-foreground hover:border-role hover:text-foreground")}>{category.name}{categoryId === category.id && <Check size={14} className="ml-1 inline" />}</button>)}</div>{selectedCategory?.attributes?.map((attribute) => <div key={attribute.id} className="mt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{attribute.name}</p><div className="flex flex-wrap gap-2">{attribute.values.map((value) => <button key={value.id} type="button" onClick={() => setSelectedValueIds((current) => ({ ...current, [attribute.id]: value.id }))} className={cn("min-h-10 rounded-full border px-3 text-sm font-semibold", selectedValueIds[attribute.id] === value.id ? "border-role-dark bg-role-dark text-white" : "border-border text-muted-foreground hover:border-role")}>{value.value}</button>)}</div></div>)}</div>
                <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="product-price" className="mb-1.5 block text-sm font-bold text-foreground">Price (KES) <span className="text-error">*</span></label><input id="product-price" required type="number" min="0.01" step="0.01" inputMode="decimal" value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} placeholder="500" className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none focus:border-role focus:ring-2 focus:ring-role/20" /></div><div><label htmlFor="product-stock" className="mb-1.5 block text-sm font-bold text-foreground">Stock quantity</label><input id="product-stock" type="number" min="0" step="1" inputMode="numeric" value={formData.stock_quantity} onChange={(event) => setFormData({ ...formData, stock_quantity: event.target.value })} placeholder="20" className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none focus:border-role focus:ring-2 focus:ring-role/20" /></div></div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="mb-4"><h2 className="text-lg font-black text-foreground">Product photos</h2><p className="text-sm text-muted-foreground">Add up to 6 photos and choose the cover buyers see first.</p></div><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{photos.map((photo) => <div key={photo.id} className={cn("group relative aspect-square overflow-hidden rounded-xl border-2", coverId === photo.id ? "border-role" : "border-border")}><img src={photo.url} alt="" className="h-full w-full object-cover" /><button type="button" onClick={() => setCoverId(photo.id)} aria-label="Make this the cover photo" className={cn("absolute left-1 top-1 rounded-full p-1.5 shadow", coverId === photo.id ? "bg-role-dark text-white" : "bg-card/90 text-muted-foreground")}><Star size={14} fill={coverId === photo.id ? "currentColor" : "none"} /></button><button type="button" onClick={() => removePhoto(photo.id)} aria-label="Remove photo" className="absolute right-1 top-1 rounded-full bg-error p-1.5 text-white opacity-0 transition group-hover:opacity-100"><Trash2 size={13} /></button></div>)}{photos.length < 6 && <button type="button" onClick={() => uploadRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition hover:border-role hover:text-role"><ImagePlus size={22} /><span className="text-xs font-bold">Add photo</span></button>}</div><div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => uploadRef.current?.click()} className="gap-1.5"><Upload size={14} /> Upload photos</Button><Button type="button" variant="outline" size="sm" onClick={() => cameraRef.current?.click()} className="gap-1.5"><Camera size={14} /> Camera</Button><input ref={uploadRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => { if (event.target.files) setPhotoFiles(event.target.files); event.target.value = ""; }} /><input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => { if (event.target.files) setPhotoFiles(event.target.files); event.target.value = ""; }} /></div><div className="mt-3 flex gap-2"><div className="relative flex-1"><Link2 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={linkInput} onChange={(event) => setLinkInput(event.target.value)} placeholder="Paste an image link" className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-role" /></div><Button type="button" variant="outline" size="sm" onClick={useImageLink} disabled={!linkInput.trim()}>Use link</Button></div>{imageError && <p className="mt-2 text-sm font-semibold text-error">{imageError}</p>}</section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="mb-4"><h2 className="text-lg font-black text-foreground">More information</h2><p className="text-sm text-muted-foreground">Optional details and visibility.</p></div><label htmlFor="product-description" className="mb-1.5 block text-sm font-bold text-foreground">Description</label><textarea id="product-description" rows={3} value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="Pack size, colours, or details buyers should know..." className="w-full resize-none rounded-lg border border-input bg-background px-3 py-3 text-base text-foreground outline-none focus:border-role focus:ring-2 focus:ring-role/20" /><div className="mt-5 grid gap-2 sm:grid-cols-3">{VISIBILITY_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => setFormData({ ...formData, status: option.value })} className={cn("rounded-xl border p-3 text-left transition focus-visible:ring-2 focus-visible:ring-ring", formData.status === option.value ? "border-role bg-role-soft" : "border-border hover:border-role")}><span className="flex items-center gap-2 text-sm font-bold text-foreground">{formData.status === option.value && <Check size={15} className="text-role-dark" />}{option.title}</span><span className="mt-1 block text-xs text-muted-foreground">{option.helper}</span></button>)}</div></section>
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start"><div className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-role">Live preview</p><h2 className="text-lg font-black text-foreground">Buyer view</h2></div><Pencil size={16} className="text-muted-foreground" /></div><div className="overflow-hidden rounded-xl border border-border bg-background"><div className="relative aspect-square bg-muted">{cover ? <img src={cover.url} alt="Product preview" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground"><ImagePlus size={28} /><span className="text-xs font-semibold">Add a product photo</span></div>}</div><div className="space-y-2 p-4"><p className="truncate text-lg font-black text-foreground">{formData.name || "Your product name"}</p><p className="text-xs font-semibold text-muted-foreground">{selectedCategory?.name || "Choose a category"}{selectedVariantSummary ? ` · ${selectedVariantSummary}` : ""}</p><p className="text-xl font-black text-role">{formData.price ? `KES ${Number(formData.price).toLocaleString("en-KE")}` : "KES 0"}</p><p className="line-clamp-3 text-sm text-muted-foreground">{formData.description || "Your product description will appear here."}</p><div className="rounded-lg bg-role-dark py-2.5 text-center text-sm font-bold text-white">{formData.status === "available" ? "Available to order" : formData.status === "draft" ? "Draft" : "Out of stock"}</div></div></div><button type="submit" disabled={isSaving} className="mt-4 min-h-12 w-full rounded-lg bg-role-dark px-4 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "Saving product..." : isEditing ? "Save changes" : "Publish product"}</button><p className="mt-2 text-center text-xs text-muted-foreground">You can change the price or stock anytime.</p></div></aside>
        </form>
      </div>
    </AppShell>
  );
}
