import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { ArrowLeft, CalendarDays, Clock, Linkedin, Mail, Twitter } from "lucide-react";
import { Container } from "@/components/layout/container";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import { formatDate } from "@/lib/format";

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: ArticlePageProps): Metadata {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Makale bulunamadı"
    };
  }

  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.summary,
    alternates: {
      canonical: `/makaleler/${article.slug}`
    },
    openGraph: {
      title: article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.summary,
      type: "article",
      publishedTime: article.date,
      images: [article.coverImage]
    }
  };
}

const mdxComponents = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} className="font-semibold text-gold-600 underline decoration-gold-500/40 underline-offset-4" />
  )
};

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const encodedUrl = encodeURIComponent(`/makaleler/${article.slug}`);
  const encodedTitle = encodeURIComponent(article.title);

  return (
    <article className="bg-cream-50">
      <Container className="py-12 md:py-16">
        <Link
          href="/makaleler"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gold-600 transition hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Makalelere dön
        </Link>

        <div className="mx-auto max-w-4xl">
          <p className="mb-4 inline-flex border border-gold-500/35 bg-white px-3 py-2 text-sm font-semibold text-navy-900">
            {article.category}
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-navy-900 md:text-6xl">
            {article.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-ink/74">{article.summary}</p>

          <div className="mt-7 flex flex-wrap items-center gap-4 border-y border-navy-900/10 py-4 text-sm text-ink/65">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gold-600" aria-hidden />
              {formatDate(article.date)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold-600" aria-hidden />
              {article.readingTime} dk okuma
            </span>
          </div>

          <div className="mt-8 overflow-hidden rounded-[8px] border border-navy-900/10 bg-white shadow-soft">
            <Image
              src={article.coverImage}
              alt={`${article.title} kapak görseli`}
              width={1200}
              height={675}
              sizes="(min-width: 768px) 768px, 100vw"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        </div>
      </Container>

      <section className="bg-white py-14 md:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="mx-auto w-full max-w-3xl article-prose">
            <MDXRemote
              source={article.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm]
                }
              }}
            />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[8px] border border-navy-900/10 bg-cream-50 p-5">
              <p className="text-sm font-semibold text-navy-900">Paylaş</p>
              <div className="mt-4 flex gap-2 lg:flex-col">
                <a
                  href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-navy-900/10 bg-white text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
                  aria-label="E-posta ile paylaş"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-navy-900/10 bg-white text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
                  aria-label="X üzerinde paylaş"
                >
                  <Twitter className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-navy-900/10 bg-white text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
                  aria-label="LinkedIn üzerinde paylaş"
                >
                  <Linkedin className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
          </aside>
        </Container>
      </section>
    </article>
  );
}
