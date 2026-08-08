import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { RegisterContent } from "./RegisterContent";

export const metadata: Metadata = {
  title: "Create Your Free Account",
  description:
    "Join Nyakizu free — buyers track orders and debts, sellers manage stock and get paid, all without WhatsApp chaos or paper notebooks.",
  alternates: { canonical: `${SITE_URL}/register` },
};

export default function RegisterPage() {
  return <RegisterContent />;
}
