"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A thin top-of-page progress bar that shows on every internal navigation —
 * the single global "something is happening" signal the rest of the app's
 * per-component loading states (Button spinners, page skeletons) don't
 * cover: the gap between "I clicked a link" and "the new page's own loading
 * state has even mounted yet." Turbopack's first compile of a route can
 * take several seconds with nothing else on screen to say the click landed.
 *
 * App Router has no built-in route-change events, so this listens for
 * clicks on internal links (the same signal next/link itself acts on) and
 * clears when the URL actually changes.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      // Same-page hash links (e.g. "#problem") don't trigger a route change.
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;

      start();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function start() {
    if (hideRef.current) clearTimeout(hideRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setVisible(true);
    setProgress(15);
    // Indeterminate creep toward — but never reaching — 90%, since we don't
    // know the real length of the route's compile+fetch.
    timerRef.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + (90 - p) * 0.12 : p));
    }, 200);
  }

  function finish() {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
  }

  // Fires whenever the resolved route actually changes — the real signal
  // that navigation completed, regardless of how long it took.
  useEffect(() => {
    finish();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-brand-gold shadow-[0_0_8px_rgba(200,134,10,0.6)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
