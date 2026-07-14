import type { Metadata } from "next";
import Link from "next/link";
import { Eye, PencilLine, Search } from "lucide-react";
import { AdminToast } from "@/components/admin/admin-toast";
import { ArticleDeleteButton } from "@/components/admin/article-delete-button";
import { ArticleStatusButton } from "@/components/admin/article-status-button";
import {
  ARTICLE_CATEGORY_OPTIONS,
  getArticleCategoryLabel,
  isArticleCategorySlug,
  type ArticleCategorySlug
} from "@/lib/article-categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Makaleler"
};

export const dynamic = "force-dynamic";

type ArticleStatus = "draft" | "published";
type SortOption = "newest" | "oldest" | "updated" | "title";

type AdminArticleRow = {
  id: string | number;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  category: string | null;
  status: string | null;
  cover_image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  published_at: string | null;
};

type AdminArticlesPageProps = {
  searchParams?: {
    created?: string;
    updated?: string;
    published?: string;
    draft?: string;
    deleted?: string;
    status?: string;
    category?: string;
    q?: string;
    sort?: string;
    page?: string;
  };
};

const pageSize = 20;

const statusOptions: Array<{ label: string; value: ArticleStatus | "" }> = [
  { label: "Tümü", value: "" },
  { label: "Taslaklar", value: "draft" },
  { label: "Yayındakiler", value: "published" }
];

const sortOptions: Array<{ label: string; value: SortOption }> = [
  { label: "En yeni", value: "newest" },
  { label: "En eski", value: "oldest" },
  { label: "Son güncellenen", value: "updated" },
  { label: "Başlık A-Z", value: "title" }
];

function getActiveStatus(status?: string): ArticleStatus | null {
  if (status === "draft" || status === "published") {
    return status;
  }

  return null;
}

function getActiveCategory(category?: string): ArticleCategorySlug | "" {
  return category && isArticleCategorySlug(category) ? category : "";
}

function getActiveSort(sort?: string): SortOption {
  return sort === "oldest" || sort === "updated" || sort === "title" ? sort : "newest";
}

