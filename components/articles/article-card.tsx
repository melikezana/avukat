import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { ArticleCover } from "@/components/articles/article-cover";
import type { ArticleMeta } from "@/lib/articles";
import { formatReadingTime } from "@/lib/article-reading-time";
import { formatDate } from "@/lib/format";

type ArticleCardProps = {
  article: ArticleMeta;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/makaleler/${article.slug}`} className="group block h-full focus-visible:outline-none">
      <article className="flex h-full flex-col overflow-hidden rounded-[8px] border border-primary/10 bg-background shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:border-accent-1/40 group-hover:shadow-[0_22px_64px_rgba(10,22,40,0.12)] group-focus-visible:-translate-y-1 group-focus-visible:border-accent-1/50">
        <div className="overflow-hidden bg-white">
          <ArticleCover
            src={article.coverImageExists ? article.coverImage : undefined}
            title={article.title}
            category={article.category}
            sizes="(min-width: 1280px) 360px, (min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
            imageClassName="transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="mb-4 inline-flex w-fit border border-accent-1/25 bg-white px-3 py-1.5 text-xs font-semibold text-accent-1">
            {article.category}
          </p>
          <h3 className="card-title font-serif text-2xl font-bold leading-tight text-primary transition group-hover:text-accent-1">
            {article.title}
          </h3>
          <p className="mt-3 flex-1 leading-7 text-muted">{article.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-accent-1" aria-hidden />
              {formatDate(article.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-accent-1" aria-hidden />
              {formatReadingTime(article.readingTime)}
            </span>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-1 transition group-hover:text-accent-2">
            Yazıyı oku
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </article>
    </Link>
  );
}
