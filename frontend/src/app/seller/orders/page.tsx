import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function SellerOrders() {
  const orders = [
    {
      id: "#2048",
      buyer: "John Mwangi",
      items: 5,
      total: "KES 3,200",
      status: "pending",
      date: "Today",
    },
    {
      id: "#2047",
      buyer: "Grace Kipchoge",
      items: 12,
      total: "KES 6,500",
      status: "confirmed",
      date: "Yesterday",
    },
    {
      id: "#2046",
      buyer: "Moses Okonkwo",
      items: 8,
      total: "KES 4,800",
      status: "completed",
      date: "3 days ago",
    },
  ];

  const statusConfig = {
    pending: { icon: Clock, color: "warning", label: "Pending" },
    confirmed: { icon: AlertCircle, color: "info", label: "Confirmed" },
    completed: { icon: CheckCircle2, color: "success", label: "Completed" },
  };

  return (
    <DashboardLayout title="Orders">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Manage Orders</h2>

          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;

              return (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-white">{order.id}</h3>
                          <Badge variant={config.color as any} className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">
                          {order.buyer} • {order.items} items • {order.date}
                        </p>
                      </div>
                      <div className="text-right space-y-3 mr-4">
                        <p className="font-bold text-brand-gold text-lg">{order.total}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>
    </DashboardLayout>
  );
}