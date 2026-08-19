import { Phone } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardSection } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getStatusVariant, getStatusLabel, buyerDisplayName } from "@/lib/order-status";
import type { ApiOrder } from "@/lib/api";

interface OrderSummaryHeaderProps {
  order: ApiOrder;
  canCancel: boolean;
  onCancelClick: () => void;
}

/** Small, constant context shown above every stage — never the main focus of the screen. */
export function OrderSummaryHeader({ order, canCancel, onCancelClick }: OrderSummaryHeaderProps) {
  const name = buyerDisplayName(order);
  return (
    <Card className="animate-fade-in-up">
      <CardSection className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={name} size="lg" className="shrink-0" />
          <div className="min-w-0">
            <p className="text-body font-black text-text-primary truncate">{name}</p>
            {order.buyer_phone && (
              <a
                href={`tel:${order.buyer_phone}`}
                className="flex items-center gap-1.5 text-xs text-role font-bold mt-0.5 hover:opacity-80"
              >
                <Phone size={11} /> {order.buyer_phone}
              </a>
            )}
            <p className="text-xs text-text-muted mt-1 font-bold uppercase tracking-wide">
              Order #{order.id} · {new Date(order.created_at).toLocaleDateString("en-KE")}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant={getStatusVariant(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
          {canCancel && (
            <button
              onClick={onCancelClick}
              className="text-xs font-bold text-error hover:opacity-80 uppercase tracking-wide cursor-pointer"
            >
              Cancel Order
            </button>
          )}
        </div>
      </CardSection>
    </Card>
  );
}
