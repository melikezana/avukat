"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, X } from "lucide-react";
import { getAnalyticsConfig } from "@/lib/site";

type ConsentState = "unknown" | "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | IArguments>;
    gtag?: (...args: unknown[]) => void;
  }
}

const storageKey = "idrisdagkesen.analyticsConsent";

function getStoredConsent(): ConsentState {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const value = window.localStorage.getItem(storageKey);
  return value === "granted" || value === "denied" ? value : "unknown";
}

function storeConsent(value: ConsentState) {
  window.localStorage.setItem(storageKey, value);
}

function sendDirectGaPageView(measurementId: string, path: string) {
  window.gtag?.("config", measurementId, {
    page_path: path,
    send_page_view: true,
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
}

export function GoogleConsentManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const analyticsConfig = getAnalyticsConfig();
  const [consent, setConsent] = useState<ConsentState>("unknown");
  const active = analyticsConfig.enabled && (analyticsConfig.gaMeasurementId || analyticsConfig.gtmId);
  const currentPath = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    setConsent(getStoredConsent());
  }, []);

  useEffect(() => {
    if (!active || consent !== "granted") {
      return;
    }

    if (analyticsConfig.gaMeasurementId) {
      sendDirectGaPageView(analyticsConfig.gaMeasurementId, currentPath);
      return;
    }

    if (analyticsConfig.gtmId) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "next_route_change",
        page_path: currentPath,
        page_location: window.location.href
      });
    }
  }, [active, analyticsConfig.gaMeasurementId, analyticsConfig.gtmId, consent, currentPath]);

  if (!active) {
    return null;
  }

  const allowTracking = consent === "granted";

  return (
    <>
      {allowTracking && analyticsConfig.gaMeasurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${analyticsConfig.gaMeasurementId}', {
                send_page_view: false,
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false
              });
            `}
          </Script>
        </>
      ) : null}

      {allowTracking && analyticsConfig.gtmId ? (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({'gtm.start': new Date().getTime(), event:'gtm.js'});
            (function(w,d,s,l,i){w[l]=w[l]||[];var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${analyticsConfig.gtmId}');
          `}
        </Script>
      ) : null}

      {consent === "unknown" ? (
        <div className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-3xl rounded-[8px] border border-primary/10 bg-white p-4 shadow-[0_20px_70px_rgba(10,22,40,0.18)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-primary text-white">
                <BarChart3 className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold text-primary">Analitik tercihleri</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Site deneyimini ölçmek için anonimleştirilmiş sayfa görüntüleme verileri kullanılabilir. Kabul etmezseniz Google Analytics veya GTM scripti yüklenmez.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  storeConsent("denied");
                  setConsent("denied");
                }}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-primary/10 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-accent-2"
              >
                <X className="h-4 w-4" aria-hidden />
                Reddet
              </button>
              <button
                type="button"
                onClick={() => {
                  storeConsent("granted");
                  setConsent("granted");
                }}
                className="inline-flex min-h-10 items-center justify-center rounded-[6px] bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-1"
              >
                Kabul Et
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
