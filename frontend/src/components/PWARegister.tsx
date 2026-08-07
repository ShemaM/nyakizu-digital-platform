"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { Serwist } from "@serwist/window";

/**
 * Registers the Serwist service worker in production and surfaces a
 * dismissible "new version available" banner instead of activating (and
 * silently swapping out running JS) the moment an update is installed —
 * skipWaiting is off in sw-src/sw.ts specifically so this prompt is the
 * only thing that can trigger it.
 */
export function PWARegister() {
  const [updateReady, setUpdateReady] = useState(false);
  const [serwist, setSerwist] = useState<Serwist | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Never register (and actively clean up) a service worker in dev —
    // Turbopack's chunk hashes change on every rebuild, but a live SW
    // keeps serving its precached versions, which causes chunk-load
    // errors and hydration mismatches against the fresh dev server.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    const sw = new Serwist("/sw.js", { scope: "/" });

    sw.addEventListener("waiting", () => setUpdateReady(true));
    sw.addEventListener("controlling", () => window.location.reload());
    sw.addEventListener("message", (event) => {
      if (event.data?.type === "SYNC_DRAFTS") {
        window.dispatchEvent(new CustomEvent("nyakizu:sync-drafts"));
      }
    });

    void sw.register().then((registration) => {
      if (!registration) return;
      window.addEventListener("online", async () => {
        if ("sync" in registration) {
          try {
            await (registration as any).sync.register("sync-draft-orders");
          } catch {
            // Background Sync not supported — app layer handles via online event
          }
        }
        window.dispatchEvent(new CustomEvent("nyakizu:sync-drafts"));
      });
    });

    setSerwist(sw);
  }, []);

  const applyUpdate = useCallback(() => {
    serwist?.messageSkipWaiting();
    setUpdateReady(false);
  }, [serwist]);

  if (!updateReady) return null;

  return (
    <div
      role="status"
      className="fixed left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-xl border border-info/30 bg-white p-3 shadow-2xl animate-toast-in"
      style={{ top: "calc(1rem + env(safe-area-inset-top))" }}
    >
      <RefreshCw size={18} className="shrink-0 text-info" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium text-text-primary">
        A new version of Nyakizu is ready.
      </p>
      <button
        onClick={applyUpdate}
        className="shrink-0 rounded-lg bg-info px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-info/90"
      >
        Update
      </button>
      <button
        onClick={() => setUpdateReady(false)}
        aria-label="Dismiss update notification"
        className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}
