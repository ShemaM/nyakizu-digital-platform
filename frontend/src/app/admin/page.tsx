import { Container, Section } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Users, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <Section spacing="md">
        <Container size="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: Users,
                label: "Total Users",
                value: "342",
                subtext: "+12 this week",
              },
              {
                icon: TrendingUp,
                label: "Total Volume",
                value: "KES 2.4M",
                subtext: "This month",
              },
              {
                icon: AlertCircle,
                label: "Pending Verifications",
                value: "8",
                subtext: "Awaiting review",
              },
              {
                icon: CheckCircle2,
                label: "Verified Sellers",
                value: "156",
                subtext: "Active",
              },
            ].map(({ icon: Icon, label, value, subtext }) => (
              <Card key={label}>
                <CardContent className="pt-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-gold" />
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

          {/* Pending Verifications */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Seller Verifications</CardTitle>
              <CardDescription>Sellers awaiting account approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { seller: "TechPlus Store", owner: "Ali Hassan", location: "RNG Plaza", submitted: "2 days ago" },
                  { seller: "Mobile World", owner: "Sarah Okonkwo", location: "Westlands", submitted: "1 day ago" },
                ].map(({ seller, owner, location, submitted }) => (
                  <div key={seller} className="flex items-center justify-between p-3 border border-slate-700/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{seller}</p>
                      <p className="text-xs text-slate-400">{owner} • {location}</p>
                    </div>
                    <div className="text-right space-y-1 text-xs text-slate-400">
                      <p>{submitted}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </DashboardLayout>
  );
}