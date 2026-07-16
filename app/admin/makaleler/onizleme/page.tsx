import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { ArticleCover } from "@/components/articles/article-cover";
import { Container } from "@/components/layout/container";
import { getArticleCategoryLabel } from "@/lib/article-categories";
import { estimateHtmlReadingTime, sanitizeArticleHtml } from "@/lib/article-html";
import { formatReadingTime } from "@/lib/article-reading-time";
import { formatDate } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Makale Önizleme",
  robots: {
    index: false,
    follow: false
  }
};

export const dynamic = "force-dynamic";

type PreviewPageProps = {
  searchParams?: {
    id?: string;
  };
};

type PreviewArticleRow = {
  id: string | number;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  cover_image_url: string | null;
  status: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

async function getPreviewArticle(id?: string) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/yonetim-giris?next=/admin/makaleler/onizleme");
  }

  if (!id) {
    return null;
  }

  const { data, error } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("[admin.articles.preview]", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      id
    });

    return null;
  }

  return data as PreviewArticleRow | null;
}

export default async function AdminArticlePreviewPage({ searchParams }: PreviewPageProps) {
  const article = await getPreviewArticle(searchParams?.id);

  if (!article) {
    notFound();
  }

  const content = sanitizeArticleHtml(article.content ?? "");
  const date = article.published_at || article.created_at || new Date().toISOString();
  const category = getArticleCategoryLabel(article.category) || "Kategori";

  return (
    <article className="bg-background">
      <Container className="py-12 md:py-16">
        <Link
          href="/admin/makaleler"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-1 transition hover:text-accent-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Admin listeye dön
        </Link>

        <div className="mx-auto max-w-4xl">
          <p className="mb-4 inline-flex border border-accent-1/25 bg-white px-3 py-2 text-sm font-semibold text-accent-1">
            {category}
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-primary md:text-6xl">
            {article.title || "Başlıksız makale"}
          </h1>
          {article.excerpt ? <p className="mt-6 text-lg leading-8 text-muted">{article.excerpt}</p> : null}

          <div className="mt-7 flex flex-wrap items-center gap-4 border-y border-primary/10 py-4 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-accent-1" aria-hidden />
              {formatDate(date)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-1" aria-hidden />
              {formatReadingTime(estimateHtmlReadingTime(content))}
            </span>
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
              {article.status === "published" ? "Yayında" : "Taslak önizleme"}
            </span>
          </div>

          <div className="mt-8 overflow-hidden rounded-[8px] border border-primary/10 bg-white shadow-soft">
            <ArticleCover
              src={article.cover_image_url ?? undefined}
              title={article.title || "Makale"}
              category={category}
              width={1200}
              height={675}
              sizes="(min-width: 1024px) 896px, (min-width: 768px) calc(100vw - 4rem), 100vw"
            />
          </div>
        </div>
      </Container>

      <section className="bg-white py-14 md:py-20">
        <Container>
          <div lang="tr" className="article-prose prose mx-auto w-full max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
        </Container>
      </section>
    </article>
  );
}
