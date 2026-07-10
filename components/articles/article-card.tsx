"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import type { ArticleMeta } from "@/lib/articles";
import { formatDate } from "@/lib/format";

type ArticleCardProps = {
  article: ArticleMeta;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[8px] border border-navy-900/10 bg-cream-50 shadow-soft transition hover:-translate-y-1 hover:border-gold-500/45">
      <Link href={`/makaleler/${article.slug}`} className="block overflow-hidden bg-white">
        <Image
          src={article.coverImage}
          alt={`${article.title} kapak görseli`}
          width={800}
          height={450}
          sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
          className="aspect-[16/9] w-full object-cover transition duration-500 hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-4 inline-flex w-fit border border-gold-500/35 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900">
          {article.category}
        </p>
        <h3 className="font-serif text-2xl font-bold leading-tight text-navy-900">
          <Link href={`/makaleler/${article.slug}`} className="transition hover:text-gold-600">
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 leading-7 text-ink/72">{article.summary}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-ink/60">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-gold-600" aria-hidden />
            {formatDate(article.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gold-600" aria-hidden />
            {article.readingTime} dk
          </span>
        </div>
        <Link
          href={`/makaleler/${article.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-600 transition hover:text-navy-900"
        >
          Yazıyı oku
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
