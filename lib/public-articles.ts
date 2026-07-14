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
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
};

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
};

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
    publishedAt,
    updatedAt,
    content,
    contentFormat: "html"
  };
}

function sortByDateDesc<T extends { date: string }>(articles: T[]) {
  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function mergePublicArticles(mdxArticles: PublicArticleMeta[], supabaseArticles: PublicArticleMeta[]) {
  const seenSlugs = new Set<string>();
  const merged: PublicArticleMeta[] = [];

  for (const article of mdxArticles) {
    seenSlugs.add(article.slug);
    merged.push(article);
  }

  for (const article of supabaseArticles) {
    if (seenSlugs.has(article.slug)) {
      console.warn("[public.articles.slugConflict]", {
        slug: article.slug,
        priority: "mdx"
      });
      continue;
    }

    seenSlugs.add(article.slug);
    merged.push(article);
  }

  return sortByDateDesc(merged);
}

async function getPublishedSupabaseArticleRows() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[public.articles.supabase.list]", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });

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

export async function getPublicArticleBySlug(slug: string) {
  const mdxArticle = getMdxArticleBySlug(slug);

  if (mdxArticle) {
    return mapMdxArticle(mdxArticle);
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[public.articles.supabase.detail]", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      slug
    });

    return null;
  }

  return data ? mapSupabaseArticle(data as SupabaseArticleRow) : null;
}

export function getPublicArticleCategories(articles: PublicArticleMeta[]) {
  return Array.from(new Set([...ARTICLE_CATEGORY_OPTIONS.map((category) => category.label), ...articles.map((article) => article.category)])).sort(
    (a, b) => a.localeCompare(b, "tr")
  );
}

export function getRelatedArticles(article: PublicArticleMeta, articles: PublicArticleMeta[], limit = 3) {
  const sameCategory = articles.filter((item) => item.slug !== article.slug && item.category === article.category);
  const fallback = articles.filter((item) => item.slug !== article.slug && item.category !== article.category);
  return [...sameCategory, ...fallback].slice(0, limit);
}
