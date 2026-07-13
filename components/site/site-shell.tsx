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
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
