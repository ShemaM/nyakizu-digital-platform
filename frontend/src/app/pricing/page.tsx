import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { PricingContent } from "./PricingContent";

export const metadata: Metadata = {
  title: "Pricing & Fees | Nyakizu Digital Market",
  description:
    "Zero monthly subscription. Pay only KSh 50 to KSh 100 per order when you pack. Retail buyers and hawkers across Kenya use Nyakizu 100% free.",
  alternates: { canonical: `${SITE_URL}/pricing` },
};

export default function PricingPage() {
  return <PricingContent />;
}

