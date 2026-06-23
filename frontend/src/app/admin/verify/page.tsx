"use client";

import { useState } from "react";
import { MapPin, CheckCircle, XCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardSection } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SELLERS } from "@/lib/dummy-data";

type Decision = { sellerId: string; action: "approve" | "reject" } | null;

export default function AdminVerifyPage() {
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(SELLERS.map((s) => [s.id, s.approvalStatus]))
  );
  const [pending, setPending] = useState<Decision>(null);
  const [saving, setSaving] = useState(false);

  const pendingSellers = SELLERS.filter((s) => statuses[s.id] === "pending");
  const decidedSellers = SELLERS.filter((s) => statuses[s.id] !== "pending");

  function decide(sellerId: string, action: "approve" | "reject") {
    setPending({ sellerId, action });
  }

  function confirmDecision() {
    if (!pending) return;
    setSaving(true);
    setTimeout(() => {
      setStatuses((prev) => ({
        ...prev,
        [pending.sellerId]: pending.action === "approve" ? "approved" : "rejected",
      }));
      setPending(null);
      setSaving(false);
    }, 700);
  }

  const pendingDecision = pending
    ? SELLERS.find((s) => s.id === pending.sellerId)
    : null;

  return (
    <AppShell title={`Seller Verification (${pendingSellers.length})`}>
      {pendingSellers.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-sm font-medium text-green-700">All seller applications reviewed.</p>
        </div>
      )}

      {pendingSellers.map((seller) => (
        <Card key={seller.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">{seller.storeName}</span>
                <Badge status="pending" />
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <MapPin size={12} /> {seller.location}
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{seller.description}</p>
              <p className="text-xs text-gray-400 mt-1">Applied: {seller.joinedDate}</p>
            </div>
          </div>

          {seller.categories.length > 0 && (
            <CardSection>
              <p className="text-xs text-gray-400 mb-1.5">Categories</p>
              <div className="flex flex-wrap gap-1">
                {seller.categories.map((cat) => (
                  <span key={cat} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{cat}</span>
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
              >
                <XCircle size={14} /> Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => decide(seller.id, "approve")}
              >
                <CheckCircle size={14} /> Approve
              </Button>
            </div>
          </CardSection>
        </Card>
      ))}

      {decidedSellers.length > 0 && (
        <section className="space-y-2 mt-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Previously reviewed</h2>
          {decidedSellers.map((seller) => (
            <Card key={seller.id} className="opacity-70">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{seller.storeName}</span>
                <Badge status={statuses[seller.id] as "approved" | "rejected"} />
              </div>
            </Card>
          ))}
        </section>
      )}

      <Dialog
        open={!!pending}
        title={pending?.action === "approve" ? "Approve this seller?" : "Reject this seller?"}
        message={
          pending?.action === "approve"
            ? `${pendingDecision?.storeName} will go live and appear to buyers.`
            : `${pendingDecision?.storeName} will be notified that their application was rejected.`
        }
        confirmLabel={pending?.action === "approve" ? "Yes, approve" : "Yes, reject"}
        variant={pending?.action === "reject" ? "danger" : "primary"}
        onConfirm={confirmDecision}
        onCancel={() => setPending(null)}
      />
    </AppShell>
  );
}
