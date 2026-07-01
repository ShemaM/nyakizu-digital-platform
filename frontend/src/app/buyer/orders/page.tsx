import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import Link from "next/link";

export default function BuyerOrders() {
  const orders = [
    {
      id: "#2048",
      supplier: "Kamau Electronics",
      status: "locked",
      total: "KES 3,200",
      date: "Today",
      items: 3,
    },
    {
      id: "#2047",
      supplier: "Tech Hub",
      status: "completed",
      total: "KES 5,000",
      date: "Yesterday",
      items: 5,
    },
  ];

  return (
    <DashboardLayout title="Orders">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Your Orders</h2>
            <Button asChild>
              <Link href="#">New Order</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-white">{order.id}</h3>
                        <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-slate-800 text-slate-300">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{order.supplier}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-brand-gold text-lg">{order.total}</p>
                      <p className="text-xs text-slate-500">{order.items} items • {order.date}</p>
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