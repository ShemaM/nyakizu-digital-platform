import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Seller Dashboard",
    template: "%s | Seller Dashboard",
  },
  robots: NOINDEX_ROBOTS,
};

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
