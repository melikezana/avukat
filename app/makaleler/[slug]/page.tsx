import type { Metadata } from "next";
import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock,
  Instagram,
  Mail,
  Phone,
  UserRound
} from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleCover } from "@/components/articles/article-cover";
import { ArticleDecisionSummary, DecisionPdfCard, getDecisionRows, isValidPdfUrl } from "@/components/articles/article-decision";
import { ArticleAuthorBox, ArticleContactCta } from "@/components/articles/article-ending";
import { ArticleShareActions } from "@/components/articles/article-share-actions";
import { ArticleTableOfContents } from "@/components/articles/article-table-of-contents";
import { Container } from "@/components/layout/container";
import { BrandIconWhatsApp, BrandIconX } from "@/components/ui/brand-icons";
import { formatReadingTime } from "@/lib/article-reading-time";
import { enhanceHtmlHeadings, extractMdxHeadings, type ArticleHeading } from "@/lib/article-toc";
import { getAllArticles } from "@/lib/articles";
import { getCategoryFilterHref } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import {
  getAllPublicArticleMetas,
  getArticleCanonicalUrl,
  getPublicArticleBySlug,
  getPublicSiteUrl,
  getRelatedArticles,
  type PublicArticle
} from "@/lib/public-articles";
import { contactInfo, lawyerProfile, portraitBlurDataUrl, socialLinks } from "@/lib/site-profile";

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

export const dynamicParams = true;

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getPublicArticleBySlug(params.slug);

  if (!article) {
    return {};
  }

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt;
  const image = toAbsoluteUrl(article.ogImage || article.coverImage) || new URL("/opengraph-image", getPublicSiteUrl()).toString();
  const canonical = getArticleCanonicalUrl(article);

  return {
    title,
    description,
    authors: [{ name: article.author }],
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt || article.date,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

function createMdxComponents(headings: ArticleHeading[]) {
  let headingIndex = 0;

  return {
    a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a {...props} className="font-semibold text-accent-1 underline decoration-accent-1/40 underline-offset-4" />
    ),
    h2: (props: HTMLAttributes<HTMLHeadingElement>) => {
      const heading = headings[headingIndex++];
      return <h2 {...props} id={heading?.id} />;
    },
    h3: (props: HTMLAttributes<HTMLHeadingElement>) => {
      const heading = headings[headingIndex++];
      return <h3 {...props} id={heading?.id} />;
    }
  };
}

function toAbsoluteUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).toString();
  } catch {
    return new URL(value, getPublicSiteUrl()).toString();
  }
}

function getDecisionCitation(article: PublicArticle) {
  const rows = getDecisionRows(article);

  if (!rows.length) {
    return undefined;
  }

  return rows.map((row) => `${row.label}: ${row.value}`).join(", ");
}

function getArticleJsonLd(article: PublicArticle) {
  const articleUrl = getArticleCanonicalUrl(article);
  const image = toAbsoluteUrl(article.ogImage || article.coverImage) || new URL("/opengraph-image", getPublicSiteUrl()).toString();
  const keywords = [article.focusKeyword, article.category].filter(Boolean);
  const decisionCitation = getDecisionCitation(article);
  const pdfUrl = isValidPdfUrl(article.decisionPdfUrl) ? article.decisionPdfUrl : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    mainEntityOfPage: articleUrl,
    datePublished: article.publishedAt || article.date,
    dateModified: article.updatedAt || article.publishedAt || article.date,
    author: {
      "@type": "Person",
      name: article.author
    },
    publisher: {
      "@type": "Person",
      name: lawyerProfile.name
    },
    image: [image],
    articleSection: article.category,
    ...(keywords.length ? { keywords } : {}),
    ...(decisionCitation ? { citation: decisionCitation } : {}),
    ...(pdfUrl
      ? {
          associatedMedia: {
            "@type": "MediaObject",
            contentUrl: pdfUrl,
            encodingFormat: "application/pdf",
            name: article.decisionPdfTitle || article.title
          }
        }
      : {})
  };
}

