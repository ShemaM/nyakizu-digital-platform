import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Nyakizu - Digital Platform for RNG Plaza Traders",
  description: "Manage orders, payments, and relationships with trusted ledger technology.",
  keywords: ["trade", "orders", "ledger", "Nairobi", "RNG Plaza"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}