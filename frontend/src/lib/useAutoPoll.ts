"use client";

import { useEffect, useRef } from "react";

interface AutoPollOptions {
  intervalMs?: number;
  enabled?: boolean;
}

/**
 * Automatically triggers background polling on an interval.
 * - Pauses execution when browser tab is inactive / hidden (`document.hidden`).
 * - Immediately fires an update when the tab is refocused or visible again.
 * - Calls `callback(true)` where `true` indicates a silent background refresh.
 */
export function useAutoPoll(
  callback: (silent: boolean) => void | Promise<void>,
  options: AutoPollOptions = {}
) {
  const { intervalMs = 5000, enabled = true } = options;
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    let timer: NodeJS.Timeout | null = null;

    const tick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        cbRef.current(true);
      } catch {
        // Suppress background tick errors
      }
    };

    timer = setInterval(tick, intervalMs);

    const handleVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        try {
          cbRef.current(true);
        } catch {}
      }
    };

    const handleFocus = () => {
      try {
        cbRef.current(true);
      } catch {}
    };

    if (typeof window !== "undefined") {
      window.addEventListener("visibilitychange", handleVisibility);
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (typeof window !== "undefined") {
        window.removeEventListener("visibilitychange", handleVisibility);
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, [intervalMs, enabled]);
}
