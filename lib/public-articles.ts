import "server-only";

import { ARTICLE_CATEGORY_OPTIONS, getArticleCategoryLabel } from "@/lib/article-categories";
import { defaultArticleAuthor } from "@/lib/article-defaults";
import { estimateHtmlReadingTime, getPlainTextFromHtml, sanitizeArticleHtml } from "@/lib/article-html";
import {
  getAllArticles as getAllMdxArticles,
  getArticleBySlug as getMdxArticleBySlug,
  type Article,
  type ArticleMeta
} from "@/lib/articles";
import { absoluteUrl, getSiteUrl } from "@/lib/site";
import { createSupabasePublicServerClient } from "@/lib/supabase/public-server";

export type PublicArticleSource = "mdx" | "supabase";
export type PublicArticleContentFormat = "mdx" | "html";

export type PublicArticleMeta = ArticleMeta & {
  source: PublicArticleSource;
  id?: string;
  publishedAt?: string;
  updatedAt?: string;
  canonicalUrl?: string;
  ogImage?: string;
  focusKeyword?: string;
  decisionPdfUrl?: string;
  decisionPdfTitle?: string;
  decisionCourt?: string;
  decisionCaseNo?: string;
  decisionNumber?: string;
  decisionDate?: string;
};

export type ArticleSummary = PublicArticleMeta;

export type PublicArticle = PublicArticleMeta & {
  content: string;
  contentFormat: PublicArticleContentFormat;
};

type SupabaseArticleRow = {
  id?: string | number | null;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  cover_image_url?: string | null;
  status?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  og_image_url?: string | null;
  focus_keyword?: string | null;
  author_name?: string | null;
  decision_pdf_url?: string | null;
  decision_pdf_title?: string | null;
  decision_court?: string | null;
  decision_case_no?: string | null;
  decision_number?: string | null;
  decision_date?: string | null;
};

type SupabaseArticleStatusRow = {
  id?: string | number | null;
  slug?: string | null;
  status?: string | null;
};

const basePublicArticleSelect =
  "id,title,slug,excerpt,content,category,cover_image_url,status,published_at,created_at,updated_at,seo_title,seo_description,canonical_url,og_image_url,focus_keyword,author_name";
const publicArticleSelect =
  `${basePublicArticleSelect},decision_pdf_url,decision_pdf_title,decision_court,decision_case_no,decision_number,decision_date`;

function trimOptional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function getExcerpt(row: SupabaseArticleRow, content: string) {
  const explicitExcerpt = trimOptional(row.excerpt);

  if (explicitExcerpt) {
    return explicitExcerpt;
  }

  const plainText = getPlainTextFromHtml(content);
  return plainText.length > 220 ? `${plainText.slice(0, 217).trim()}...` : plainText;
}

function mapMdxMeta(article: ArticleMeta): PublicArticleMeta {
  return {
    ...article,
    source: "mdx",
    publishedAt: article.date,
    updatedAt: article.date
  };
}

function mapMdxArticle(article: Article): PublicArticle {
  return {
    ...mapMdxMeta(article),
    content: article.content,
    contentFormat: "mdx"
  };
}

function mapSupabaseArticle(row: SupabaseArticleRow): PublicArticle | null {
  const slug = trimOptional(row.slug);
  const title = trimOptional(row.title);

  if (!slug || !title) {
    return null;
  }

  const content = sanitizeArticleHtml(row.content ?? "");
  const excerpt = getExcerpt(row, content);
  const category = getArticleCategoryLabel(row.category) || "Genel Hukuk";
  const publishedAt = row.published_at || row.created_at || new Date().toISOString();
  const updatedAt = row.updated_at || publishedAt;
  const coverImage = trimOptional(row.cover_image_url);
  const ogImage = trimOptional(row.og_image_url) || coverImage;

  return {
    id: row.id == null ? undefined : String(row.id),
    source: "supabase",
    title,
    slug,
    date: publishedAt,
    summary: excerpt,
    excerpt,
    category,
    coverImage,
    coverImageExists: Boolean(coverImage),
    readingTime: estimateHtmlReadingTime(content),
    author: trimOptional(row.author_name) || defaultArticleAuthor,
    metaTitle: trimOptional(row.seo_title),
    metaDescription: trimOptional(row.seo_description) || excerpt,
    canonicalUrl: trimOptional(row.canonical_url),
    ogImage,
    focusKeyword: trimOptional(row.focus_keyword),
    decisionPdfUrl: trimOptional(row.decision_pdf_url),
    decisionPdfTitle: trimOptional(row.decision_pdf_title),
    decisionCourt: trimOptional(row.decision_court),
    decisionCaseNo: trimOptional(row.decision_case_no),
    decisionNumber: trimOptional(row.decision_number),
    decisionDate: trimOptional(row.decision_date),
    publishedAt,
    updatedAt,
    content,
    contentFormat: "html"
  };
}

function sortByDateDesc<T extends { date: string }>(articles: T[]) {
  return articles.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    return (Number.isNaN(dateB) ? 0 : dateB) - (Number.isNaN(dateA) ? 0 : dateA);
  });
}