function getBreadcrumbJsonLd(article: PublicArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: getPublicSiteUrl()
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Makaleler",
        item: new URL("/makaleler", getPublicSiteUrl()).toString()
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.category,
        item: new URL(getCategoryFilterHref(article.category), getPublicSiteUrl()).toString()
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: getArticleCanonicalUrl(article)
      }
    ]
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getPublicArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const allArticles = await getAllPublicArticleMetas();
  const relatedArticles = getRelatedArticles(article, allArticles, 3);
  const articleUrl = getArticleCanonicalUrl(article);
  const articleContent =
    article.contentFormat === "html"
      ? enhanceHtmlHeadings(article.content)
      : {
          content: article.content,
          headings: extractMdxHeadings(article.content)
        };
  const mdxComponents = article.contentFormat === "mdx" ? createMdxComponents(articleContent.headings) : undefined;
  const jsonLd = getArticleJsonLd(article);
  const breadcrumbJsonLd = getBreadcrumbJsonLd(article);

  return (
    <article className="bg-background">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd)
          }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd)
        }}
      />

      <Container className="py-12 md:py-16">
        <nav aria-label="İçerik yolu" className="mb-6 text-sm font-semibold text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition hover:text-accent-1">
                Ana Sayfa
              </Link>
            </li>
            <li className="inline-flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-accent-1" aria-hidden />
              <Link href="/makaleler" className="transition hover:text-accent-1">
                Makaleler
              </Link>
            </li>
            <li className="inline-flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-accent-1" aria-hidden />
              <Link href={getCategoryFilterHref(article.category)} className="transition hover:text-accent-1">
                {article.category}
              </Link>
            </li>
            <li className="inline-flex min-w-0 items-center gap-2 text-primary" aria-current="page">
              <ChevronRight className="h-4 w-4 shrink-0 text-accent-1" aria-hidden />
              <span className="truncate">{article.title}</span>
            </li>
          </ol>
        </nav>

        <Link
          href="/makaleler"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-1 transition hover:text-accent-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Makalelere dön
        </Link>

        <div className="mx-auto max-w-4xl">
          <p className="mb-4 inline-flex border border-accent-1/25 bg-white px-3 py-2 text-sm font-semibold text-accent-1">
            {article.category}
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-primary md:text-6xl">
            {article.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">{article.summary}</p>

          <div className="mt-7 flex flex-wrap items-center gap-4 border-y border-primary/10 py-4 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-accent-1" aria-hidden />
              {formatDate(article.publishedAt || article.date)}
            </span>
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4 text-accent-1" aria-hidden />
              {article.author}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-1" aria-hidden />
              {formatReadingTime(article.readingTime)}
            </span>
          </div>

          <div className="mt-8 overflow-hidden rounded-[8px] border border-primary/10 bg-white shadow-soft">
            <ArticleCover
              src={article.coverImageExists ? article.coverImage : undefined}
              title={article.title}
              category={article.category}
              width={1200}
              height={675}
              sizes="(min-width: 1024px) 896px, (min-width: 768px) calc(100vw - 4rem), 100vw"
              priority
            />
          </div>
        </div>
      </Container>

      <section className="bg-white py-14 md:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div lang="tr" className="article-prose prose mx-auto w-full max-w-3xl">
            <ArticleTableOfContents headings={articleContent.headings} mobile className="not-prose mb-8 lg:hidden" />
            <ArticleDecisionSummary article={article} />

            {article.contentFormat === "mdx" ? (
              <MDXRemote
                source={articleContent.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm]
                  }
                }}
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: articleContent.content }} />
            )}

            <div className="mt-10 rounded-[8px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
              Bu içerik genel bilgilendirme amacıyla hazırlanmıştır. Somut olayınıza ilişkin hukuki değerlendirme ve profesyonel danışmanlık yerine geçmez.
            </div>
            <DecisionPdfCard article={article} />
            <ArticleShareActions url={articleUrl} title={article.title} />
            <ArticleContactCta />
            <ArticleAuthorBox />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <ArticleTableOfContents headings={articleContent.headings} className="hidden lg:block" />

            <div className="rounded-[8px] border border-primary/10 bg-background p-5">
              <div className="flex items-center gap-3">
                <Image
                  src={lawyerProfile.portraitSrc}
                  alt={lawyerProfile.portraitAlt}
                  width={96}
                  height={96}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={portraitBlurDataUrl}
                  sizes="48px"
                  className="h-12 w-12 rounded-full border border-accent-2/40 object-cover object-top"
                />
                <div>
                  <p className="text-sm font-semibold text-accent-1">Yazar Hakkında</p>
                  <p className="font-serif text-lg font-bold leading-tight text-primary">{article.author}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{lawyerProfile.articleBio}</p>
              <div className="mt-4 flex gap-2">
                {socialLinks.map((link) => {
                  const Icon = link.label === "Instagram" ? Instagram : BrandIconX;

                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-primary/10 bg-white text-primary transition hover:border-accent-2 hover:text-accent-1"
                      aria-label={`${link.label} profilini aç`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </a>
                  );
                })}
                <a
                  href={contactInfo.phoneHref}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-primary/10 bg-white text-primary transition hover:border-accent-2 hover:text-accent-1"
                  aria-label="Telefonla ara"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href={contactInfo.emailHref}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-primary/10 bg-white text-primary transition hover:border-accent-2 hover:text-accent-1"
                  aria-label="E-posta gönder"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href={contactInfo.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#1f7a3d] bg-[#1f7a3d] text-white transition hover:border-[#17662f] hover:bg-[#17662f]"
                  aria-label="WhatsApp ile yaz"
                >
                  <BrandIconWhatsApp className="h-4 w-4" />
                </a>
              </div>
            </div>
          </aside>
        </Container>
      </section>

      {relatedArticles.length > 0 ? (
        <section className="bg-background py-14 md:py-20">
          <Container>
            <div className="mb-8">
              <p className="text-sm font-semibold text-accent-1">İlgili Yazılar</p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-primary">Benzer konular</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard key={`${relatedArticle.source}-${relatedArticle.slug}`} article={relatedArticle} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </article>
  );
}
