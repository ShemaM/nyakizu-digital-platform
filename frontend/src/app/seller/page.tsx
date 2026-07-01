import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import Link from "next/link";
import { Package, TrendingUp, Users, Zap } from "lucide-react";

export default function SellerDashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <Section spacing="md">
        <Container size="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: Package,
                label: "Products",
                value: "24",
                subtext: "In catalog",
              },
              {
                icon: TrendingUp,
                label: "Monthly Sales",
                value: "KES 450K",
                subtext: "This month",
              },
              {
                icon: Users,
                label: "Buyers",
                value: "23",
                subtext: "Verified",
              },
              {
                icon: Zap,
                label: "Pending Orders",
                value: "8",
                subtext: "Awaiting approval",
              },
            ].map(({ icon: Icon, label, value, subtext }) => (
              <Card key={label}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-gold" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                      {label}
                    </p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs text-slate-500 mt-1">{subtext}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                  <Link href="/seller/catalog">Manage Catalog</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                  <Link href="/seller/orders">View Orders</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                  <Link href="/seller/ledger">Payment Ledger</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                  <Link href="/seller/account">Settings</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription>Latest buyer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      orderID: "#2048",
                      buyer: "John Mwangi",
                      items: "5 items",
                      total: "KES 3,200",
                      time: "30 mins ago",
                    },
                    {
                      orderID: "#2047",
                      buyer: "Grace Kipchoge",
                      items: "12 items",
                      total: "KES 6,500",
                      time: "2 hours ago",
                    },
                  ].map(({ orderID, buyer, items, total, time }) => (
                    <div
                      key={orderID}
                      className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">{orderID}</p>
                        <p className="text-xs text-slate-400">
                          {buyer} • {items}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-semibold text-brand-gold">{total}</p>
                        <p className="text-xs text-slate-500">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </DashboardLayout>
  );
}