import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ArticleCreateForm } from "@/components/admin/article-create-form";
import type { ArticleFormFields, ArticleStatus } from "@/app/admin/makaleler/actions";
import { normalizeArticleCategory } from "@/lib/article-categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Makale Düzenle"
};

export const dynamic = "force-dynamic";

type EditArticlePageProps = {
  params: {
    id: string;
  };
};

type ArticleRow = {
  id: string | number;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  cover_image_url: string | null;
  status: string | null;
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

function normalizeStatus(status: string | null): ArticleStatus {
  return status === "published" ? "published" : "draft";
}

function toFormFields(article: ArticleRow): ArticleFormFields {
  return {
    title: article.title ?? "",
    slug: article.slug ?? "",
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    category: normalizeArticleCategory(article.category),
    cover_image_url: article.cover_image_url ?? "",
    status: normalizeStatus(article.status),
    seo_title: article.seo_title ?? "",
    seo_description: article.seo_description ?? "",
    canonical_url: article.canonical_url ?? "",
    og_image_url: article.og_image_url ?? "",
    focus_keyword: article.focus_keyword ?? "",
    author_name: article.author_name ?? "",
    decision_pdf_url: article.decision_pdf_url ?? "",
    decision_pdf_title: article.decision_pdf_title ?? "",
    decision_court: article.decision_court ?? "",
    decision_case_no: article.decision_case_no ?? "",
    decision_number: article.decision_number ?? "",
    decision_date: article.decision_date ?? ""
  };
}

async function getArticle(id: string) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/yonetim-giris?next=/admin/makaleler/${encodeURIComponent(id)}/duzenle`);
  }

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return {
        article: null,
        loadError: false
      };
    }

    console.error("[admin.articles.detail]", {
      code: error.code,
      message: error.message
    });

    return {
      article: null,
      loadError: true
    };
  }

  return {
    article: data as ArticleRow,
    loadError: false
  };
}

export default async function EditAdminArticlePage({ params }: EditArticlePageProps) {
  const { article, loadError } = await getArticle(params.id);

  if (loadError) {
    return (
      <section>
        <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
          Makale şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.
        </div>
      </section>
    );
  }

  if (!article) {
    notFound();
  }

  return (
    <section>
      <div className="mb-6">
        <Link
          href="/admin/makaleler"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-gold)] transition hover:text-[var(--color-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Makalelere dön
        </Link>
        <h2 className="font-display text-2xl font-bold tracking-normal text-[var(--color-navy)]">Makale Düzenle</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5a52]">Kayıtlı makale bilgilerini güncelleyin.</p>
      </div>

      <ArticleCreateForm mode="edit" articleId={String(article.id)} initialFields={toFormFields(article)} />
    </section>
  );
}
