import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/ui/page-header";

type LegalSection = {
  title: string;
  body: ReactNode;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  currentHref: string;
  sections: LegalSection[];
};

export function LegalPage({ eyebrow, title, description, currentHref, sections }: LegalPageProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <section className="bg-white py-10 md:py-14">
        <Container>
          <Breadcrumbs
            className="mb-8"
            items={[
              { name: "Ana Sayfa", href: "/" },
              { name: title, href: currentHref }
            ]}
          />
          <div className="mx-auto max-w-4xl rounded-[8px] border border-primary/10 bg-background p-6 shadow-soft md:p-8">
            <div className="article-prose max-w-none">
              {sections.map((section, index) => (
                <section key={section.title} aria-labelledby={`${currentHref.slice(1)}-section-${index + 1}`}>
                  <h2 id={`${currentHref.slice(1)}-section-${index + 1}`}>{section.title}</h2>
                  <div>{section.body}</div>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
