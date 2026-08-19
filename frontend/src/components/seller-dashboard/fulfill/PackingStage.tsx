import { Package, AlertTriangle } from "lucide-react";
import { Card, CardSection } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PackingChecklist } from "@/components/seller-dashboard/PackingChecklist";
import { fmtKES, type ApiOrder, type ApiOrderItem } from "@/lib/api";

interface PackingStageProps {
  orderId: number;
  items: ApiOrderItem[];
  onOrderUpdated: (order: ApiOrder) => void;
  packedCount: number;
  packableCount: number;
  allPacked: boolean;
  displayTotal: number;
  pendingPricing: boolean;
  pendingCount: number;
  onSendPrice: () => void;
}

/**
 * The one screen a seller spends the most time on — packing and pricing.
 * Nothing else is on it: no payment section, no old confirmed steps. Once
 * they tap "Send Price to Buyer" the page moves on to the Payment stage.
 */
export function PackingStage({
  orderId,
  items,
  onOrderUpdated,
  packedCount,
  packableCount,
  allPacked,
  displayTotal,
  pendingPricing,
  pendingCount,
  onSendPrice,
}: PackingStageProps) {
  return (
    <>
      <Card className="mt-3 animate-fade-in-up delay-75">
        <CardSection>
          <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
            <Package size={12} /> Pack The Order
          </p>
          <p className="text-xs text-text-secondary mb-4">Tick each item as you pack it.</p>
          <PackingChecklist
            orderId={orderId}
            items={items}
            interactive
            onOrderUpdated={onOrderUpdated}
          />
        </CardSection>

        <CardSection className="border-t border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-text-muted uppercase tracking-widest">
              {pendingPricing ? "Total So Far" : "Total"}
            </span>
            <span className="text-sm font-black text-text-primary">{fmtKES(displayTotal)}</span>
          </div>
          {pendingPricing && (
            <p className="text-xs text-warning font-semibold mt-1">
              {pendingCount} item{pendingCount !== 1 ? "s" : ""} still {pendingCount !== 1 ? "need" : "needs"} a price.
            </p>
          )}
        </CardSection>
      </Card>

      <div className="py-4 space-y-2">
        {!allPacked && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-text-muted justify-center pb-1">
            <AlertTriangle size={12} className="text-warning shrink-0" />
            {packedCount} of {packableCount} packed. You can still send the price now.
          </p>
        )}
        <Button
          variant="dark"
          className="w-full rounded-xl font-black text-sm py-4 h-auto"
          onClick={onSendPrice}
        >
          Send Price to Buyer
        </Button>
      </div>
    </>
  );
}
