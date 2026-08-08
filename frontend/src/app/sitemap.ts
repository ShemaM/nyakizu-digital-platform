import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { BACKEND_ORIGIN, type ApiSeller } from "@/lib/api";

async function approvedStoreSlugs(): Promise<string[]> {
  try {
    // Direct fetch, not lib/api.ts's sellers.list() — this runs server-side
    // with no browser origin for that helper's relative API_BASE_URL ("/api")
    // to resolve against, so it needs the real backend URL directly.
    const res = await fetch(`${BACKEND_ORIGIN}/api/accounts/sellers/`, {
      // Sitemap is regenerated periodically, not on every request — new
      // stores don't need to appear within seconds.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    const list: ApiSeller[] = Array.isArray(data)
      ? data
      : Array.isArray((data as { results?: ApiSeller[] })?.results)
        ? (data as { results: ApiSeller[] }).results
        : [];
    // The list endpoint nests username under `user.username`, not as a
    // top-level field, despite what the ApiSeller type implies — checking
    // both keeps this working regardless of which shape actually shows up.
    return list.map((seller) => seller.user?.username || seller.username).filter((u): u is string => Boolean(u));
  } catch {
    // A sitemap that's missing the dynamic entries is far better than a
    // sitemap.xml that 500s because the backend hiccuped.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/help`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/register`, changeFrequency: "yearly", priority: 0.6 },
  ];

  const slugs = await approvedStoreSlugs();
  const storeEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/store/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...storeEntries];
}
