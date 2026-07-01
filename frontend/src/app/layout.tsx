import "@/app/globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Nyakizu - Digital Platform for RNG Plaza Traders",
  description: "Manage orders, payments, and relationships with trusted ledger technology.",
  keywords: ["trade", "orders", "ledger", "Nairobi", "RNG Plaza"],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}