import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Badge } from "@/components/ui/Badge";

export default function AdminOrders() {
  const orders = [
    {
      id: "#2048",
      buyer: "John Mwangi",
      seller: "Kamau Electronics",
      amount: "KES 3,200",
      status: "completed",
      date: "Today",
    },
    {
      id: "#2047",
      buyer: "Grace Kipchoge",
      seller: "Tech Hub",
      amount: "KES 6,500",
      status: "pending",
      date: "Yesterday",
    },
  ];

  return (
    <DashboardLayout title="Orders">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          <h2 className="text-2xl font-bold text-white">All Orders</h2>

          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-white">{order.id}</h3>
                        <Badge variant={order.status === "completed" ? "success" : "warning"}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">
                        {order.buyer} → {order.seller}
                      </p>
                      <p className="text-xs text-slate-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-gold text-lg">{order.amount}</p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        Details
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