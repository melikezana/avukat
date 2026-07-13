import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";
import { practiceAreas } from "@/lib/data/practice-areas";

export const metadata: Metadata = {
  title: "Uzmanlık Alanları",
  description:
    "Kira, iş, aile, ceza, ticaret ve gayrimenkul hukuku alanlarına dair anlaşılır bilgiler."
};

export default function PracticeAreasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Uzmanlık alanları"
        title="Hukuki sürecin hangi alana girdiğini birlikte netleştirelim."
        description="Aşağıdaki başlıklar, sık karşılaşılan hukuki konuları anlaşılır biçimde özetler. Her olayın ayrıntısı farklıdır; doğru yol haritası belgeler, süreler ve somut durum birlikte değerlendirilerek belirlenir."
      />

      <section className="bg-white py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {practiceAreas.map((area) => (
              <Reveal key={area.slug}>
                <article className="flex h-full flex-col rounded-[8px] border border-primary/10 bg-background p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-accent-1/40">
                  <area.icon className="h-8 w-8 text-accent-1" aria-hidden />
                  <h2 className="mt-6 font-serif text-2xl font-bold text-primary">{area.title}</h2>
                  <p className="mt-3 flex-1 leading-7 text-muted">{area.summary}</p>
                  <p className="mt-5 border-l-2 border-accent-1 pl-3 text-sm font-semibold text-primary">{area.note}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-primary py-16 text-white">
        <Container className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-accent-2">Danışmanlık talebi</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Hangi hukuki yolun uygun olduğunu birlikte netleştirelim.</h2>
          </div>
          <Link
            href="/iletisim"
            className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-accent-1 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-accent-2 hover:text-primary"
          >
            İletişime Geç
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Container>
      </section>
    </>
  );
}
