import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Buyer Dashboard",
    template: "%s | Buyer Dashboard",
  },
  robots: NOINDEX_ROBOTS,
};

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
