import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleFilters } from "@/components/articles/article-filters";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageHeader } from "@/components/ui/page-header";
import { getAllPublicArticleMetas, getPublicArticleCategories } from "@/lib/public-articles";

export const metadata: Metadata = {
  title: "Makaleler",
  description:
    "Av. İdris Dağkesen'in anlaşılır hukuk yazıları kategori filtresi ve arama deneyimiyle listelenir."
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await getAllPublicArticleMetas();
  const categories = getPublicArticleCategories(articles);

  return (
    <>
      <PageHeader
        eyebrow="Makaleler"
        title="Hukuki konuları kısa, açık ve güven veren yazılarla okuyun."
        description="Günlük hayatta karşılaşılan hukuki sorulara, kavramlara ve süreçlere dair anlaşılır içerikler."
      />
      <section className="bg-white py-16 md:py-20">
        <Container>
          <Breadcrumbs
            className="mb-10"
            items={[
              { name: "Ana Sayfa", href: "/" },
              { name: "Makaleler", href: "/makaleler" }
            ]}
          />
          <Suspense fallback={<div className="h-64 rounded-[8px] border border-primary/10 bg-background" />}>
            <ArticleFilters articles={articles} categories={categories} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
