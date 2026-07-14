import type { MetadataRoute } from "next";
import { getAllPublicArticleMetas, getPublicSiteUrl } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getPublicSiteUrl();
  const staticRoutes = [
    "",
    "/hakkimda",
    "/uzmanlik-alanlari",
    "/makaleler",
    "/iletisim",
    "/gizlilik",
    "/kvkk-aydinlatma",
    "/kullanim-kosullari"
  ];
  const routes = staticRoutes.map((route) => ({
    url: new URL(route || "/", siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.7
  }));

  const articles = (await getAllPublicArticleMetas()).map((article) => ({
    url: new URL(`/makaleler/${article.slug}`, siteUrl).toString(),
    lastModified: new Date(article.updatedAt || article.date),
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  const uniqueEntries = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const entry of [...routes, ...articles]) {
    uniqueEntries.set(entry.url, entry);
  }

  return Array.from(uniqueEntries.values());
}
