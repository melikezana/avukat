import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <section className="min-h-[58vh] bg-background py-16">
      <Container>
        <div className="max-w-3xl animate-pulse space-y-5" aria-label="Sayfa yükleniyor">
          <div className="h-4 w-36 rounded bg-primary/10" />
          <div className="h-12 w-full rounded bg-primary/10" />
          <div className="h-5 w-5/6 rounded bg-primary/10" />
          <div className="h-5 w-2/3 rounded bg-primary/10" />
        </div>
      </Container>
    </section>
  );
}
