import { Container } from "@/components/layout/container";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="border-b border-primary/10 bg-background">
      <Container className="py-16 md:py-20">
        <p className="mb-4 inline-flex border-l-2 border-accent-1 pl-3 text-sm font-semibold text-accent-1">
          {eyebrow}
        </p>
        <h1 className="max-w-4xl font-serif text-4xl font-bold leading-tight text-primary md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{description}</p>
      </Container>
    </section>
  );
}
