"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useActionAlerts } from "@/lib/useActionAlerts";

export function NotificationBell() {
  const { alerts, refresh, acknowledgeAlert } = useActionAlerts();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const totalCount = alerts.reduce((sum, a) => sum + a.count, 0);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) refresh();
        }}
        aria-label={totalCount > 0 ? `${totalCount} things need your attention` : "Notifications"}
        className="relative flex items-center justify-center w-10 h-10 rounded-full text-text-muted hover:text-text-primary hover:bg-dark-tertiary transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5" strokeWidth={totalCount > 0 ? 2.2 : 1.8} aria-hidden="true" />
        {totalCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-bold leading-none">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-dark-accent bg-dark-card shadow-2xl z-50 overflow-hidden animate-scale-in text-text-primary">
          <div className="px-4 py-3 border-b border-dark-accent">
            <p className="text-sm font-black text-text-primary">What needs you</p>
          </div>
          {alerts.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-muted text-center">Nothing new right now.</p>
          ) : (
            <div className="divide-y divide-dark-accent">
              {alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  onClick={() => {
                    setOpen(false);
                    acknowledgeAlert(alert.id);
                  }}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-dark-tertiary transition-colors"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-error/10 text-error text-xs font-black shrink-0">
                    {alert.count}
                  </span>
                  <span className="text-sm font-bold text-text-primary leading-snug">{alert.text}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
