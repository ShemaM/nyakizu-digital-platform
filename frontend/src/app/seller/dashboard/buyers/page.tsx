"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { relationships, type ApiRelationship, ApiError } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RefreshCw, Users, CheckCircle, XCircle, Clock, User } from "lucide-react";

export default function SellerBuyersPage() {
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
      setError(err instanceof ApiError ? err.message : "Failed to load buyers.");
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
      alert(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setActingId(null);
    }
  };

  const pending = buyerRels.filter((r) => r.status === "pending");
  const approved = buyerRels.filter((r) => r.status === "approved");
  const denied = buyerRels.filter((r) => r.status === "denied");

  if (isLoading) {
    return (
      <DashboardLayout title="My Buyers">
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingScreen />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="My Buyers">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadBuyers} size="sm">Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Buyers">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-5 h-5 text-brand-gold mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{approved.length}</p>
              <p className="text-xs text-slate-400">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-5 h-5 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{pending.length}</p>
              <p className="text-xs text-slate-400">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <XCircle className="w-5 h-5 text-error mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{denied.length}</p>
              <p className="text-xs text-slate-400">Denied</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Buyer Access Requests</h2>
          <Button variant="outline" size="sm" onClick={loadBuyers}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-warning uppercase tracking-wide">Pending Approval</h3>
            {pending.map((rel) => (
              <Card key={rel.id} className="border-warning/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                        <User size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{rel.buyer_name || "Unknown buyer"}</p>
                        <p className="text-xs text-slate-400">{rel.buyer_phone || "No phone"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error hover:text-error"
                        onClick={() => setConfirmAction({ id: rel.id, action: "deny" })}
                        disabled={actingId === rel.id}
                      >
                        <XCircle size={14} className="mr-1" /> Deny
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setConfirmAction({ id: rel.id, action: "approve" })}
                        disabled={actingId === rel.id}
                      >
                        <CheckCircle size={14} className="mr-1" /> Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* Approved */}
        {approved.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-success uppercase tracking-wide">Approved Buyers</h3>
            {approved.map((rel) => (
              <Card key={rel.id} className="opacity-80">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                        <User size={18} className="text-success" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{rel.buyer_name || "Unknown buyer"}</p>
                        <p className="text-xs text-slate-400">{rel.buyer_phone || "No phone"}</p>
                      </div>
                    </div>
                    <Badge variant="success" className="text-xs">
                      <CheckCircle size={12} className="mr-1" /> Approved
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {buyerRels.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-sm">No buyer requests yet.</p>
            <p className="text-xs mt-1">Buyers will appear here when they request access to your store.</p>
          </div>
        )}
      </div>

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
    </DashboardLayout>
  );
}
