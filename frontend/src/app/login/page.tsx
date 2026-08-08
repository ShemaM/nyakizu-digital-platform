import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { LoginContent } from "./LoginContent";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to manage your Nyakizu orders, stock, and debts.",
  alternates: { canonical: `${SITE_URL}/login` },
};

export default function LoginPage() {
  return <LoginContent />;
}
