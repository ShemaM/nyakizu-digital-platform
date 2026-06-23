import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { PWARegister } from "@/components/PWARegister";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const viewport: Viewport = {
  themeColor: "#0a1f10",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Nyakizu Digital Market",
    template: "%s · Nyakizu",
  },
  description:
    "Digitising trusted phone accessories trade for Banyamulenge wholesalers, hawkers, and resellers in Kenya.",
  applicationName: "Nyakizu",
  keywords: ["phone accessories", "wholesale", "Kenya", "B2B", "trade"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nyakizu",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "msapplication-TileColor": "#0a1f10",
    "msapplication-TileImage": "/icons/icon-192.png",
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sw" className={`${geist.variable} h-full`} data-scroll-behavior="smooth">
      <body
        className="min-h-[100dvh] flex flex-col bg-[#0a1f10] text-slate-200 antialiased overscroll-none"
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <PWARegister />
      </body>
    </html>
  );
}