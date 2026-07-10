import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, GraduationCap, Scale, ShieldCheck } from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { SectionIntro } from "@/components/ui/section-intro";
import { getAllArticles } from "@/lib/articles";
import { practiceAreas } from "@/lib/data/practice-areas";

const badges = [
  { label: "10 yıl deneyim", icon: ShieldCheck },
  { label: "İÜ Hukuk mezunu", icon: GraduationCap },
  { label: "Sade dilli yayınlar", icon: BookOpenText }
];

export default function HomePage() {
  const latestArticles = getAllArticles().slice(0, 3);

  return (
    <>
      <section className="overflow-hidden border-b border-navy-900/10 bg-cream-50">
        <Container className="grid items-center gap-12 py-16 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <Reveal>
            <p className="mb-5 inline-flex items-center gap-2 border border-gold-500/35 bg-white/70 px-3 py-2 text-sm font-medium text-navy-900">
              <Scale className="h-4 w-4 text-gold-600" aria-hidden />
              Kurumsal avukat ve hukuk yazarı
            </p>
            <h1 className="max-w-3xl font-serif text-5xl font-bold leading-[1.05] text-navy-900 md:text-6xl">
              Av. İdris Dağkesen
            </h1>
            <p className="mt-6 max-w-2xl font-serif text-3xl leading-tight text-navy-800 md:text-4xl">
              Hukuku Herkes İçin Anlaşılır Kılmak
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/78">
              İstanbul Üniversitesi Hukuk Fakültesi mezunu Av. İdris Dağkesen,
              hukuki sorunları sade, güvenilir ve uygulanabilir bilgilerle anlatan
              bir yayın platformu sunar.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/makaleler"
                className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-navy-800"
              >
                Makaleleri Oku
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/iletisim"
                className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-navy-900/15 bg-white px-5 py-3 text-sm font-semibold text-navy-900 transition hover:border-gold-500 hover:text-gold-600"
              >
                İletişime Geç
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative mx-auto max-w-[460px]">
              <div className="absolute -left-4 top-8 h-48 w-24 border border-gold-500/40" aria-hidden />
              <div className="relative overflow-hidden rounded-[8px] border border-navy-900/10 bg-navy-900 shadow-soft">
                <Image
                  src="/images/av-idris-dagkesen-placeholder.png"
                  alt="Av. İdris Dağkesen için profesyonel portre placeholder"
                  width={1024}
                  height={1536}
                  priority
                  sizes="(min-width: 1024px) 38vw, 82vw"
                  className="aspect-[4/5] h-auto w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 right-5 border border-gold-500/40 bg-cream-50 px-5 py-4 shadow-gold">
                <p className="font-serif text-2xl font-bold text-navy-900">10+</p>
                <p className="text-sm text-ink/70">yıllık mesleki deneyim</p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <Reveal key={badge.label}>
                  <div className="flex items-center gap-4 border border-navy-900/10 bg-cream-50 p-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[6px] bg-navy-900 text-gold-500">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <p className="font-semibold text-navy-900">{badge.label}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-cream-50 py-20">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <SectionIntro
              eyebrow="Yaklaşım"
              title="Hukuki bilgi, ancak anlaşılır olduğunda değer üretir."
              description="Bu site, hukuki kavramları teknik jargonun içinde kaybetmeden; hak arama yollarını, süreçleri ve dikkat edilmesi gereken noktaları herkesin anlayacağı açıklıkta paylaşmak için tasarlandı."
            />
            <Link
              href="/hakkimda"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-gold-600 transition hover:text-navy-900"
            >
              Hakkımda sayfası
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {practiceAreas.slice(0, 4).map((area) => (
              <Reveal key={area.slug}>
                <div className="h-full rounded-[8px] border border-navy-900/10 bg-white p-6 shadow-soft">
                  <area.icon className="mb-5 h-7 w-7 text-gold-600" aria-hidden />
                  <h3 className="font-serif text-2xl font-bold text-navy-900">{area.title}</h3>
                  <p className="mt-3 leading-7 text-ink/72">{area.summary}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container>
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <SectionIntro
              eyebrow="Son yazılar"
              title="Güncel hukuki konular sade bir dille"
              description="Makaleler; günlük hayatta sık karşılaşılan sorunları, hakları ve hukuki süreçleri pratik bir çerçevede ele alır."
            />
            <Link
              href="/makaleler"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gold-600 transition hover:text-navy-900"
            >
              Tüm makaleler
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latestArticles.map((article) => (
              <Reveal key={article.slug}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy-900 py-18 text-white md:py-20">
        <Container className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-3 text-sm font-semibold text-gold-500">İletişim</p>
            <h2 className="font-serif text-4xl font-bold md:text-5xl">
              Hukuki sorunuz için ilk adımı sadeleştirelim.
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-white/74">
              Randevu talebi, yayın önerisi veya genel bilgi için iletişim formunu
              doldurabilirsiniz. Başvurunuz kısa sürede değerlendirilir.
            </p>
          </div>
          <Link
            href="/iletisim"
            className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-900 transition hover:bg-cream-50"
          >
            Formu Aç
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Container>
      </section>
    </>
  );
}
