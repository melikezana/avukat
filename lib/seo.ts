import type { PublicArticle, PublicArticleMeta } from "@/lib/public-articles";
import { contactInfo, lawyerProfile, socialLinks } from "@/lib/site-profile";
import { absoluteUrl, getSiteUrl, siteDefaults } from "@/lib/site";
import { practiceAreas } from "@/lib/data/practice-areas";

export type BreadcrumbItem = {
  name: string;
  href: string;
};

export function getBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href)
    }))
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteDefaults.name,
    url: getSiteUrl(),
    inLanguage: "tr-TR",
    description: siteDefaults.description
  };
}

export function getPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: lawyerProfile.name,
    jobTitle: lawyerProfile.title,
    url: getSiteUrl(),
    image: absoluteUrl(lawyerProfile.portraitSrc),
    sameAs: socialLinks.map((link) => link.href),
    alumniOf: "İstanbul Üniversitesi Hukuk Fakültesi",
    knowsAbout: practiceAreas.map((area) => area.title),
    description: lawyerProfile.shortBio
  };
}

export function getLegalServiceJsonLd() {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: lawyerProfile.name,
    url: getSiteUrl(),
    areaServed: "Türkiye",
    image: absoluteUrl(lawyerProfile.portraitSrc),
    sameAs: socialLinks.map((link) => link.href)
  };

  if (contactInfo.phoneHref.startsWith("tel:")) {
    schema.telephone = contactInfo.phoneHref.replace("tel:", "");
  }

  if (contactInfo.email) {
    schema.email = contactInfo.email;
  }

  return schema;
}

export function getDefaultOgImageUrl() {
  return absoluteUrl(siteDefaults.defaultOgImagePath);
}

export function getArticleImageUrl(article: PublicArticleMeta) {
  return article.ogImage || article.coverImage || getDefaultOgImageUrl();
}

export function getArticleJsonLd(article: PublicArticle) {
  const articleUrl = article.canonicalUrl || absoluteUrl(`/makaleler/${article.slug}`);
  const image = getArticleImageUrl(article);
  const keywords = [article.focusKeyword, article.category].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    image: [absoluteUrl(image)],
    datePublished: article.publishedAt || article.date,
    dateModified: article.updatedAt || article.publishedAt || article.date,
    author: {
      "@type": "Person",
      name: article.author
    },
    publisher: {
      "@type": "Person",
      name: lawyerProfile.name,
      image: absoluteUrl(lawyerProfile.portraitSrc)
    },
    mainEntityOfPage: articleUrl,
    articleSection: article.category,
    ...(keywords.length ? { keywords } : {})
  };
}
