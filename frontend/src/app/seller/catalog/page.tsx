"use client";

import { useState } from "react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Image as ImageIcon, Upload, Info } from "lucide-react";

import { products, ApiError, Product } from "@/lib/api";
import { 
  categories as mockCategories, subcategories as mockSubcategories, 
  brands as mockBrands, deviceModels as mockDeviceModels,
  Category as MockCategory, Subcategory as MockSubcategory, Brand as MockBrand, DeviceModel as MockDeviceModel
} from "@/lib/mockData";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

const MAX_DESC_LENGTH = 1000;

export default function NewProductPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isEditMode = pathname.includes('/edit');
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"available" | "draft">("available");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [deviceModelId, setDeviceModelId] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data for dropdowns
  const [allCategories, setAllCategories] = useState<MockCategory[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<MockSubcategory[]>([]);
  const [allBrands, setAllBrands] = useState<MockBrand[]>([]);
  const [allDeviceModels, setAllDeviceModels] = useState<MockDeviceModel[]>([]);

  // Filtered data for dependent dropdowns
  const [filteredSubcategories, setFilteredSubcategories] = useState<MockSubcategory[]>([]);
  const [filteredDeviceModels, setFilteredDeviceModels] = useState<MockDeviceModel[]>([]);

  useEffect(() => {
    // In a real app, this would be an API call.
    setAllCategories(mockCategories);
    setAllSubcategories(mockSubcategories);
    setAllBrands(mockBrands);
    setAllDeviceModels(mockDeviceModels);
  }, []);

  // Filter subcategories when category changes
  useEffect(() => {
    setFilteredSubcategories(categoryId ? allSubcategories.filter(s => s.categoryId === parseInt(categoryId)) : []);
    setSubcategoryId(""); // Reset subcategory selection
  }, [categoryId, allSubcategories]);

  // Filter device models when brand changes
  useEffect(() => {
    setFilteredDeviceModels(brandId ? allDeviceModels.filter(d => d.brandId === parseInt(brandId)) : []);
    setDeviceModelId(""); // Reset device model selection
  }, [brandId, allDeviceModels]);

  // Derived state
  const isFormValid = name.trim().length > 0 && Number(price) > 0;
  const isFormValid = name.trim().length > 0 && Number(price) > 0 && !!categoryId && !!subcategoryId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    const productData: Partial<Product> = {
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      status,
    };
    try {
      await products.create(productData as any); // Assuming create handles this
      router.push("/seller/catalog");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while saving. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title={isEditMode ? "Edit Product" : "Add New Product"}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="p-4 sm:p-6 lg:p-8">
          <header className="mb-8">
            <Link 
              href="/seller/catalog" 
              className="group flex w-fit items-center text-sm text-muted-foreground transition-colors hover:text-primary mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Catalog
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Fill in the details below to add a new product to your catalog.
            </p>
          </header>
        </div>

        <main>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 sm:p-6 lg:p-8">
            {/* Left Column: Main Details */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>
                    The name, price, and description will be visible to buyers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive" role="alert">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Product Name <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. Premium Screen Protector" 
                      required 
                      aria-invalid={name.trim().length === 0}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="description">Description</Label>
                      <span className={`text-xs ${description.length > MAX_DESC_LENGTH * 0.9 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        {description.length} / {MAX_DESC_LENGTH}
                      </span>
                    </div>
                    <Textarea 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      maxLength={MAX_DESC_LENGTH}
                      placeholder="Describe your product, including quality, origin, or packaging details." 
                      rows={6}
                      className="resize-y"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Categorization</CardTitle>
                  <CardDescription>
                    Help buyers find your product by categorizing it correctly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCategories.map(cat => (
                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory <span className="text-destructive">*</span></Label>
                      <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId}>
                        <SelectTrigger id="subcategory">
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredSubcategories.map(sub => (
                            <SelectItem key={sub.id} value={String(sub.id)}>{sub.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price">
                        Price <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-muted-foreground text-sm font-medium">KES</span>
                        </div>
                        <Input 
                          id="price" 
                          type="number" 
                          value={price} 
                          onChange={(e) => setPrice(e.target.value)} 
                          placeholder="0.00" 
                          required 
                          min="0" 
                          step="0.01"
                          className="pl-12"
                          aria-invalid={Number(price) <= 0}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                    <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 text-slate-500 dark:text-slate-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                    <p className="text-sm text-muted-foreground">Drag & drop images here, or</p>
                    <Button type="button" variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Listing Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={status} onValueChange={(v) => setStatus(v as "available" | "draft")}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available (Public)</SelectItem>
                      <SelectItem value="draft">Draft (Hidden)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-start gap-3 mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">
                    <Info className="h-5 w-5 mt-0.5 shrink-0" />
                    <p className="text-xs">
                      Setting status to <span className="font-bold">Draft</span> will hide this product from your public catalog.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <footer className="sticky bottom-0 z-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-primary/95 backdrop-blur-sm">
          <div className="flex justify-end items-center gap-4 p-4 sm:p-6 lg:p-8">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.push('/seller/catalog')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !isFormValid} 
            >
              {loading ? "Saving..." : (isEditMode ? "Save Changes" : "Save Product")}
            </Button>
          </div>
        </footer>
      </form>
    </DashboardLayout>
  );
}