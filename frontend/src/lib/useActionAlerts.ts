"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { orders, relationships, parsePrice } from "@/lib/api";

export interface ActionAlert {
  id: string;
  count: number;
  text: string;
  href: string;
}

const POLL_MS = 45000;

/**
 * Plain-language "things that need you" alerts shown from the header bell.
 * Deliberately derived from existing status fields (submitted orders,
 * pending buyer requests, unpaid debts) rather than a stored read/unread
 * flag — an alert only clears once the seller/buyer actually acts on it
 * (e.g. starts packing, approves the buyer), which is a truer signal for
 * this audience than "has been seen".
 */
export function useActionAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ActionAlert[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      return;
    }

    try {
      if (user.role === "seller") {
        const [orderList, relationshipList] = await Promise.all([
          orders.sellerList(),
          relationships.mine(),
        ]);

        const newOrders = orderList.filter((o) => o.status === "submitted");
        const pendingBuyers = relationshipList.filter((r) => r.status === "pending");

        const next: ActionAlert[] = [];
        if (newOrders.length > 0) {
          next.push({
            id: "new-orders",
            count: newOrders.length,
            text: newOrders.length === 1 ? "1 new order needs packing" : `${newOrders.length} new orders need packing`,
            href: "/seller/dashboard/orders",
          });
        }
        if (pendingBuyers.length > 0) {
          next.push({
            id: "buyer-requests",
            count: pendingBuyers.length,
            text: pendingBuyers.length === 1 ? "1 buyer wants to join your shop" : `${pendingBuyers.length} buyers want to join your shop`,
            href: "/seller/dashboard/buyers",
          });
        }
        setAlerts(next);
      } else if (user.role === "buyer") {
        const debtOrders = await orders.buyerDebts();
        const owing = debtOrders.filter((o) => parsePrice(o.balance ?? 0) > 0);

        const next: ActionAlert[] = [];
        if (owing.length > 0) {
          next.push({
            id: "debts",
            count: owing.length,
            text: owing.length === 1 ? "1 order is ready — pay now" : `${owing.length} orders are ready — pay now`,
            href: "/buyer/debts",
          });
        }
        setAlerts(next);
      } else {
        setAlerts([]);
      }
    } catch {
      // Best-effort — a failed poll just means the bell stays as it was.
    }
  }, [user]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return { alerts, refresh };
}
