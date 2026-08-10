"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Avatar } from "@/components/ui/Avatar";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { relationships, type ApiRelationship, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { RefreshCw, Users, CheckCircle, XCircle, Clock } from "lucide-react";

export default function SellerBuyersPage() {
  const { toast } = useToast();
  const [buyerRels, setBuyerRels] = useState<ApiRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: number; action: "approve" | "deny" } | null>(null);

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await relationships.mine();
      setBuyerRels(data);
    } catch (err) {
      console.error("Failed to load buyers:", err);
      setError(err instanceof ApiError ? err.message : "We could not load your buyers.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!confirmAction) return;
    setActingId(confirmAction.id);
    try {
      await relationships.resolve(confirmAction.id, confirmAction.action);
      setConfirmAction(null);
      await loadBuyers();
    } catch (err) {
      console.error("Action failed:", err);
      toast(err instanceof ApiError ? err.message : "That did not work. Please try again.", "error");
    } finally {
      setActingId(null);
    }
  };

  const pending = buyerRels.filter((r) => r.status === "pending");
  const approved = buyerRels.filter((r) => r.status === "approved");
  const denied = buyerRels.filter((r) => r.status === "denied");

  if (isLoading) {
    return (
      <AppShell title="My Buyers">
        <PageSkeleton showKPIs listCount={3} />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="My Buyers">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadBuyers} size="sm">Retry</Button>
        </div>
      </AppShell>
    );
  }

  const STAT_CARDS = [
    { label: "Approved", value: approved.length, Icon: Users, color: "text-role", bg: "bg-role-soft" },
    { label: "Pending", value: pending.length, Icon: Clock, color: "text-warning", bg: "bg-warning/12" },
    { label: "Denied", value: denied.length, Icon: XCircle, color: "text-error", bg: "bg-error/12" },
  ].filter((card) => card.value > 0); // zero is not shown

  return (
    <AppShell title="My Buyers">
      <Section spacing="md">
        <Container size="xl" className="space-y-8">
          <SectionHeading
            eyebrow="Buyers"
            title="Who buys from you"
            description="Approve new buyers before they can place orders from your store."
            action={
              <Button variant="outline" size="lg" onClick={loadBuyers} className="gap-2">
                <RefreshCw size={16} /> Refresh
              </Button>
            }
          />

          {/* Stats */}
          {STAT_CARDS.length > 0 && (
            <div className={`grid gap-4 ${STAT_CARDS.length === 1 ? "grid-cols-1" : STAT_CARDS.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {STAT_CARDS.map(({ label, value, Icon, color, bg }) => (
                <Card key={label}>
                  <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center gap-2">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-text-primary">{value}</p>
                    <p className="text-xs sm:text-sm font-semibold text-text-muted">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <SectionHeading eyebrow="Action needed" title="Pending approval" description="These buyers are waiting to hear back from you." />
              <div className="space-y-3">
                {pending.map((rel) => (
                  <Card key={rel.id} className="border-warning/30">
                    <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar name={rel.buyer_name || "?"} size="lg" />
                        <div>
                          <p className="text-body font-bold text-text-primary">{rel.buyer_name || "Unknown buyer"}</p>
                          <p className="text-caption text-text-muted mt-0.5">{rel.buyer_phone || "No phone"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="lg"
                          className="text-error border-error/30 hover:bg-error/5"
                          onClick={() => setConfirmAction({ id: rel.id, action: "deny" })}
                          disabled={actingId === rel.id}
                        >
                          <XCircle size={16} className="mr-1.5" /> Deny
                        </Button>
                        <Button
                          variant="role"
                          size="lg"
                          onClick={() => setConfirmAction({ id: rel.id, action: "approve" })}
                          disabled={actingId === rel.id}
                        >
                          <CheckCircle size={16} className="mr-1.5" /> Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Approved */}
          {approved.length > 0 && (
            <div>
              <SectionHeading title="Approved buyers" description="These buyers can place orders from your store." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {approved.map((rel) => (
                  <Card key={rel.id}>
                    <CardContent className="p-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={rel.buyer_name || "?"} size="md" />
                        <div className="min-w-0">
                          <p className="text-body font-semibold text-text-primary truncate">{rel.buyer_name || "Unknown buyer"}</p>
                          <p className="text-caption text-text-muted">{rel.buyer_phone || "No phone"}</p>
                        </div>
                      </div>
                      <Badge variant="success" className="shrink-0">
                        <CheckCircle size={12} className="mr-1" /> Approved
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {buyerRels.length === 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-text-muted flex flex-col items-center justify-center min-h-[260px]">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-body font-bold text-text-secondary">No buyer requests yet</p>
              <p className="text-caption text-text-muted mt-1">Buyers will appear here when they request access to your store.</p>
            </div>
          )}
        </Container>
      </Section>

      <Dialog
        open={!!confirmAction}
        title={confirmAction?.action === "approve" ? "Approve this buyer?" : "Deny this buyer?"}
        message={
          confirmAction?.action === "approve"
            ? "This buyer will be able to place orders from your store."
            : "This buyer will be blocked from placing orders from your store."
        }
        confirmLabel={confirmAction?.action === "approve" ? "Yes, Approve" : "Yes, Deny"}
        variant={confirmAction?.action === "deny" ? "danger" : "primary"}
        onConfirm={handleResolve}
        onCancel={() => setConfirmAction(null)}
      />
    </AppShell>
  );
}
