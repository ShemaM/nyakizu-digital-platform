import { cn } from "@/lib/cn";
import type {
  OrderStatus,
  ApprovalStatus,
  RelationshipStatus,
  Availability,
} from "@/lib/dummy-data";

type AnyStatus = OrderStatus | ApprovalStatus | RelationshipStatus | Availability;

interface StatusConfig {
  dot:   string;
  bg:    string;
  text:  string;
  label: string;
  pulse?: boolean;
}

const CONFIG: Record<string, StatusConfig> = {
  draft:          { dot: "bg-slate-400",   bg: "bg-slate-100",   text: "text-slate-600",  label: "Draft"             },
  submitted:      { dot: "bg-blue-500",    bg: "bg-blue-50",     text: "text-blue-700",   label: "Submitted",        pulse: true },
  sourcing:       { dot: "bg-amber-500",   bg: "bg-amber-50",    text: "text-amber-700",  label: "Sourcing",         pulse: true },
  locked:         { dot: "bg-indigo-400",  bg: "bg-indigo-50",   text: "text-indigo-700", label: "Locked"            },
  debt_active:    { dot: "bg-amber-500",   bg: "bg-amber-50",    text: "text-amber-700",  label: "Balance due",      pulse: true },
  cleared:        { dot: "bg-green-500",   bg: "bg-green-50",    text: "text-green-700",  label: "Cleared"           },
  cancelled:      { dot: "bg-red-400",     bg: "bg-red-50",      text: "text-red-600",    label: "Cancelled"         },
  pending:        { dot: "bg-amber-500",   bg: "bg-amber-50",    text: "text-amber-700",  label: "Pending",          pulse: true },
  approved:       { dot: "bg-green-500",   bg: "bg-green-50",    text: "text-green-700",  label: "Approved"          },
  rejected:       { dot: "bg-red-400",     bg: "bg-red-50",      text: "text-red-600",    label: "Rejected"          },
  denied:         { dot: "bg-red-400",     bg: "bg-red-50",      text: "text-red-600",    label: "Denied"            },
  available:      { dot: "bg-green-500",   bg: "bg-green-50",    text: "text-green-700",  label: "Available"         },
  can_be_sourced: { dot: "bg-blue-400",    bg: "bg-blue-50",     text: "text-blue-600",   label: "Can source"        },
  not_available:  { dot: "bg-slate-400",   bg: "bg-slate-100",   text: "text-slate-500",  label: "Unavailable"       },
};

const FALLBACK: StatusConfig = {
  dot: "bg-slate-400", bg: "bg-slate-100", text: "text-slate-600", label: "Unknown",
};

export function Badge({
  status,
  className,
}: {
  status: AnyStatus;
  className?: string;
}) {
  const cfg = CONFIG[status] ?? { ...FALLBACK, label: status };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-current/10",
        cfg.bg,
        cfg.text,
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          cfg.dot,
          cfg.pulse && "animate-status-pulse"
        )}
      />
      {cfg.label}
    </span>
  );
}