function getActivePage(page?: string) {
  const parsed = Number.parseInt(page ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
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

function normalizeStatus(status: string | null): ArticleStatus {
  return status === "published" ? "published" : "draft";
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

function escapeSearchTerm(value: string) {
  return value.replace(/[%,()]/g, " ").trim();
}

function getToastMessage(searchParams?: AdminArticlesPageProps["searchParams"]) {
  if (searchParams?.created === "1") {
    return searchParams.published === "1" ? "Makale yayımlandı" : "Taslak kaydedildi";
  }

  if (searchParams?.updated === "1") {
    return "Makale güncellendi";
  }

  if (searchParams?.deleted === "1") {
    return "Makale silindi";
  }

  return undefined;
}

function buildPageHref(searchParams: AdminArticlesPageProps["searchParams"], page: number) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value && !["created", "updated", "published", "draft"].includes(key)) {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }

  const query = params.toString();
  return query ? `/admin/makaleler?${query}` : "/admin/makaleler";
}

async function getArticles({
  status,
  category,
  query,
  sort,
  page
}: {
  status: ArticleStatus | null;
  category: ArticleCategorySlug | "";
  query: string;
  sort: SortOption;
  page: number;
}) {
  const supabase = createSupabaseServerClient();
  const rangeFrom = (page - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;
  let request = supabase
    .from("articles")
    .select("id,title,slug,excerpt,category,status,cover_image_url,created_at,updated_at,published_at", {
      count: "exact"
    });

  if (status) {
    request = request.eq("status", status);
  }

  if (category) {
    request = request.eq("category", category);
  }

  const escapedQuery = escapeSearchTerm(query);

  if (escapedQuery) {
    request = request.or(`title.ilike.%${escapedQuery}%,slug.ilike.%${escapedQuery}%,excerpt.ilike.%${escapedQuery}%`);
  }

  if (sort === "oldest") {
    request = request.order("created_at", { ascending: true });
  } else if (sort === "updated") {
    request = request.order("updated_at", { ascending: false, nullsFirst: false });
  } else if (sort === "title") {
    request = request.order("title", { ascending: true });
  } else {
    request = request.order("created_at", { ascending: false });
  }

  const { data, error, count } = await request.range(rangeFrom, rangeTo);

  if (error) {
    console.error("[admin.articles.list]", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });

    return {
      articles: [] as AdminArticleRow[],
      total: 0,
      error: true
    };
  }

  return {
    articles: (data ?? []) as AdminArticleRow[],
    total: count ?? 0,
    error: false
  };
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const activeStatus = getActiveStatus(searchParams?.status);
  const activeCategory = getActiveCategory(searchParams?.category);
  const activeSort = getActiveSort(searchParams?.sort);
  const activePage = getActivePage(searchParams?.page);
  const activeQuery = searchParams?.q?.trim() ?? "";
  const { articles, total, error } = await getArticles({
    status: activeStatus,
    category: activeCategory,
    query: activeQuery,
    sort: activeSort,
    page: activePage
  });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const toastMessage = getToastMessage(searchParams);

  return (
    <section>
      <AdminToast message={toastMessage} />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-normal text-[var(--color-navy)]">Makaleler</h2>
          <p className="mt-2 text-sm leading-6 text-[#5f5a52]">Taslakları, yayınları ve SEO içeriklerini tek yerden yönetin.</p>
        </div>
        <Link
          href="/admin/makaleler/yeni"
          className="inline-flex min-h-10 items-center justify-center rounded-[6px] bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
        >
          Yeni Makale Oluştur
        </Link>
      </div>

      <form className="mb-5 grid gap-3 rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-4 md:grid-cols-[minmax(0,1fr)_160px_180px_170px_auto] md:items-end">
        <div>
          <label htmlFor="article-search" className="text-xs font-bold uppercase tracking-wide text-[#6c6254]">
            Arama
          </label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6a2f]" aria-hidden />
            <input
              id="article-search"
              name="q"
              type="search"
              defaultValue={activeQuery}
              placeholder="Başlık, slug veya özet"
              className="min-h-10 w-full rounded-[6px] border border-[#d8c7a8] bg-white py-2 pl-10 pr-3 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="article-status-filter" className="text-xs font-bold uppercase tracking-wide text-[#6c6254]">
            Durum
          </label>
          <select
            id="article-status-filter"
            name="status"
            defaultValue={activeStatus ?? ""}
            className="mt-2 min-h-10 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          >
            {statusOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="article-category-filter" className="text-xs font-bold uppercase tracking-wide text-[#6c6254]">
            Kategori
          </label>
          <select
            id="article-category-filter"
            name="category"
            defaultValue={activeCategory}
            className="mt-2 min-h-10 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          >
            <option value="">Tüm kategoriler</option>
            {ARTICLE_CATEGORY_OPTIONS.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="article-sort" className="text-xs font-bold uppercase tracking-wide text-[#6c6254]">
            Sıralama
          </label>
          <select
            id="article-sort"
            name="sort"
            defaultValue={activeSort}
            className="mt-2 min-h-10 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex min-h-10 items-center justify-center rounded-[6px] bg-[var(--color-navy)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-navy-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
        >
          Filtrele
        </button>
      </form>

      {error ? (
        <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
          Makaleler şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] shadow-[0_16px_50px_rgba(10,22,40,0.07)]">
          {articles.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#d8c7a8] text-left text-sm">
                  <thead className="bg-[#efe6d8]/60 text-xs font-bold uppercase tracking-wide text-[#6c6254]">
                    <tr>
                      <th scope="col" className="px-4 py-3">Kapak</th>
                      <th scope="col" className="px-4 py-3">Başlık</th>
                      <th scope="col" className="px-4 py-3">Kategori</th>
                      <th scope="col" className="px-4 py-3">Durum</th>
                      <th scope="col" className="px-4 py-3">Slug</th>
                      <th scope="col" className="px-4 py-3">Oluşturulma</th>
                      <th scope="col" className="px-4 py-3">Güncellenme</th>
                      <th scope="col" className="px-4 py-3">Yayın</th>
                      <th scope="col" className="px-4 py-3">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eadcc5]">
                    {articles.map((article) => (
                      <tr key={article.id ?? article.slug} className="bg-[#fffaf0] align-top">
                        <td className="min-w-[112px] px-4 py-4">
                          <div className="h-14 w-24 overflow-hidden rounded-[6px] border border-[#eadcc5] bg-[#f8efe0]">
                            {article.cover_image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={article.cover_image_url}
                                alt={`${article.title || "Makale"} kapak görseli`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[var(--color-navy)] text-xs font-bold text-white">
                                Yok
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="min-w-[260px] px-4 py-4 font-semibold text-[var(--color-navy)]">
                          {article.title || "Başlıksız makale"}
                        </td>
                        <td className="min-w-[160px] px-4 py-4 text-[#5f5a52]">
                          {getArticleCategoryLabel(article.category) || "-"}
                        </td>
                        <td className="min-w-[140px] px-4 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClass(article.status)}`}>
                            {formatStatus(article.status)}
                          </span>
                        </td>
                        <td className="min-w-[180px] px-4 py-4 font-mono text-xs text-[#5f5a52]">{article.slug || "-"}</td>
                        <td className="min-w-[180px] px-4 py-4 text-[#5f5a52]">{formatDateTime(article.created_at)}</td>
                        <td className="min-w-[180px] px-4 py-4 text-[#5f5a52]">{formatDateTime(article.updated_at)}</td>
                        <td className="min-w-[180px] px-4 py-4 text-[#5f5a52]">{formatDateTime(article.published_at)}</td>
                        <td className="min-w-[300px] px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/admin/makaleler/${article.id}/duzenle`}
                              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                            >
                              <PencilLine className="h-3.5 w-3.5" aria-hidden />
                              Düzenle
                            </Link>
                            <Link
                              href={`/admin/makaleler/onizleme?id=${article.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden />
                              Önizle
                            </Link>
                            <ArticleStatusButton articleId={String(article.id)} status={normalizeStatus(article.status)} />
                            <ArticleDeleteButton articleId={String(article.id)} articleTitle={article.title || "Başlıksız makale"} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#eadcc5] px-4 py-4 text-sm text-[#5f5a52] sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Toplam {total} kayıt, sayfa {Math.min(activePage, pageCount)} / {pageCount}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={buildPageHref(searchParams, Math.max(1, activePage - 1))}
                    aria-disabled={activePage <= 1}
                    className={`inline-flex min-h-9 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] ${activePage <= 1 ? "pointer-events-none opacity-50" : "hover:border-[#c8a45d]"}`}
                  >
                    Önceki
                  </Link>
                  <Link
                    href={buildPageHref(searchParams, Math.min(pageCount, activePage + 1))}
                    aria-disabled={activePage >= pageCount}
                    className={`inline-flex min-h-9 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] ${activePage >= pageCount ? "pointer-events-none opacity-50" : "hover:border-[#c8a45d]"}`}
                  >
                    Sonraki
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <h3 className="text-lg font-bold tracking-normal text-[var(--color-navy)]">Henüz makale yok</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6c6254]">
                Seçili filtreye uygun kayıt bulunamadı. Yeni bir makale oluşturduğunuzda burada listelenecek.
              </p>
              <Link
                href="/admin/makaleler/yeni"
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-[6px] bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              >
                Yeni Makale Oluştur
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
