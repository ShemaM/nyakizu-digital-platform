import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { HomeContent } from "./HomeContent";

export const metadata: Metadata = {
  // Absolute, not a template string — the tab title should read as the
  // brand name on the homepage, not "<page> | Nyakizu Digital Market".
  title: { absolute: SITE_NAME },
  description:
    "Direct wholesale phone accessories trade platform for Nairobi suppliers and countrywide buyers. Track orders, sourcing, packing, and M-Pesa debt with zero monthly subscriptions.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
    title: `${SITE_NAME} — Trade with 100% Trust Across Kenya`,
  },
};

export default function Home() {
  return <HomeContent />;
}
