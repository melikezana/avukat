import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { SectionIntro } from "@/components/ui/section-intro";
import { getAllPublicArticleMetas, type PublicArticleMeta } from "@/lib/public-articles";

export async function getRecentArticles(): Promise<PublicArticleMeta[]> {
  try {
    return (await getAllPublicArticleMetas()).slice(0, 3);
  } catch (error) {
    console.error("[home.recentArticles]", error);
    return [];
  }
}

export function RecentArticlesSection({ articles }: { articles: PublicArticleMeta[] }) {
  if (!articles.length) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-20">
      <Container>
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <SectionIntro
            eyebrow="Güncel içerikler"
            title="📌 Son Eklenenler"
            description="En yeni içtihatlar, önemli Yargıtay kararları ve güncel hukuki değerlendirmeler."
          />
          <Link
            href="/makaleler"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[6px] border border-primary/15 bg-cream-50 px-4 py-2 text-sm font-semibold text-primary transition hover:border-accent-2 hover:text-accent-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1"
          >
            Tüm Makaleler
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <Reveal key={`${article.source}-${article.slug}`} delay={index * 0.06}>
              <ArticleCard article={article} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
