"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container, Section } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Users, TrendingUp, AlertCircle, CheckCircle2, RefreshCw, Clock } from "lucide-react";
import { admin, sellers, type ApiSeller, ApiError } from "@/lib/api";

export default function AdminDashboard() {
  const [pendingSellers, setPendingSellers] = useState<ApiSeller[]>([]);
  const [approvedSellers, setApprovedSellers] = useState<ApiSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [pending, approved] = await Promise.all([
        admin.pendingSellers(),
        sellers.list(),
      ]);
      setPendingSellers(pending.filter((s) => s.approval_status === "pending"));
      setApprovedSellers(approved);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-KE", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const stats = [
    {
      icon: Users,
      label: "Total Sellers",
      value: String(pendingSellers.length + approvedSellers.length),
      subtext: "On platform",
    },
    {
      icon: TrendingUp,
      label: "Total Volume",
      value: "—",
      subtext: "Coming soon",
    },
    {
      icon: AlertCircle,
      label: "Pending Verifications",
      value: String(pendingSellers.length),
      subtext: "Awaiting review",
      highlight: pendingSellers.length > 0,
    },
    {
      icon: CheckCircle2,
      label: "Verified Sellers",
      value: String(approvedSellers.length),
      subtext: "Active",
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-slate-400 text-sm">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadStats} size="sm">
            <RefreshCw size={14} className="mr-1" /> Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <Section spacing="md">
        <Container size="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ icon: Icon, label, value, subtext, highlight }) => (
              <Card key={label} className={highlight ? "border-warning/30" : ""}>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Seller Verifications</CardTitle>
                <CardDescription>Sellers awaiting account approval</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/verify">Review All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingSellers.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-success" />
                  <p className="text-sm">All caught up — no pending verifications.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingSellers.slice(0, 5).map((seller) => (
                    <div key={seller.id} className="flex items-center justify-between p-3 border border-slate-700/50 rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{seller.store_name}</p>
                          <Badge variant="warning" className="text-xs">Pending</Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          {seller.user?.full_name || seller.user?.username} • {seller.location || "No location"}
                        </p>
                      </div>
                      <div className="text-right space-y-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>{formatDate(seller.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingSellers.length > 5 && (
                    <p className="text-xs text-slate-400 text-center">
                      +{pendingSellers.length - 5} more pending
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </Container>
      </Section>
    </DashboardLayout>
  );
}
