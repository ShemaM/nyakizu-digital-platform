"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const DISMISSED_KEY = "nyakizu:install-prompt-dismissed";

/**
 * A single dismissible banner that covers both install paths:
 * the native beforeinstallprompt flow (Chrome/Edge/Android) and, since
 * Safari never fires that event, manual "Share -> Add to Home Screen"
 * instructions for iOS.
 */
export function InstallPrompt() {
  const { canInstall, needsIOSInstructions, isStandalone, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISSED_KEY) === "1");
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  if (isStandalone || dismissed || !(canInstall || needsIOSInstructions)) return null;

  return (
    <div
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xl"
      role="complementary"
      aria-label="Install Nyakizu"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-role-soft text-role">
        <Download size={16} aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">Install Nyakizu</p>
        {canInstall ? (
          <p className="mt-0.5 text-xs text-text-muted">
            Add it to your home screen for faster, offline-ready access.
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-text-muted">
            Tap <Share size={12} className="inline -mt-0.5" aria-hidden="true" /> Share, then{" "}
            <SquarePlus size={12} className="inline -mt-0.5" aria-hidden="true" /> &quot;Add to Home Screen&quot;.
          </p>
        )}

        {canInstall && (
          <button
            onClick={async () => {
              await promptInstall();
              dismiss();
            }}
            className="mt-2 rounded-lg bg-role px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Add to Home Screen
          </button>
        )}
      </div>

      <button
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}
