import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DashboardLayout } from "@/components/layouts";
import { Search, MapPin, Star } from "lucide-react";

export default function BuyerSuppliersPage() {
  const suppliers = [
    {
      name: "Kamau Electronics",
      location: "RNG Plaza - Stall 42",
      categories: ["Screens", "Cases", "Batteries"],
      rating: 4.8,
      trusted: true,
    },
    {
      name: "Tech Hub",
      location: "RNG Plaza - Stall 58",
      categories: ["Chargers", "Cables", "Adapters"],
      rating: 4.6,
      trusted: true,
    },
    {
      name: "Mwangi Store",
      location: "RNG Plaza - Stall 15",
      categories: ["Wholesale", "Bulk Orders"],
      rating: 4.9,
      trusted: true,
    },
  ];

  return (
    <DashboardLayout title="Suppliers">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Input
              placeholder="Search suppliers or products..."
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <Card key={supplier.name} className="hover:border-slate-700 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {supplier.location}
                      </CardDescription>
                    </div>
                    {supplier.trusted && (
                      <Badge variant="success" className="text-xs">Verified</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Categories */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {supplier.categories.map((cat) => (
                        <Badge key={cat} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 py-2 border-t border-slate-800/50">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(supplier.rating)
                              ? "fill-brand-gold text-brand-gold"
                              : "text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-400">{supplier.rating}</span>
                  </div>

                  {/* Action */}
                  <Button size="sm" className="w-full" variant="ghost">
                    View Products
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </DashboardLayout>
  );
}