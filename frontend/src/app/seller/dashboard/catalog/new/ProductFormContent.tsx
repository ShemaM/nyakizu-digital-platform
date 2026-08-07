"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, AlertCircle, Lightbulb, Check, Pencil, ImagePlus, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { products } from "@/lib/api";
import { cn } from "@/lib/cn";

const STEPS = ["Product name", "Photo", "Price & stock", "Who can see it?", "Description", "Review & save"] as const;
type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;

const VISIBILITY_OPTIONS = [
  {
    value: "available",
    title: "Visible to buyers",
    helper: "Buyers can see this and order it right now.",
    example: "Use this when you are ready to sell.",
  },
  {
    value: "draft",
    title: "Hidden draft",
    helper: "Only you can see it — buyers cannot find or order it yet.",
    example: "Use this while you are still deciding on price or details.",
  },
  {
    value: "out_of_stock",
    title: "Out of stock",
    helper: "Buyers can see it, but cannot order until you restock.",
    example: "Use this when you have sold out but plan to restock soon.",
  },
] as const;

function ExampleBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
      <Lightbulb size={18} className="text-amber-500 shrink-0 mt-0.5" />
      <p className="text-caption text-amber-800 leading-relaxed">{children}</p>
    </div>
  );
}

export function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = !!editId;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<StepIndex>(0);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock_quantity: "",
    description: "",
    status: "available",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    products.list().then((list) => {
      const existing = list.find((p) => String(p.id) === editId);
      if (existing) {
        setFormData({
          name: existing.name,
          price: String(existing.price),
          stock_quantity: existing.stock_quantity != null ? String(existing.stock_quantity) : "",
          description: existing.description || "",
          status: existing.status,
        });
        if (existing.image_url) setImagePreviewUrl(existing.image_url);
      }
      setIsLoading(false);
    });
  }, [editId]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setImageFile(null);
    setImagePreviewUrl(null);
  }

  function canAdvance(): boolean {
    if (step === 0) return formData.name.trim().length > 0;
    if (step === 2) return formData.price.trim().length > 0 && !isNaN(parseFloat(formData.price));
    return true;
  }

  function goNext() {
    if (!canAdvance()) {
      setError(step === 0 ? "Enter a product name to continue." : "Enter a price to continue.");
      return;
    }
    setError(null);
    setStep((s) => (s < 5 ? ((s + 1) as StepIndex) : s));
  }

  function goBack() {
    setError(null);
    setStep((s) => (s > 0 ? ((s - 1) as StepIndex) : s));
  }

  const handleSave = async () => {
    if (isSaving) return; // Prevent double-submissions from jamming the router
    if (!formData.name || !formData.price) {
      setError("Product name and price are required.");
      setStep(0);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity, 10) : 0,
        description: formData.description.trim() || "",
        status: formData.status,
      };

      if (isEditing) {
        await products.update(Number(editId), payload, imageFile);
      } else {
        await products.create(payload, imageFile);
      }

      // Navigate away smoothly without locking up the server-side cache router
      router.push("/seller/dashboard/catalog");
    } catch (err: any) {
      console.error("Caught form exception:", err);
      setError(err?.message || "An unexpected network error occurred.");
      setIsSaving(false); // Make sure to turn off loading state only on failure
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      goNext();
    } else {
      void handleSave();
    }
  };

  if (isLoading) {
    return (
      <AppShell title={isEditing ? "Edit Product" : "Add Product"}>
        <PageSkeleton showKPIs={false} listCount={1} />
      </AppShell>
    );
  }

  const visibilityChoice = VISIBILITY_OPTIONS.find((o) => o.value === formData.status) ?? VISIBILITY_OPTIONS[0];

  return (
    <AppShell title={isEditing ? "Edit Product" : "Add Product"}>
      <div className="space-y-6 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => router.push("/seller/dashboard/catalog")}
          className="flex items-center gap-2 text-caption font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors border-none bg-transparent cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </button>

        <div>
          <h1 className="text-title font-black text-text-primary tracking-tight">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-caption text-text-muted mt-1">
            {isEditing ? "Update details for this item, one step at a time." : "Add a new item for buyers to see, one step at a time."}
          </p>
        </div>

        <div className="space-y-2">
          <ProgressBar percent={((step + 1) / STEPS.length) * 100} tone="role" />
          <p className="text-caption font-bold text-text-secondary">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-4 text-caption font-semibold flex items-center gap-2">
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-5 bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-body-lg font-bold text-text-primary">What are you selling?</h2>
                <p className="text-caption text-text-muted mt-0.5">Type the name buyers will see first.</p>
              </div>
              <ExampleBox>
                Example: <strong>&ldquo;iPhone 13 Pro Clear Case&rdquo;</strong> or <strong>&ldquo;Rice — 5kg bag&rdquo;</strong>
              </ExampleBox>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Product Name *</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g., iPhone 13 Pro Clear Case"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:border-role rounded-xl px-4 py-3 text-body text-text-primary placeholder-slate-400 outline-none transition-all"
                  disabled={isSaving}
                  required
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-body-lg font-bold text-text-primary">Add a photo (optional)</h2>
                <p className="text-caption text-text-muted mt-0.5">
                  Buyers trust items with a real photo more. You can skip this and add one later.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isSaving}
                  className="relative w-44 h-44 rounded-2xl border-2 border-dashed border-slate-300 bg-dark-secondary flex items-center justify-center overflow-hidden hover:border-role transition-colors cursor-pointer"
                >
                  {imagePreviewUrl ? (
                    <Image src={imagePreviewUrl} alt="Product photo" fill unoptimized className="object-cover" />
                  ) : (
                    <span className="flex flex-col items-center gap-2 text-text-muted">
                      <ImagePlus size={28} />
                      <span className="text-caption font-semibold">Tap to add a photo</span>
                    </span>
                  )}
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                {imagePreviewUrl && (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="flex items-center gap-1 text-caption font-bold text-error border-none bg-transparent cursor-pointer"
                  >
                    <X size={13} /> Remove photo
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-body-lg font-bold text-text-primary">How much, and how many?</h2>
                <p className="text-caption text-text-muted mt-0.5">
                  Price is what one unit costs. Stock is how many you have right now.
                </p>
              </div>
              <ExampleBox>
                Example: Price = <strong>500</strong> (one item costs 500 KES) and Stock = <strong>20</strong> (you have 20 to sell).
              </ExampleBox>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Price (KES) *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    placeholder="0.00"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white border border-slate-200 focus:border-role rounded-xl px-4 py-3 text-body text-text-primary placeholder-slate-400 outline-none transition-all"
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Stock Quantity</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    step="1"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full bg-white border border-slate-200 focus:border-role rounded-xl px-4 py-3 text-body text-text-primary placeholder-slate-400 outline-none transition-all"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-text-muted">Not sure yet? Leave this blank.</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-body-lg font-bold text-text-primary">Who should see this product?</h2>
                <p className="text-caption text-text-muted mt-0.5">Pick the option that matches where you are right now.</p>
              </div>
              <div className="space-y-2.5">
                {VISIBILITY_OPTIONS.map((opt) => {
                  const selected = formData.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: opt.value })}
                      disabled={isSaving}
                      className={cn(
                        "w-full text-left rounded-xl border p-4 transition-all flex items-start gap-3",
                        selected ? "border-role bg-role-soft ring-1 ring-role/20" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div
                        className={cn(
                          "shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5",
                          selected ? "border-role bg-role" : "border-slate-300"
                        )}
                      >
                        {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-body font-bold text-text-primary">{opt.title}</p>
                        <p className="text-caption text-text-secondary">{opt.helper}</p>
                        <p className="text-caption text-text-muted italic">{opt.example}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-body-lg font-bold text-text-primary">Any extra details? (optional)</h2>
                <p className="text-caption text-text-muted mt-0.5">Help buyers know exactly what they are getting.</p>
              </div>
              <ExampleBox>
                Example: <strong>&ldquo;All green, pack of 5, waterproof&rdquo;</strong> or <strong>&ldquo;Available in S, M, L&rdquo;</strong>
              </ExampleBox>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description</label>
                <textarea
                  rows={4}
                  autoFocus
                  placeholder="Pack size, colours, or other details buyers should know..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:border-role rounded-xl px-4 py-3 text-body text-text-primary placeholder-slate-400 outline-none transition-all resize-none"
                  disabled={isSaving}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-body-lg font-bold text-text-primary">Check everything before you save</h2>
                <p className="text-caption text-text-muted mt-0.5">Tap the pencil to change anything.</p>
              </div>
              {imagePreviewUrl && (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-100 mx-auto">
                  <Image src={imagePreviewUrl} alt="Product photo" fill unoptimized className="object-cover" />
                </div>
              )}
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                <ReviewRow label="Product name" value={formData.name || "—"} onEdit={() => setStep(0)} />
                <ReviewRow label="Photo" value={imagePreviewUrl ? "Added" : "None added"} onEdit={() => setStep(1)} />
                <ReviewRow
                  label="Price"
                  value={formData.price ? `${formData.price} KES` : "—"}
                  onEdit={() => setStep(2)}
                />
                <ReviewRow
                  label="Stock quantity"
                  value={formData.stock_quantity || "Not set"}
                  onEdit={() => setStep(2)}
                />
                <ReviewRow label="Who can see it" value={visibilityChoice.title} onEdit={() => setStep(3)} />
                <ReviewRow label="Description" value={formData.description || "None added"} onEdit={() => setStep(4)} />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={goBack} disabled={isSaving} className="gap-2">
                <ArrowLeft size={16} /> Back
              </Button>
            ) : (
              <span />
            )}

            <Button type="submit" loading={isSaving} variant="role" className="gap-2 px-6">
              {step < 5 ? (
                <>
                  Next <ArrowRight size={16} />
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-body text-text-primary truncate">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 flex items-center gap-1 text-caption font-bold text-role hover:opacity-80 border-none bg-transparent cursor-pointer"
      >
        <Pencil size={13} /> Edit
      </button>
    </div>
  );
}
