"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  Search,
  Store,
} from "lucide-react";

import { DashboardLayout } from "@/components/layouts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  ApiError,
  ApiProduct,
  categories,
  fmtKES,
  parsePrice,
  products,
  type ApiCategory,
} from "@/lib/api";
import { cn } from "@/lib/cn";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  status: "available" as ApiProduct["status"],
  imageUrl: "",
};

function getStatusText(product: ApiProduct) {
  if (product.status === "draft") return "Draft";
  if (product.status === "out_of_stock") return "Out of stock";
  if ((product.stock_quantity ?? 0) > 0) return "Available";
  return "Can be sourced";
}

function getStatusVariant(product: ApiProduct) {
  if (product.status === "draft") return "outline";
  if (product.status === "out_of_stock") return "warning";
  if ((product.stock_quantity ?? 0) > 0) return "success";
  return "info";
}

export function CatalogWorkspace() {
  const [catalog, setCatalog] = useState<ApiProduct[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ApiCategory[]>([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadCatalog() {
    try {
      setLoading(true);
      setError(null);
      const [productData, categoryData] = await Promise.all([
        products.mine(),
        categories.list(),
      ]);
      setCatalog(productData);
      setCategoryOptions(categoryData);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We could not load your products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  const filteredCatalog = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return catalog;

    return catalog.filter((product) => {
      const categoryName =
        "category_name" in product ? String(product.category_name ?? "") : "";
      return [product.name, product.description ?? "", categoryName]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [catalog, search]);

  const availableCount = catalog.filter((item) => item.status === "available").length;
  const draftCount = catalog.filter((item) => item.status === "draft").length;
  const totalStock = catalog.reduce((sum, item) => sum + (item.stock_quantity ?? 0), 0);
  const formIsValid =
    form.name.trim().length > 1 &&
    Number(form.price) > 0 &&
    form.categoryId.trim().length > 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formIsValid) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const created = await products.create({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock_quantity: Number(form.stockQuantity) || 0,
        category: Number(form.categoryId),
        status: form.status,
        image_url: form.imageUrl.trim(),
      });

      setCatalog((current) => [created, ...current]);
      setForm(initialForm);
      setShowForm(false);
      setSuccess("Product saved. Buyers can now see it when it is available.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We could not save this product. Please check the details and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Products">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-28 pt-4 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Seller workspace
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0a1f10]">
                Manage products
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-6 text-gray-600">
                Add products buyers can trust: clear names, fair prices, stock, and simple descriptions.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowForm((current) => !current)}
              className="min-h-12 shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          {success && (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </header>

        <section className="grid grid-cols-3 gap-3" aria-label="Catalog summary">
          <SummaryTile icon={Package} label="Products" value={catalog.length} />
          <SummaryTile icon={Store} label="Live" value={availableCount} />
          <SummaryTile icon={ClipboardList} label="Stock" value={totalStock} />
        </section>

        {showForm && (
          <Card className="border-gray-200 bg-white text-slate-900 shadow-sm">
            <form onSubmit={handleSubmit} noValidate>
              <CardHeader className="border-gray-100">
                <CardTitle className="text-slate-950">Add a product</CardTitle>
                <CardDescription className="text-gray-600">
                  Keep it short and specific so buyers know exactly what they are ordering.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Product name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Example: Type-C fast charger"
                    required
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={form.categoryId}
                      onValueChange={(categoryId) => setForm({ ...form, categoryId })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Listing status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(status) =>
                        setForm({ ...form, status: status as ApiProduct["status"] })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Choose status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available to buyers</SelectItem>
                        <SelectItem value="draft">Save as draft</SelectItem>
                        <SelectItem value="out_of_stock">Out of stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price in KES</Label>
                    <Input
                      id="price"
                      inputMode="decimal"
                      min="1"
                      type="number"
                      value={form.price}
                      onChange={(event) => setForm({ ...form, price: event.target.value })}
                      placeholder="250"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock on hand</Label>
                    <Input
                      id="stock"
                      inputMode="numeric"
                      min="0"
                      type="number"
                      value={form.stockQuantity}
                      onChange={(event) =>
                        setForm({ ...form, stockQuantity: event.target.value })
                      }
                      placeholder="12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Mention quality, color, compatibility, packaging, or minimum order details."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    inputMode="url"
                    value={form.imageUrl}
                    onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
              <CardFooter className="sticky bottom-16 border-gray-100 bg-white/95 backdrop-blur sm:static">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setForm(initialForm);
                    setShowForm(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!formIsValid || saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save product
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <section className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              aria-label="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your products"
              className="min-h-12 bg-white pl-10 text-slate-900"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-xl border border-gray-100 bg-white"
                />
              ))}
            </div>
          ) : catalog.length === 0 ? (
            <EmptyCatalog onAdd={() => setShowForm(true)} />
          ) : filteredCatalog.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white p-6 text-center">
              <p className="text-sm font-bold text-[#0a1f10]">No matching products</p>
              <p className="mt-1 text-sm text-gray-500">
                Try another name or clear your search to see the full catalog.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCatalog.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {draftCount > 0 && (
          <p className="text-center text-xs text-gray-500">
            {draftCount} draft {draftCount === 1 ? "product is" : "products are"} hidden from buyers.
          </p>
        )}
      </main>
    </DashboardLayout>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <Icon className="h-4 w-4 text-amber-600" />
      <p className="mt-2 text-xl font-black leading-none text-[#0a1f10] tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-bold uppercase text-gray-500">{label}</p>
    </div>
  );
}

function EmptyCatalog({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm">
        <Package className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-black text-[#0a1f10]">Add your first product</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-600">
        Your shop needs at least one product before buyers can understand what you sell.
      </p>
      <Button type="button" onClick={onAdd} className="mt-5 min-h-12">
        <Plus className="mr-2 h-4 w-4" />
        Add product
      </Button>
    </div>
  );
}

function ProductRow({ product }: { product: ApiProduct }) {
  const stock = product.stock_quantity ?? 0;
  const categoryName =
    "category_name" in product ? String(product.category_name ?? "") : "";

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100",
            product.image_url && "bg-white"
          )}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-[#0a1f10]">
                {product.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {categoryName || "Uncategorized"}
              </p>
            </div>
            <Badge variant={getStatusVariant(product)}>{getStatusText(product)}</Badge>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-base font-black text-[#0a1f10]">
                {fmtKES(parsePrice(product.price))}
              </p>
              <p className="text-xs text-gray-500">
                {stock > 0 ? `${stock} in stock` : "No stock recorded"}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" disabled>
              Edit
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
