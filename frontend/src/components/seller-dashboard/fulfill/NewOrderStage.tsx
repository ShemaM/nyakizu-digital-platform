import { Package } from "lucide-react";
import { Card, CardSection } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fmtKES, type ApiOrderItem } from "@/lib/api";

interface NewOrderStageProps {
  items: ApiOrderItem[];
  onStart: () => void;
  isSaving: boolean;
}

/**
 * The very first screen a seller sees for a new order — a plain read-only
 * list (no checkboxes yet, packing hasn't started) and one button. Nothing
 * else competes for attention here.
 */
export function NewOrderStage({ items, onStart, isSaving }: NewOrderStageProps) {
  return (
    <>
      <Card className="mt-3 animate-fade-in-up delay-75">
        <CardSection>
          <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
            <Package size={12} /> What They Ordered
          </p>
          <div className="space-y-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 p-2.5">
                <span className="text-sm font-bold text-text-primary leading-snug">
                  {item.product_name || `Product #${item.product_id}`}
                </span>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-text-primary">× {item.quantity}</p>
                  {item.unit_price != null && (
                    <p className="text-xs text-text-muted font-bold">{fmtKES(item.unit_price)} ea</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardSection>
      </Card>

      <div className="py-4">
        <Button
          variant="role"
          className="w-full rounded-xl font-black text-sm py-4 h-auto"
          loading={isSaving}
          onClick={onStart}
        >
          Start Packing
        </Button>
      </div>
    </>
  );
}
