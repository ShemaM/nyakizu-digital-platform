import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { HelpContent } from "./HelpContent";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description: "Answers to common questions about ordering, payments, and managing your Nyakizu account.",
  alternates: { canonical: `${SITE_URL}/help` },
};

export default function HelpPage() {
  return <HelpContent />;
}
