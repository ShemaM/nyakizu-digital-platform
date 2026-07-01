import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import Link from "next/link";
import { ShoppingCart, Package, TrendingUp, Settings } from "lucide-react";

export default function BuyerDashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <Section spacing="md">
        <Container size="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: ShoppingCart,
                label: "Active Orders",
                value: "12",
                subtext: "In progress",
              },
              {
                icon: Package,
                label: "Completed",
                value: "48",
                subtext: "This month",
              },
              {
                icon: TrendingUp,
                label: "Total Spent",
                value: "KES 125K",
                subtext: "Year to date",
              },
              {
                icon: Settings,
                label: "Suppliers",
                value: "8",
                subtext: "Verified",
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
                  <Link href="/buyer/suppliers">Browse Suppliers</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                  <Link href="/buyer/orders">View Orders</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                  <Link href="/buyer/debts">Track Debts</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                  <Link href="/buyer/account">Settings</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      action: "Order placed",
                      supplier: "Kamau Electronics",
                      amount: "KES 3,200",
                      time: "2 hours ago",
                    },
                    {
                      action: "Payment recorded",
                      supplier: "Tech Hub RNG",
                      amount: "KES 5,000",
                      time: "Yesterday",
                    },
                    {
                      action: "Order completed",
                      supplier: "Mwangi Store",
                      amount: "KES 2,150",
                      time: "3 days ago",
                    },
                  ].map(({ action, supplier, amount, time }) => (
                    <div
                      key={supplier}
                      className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">{action}</p>
                        <p className="text-xs text-slate-400">{supplier}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-semibold text-brand-gold">{amount}</p>
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