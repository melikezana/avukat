"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/articles/article-card";
import type { ArticleMeta } from "@/lib/articles";
import { cn } from "@/lib/utils";

type ArticleFiltersProps = {
  articles: ArticleMeta[];
  categories: string[];
};

export function ArticleFilters({ articles, categories }: ArticleFiltersProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

    return articles.filter((article) => {
      const matchesCategory = category === "Tümü" || article.category === category;
      const searchable = `${article.title} ${article.summary} ${article.category}`.toLocaleLowerCase("tr-TR");
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [articles, category, query]);

  return (
    <div>
      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative">
          <label htmlFor="article-search" className="sr-only">
            Makalelerde ara
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-accent-1" aria-hidden />
          <input
            id="article-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Başlık, konu veya kategori ara"
            className="h-12 w-full rounded-[6px] border border-primary/10 bg-background pl-12 pr-4 text-sm transition placeholder:text-muted/60 focus:border-accent-1 focus:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["Tümü", ...categories].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "rounded-[6px] border px-4 py-2 text-sm font-semibold transition",
                category === item
                  ? "border-accent-1 bg-accent-1 text-white"
                  : "border-primary/10 bg-background text-primary hover:border-accent-2 hover:text-accent-1"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filteredArticles.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-[8px] border border-primary/10 bg-background p-8 text-center">
          <p className="font-serif text-2xl font-bold text-primary">Sonuç bulunamadı</p>
          <p className="mt-2 text-muted">Daha kısa bir arama ifadesiyle tekrar deneyebilirsiniz.</p>
        </div>
      )}
    </div>
  );
}
