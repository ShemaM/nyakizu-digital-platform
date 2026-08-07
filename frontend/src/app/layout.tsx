import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { MotionConfig } from "motion/react";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toast";
import { RouteProgressBar } from "@/components/RouteProgressBar";
import { PWARegister } from "@/components/PWARegister";
import { InstallPrompt } from "@/components/InstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nyakizu - Digital Platform for Phone Accessories Traders",
  description: "Manage orders, payments, and relationships with trusted ledger technology.",
  keywords: ["trade", "orders", "ledger", "Nairobi", "phone accessories"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nyakizu",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={inter.variable}>
      <body suppressHydrationWarning>
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        <MotionConfig reducedMotion="user">
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </MotionConfig>
        <PWARegister />
        <InstallPrompt />
      </body>
    </html>
  );
}