import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white p-6 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-surface text-brand">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-sm font-black text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-body">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
