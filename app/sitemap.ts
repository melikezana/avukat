import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.idrisdagkesen.av.tr";
  const routes = ["", "/hakkimda", "/uzmanlik-alanlari", "/makaleler", "/iletisim"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.7
  }));

  const articles = getAllArticles().map((article) => ({
    url: `${siteUrl}/makaleler/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  return [...routes, ...articles];
}
