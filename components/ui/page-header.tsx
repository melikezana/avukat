import { Container } from "@/components/layout/container";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="border-b border-navy-900/10 bg-cream-50">
      <Container className="py-16 md:py-20">
        <p className="mb-4 text-sm font-semibold text-gold-600">{eyebrow}</p>
        <h1 className="max-w-4xl font-serif text-4xl font-bold leading-tight text-navy-900 md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-ink/74">{description}</p>
      </Container>
    </section>
  );
}
