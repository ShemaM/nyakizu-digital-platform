import type { BadgeProps } from "@/components/ui/Badge";
import type { ApiOrderStatusEvent } from "@/lib/api";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

const VARIANT_MAP: Record<string, BadgeVariant> = {
  submitted: "warning",
  sourcing: "info",
  locked: "default",
  debt_active: "error",
  cleared: "success",
  cancelled: "error",
  pending: "warning",
  draft: "outline",
};

// Short words for badges/lists — plain Kenyan English, not system jargon.
const LABEL_MAP: Record<string, string> = {
  submitted: "New",
  sourcing: "Packing",
  locked: "Ready",
  debt_active: "You Owe",
  cleared: "Paid",
  cancelled: "Cancelled",
  pending: "Pending",
  draft: "Draft",
};

export function getStatusVariant(status: string): BadgeVariant {
  return VARIANT_MAP[status] ?? "default";
}

export function getStatusLabel(status: string): string {
  return LABEL_MAP[status] ?? status;
}

/** Ordered progression used to render the order Timeline component. */
export const ORDER_PROGRESSION = ["submitted", "sourcing", "locked", "cleared"] as const;

// Full sentences for the tracker — this is what the buyer reads to
// understand where their order actually is, so it needs to stand on its
// own without any of the short badge words above.
const TRACKER_LABELS = [
  "Order Placed",
  "Seller is Packing Your Order",
  "Price Confirmed — Ready",
  "Paid in Full",
];

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface TrackerStep {
  label: string;
  done: boolean;
  current: boolean;
  date?: string;
}

/**
 * Builds the buyer-facing order tracker: one row per stage in
 * ORDER_PROGRESSION, each marked done/current, with a real date once
 * status_history has an event for that stage. "debt_active" reads as
 * "still on the Ready stage, working toward Paid" — it isn't its own
 * tracker row since the buyer is really just waiting to finish paying.
 */
export function orderTimelineSteps(status: string, statusHistory?: ApiOrderStatusEvent[]): TrackerStep[] {
  if (status === "cancelled") {
    return [{ label: "Order Cancelled", done: true, current: true }];
  }

  const effectiveStatus = status === "debt_active" ? "locked" : status;
  const currentIndex = ORDER_PROGRESSION.indexOf(effectiveStatus as (typeof ORDER_PROGRESSION)[number]);

  const dateByStatus = new Map<string, string>();
  for (const event of statusHistory ?? []) {
    const key = event.status === "debt_active" ? "locked" : event.status;
    if (!dateByStatus.has(key)) dateByStatus.set(key, event.created_at);
  }

  return ORDER_PROGRESSION.map((stepStatus, i) => {
    const done = currentIndex >= 0 && i <= currentIndex;
    const rawDate = dateByStatus.get(stepStatus);
    return {
      label: TRACKER_LABELS[i],
      done,
      current: i === currentIndex,
      date: rawDate ? formatEventDate(rawDate) : undefined,
    };
  });
}
