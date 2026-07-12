import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, GraduationCap, Scale, ShieldCheck } from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { SectionIntro } from "@/components/ui/section-intro";
import { getAllArticles } from "@/lib/articles";
import { practiceAreas } from "@/lib/data/practice-areas";
import { lawyerProfile, portraitBlurDataUrl } from "@/lib/site-profile";

const trustBadges = [
  { label: "10+ Yıl Deneyim", icon: ShieldCheck },
  { label: "İ.Ü. Hukuk Fakültesi", icon: GraduationCap },
  { label: "Anlaşılır Hukuk Yazıları", icon: BookOpenText }
];

const approachCards = [
  {
    title: "Önce süreci netleştirir",
    text: "Karmaşık görünen hukuki konuyu anlaşılır parçalara ayırır; hangi adımın neden önemli olduğunu açıklar.",
    icon: Scale
  },
  {
    title: "Bilgiyi uygulanabilir kılar",
    text: "Yazılar ve açıklamalar, kişinin haklarını ve seçeneklerini gerçekçi bir çerçevede görebilmesi için hazırlanır.",
    icon: BookOpenText
  }
];

export default function HomePage() {
  const latestArticles = getAllArticles().slice(0, 3);

  return (
    <>
      <section className="overflow-hidden border-b border-primary/10 bg-background">
        <Container className="grid items-center gap-12 py-12 md:py-16 lg:grid-cols-[1.04fr_0.96fr] lg:py-24">
          <Reveal className="lg:order-1">
            <p className="mb-5 inline-flex items-center gap-2 border border-accent-1/25 bg-white/75 px-3 py-2 text-sm font-medium text-accent-1">
              <Scale className="h-4 w-4" aria-hidden />
              {lawyerProfile.name}
            </p>
            <h1 className="max-w-3xl font-serif text-5xl font-bold leading-[1.05] text-primary md:text-6xl">
              Hukuki süreçleri anlaşılır ve güven veren bir dille açıklıyorum.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              İstanbul Üniversitesi Hukuk Fakültesi mezunu Av. İdris Dağkesen, 10 yıllık deneyimiyle
              hukuki konuları değerlendirir; haklarınızı, seçeneklerinizi ve atılabilecek adımları
              açık bir dille ortaya koyar.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/makaleler"
                className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-accent-1 px-5 py-3 text-sm font-semibold text-white shadow-brand transition duration-300 hover:bg-accent-2 hover:text-primary"
              >
                Hukuk Yazılarını İncele
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/iletisim"
                className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-accent-1/25 bg-white px-5 py-3 text-sm font-semibold text-accent-1 transition duration-300 hover:border-accent-2 hover:text-accent-2"
              >
                Danışmanlık İçin İletişime Geç
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-y-3 text-sm font-semibold text-primary">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;

                return (
                  <span
                    key={badge.label}
                    className={`inline-flex items-center gap-2 pr-4 ${
                      index > 0 ? "border-l border-accent-1/30 pl-4" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 text-accent-1" aria-hidden />
                    {badge.label}
                  </span>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="order-first lg:order-2">
            <div className="relative mx-auto max-w-[460px]">
              <div
                className="absolute -inset-4 rounded-[42%_58%_50%_50%/46%_42%_58%_54%] bg-accent-1/10"
                aria-hidden
              />
              <div className="absolute -right-5 top-8 h-[78%] w-[72%] rounded-[8px] border border-accent-2/50" aria-hidden />
              <div className="relative overflow-hidden rounded-[8px] border border-accent-2/40 bg-primary shadow-soft">
                <Image
                  src={lawyerProfile.portraitSrc}
                  alt={lawyerProfile.portraitAlt}
                  width={400}
                  height={400}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={portraitBlurDataUrl}
                  sizes="(min-width: 1024px) 38vw, 88vw"
                  className="aspect-square h-auto w-full object-cover object-center"
                />
              </div>
              <div className="absolute -bottom-5 right-5 border border-accent-2/50 bg-background px-5 py-4 shadow-gold">
                <p className="font-serif text-2xl font-bold text-accent-1">10+</p>
                <p className="text-sm text-muted">yıllık mesleki deneyim</p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr]">
          <Reveal>
            <SectionIntro
              eyebrow="Yaklaşım"
              title="Hukuk, doğru açıklandığında yol gösterir."
              description="Bu site; hak arama yollarını, hukuki süreçleri ve dikkat edilmesi gereken noktaları yalın ama özenli bir dille aktarmak için hazırlandı."
            />
            <Link
              href="/hakkimda"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-accent-1 transition hover:text-accent-2"
            >
              Hakkımda sayfasını oku
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {approachCards.map((item) => {
              const Icon = item.icon;

              return (
                <Reveal key={item.title}>
                  <div className="h-full rounded-[8px] border border-primary/10 bg-background p-6 shadow-soft">
                    <Icon className="mb-5 h-7 w-7 text-accent-1" aria-hidden />
                    <h3 className="font-serif text-2xl font-bold text-primary">{item.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{item.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-background py-20">
        <Container>
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <SectionIntro
              eyebrow="Hizmet alanları"
              title="Hukuki ihtiyaçlara göre uzmanlık alanları"
              description="Ceza, aile, iş, kira, tüketici ve ticaret hukuku gibi alanlarda süreci doğru değerlendirmeye yardımcı açıklamalar ve danışmanlık başlıkları."
            />
            <Link
              href="/uzmanlik-alanlari"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-1 transition hover:text-accent-2"
            >
              Tüm alanları gör
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {practiceAreas.slice(0, 4).map((area) => (
              <Reveal key={area.slug}>
                <div className="h-full rounded-[8px] border border-primary/10 bg-white p-6 shadow-soft transition hover:border-accent-1/30">
                  <area.icon className="mb-5 h-7 w-7 text-accent-1" aria-hidden />
                  <h3 className="font-serif text-2xl font-bold text-primary">{area.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{area.summary}</p>
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
              title="Hukuki konuları açık ve ölçülü bir dille okuyun"
              description="Makaleler; sık karşılaşılan sorunları, temel hakları ve izlenebilecek yolları pratik örneklerle ele alır."
            />
            <Link
              href="/makaleler"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-1 transition hover:text-accent-2"
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

      <section className="bg-primary py-16 text-white md:py-20">
        <Container className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-3 text-sm font-semibold text-accent-2">İletişim</p>
            <h2 className="font-serif text-4xl font-bold md:text-5xl">
              Hukuki sorunuz için ilk adımı birlikte netleştirelim.
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-white/75">
              Randevu talebi, yazı önerisi veya genel bilgi için iletişim formunu doldurabilirsiniz.
              Mesajınız incelendikten sonra size dönüş yapılır.
            </p>
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
