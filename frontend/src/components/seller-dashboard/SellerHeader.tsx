import { Store, BadgeCheck, MapPin, Phone, Clock3 } from "lucide-react";

interface SellerHeaderProps {
  shopName: string;
  sellerName: string;
  status: string;
  location?: string;
  phoneNumber?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  needs_info: "Needs More Info",
  rejected: "Rejected",
};

export function SellerHeader({ shopName, sellerName, status, location, phoneNumber }: SellerHeaderProps) {
  const firstName = sellerName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const normalizedStatus = status.toLowerCase();
  const isApproved = normalizedStatus === "approved";
  const statusLabel = STATUS_LABELS[normalizedStatus];

  return (
    <div className="min-w-0">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight truncate">
        {greeting}, {firstName}
      </h1>

      <div className="flex items-center gap-1.5 mt-2 min-w-0">
        <Store className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
        <span className="text-sm sm:text-base font-semibold text-text-secondary truncate">{shopName}</span>
        {isApproved && <BadgeCheck className="w-4 h-4 text-info shrink-0" aria-hidden="true" />}
        {statusLabel && (
          <span className="flex items-center gap-1 bg-warning/12 text-warning text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md shrink-0">
            <Clock3 className="w-3 h-3" aria-hidden="true" /> {statusLabel}
          </span>
        )}
      </div>

      {(location || phoneNumber) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs sm:text-sm text-text-muted">
          {location && (
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </span>
          )}
          {phoneNumber && (
            <a href={`tel:${phoneNumber}`} className="flex items-center gap-1.5 font-semibold text-role hover:opacity-80 shrink-0">
              <Phone className="w-3.5 h-3.5" aria-hidden="true" /> {phoneNumber}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
