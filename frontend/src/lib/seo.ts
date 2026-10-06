

export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

export const SITE_NAME = "Nyakizu Digital Market";

/** Pages with no real search intent — logged-in dashboards, transactional
 * redirects, PWA fallbacks. Excluded from robots.txt crawling AND flagged
 * noindex on the page itself (defense in depth: robots.txt only stops
 * well-behaved crawlers, the meta tag stops indexing even if a page gets
 * reached some other way, e.g. a shared link). */
export const NOINDEX_ROBOTS = { index: false, follow: false } as const;
