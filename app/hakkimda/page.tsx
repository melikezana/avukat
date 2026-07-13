import type { Metadata } from "next";
import Image from "next/image";
import { Award, BookOpenText, GraduationCap, Scale } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";
import { lawyerProfile, portraitBlurDataUrl } from "@/lib/site-profile";

export const metadata: Metadata = {
  title: "Hakkımda",
  description:
    "Av. İdris Dağkesen'in İstanbul Üniversitesi Hukuk Fakültesi mezuniyeti, mesleki deneyimi ve danışmanlık yaklaşımı."
};

const timeline = [
  {
    title: "İstanbul Üniversitesi Hukuk Fakültesi",
    text: "Hukuki düşünme, yazma ve yorumlama disiplinini köklü bir hukuk eğitimiyle pekiştirdi.",
    icon: GraduationCap
  },
  {
    title: "10 yıllık mesleki deneyim",
    text: "Dava takibi, danışmanlık ve uyuşmazlık çözümü süreçlerinde bireysel ve kurumsal dosyalar üzerinde çalıştı.",
    icon: Award
  },
  {
    title: "Anlaşılır hukuk dili",
    text: "Karmaşık kavramları açık cümlelerle anlatarak hak arama yollarını daha görünür hale getirmeyi amaçlar.",
    icon: BookOpenText
  }
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hakkımda"
        title="Hukuki desteği anlaşılır, ölçülü ve güven veren bir yaklaşımla sunan avukat."
        description="Av. İdris Dağkesen, hukuki danışmanlığın yalnızca dava dosyalarında değil, kişinin haklarını doğru anlamasında da değerli olduğuna inanır."
      />

      <section className="bg-white py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <div className="relative mx-auto max-w-[480px]">
              <div
                className="absolute -inset-4 rounded-[48%_52%_44%_56%/44%_48%_52%_56%] bg-accent-1/10"
                aria-hidden
              />
              <div className="absolute -left-5 top-10 h-[76%] w-[68%] rounded-[8px] border border-accent-2/50" aria-hidden />
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
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="font-serif text-3xl font-bold leading-tight text-primary md:text-4xl">
              Amacım, hukuki süreci kişinin anlayabileceği açıklıkta ve güvenle takip edebileceği şekilde anlatmak.
            </p>
            <div className="mt-6 space-y-5 leading-8 text-muted">
              <p>
                İstanbul Üniversitesi Hukuk Fakültesi mezunu Av. İdris Dağkesen, 10 yıllık mesleki
                deneyimiyle hukuki sorunları dikkatli, ölçülü ve çözüm odaklı biçimde değerlendirir.
              </p>
              <p>
                Hukuki süreçler çoğu kişi için karmaşık ve yorucu görünebilir. Bu nedenle temel amaç;
                kanunları, kavramları ve süreleri anlaşılır biçimde açıklamak, kişinin hangi hakka sahip
                olduğunu ve hangi adımları değerlendirebileceğini netleştirmektir.
              </p>
              <p>
                Yazılarda ve danışmanlık yaklaşımında ağır hukuk dili yerine açık ifadeler, pratik örnekler
                ve gerçek hayatta karşılığı olan yol haritaları öne çıkar.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="border-y border-primary/10 bg-background py-20">
        <Container className="grid gap-5 md:grid-cols-3">
          {timeline.map((item) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.title}>
                <div className="h-full rounded-[8px] border border-primary/10 bg-white p-6 shadow-soft">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] bg-accent-1 text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h2 className="mt-5 font-serif text-2xl font-bold text-primary">{item.title}</h2>
                  <p className="mt-3 leading-7 text-muted">{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container className="grid gap-10 md:grid-cols-3">
          {[
            ["Çalışma ilkesi", "Önce kişiyi dinlemek, sonra seçenekleri açık ve gerçekçi biçimde anlatmak."],
            ["Yayın dili", "Teknik kavramları günlük hayattan örneklerle takip edilebilir hale getirmek."],
            ["Odak", "Kira, iş, aile, ceza, ticaret ve gayrimenkul hukuku gibi sık karşılaşılan alanlar."]
          ].map(([title, text]) => (
            <Reveal key={title}>
              <div className="border-l-2 border-accent-1 pl-5">
                <Scale className="mb-5 h-6 w-6 text-accent-1" aria-hidden />
                <h2 className="font-serif text-2xl font-bold text-primary">{title}</h2>
                <p className="mt-3 leading-7 text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </Container>
      </section>
    </>
  );
}
