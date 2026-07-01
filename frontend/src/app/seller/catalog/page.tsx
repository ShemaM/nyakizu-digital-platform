import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Edit2, Trash2, Plus } from "lucide-react";

export default function SellerCatalog() {
  const products = [
    {
      id: 1,
      name: "Screen Protector (5\")",
      category: "Screens",
      price: "KES 240",
      stock: 45,
      sold: 120,
    },
    {
      id: 2,
      name: "TPU Case (Assorted)",
      category: "Cases",
      price: "KES 60",
      stock: 82,
      sold: 340,
    },
    {
      id: 3,
      name: "Phone Battery (4000mAh)",
      category: "Batteries",
      price: "KES 450",
      stock: 28,
      sold: 65,
    },
  ];

  return (
    <DashboardLayout title="Product Catalog">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Your Products</h2>
            <Button className="gap-2" size="sm">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>

          <div className="space-y-3">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="space-y-1">
                        <h3 className="font-bold text-white">{product.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>Category: {product.category}</span>
                          <span>Stock: {product.stock}</span>
                          <span>Sold: {product.sold}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-3 mr-4">
                      <p className="font-bold text-brand-gold text-lg">{product.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-error hover:text-error">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </DashboardLayout>
  );
}