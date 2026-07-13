import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { ArticleCover } from "@/components/articles/article-cover";
import type { ArticleMeta } from "@/lib/articles";
import { formatDate } from "@/lib/format";

type ArticleCardProps = {
  article: ArticleMeta;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[8px] border border-primary/10 bg-background shadow-soft transition duration-300 hover:-translate-y-1 hover:border-accent-1/40">
      <Link href={`/makaleler/${article.slug}`} className="block overflow-hidden bg-white">
        <ArticleCover
          src={article.coverImageExists ? article.coverImage : undefined}
          title={article.title}
          category={article.category}
          sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
          imageClassName="transition duration-500 hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-4 inline-flex w-fit border border-accent-1/25 bg-white px-3 py-1.5 text-xs font-semibold text-accent-1">
          {article.category}
        </p>
        <h3 className="font-serif text-2xl font-bold leading-tight text-primary">
          <Link href={`/makaleler/${article.slug}`} className="transition hover:text-accent-1">
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 leading-7 text-muted">{article.summary}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-accent-1" aria-hidden />
            {formatDate(article.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-accent-1" aria-hidden />
            {article.readingTime} dakika okuma
          </span>
        </div>
        <Link
          href={`/makaleler/${article.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-1 transition hover:text-accent-2"
        >
          Yazıyı oku
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
