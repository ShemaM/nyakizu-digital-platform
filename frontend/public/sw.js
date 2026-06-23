const CACHE_VERSION = "v2";
const CACHE_NAME = `nyakizu-shell-${CACHE_VERSION}`;

// App shell URLs (Next build will also be cached by the runtime rules below)
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icon.svg",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL);
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        }),
      );
      await self.clients.claim();
    })(),
  );
});

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
}

function isStaticAsset(requestUrl) {
  return (
    requestUrl.pathname.startsWith("/_next/") ||
    requestUrl.pathname.startsWith("/static/") ||
    requestUrl.pathname.endsWith(".css") ||
    requestUrl.pathname.endsWith(".js") ||
    requestUrl.pathname.endsWith(".svg") ||
    requestUrl.pathname.endsWith(".png") ||
    requestUrl.pathname.endsWith(".jpg") ||
    requestUrl.pathname.endsWith(".ico")
  );
}

// Runtime caching strategy:
// - Navigations: cache-first with offline fallback to /
// - Static assets: stale-while-revalidate-ish (serve cached if present; fetch+cache if possible)
// - Everything else: network-first
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const request = event.request;
      const url = new URL(request.url);

      if (isNavigationRequest(request)) {
        const cached = await caches.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const fallback = await caches.match("/");
          if (fallback) return fallback;
          throw new Error("Network unavailable");
        }
      }

      if (isStaticAsset(url)) {
        const cached = await caches.match(request);
        if (cached) {
          // Update cache in background
          fetch(request)
            .then((res) => {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, res.clone()));
            })
            .catch(() => {});
          return cached;
        }

        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          // If asset missing in cache and offline, fail to cached fallback when possible
          throw new Error("Network unavailable");
        }
      }

      // Default: network-first
      try {
        return await fetch(request);
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw new Error("Network unavailable");
      }
    })(),
  );
});

