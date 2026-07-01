import { Container, Section } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, Users, Zap } from "lucide-react";

export default function AdminAnalytics() {
  const metrics = [
    {
      period: "Last 7 days",
      newUsers: 42,
      transactions: 234,
      volume: "KES 1.2M",
    },
    {
      period: "Last 30 days",
      newUsers: 156,
      transactions: 892,
      volume: "KES 4.8M",
    },
  ];

  return (
    <DashboardLayout title="Analytics">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Platform Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map(({ period, newUsers, transactions, volume }) => (
              <Card key={period}>
                <CardHeader>
                  <CardTitle className="text-lg">{period}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-brand-gold" />
                        <span className="text-slate-400">New Users</span>
                      </div>
                      <span className="font-bold text-white">{newUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-brand-gold" />
                        <span className="text-slate-400">Transactions</span>
                      </div>
                      <span className="font-bold text-white">{transactions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-brand-gold" />
                        <span className="text-slate-400">Trade Volume</span>
                      </div>
                      <span className="font-bold text-brand-gold text-lg">{volume}</span>
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