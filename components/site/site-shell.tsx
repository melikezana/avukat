"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

type SiteShellProps = {
  children: ReactNode;
};

const chromeHiddenPrefixes = ["/admin", "/yonetim-giris"];

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const hidePublicChrome = chromeHiddenPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (hidePublicChrome) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[80] rounded-[6px] bg-primary px-4 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Ana içeriğe geç
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
