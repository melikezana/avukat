import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";

  if (isPreview) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/"
      },
      sitemap: new URL("/sitemap.xml", siteUrl).toString()
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/yonetim-giris",
        "/api/admin",
        "/api/admin/",
        "/admin/makaleler/onizleme",
        "/admin/makaleler/onizleme/"
      ]
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString()
  };
}
