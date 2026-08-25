import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { MotionConfig } from "motion/react";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toast";
import { RouteProgressBar } from "@/components/RouteProgressBar";
import { PWARegister } from "@/components/PWARegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Wordmark-only display sans — everything else stays on Inter.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
  display: "swap",
});

const DESCRIPTION =
  "Nyakizu digitizes phone accessories trade in Nairobi, Kenya — orders, stock, and debts in one place for wholesale sellers and their buyers. Free forever, works offline.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nyakizu — Digital Trade Platform for Phone Accessories Sellers in Kenya",
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "Nyakizu",
    "Nyakizu Digital",
    "Nyakizu Platform",
    "Nyakizu Market",
    "Nyakizu Digital Market",
    "Nyakizu Digital Marketplace",
    "phone accessories wholesale Kenya",
    "Nairobi wholesale trade platform",
    "buyer seller ledger app",
    "digital debt tracking",
    "B2B marketplace Kenya",
  ],
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nyakizu",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
  // Site-wide default — pages behind login override this to noindex
  // individually where it matters; robots.ts also blocks crawling those
  // paths outright. See lib/seo.ts's NOINDEX_ROBOTS.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "wsG2_HiGIHL8fIXR8pbJWEhy26T_rGyotEmFyXxbxGU",
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Nyakizu — Digital Trade Platform for Phone Accessories Sellers in Kenya",
    description: DESCRIPTION,
    // No explicit `images` here — app/opengraph-image.tsx (file convention)
    // generates the og:image/twitter:image tags automatically.
  },
  twitter: {
    card: "summary_large_image",
    title: "Nyakizu — Digital Trade Platform for Phone Accessories Sellers in Kenya",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563EB",
};

// Organization + WebSite structured data — helps search engines understand
// what Nyakizu is and can surface a sitelinks search box. Kept in the root
// layout (site-wide) rather than duplicated per page.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      // Tells Google these all refer to the same entity — the actual search
      // terms buyers/sellers are likely to type, not just the formal name.
      alternateName: [
        "Nyakizu",
        "Nyakizu Digital",
        "Nyakizu Platform",
        "Nyakizu Market",
        "Nyakizu Digital Marketplace",
      ],
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
      description: "Digitizes trusted phone accessories trade for the Banyamulenge community in Nairobi, Kenya.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: [
        "Nyakizu",
        "Nyakizu Digital",
        "Nyakizu Platform",
        "Nyakizu Market",
        "Nyakizu Digital Marketplace",
      ],
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-KE",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${bricolage.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- static, server-generated JSON, no user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
        <Analytics />
      </body>
    </html>
  );
}
