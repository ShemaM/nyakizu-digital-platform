import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nyakizu Digital Market",
  description:
    "A mobile-first trade workspace for trusted phone accessories wholesalers, hawkers, orders, payments, and credit records.",
  applicationName: "Nyakizu",
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
