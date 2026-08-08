import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Everything below requires a login (proxy.ts already redirects
      // unauthenticated requests to /login, so a crawler couldn't see
      // real content here anyway) or is a transactional/utility page with
      // no search intent — disallowing keeps them out of the crawl budget
      // entirely, on top of the per-page noindex tags on the ones that
      // are technically reachable without auth (verify-email, the OAuth
      // redirect landing page, /offline).
      disallow: ["/buyer/", "/seller/", "/receipt/", "/verify-email", "/auth/", "/offline"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
