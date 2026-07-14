import type { Metadata } from "next";
import Link from "next/link";
import { PencilLine } from "lucide-react";
import { ArticleDeleteButton } from "@/components/admin/article-delete-button";
import { getArticleCategoryLabel } from "@/lib/article-categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Makaleler"
};

export const dynamic = "force-dynamic";

type ArticleStatus = "draft" | "published";

type AdminArticleRow = {
  id: string | number;
  title: string | null;
  slug: string | null;
  category: string | null;
  status: string | null;
  created_at: string | null;
};

type AdminArticlesPageProps = {
  searchParams?: {
    created?: string;
    updated?: string;
    status?: string;
  };
};

const filters: Array<{ href: string; label: string; value: ArticleStatus | null }> = [
  { href: "/admin/makaleler", label: "Tümü", value: null },
  { href: "/admin/makaleler?status=draft", label: "Taslak", value: "draft" },
  { href: "/admin/makaleler?status=published", label: "Yayında", value: "published" }
];

function getActiveStatus(status?: string): ArticleStatus | null {
  if (status === "draft" || status === "published") {
    return status;
  }

  return null;
}

function getFilterClass(isActive: boolean) {
  return [
    "inline-flex min-h-10 items-center rounded-[6px] border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]",
    isActive
      ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
      : "border-[#d8c7a8] bg-[#fffaf0] text-[#5f5a52] hover:border-[#c8a45d] hover:text-[var(--color-navy)]"
  ].join(" ");
}

function formatStatus(status: string | null) {
  if (status === "published") {
    return "Yayında";
  }

  if (status === "draft") {
    return "Taslak";
  }

  return status?.trim() || "Belirsiz";
}

function getStatusClass(status: string | null) {
  if (status === "published") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "draft") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

async function getArticles(status: ArticleStatus | null) {
  const supabase = createSupabaseServerClient();
  let query = supabase.from("articles").select("id,title,slug,category,status,created_at");

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("[admin.articles.list]", {
      code: error.code,
      message: error.message
    });

    return {
      articles: [] as AdminArticleRow[],
      error: true
    };
  }

  return {
    articles: (data ?? []) as AdminArticleRow[],
    error: false
  };
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const activeStatus = getActiveStatus(searchParams?.status);
  const { articles, error } = await getArticles(activeStatus);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-normal text-[var(--color-navy)]">Makaleler</h2>
          <p className="mt-2 text-sm leading-6 text-[#5f5a52]">Kayıtlı makaleleri durumlarına göre görüntüleyin.</p>
        </div>
        <Link
          href="/admin/makaleler/yeni"
          className="inline-flex min-h-10 items-center justify-center rounded-[6px] bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
        >
          Yeni Makale
        </Link>
      </div>

      {searchParams?.created === "1" ? (
        <div className="mb-5 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Makale başarıyla kaydedildi.
        </div>
      ) : searchParams?.updated === "1" ? (
        <div className="mb-5 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Makale güncellendi.
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2" aria-label="Makale durum filtreleri">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={filter.href}
            className={getFilterClass(activeStatus === filter.value)}
            aria-current={activeStatus === filter.value ? "page" : undefined}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {error ? (
        <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
          Makaleler şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] shadow-[0_16px_50px_rgba(10,22,40,0.07)]">
          {articles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d8c7a8] text-left text-sm">
                <thead className="bg-[#efe6d8]/60 text-xs font-bold uppercase tracking-wide text-[#6c6254]">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Başlık
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Kategori
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Durum
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Oluşturulma Tarihi
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Düzenle
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Sil
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eadcc5]">
                  {articles.map((article) => (
                    <tr key={article.id ?? article.slug} className="bg-[#fffaf0] align-top">
                      <td className="min-w-[260px] px-4 py-4 font-semibold text-[var(--color-navy)]">
                        {article.title || "Başlıksız makale"}
                      </td>
                      <td className="min-w-[160px] px-4 py-4 text-[#5f5a52]">
                        {getArticleCategoryLabel(article.category) || "-"}
                      </td>
                      <td className="min-w-[140px] px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClass(article.status)}`}
                        >
                          {formatStatus(article.status)}
                        </span>
                      </td>
                      <td className="min-w-[190px] px-4 py-4 text-[#5f5a52]">{formatDateTime(article.created_at)}</td>
                      <td className="min-w-[120px] px-4 py-4">
                        <Link
                          href={`/admin/makaleler/${article.id}/duzenle`}
                          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                        >
                          <PencilLine className="h-3.5 w-3.5" aria-hidden />
                          Düzenle
                        </Link>
                      </td>
                      <td className="min-w-[120px] px-4 py-4">
                        <ArticleDeleteButton
                          articleId={String(article.id)}
                          articleTitle={article.title || "Başlıksız makale"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <h3 className="text-lg font-bold tracking-normal text-[var(--color-navy)]">Henüz makale yok</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6c6254]">
                Seçili filtreye uygun kayıt bulunamadı. Yeni bir makale oluşturduğunuzda burada listelenecek.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
