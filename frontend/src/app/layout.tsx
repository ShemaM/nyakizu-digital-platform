import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Nyakizu",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nyakizu",
  },
  title: "Nyakizu Digital Market",
  description:
    "A trusted PWA for phone accessories wholesalers, hawkers, and buyers.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
