"use client";

import { useEffect, useState } from "react";
import { Container, Section } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { TrendingUp, Users, Zap, RefreshCw } from "lucide-react";
import { admin, fmtKES, ApiError, type AdminMetrics } from "@/lib/api";

export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await admin.dashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Overview">
        <PageSkeleton showKPIs listCount={0} />
      </DashboardLayout>
    );
  }

  if (error || !metrics) {
    return (
      <DashboardLayout title="Overview">
        <div className="flex flex-col items-center justify-center h-[50vh] gap-3 text-center px-4">
          <p className="text-sm text-text-muted">{error || "Live data isn't available yet."}</p>
          <Button onClick={load} size="sm" variant="outline">
            <RefreshCw size={14} className="mr-1.5" /> Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const periods = [
    { title: "Last 7 days", data: metrics.last_7_days },
    { title: "Last 30 days", data: metrics.last_30_days },
  ];

  return (
    <DashboardLayout title="Overview">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          <div>
            <h2 className="text-title-lg font-bold text-text-primary">Platform Overview</h2>
            <p className="text-body text-text-muted mt-1">
              {metrics.total_users} people on the platform · {metrics.total_orders} orders total · {fmtKES(metrics.total_volume)} lifetime volume
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {periods.map(({ title, data }) => (
              <Card key={title}>
                <CardHeader>
                  <CardTitle className="text-title">{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-role" />
                        <span className="text-body text-text-muted">New people</span>
                      </div>
                      <span className="font-bold text-text-primary">{data.new_users}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-role" />
                        <span className="text-body text-text-muted">Orders placed</span>
                      </div>
                      <span className="font-bold text-text-primary">{data.transactions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-role" />
                        <span className="text-body text-text-muted">Trade volume</span>
                      </div>
                      <span className="font-bold text-role text-title">{fmtKES(data.volume)}</span>
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
