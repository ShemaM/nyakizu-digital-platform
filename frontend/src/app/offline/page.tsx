import type { Metadata } from "next";
import { OfflineContent } from "./OfflineContent";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Offline",
  robots: NOINDEX_ROBOTS,
};

export default function OfflinePage() {
  return <OfflineContent />;
}
