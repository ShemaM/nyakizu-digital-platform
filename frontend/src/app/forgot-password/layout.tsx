import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Forgot Password",
  robots: NOINDEX_ROBOTS,
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