function mergePublicArticles(mdxArticles: PublicArticleMeta[], supabaseArticles: PublicArticleMeta[]) {
  const seenSlugs = new Set<string>();
  const merged: PublicArticleMeta[] = [];

  for (const article of supabaseArticles) {
    seenSlugs.add(article.slug);
    merged.push(article);
  }

  for (const article of mdxArticles) {
    if (seenSlugs.has(article.slug)) {
      console.warn("[public.articles.slugConflict]", {
        slug: article.slug,
        priority: "supabase"
      });
      continue;
    }

    seenSlugs.add(article.slug);
    merged.push(article);
  }

  return sortByDateDesc(merged);
}

function logSupabaseError(
  label: string,
  error: { code?: string; message?: string; details?: string; hint?: string },
  extra?: Record<string, unknown>
) {
  console.error(label, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    ...extra
  });
}

function isDecisionColumnMissingError(error: { code?: string; message?: string; details?: string; hint?: string }) {
  const message = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`;
  return error.code === "42703" || /decision_(pdf_url|pdf_title|court|case_no|number|date)/i.test(message);
}

function getSupabaseClientOrNull(label: string, extra?: Record<string, unknown>) {
  try {
    return createSupabasePublicServerClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase client could not be created.";

    logSupabaseError(
      label,
      {
        code: "SUPABASE_CONFIG_ERROR",
        message
      },
      extra
    );

    return null;
  }
}

async function getPublishedSupabaseArticleRows() {
  const supabase = getSupabaseClientOrNull("[public.articles.supabase.list]");

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("articles")
    .select(publicArticleSelect)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    if (isDecisionColumnMissingError(error)) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("articles")
        .select(basePublicArticleSelect)
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false });

      if (!fallbackError) {
        return (fallbackData ?? []) as SupabaseArticleRow[];
      }

      logSupabaseError("[public.articles.supabase.list.fallback]", fallbackError);
      return [];
    }

    logSupabaseError("[public.articles.supabase.list]", error);

    return [];
  }

  return (data ?? []) as SupabaseArticleRow[];
}

export async function getPublishedSupabaseArticleMetas() {
  const rows = await getPublishedSupabaseArticleRows();
  return rows.map(mapSupabaseArticle).filter((article): article is PublicArticle => Boolean(article));
}

export async function getAllPublicArticleMetas() {
  const mdxArticles = getAllMdxArticles().map(mapMdxMeta);
  const supabaseArticles = await getPublishedSupabaseArticleMetas();
  return mergePublicArticles(mdxArticles, supabaseArticles);
}

async function getPublishedSupabaseArticleBySlug(slug: string) {
  const supabase = getSupabaseClientOrNull("[public.articles.supabase.detail]", { slug });

  if (!supabase) {
    return {
      article: null,
      error: true
    };
  }

  const { data, error } = await supabase
    .from("articles")
    .select(publicArticleSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    if (isDecisionColumnMissingError(error)) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("articles")
        .select(basePublicArticleSelect)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (!fallbackError) {
        return {
          article: fallbackData ? mapSupabaseArticle(fallbackData as SupabaseArticleRow) : null,
          error: false
        };
      }

      logSupabaseError("[public.articles.supabase.detail.fallback]", fallbackError, { slug });

      return {
        article: null,
        error: true
      };
    }

    logSupabaseError("[public.articles.supabase.detail]", error, { slug });

    return {
      article: null,
      error: true
    };
  }

  return {
    article: data ? mapSupabaseArticle(data as SupabaseArticleRow) : null,
    error: false
  };
}

async function getSupabaseArticleStatusBySlug(slug: string) {
  const supabase = getSupabaseClientOrNull("[public.articles.supabase.status]", { slug });

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("articles")
    .select("id,slug,status")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) {
    logSupabaseError("[public.articles.supabase.status]", error, { slug });
    return null;
  }

  return data as SupabaseArticleStatusRow | null;
}

function logSlugConflict(slug: string) {
  console.warn("[public.articles.slugConflict]", {
    slug,
    priority: "supabase"
  });
}

export function getPublicSiteUrl() {
  return getSiteUrl();
}

export function getArticleCanonicalUrl(article: PublicArticleMeta) {
  return article.canonicalUrl || absoluteUrl(`/makaleler/${article.slug}`);
}

export async function getPublicArticleBySlug(slug: string) {
  const supabaseResult = await getPublishedSupabaseArticleBySlug(slug);

  if (supabaseResult.article) {
    const mdxArticle = getMdxArticleBySlug(slug);

    if (mdxArticle) {
      logSlugConflict(slug);
    }

    return supabaseResult.article;
  }

  if (!supabaseResult.error) {
    const supabaseStatus = await getSupabaseArticleStatusBySlug(slug);

    if (supabaseStatus && supabaseStatus.status !== "published") {
      return null;
    }
  }

  const mdxArticle = getMdxArticleBySlug(slug);
  return mdxArticle ? mapMdxArticle(mdxArticle) : null;
}

export function getPublicArticleCategories(articles: PublicArticleMeta[]) {
  return Array.from(new Set([...ARTICLE_CATEGORY_OPTIONS.map((category) => category.label), ...articles.map((article) => article.category)])).sort(
    (a, b) => a.localeCompare(b, "tr")
  );
}

export function getRelatedArticles(article: PublicArticleMeta, articles: PublicArticleMeta[], limit = 3) {
  const candidates = articles.filter((item) => item.slug !== article.slug);
  const sameCategory = candidates.filter((item) => item.category === article.category);
  const otherCategories = candidates.filter((item) => item.category !== article.category);

  return [...sameCategory, ...otherCategories].slice(0, limit);
}
