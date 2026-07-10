import type { Metadata } from "next";
import { ArticleFilters } from "@/components/articles/article-filters";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/ui/page-header";
import { getAllArticles, getArticleCategories } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Makaleler",
  description:
    "Av. İdris Dağkesen'in sade dilli hukuk makaleleri, kategori filtresi ve arama deneyimiyle listelenir."
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const categories = getArticleCategories(articles);

  return (
    <>
      <PageHeader
        eyebrow="Makaleler"
        title="Hukuki süreçleri herkesin anlayabileceği bir dille okuyun."
        description="Günlük hayatta karşılaşılan hukuki sorulara, kavramlara ve süreçlere dair pratik yazılar."
      />
      <section className="bg-white py-16 md:py-20">
        <Container>
          <ArticleFilters articles={articles} categories={categories} />
        </Container>
      </section>
    </>
  );
}
