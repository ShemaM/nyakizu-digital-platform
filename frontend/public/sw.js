/**
 * Nyakizu Digital Market — Service Worker
 *
 * Strategy:
 *  - App shell + static assets  → Cache-first (served instantly offline)
 *  - API calls (/api/**)        → Network-first, no cache (fresh data always)
 *  - Navigation (HTML pages)    → Network-first, fall back to /offline on failure
 *  - Images                     → Cache-first with expiry via cache name versioning
 *
 * Offline draft orders are handled separately via IndexedDB (Dexie.js) in the
 * app layer — this SW does not touch that queue.
 */

const CACHE_VERSION = "v1";
const SHELL_CACHE = `nyakizu-shell-${CACHE_VERSION}`;
const IMAGE_CACHE = `nyakizu-images-${CACHE_VERSION}`;

/** App shell assets to pre-cache on install */
const SHELL_ASSETS = [
  "/",
  "/offline",
  "/login",
  "/register",
];

// ─── Install: pre-cache shell ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: delete old caches ──────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== IMAGE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: route-based strategy ─────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET and cross-origin requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // 2. API calls → network-only (never cache sensitive trade/ledger data)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  // 3. Images → cache-first
  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // 4. Navigation (page loads) → network-first, offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // 5. JS/CSS/fonts → cache-first (versioned by Next.js build hash)
  event.respondWith(cacheFirst(request, SHELL_CACHE));
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Serve from cache; fetch and cache if missing */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

/**
 * Try network first.
 * On failure serve cached version.
 * On total failure serve /offline page.
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    // Cache successful navigations for later offline use
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    // Last resort: the offline page (pre-cached on install)
    const offline = await cache.match("/offline");
    return offline ?? new Response("You are offline", { status: 503 });
  }
}

// ─── Background sync hook (future: draft order queue) ────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-draft-orders") {
    // The app layer (Dexie.js queue) handles the actual sync logic.
    // This event simply wakes the SW so the app can process the queue.
    event.waitUntil(
      self.clients
        .matchAll({ type: "window" })
        .then((clients) =>
          clients.forEach((c) => c.postMessage({ type: "SYNC_DRAFTS" }))
        )
    );
  }
});