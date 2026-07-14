export const siteDefaults = {
  url: "https://www.idrisdagkesen.com",
  name: "Av. İdris Dağkesen",
  title: "Av. İdris Dağkesen | Hukuku Herkes İçin Anlaşılır Kılmak",
  description:
    "Av. İdris Dağkesen'in hukuk yazıları, uzmanlık alanları ve iletişim bilgileri. Hukuki konular sade, anlaşılır ve güvenilir bir dille ele alınır.",
  slogan: "Hukuku Herkes İçin Anlaşılır Kılmak",
  locale: "tr_TR",
  lang: "tr",
  themeColor: "#0A1628",
  backgroundColor: "#FAF7F1",
  defaultOgImagePath: "/opengraph-image"
} as const;

export const siteKeywords = [
  "Av. İdris Dağkesen",
  "avukat",
  "hukuk yazıları",
  "kira hukuku",
  "iş hukuku",
  "aile hukuku",
  "ceza hukuku",
  "ticaret hukuku",
  "gayrimenkul hukuku"
];

function normalizeSiteUrl(value?: string | null) {
  const candidate = value?.trim() || siteDefaults.url;

  try {
    const url = new URL(candidate);
    url.pathname = "";
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    return siteDefaults.url;
  }
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function absoluteUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl).toString();
  } catch {
    return new URL(pathOrUrl, `${getSiteUrl()}/`).toString();
  }
}

export function getGoogleSiteVerification() {
  return process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined;
}

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview";
}

export function getAnalyticsConfig() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const enabled = isProductionRuntime();

  return {
    enabled,
    gtmId: enabled ? gtmId || undefined : undefined,
    gaMeasurementId: enabled && !gtmId ? gaMeasurementId || undefined : undefined,
    directGaDisabledByGtm: Boolean(enabled && gtmId && gaMeasurementId)
  };
}

export function getGoogleMapsEmbedUrl() {
  const value = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL?.trim();

  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    const allowedHosts = new Set(["www.google.com", "maps.google.com"]);

    if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}
