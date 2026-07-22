"use client";

import { useState, useEffect } from "react";
import { MapPin, CheckCircle, XCircle, Store, Clock, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardSection } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { admin, type ApiSeller, ApiError } from "@/lib/api";

interface Decision {
  sellerId: number;
  action: "approve" | "reject";
}

export default function AdminVerifyPage() {
  const [sellers, setSellers] = useState<ApiSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Decision | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await admin.pendingSellers();
      setSellers(data);
    } catch (err) {
      console.error("Failed to load sellers:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load sellers.");
    } finally {
      setIsLoading(false);
    }
  };

  const decide = (sellerId: number, action: "approve" | "reject") => {
    setPending({ sellerId, action });
  };

  const confirmDecision = async () => {
    if (!pending) return;
    setSaving(true);
    try {
      if (pending.action === "approve") {
        await admin.approveSeller(pending.sellerId);
      } else {
        await admin.rejectSeller(pending.sellerId);
      }
      // Remove the decided seller from the list
      setSellers((prev) => prev.filter((s) => s.id !== pending.sellerId));
    } catch (err) {
      console.error("Action failed:", err);
      alert(err instanceof ApiError ? err.message : "Action failed. Please try again.");
    } finally {
      setSaving(false);
      setPending(null);
    }
  };

  const pendingSellers = sellers.filter((s) => s.approval_status === "pending");
  const rejectedSellers = sellers.filter((s) => s.approval_status === "rejected");

  const pendingDecision = pending
    ? sellers.find((s) => s.id === pending.sellerId)
    : null;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-KE", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <AppShell title="Seller Verification">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-slate-400 text-sm">Loading sellers...</div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Seller Verification">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadSellers} size="sm">
            <RefreshCw size={14} className="mr-1" /> Retry
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Seller Verification (${pendingSellers.length})`}>
      {/* Pending Section */}
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Pending Approval</h2>
          <Button variant="outline" size="sm" onClick={loadSellers}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
        </div>

        {pendingSellers.length === 0 && (
          <div className="bg-success/10 border border-success/20 rounded-xl px-4 py-6 text-center">
            <CheckCircle size={24} className="text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-success">All seller applications reviewed.</p>
            <p className="text-xs text-slate-400 mt-1">No pending sellers waiting for approval.</p>
          </div>
        )}

        {pendingSellers.map((seller) => (
          <Card key={seller.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Store size={16} className="text-brand-gold" />
                  <span className="font-semibold text-gray-900 text-sm">{seller.store_name}</span>
                  <Badge variant="warning" className="text-xs">Pending</Badge>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <MapPin size={12} /> {seller.location || "No location"}
                </div>
                {seller.store_description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{seller.store_description}</p>
                )}
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Clock size={11} /> Applied: {formatDate(seller.created_at)}
                </div>
              </div>
            </div>

            {seller.categories && seller.categories.length > 0 && (
              <CardSection>
                <p className="text-xs text-gray-400 mb-1.5">Categories</p>
                <div className="flex flex-wrap gap-1">
                  {seller.categories.map((cat) => (
                    <span key={cat} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              </CardSection>
            )}

            <CardSection>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => decide(seller.id, "reject")}
                  disabled={saving}
                >
                  <XCircle size={14} className="mr-1" /> Reject
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-brand-gold text-dark-primary hover:bg-brand-gold-light"
                  onClick={() => decide(seller.id, "approve")}
                  disabled={saving}
                >
                  <CheckCircle size={14} className="mr-1" /> Approve
                </Button>
              </div>
            </CardSection>
          </Card>
        ))}

        {/* Rejected Section */}
        {rejectedSellers.length > 0 && (
          <section className="space-y-2 mt-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
              Rejected ({rejectedSellers.length})
            </h2>
            {rejectedSellers.map((seller) => (
              <Card key={seller.id} className="opacity-70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{seller.store_name}</span>
                    <Badge variant="error" className="text-xs">Rejected</Badge>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(seller.created_at)}</span>
                </div>
              </Card>
            ))}
          </section>
        )}
      </div>

      <Dialog
        open={!!pending}
        title={pending?.action === "approve" ? "Approve this seller?" : "Reject this seller?"}
        message={
          pending?.action === "approve"
            ? `${pendingDecision?.store_name} will go live and appear to buyers.`
            : `${pendingDecision?.store_name} will be notified that their application was rejected.`
        }
        confirmLabel={pending?.action === "approve" ? "Yes, approve" : "Yes, reject"}
        variant={pending?.action === "reject" ? "danger" : "primary"}
        onConfirm={confirmDecision}
        onCancel={() => setPending(null)}
      />
    </AppShell>
  );
}
