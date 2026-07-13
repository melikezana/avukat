import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleFilters } from "@/components/articles/article-filters";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/ui/page-header";
import { getAllArticles, getArticleCategories } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Makaleler",
  description:
    "Av. İdris Dağkesen'in anlaşılır hukuk yazıları kategori filtresi ve arama deneyimiyle listelenir."
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const categories = getArticleCategories(articles);

  return (
    <>
      <PageHeader
        eyebrow="Makaleler"
        title="Hukuki konuları kısa, açık ve güven veren yazılarla okuyun."
        description="Günlük hayatta karşılaşılan hukuki sorulara, kavramlara ve süreçlere dair anlaşılır içerikler."
      />
      <section className="bg-white py-16 md:py-20">
        <Container>
          <Suspense fallback={<div className="h-64 rounded-[8px] border border-primary/10 bg-background" />}>
            <ArticleFilters articles={articles} categories={categories} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
