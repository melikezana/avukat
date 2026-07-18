import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, Playfair_Display } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GoogleConsentManager } from "@/components/analytics/google-consent-manager";
import { SiteShell } from "@/components/site/site-shell";
import { getDefaultOgImageUrl } from "@/lib/seo";
import { getGoogleSiteVerification, getSiteUrl, siteDefaults, siteKeywords } from "@/lib/site";
import { cn } from "@/lib/utils";

const bodyFont = Inter({
  subsets: ["latin-ext"],
  display: "swap",
  variable: "--font-body",
  fallback: ["Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: true
});

const displayFont = Playfair_Display({
  subsets: ["latin-ext"],
  display: "swap",
  variable: "--font-display",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteDefaults.title,
    template: "%s | Av. İdris Dağkesen"
  },
  description: siteDefaults.description,
  keywords: siteKeywords,
  authors: [{ name: siteDefaults.name, url: getSiteUrl() }],
  creator: siteDefaults.name,
  publisher: siteDefaults.name,
  applicationName: siteDefaults.name,
  verification: {
    google: getGoogleSiteVerification()
  },
  robots:
    process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production"
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false
          }
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1
          }
        },
  openGraph: {
    title: siteDefaults.title,
    description: siteDefaults.description,
    url: getSiteUrl(),
    locale: siteDefaults.locale,
    type: "website",
    siteName: siteDefaults.name,
    images: [
      {
        url: getDefaultOgImageUrl(),
        width: 1200,
        height: 630,
        alt: siteDefaults.title
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteDefaults.title,
    description: siteDefaults.description,
    images: [getDefaultOgImageUrl()]
  },
  alternates: {
    canonical: getSiteUrl()
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }, { url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", type: "image/png" }]
  },
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={cn(bodyFont.variable, displayFont.variable, "bg-background text-primary antialiased")}>
        <SiteShell>{children}</SiteShell>
        <Suspense fallback={null}>
          <GoogleAnalytics />
          <GoogleConsentManager />
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
