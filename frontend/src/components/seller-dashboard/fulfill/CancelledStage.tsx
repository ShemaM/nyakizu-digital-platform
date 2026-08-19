import { Ban } from "lucide-react";
import { Card, CardSection } from "@/components/ui/Card";

/** A cancelled order has nothing left to act on — just say so plainly. */
export function CancelledStage() {
  return (
    <Card className="mt-3 animate-fade-in-up delay-75">
      <CardSection className="flex flex-col items-center text-center py-8">
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-error/10 text-error mb-3">
          <Ban size={28} />
        </span>
        <p className="text-lg font-black text-text-primary">Order Cancelled</p>
        <p className="text-sm text-text-muted mt-1">This order was cancelled. Nothing else to do here.</p>
      </CardSection>
    </Card>
  );
}
