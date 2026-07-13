import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Playfair_Display } from "next/font/google";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.idrisdagkesen.av.tr"),
  title: {
    default: "Av. İdris Dağkesen | Anlaşılır Hukuki Danışmanlık",
    template: "%s | Av. İdris Dağkesen"
  },
  description:
    "Av. İdris Dağkesen'in uzmanlık alanları, hukuk yazıları ve iletişim bilgileri.",
  openGraph: {
    title: "Av. İdris Dağkesen",
    description: "Anlaşılır hukuki danışmanlık, uzmanlık alanları ve hukuk yazıları.",
    locale: "tr_TR",
    type: "website",
    siteName: "Av. İdris Dağkesen"
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={cn(bodyFont.variable, displayFont.variable, "bg-background text-primary antialiased")}>
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
