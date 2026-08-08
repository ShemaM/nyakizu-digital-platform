import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Order Receipt",
  robots: NOINDEX_ROBOTS,
};

export default function ReceiptLayout({ children }: { children: React.ReactNode }) {
  return children;
}
