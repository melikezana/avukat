import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import "./globals.css";

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
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
