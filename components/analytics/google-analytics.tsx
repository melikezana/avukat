"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

type GoogleAnalyticsConfig = {
  page_path: string;
  anonymize_ip: true;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID?.trim();
const isGoogleAnalyticsEnabled = process.env.NODE_ENV === "production" && Boolean(googleAnalyticsId);

function getPagePath(pathname: string, searchParams: URLSearchParams) {
  const search = searchParams.toString();

  return search ? `${pathname}?${search}` : pathname;
}

function sendGoogleAnalyticsPageView(gaId: string, pagePath: string) {
  window.gtag?.("config", gaId, {
    page_path: pagePath,
    anonymize_ip: true
  } satisfies GoogleAnalyticsConfig);
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isGoogleAnalyticsEnabled || !googleAnalyticsId) {
      return;
    }

    const currentPath = getPagePath(pathname, searchParams);

    if (lastTrackedPath.current === null) {
      lastTrackedPath.current = currentPath;
      return;
    }

    if (lastTrackedPath.current === currentPath) {
      return;
    }

    lastTrackedPath.current = currentPath;
    sendGoogleAnalyticsPageView(googleAnalyticsId, currentPath);
  }, [pathname, searchParams]);

  if (!isGoogleAnalyticsEnabled || !googleAnalyticsId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag("js", new Date());
          gtag("config", ${JSON.stringify(googleAnalyticsId)}, {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
