/// <reference lib="webworker" />
/// <reference lib="esnext" />

/**
 * Nyakizu Digital Market — Service Worker (Serwist)
 *
 * Kept outside src/ on purpose: it runs in the ServiceWorkerGlobalScope
 * (self.skipWaiting, self.clients, caches, ...), which conflicts with the
 * DOM lib the rest of the app's tsconfig assumes. It's compiled
 * separately by scripts/build-sw.mjs (esbuild, not part of Next's own
 * Turbopack build) into public/sw.js — see that script for why.
 *
 * Strategy per route (first match wins):
 *  1. Public catalog reads (GET /products/, /products/categories/) → SWR.
 *     These are the ONLY /api/ routes that are both unauthenticated and
 *     not personalized per requester (checked backend/products/views.py's
 *     permission_classes) — everything else is session/cookie-authenticated.
 *  2. Every other /api/ request → NetworkOnly. This app is used from
 *     shared/kiosk-style devices in the trading community, so caching
 *     anything user-specific (orders, ledger, profile, relationships,
 *     admin) risks serving one person's data to the next person who picks
 *     up the same phone.
 *  3. Fonts → CacheFirst, long-lived.
 *  4. Next.js static build output / images/scripts/styles → CacheFirst.
 *  5. HTML navigations → NetworkFirst, falling back to the precached
 *     /offline route when the network is unreachable.
 */

import {
  CacheableResponsePlugin,
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";
import type { RuntimeCaching } from "serwist";

declare const self: ServiceWorkerGlobalScope;

// API calls are same-origin, proxied to the real Django backend via
// next.config.ts's rewrites() — see lib/api.ts's API_BASE_URL comment for
// why (cross-site cookies get blocked by Brave/Safari regardless of
// SameSite=None). That makes this a plain same-origin path check now,
// no build-time backend URL injection needed.
const isApiRequest = (url: URL) => url.origin === self.location.origin && url.pathname.startsWith("/api/");

const isPublicCatalogRead = (url: URL, request: Request) =>
  request.method === "GET" &&
  isApiRequest(url) &&
  (/\/products\/?$/.test(url.pathname) || /\/products\/categories\/?$/.test(url.pathname));

const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ url, request }) => isPublicCatalogRead(url, request),
    handler: new StaleWhileRevalidate({
      cacheName: "nyakizu-catalog-swr",
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 }),
      ],
    }),
  },
  {
    matcher: ({ url }) => isApiRequest(url),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ request, url }) => request.destination === "font" || url.pathname.includes("/fonts/"),
    handler: new CacheFirst({
      cacheName: "nyakizu-fonts",
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      ],
    }),
  },
  {
    matcher: ({ request, url }) =>
      url.origin === self.location.origin &&
      (url.pathname.startsWith("/_next/static/") || ["style", "script", "image"].includes(request.destination)),
    handler: new CacheFirst({
      cacheName: "nyakizu-static",
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      ],
    }),
  },
  {
    matcher: ({ request }) => request.mode === "navigate",
    handler: new NetworkFirst({
      cacheName: "nyakizu-pages",
      networkTimeoutSeconds: 8,
      plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
    }),
  },
];

const serwist = new Serwist({
  // Small, stable app-shell routes — precached on install so /offline (and
  // the sign-in entry points) work from a true cold start with no network.
  precacheEntries: ["/", "/offline", "/login", "/register"],
  skipWaiting: false, // never activate a new SW silently — see PWARegister.tsx
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Wakes the app layer's Dexie-backed offline draft-order queue once
// connectivity returns; the SW doesn't touch that queue itself. Background
// Sync isn't in the standard webworker lib typings, hence `any`.
self.addEventListener("sync", (event: any) => {
  if (event.tag === "sync-draft-orders") {
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients: Client[]) => {
        for (const client of clients) client.postMessage({ type: "SYNC_DRAFTS" });
      }),
    );
  }
});

// ── Web Push ──────────────────────────────────────────────────────────────
// Payload shape is whatever nyakizu/push.py sent: { title, body, url?, tag? }.
interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

self.addEventListener("push", (event: PushEvent) => {
  let payload: PushPayload = { title: "Nyakizu", body: "" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // Non-JSON push payload — fall back to the generic title/body above.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      // Reuse the same PWA icon the manifest already ships (src/app/manifest.ts)
      // rather than inventing a separate monochrome "badge" asset for now.
      icon: "/icons/icon-192.png",
      tag: payload.tag,
      data: { url: payload.url || "/" },
    }),
  );
});

// Tapping the notification focuses an already-open tab on that URL if one
// exists, instead of always opening a new one.
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients: WindowClient[]) => {
      const target = new URL(url, self.location.origin).href;
      for (const client of clients) {
        if (client.url === target && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(target);
    }),
  );
});
