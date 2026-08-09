import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { HomeContent } from "./HomeContent";

export const metadata: Metadata = {
  // Absolute, not a template string — the tab title should read as the
  // brand name on the homepage, not "<page> | Nyakizu Digital Market".
  title: { absolute: SITE_NAME },
  description:
    "Free trade platform for Nairobi phone accessories wholesalers and their buyers — track orders, stock, and debts without WhatsApp chaos or paper notebooks.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
    title: `${SITE_NAME} — Wholesale Phone Accessories Trade, Digitized`,
  },
};

export default function Home() {
  return <HomeContent />;
}
