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
    "Ceza hukuku, aile hukuku, ticaret hukuku, iş hukuku ve diğer hizmet alanlarına dair düzenlenebilir uzmanlık kartları."
};

export default function PracticeAreasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Uzmanlık alanları"
        title="Hukuki süreçleri anlaşılır, ölçülü ve stratejik biçimde ele alan hizmet alanları."
        description="Aşağıdaki başlıklar örnek içerik olarak hazırlanmıştır. Hizmet kapsamı, öncelikli alanlar ve açıklamalar proje yayına alınmadan kolayca düzenlenebilir."
      />

      <section className="bg-white py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {practiceAreas.map((area) => (
              <Reveal key={area.slug}>
                <article className="flex h-full flex-col rounded-[8px] border border-navy-900/10 bg-cream-50 p-6 shadow-soft transition hover:-translate-y-1 hover:border-gold-500/45">
                  <area.icon className="h-8 w-8 text-gold-600" aria-hidden />
                  <h2 className="mt-6 font-serif text-2xl font-bold text-navy-900">{area.title}</h2>
                  <p className="mt-3 flex-1 leading-7 text-ink/72">{area.summary}</p>
                  <p className="mt-5 text-sm font-semibold text-navy-900">{area.note}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy-900 py-16 text-white">
        <Container className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-gold-500">Danışmanlık talebi</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Hangi hukuki yolun uygun olduğunu birlikte netleştirelim.</h2>
          </div>
          <Link
            href="/iletisim"
            className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-900 transition hover:bg-cream-50"
          >
            İletişim
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Container>
      </section>
    </>
  );
}
