import type { Metadata } from "next";
import { Award, BookOpenText, GraduationCap, Scale } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Hakkımda",
  description:
    "Av. İdris Dağkesen'in eğitim geçmişi, mesleki deneyimi, uzmanlık alanları ve hukuku halka anlatma misyonu."
};

const timeline = [
  {
    title: "İstanbul Üniversitesi Hukuk Fakültesi",
    text: "Köklü hukuk eğitimiyle analitik düşünme, yorumlama ve hukuki yazım disiplinini geliştirdi.",
    icon: GraduationCap
  },
  {
    title: "10 yıllık mesleki deneyim",
    text: "Dava takibi, danışmanlık ve uyuşmazlık çözümü alanlarında bireysel ve kurumsal müvekkillerle çalıştı.",
    icon: Award
  },
  {
    title: "Hukuk yazarlığı",
    text: "Hukuki kavramları günlük hayatın diliyle açıklayan yayınlar hazırlayarak hukuk okuryazarlığına katkı sunar.",
    icon: BookOpenText
  }
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hakkımda"
        title="Güvenilir hukuki danışmanlık, sade ve anlaşılır bilgiyle başlar."
        description="Av. İdris Dağkesen, mesleki deneyimini yalnızca dava ve danışmanlık süreçlerinde değil, hukuki bilginin toplumla buluşmasında da kullanmayı hedefler."
      />

      <section className="bg-white py-20">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="font-serif text-3xl font-bold leading-tight text-navy-900 md:text-4xl">
              Misyon: hukuki dili sadeleştirmek, hak arama kültürünü güçlendirmek.
            </p>
            <p className="mt-6 leading-8 text-ink/74">
              Hukuk çoğu kişi için karmaşık, mesafeli ve teknik görünebilir. Bu
              nedenle her metinde temel amaç; kişinin hangi hakka sahip olduğunu,
              hangi adımı ne zaman atması gerektiğini ve süreçte nelere dikkat
              edileceğini açık biçimde anlatmaktır.
            </p>
          </Reveal>

          <div className="space-y-5">
            {timeline.map((item) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title}>
                  <div className="rounded-[8px] border border-navy-900/10 bg-cream-50 p-6">
                    <div className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] bg-navy-900 text-gold-500">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-navy-900">{item.title}</h2>
                        <p className="mt-2 leading-7 text-ink/72">{item.text}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-navy-900/10 bg-cream-50 py-20">
        <Container className="grid gap-10 md:grid-cols-3">
          {[
            ["Çalışma ilkesi", "Önce dinlemek, sonra olası yolları açık ve ölçülü biçimde anlatmak."],
            ["Yayın dili", "Teknik kavramları korurken, gündelik hayatta anlaşılacak örneklerle açıklamak."],
            ["Odak", "Ceza, aile, iş, ticaret ve tüketici hukuku gibi pratik temas noktaları."]
          ].map(([title, text]) => (
            <Reveal key={title}>
              <div className="border-l-2 border-gold-500 pl-5">
                <Scale className="mb-5 h-6 w-6 text-gold-600" aria-hidden />
                <h2 className="font-serif text-2xl font-bold text-navy-900">{title}</h2>
                <p className="mt-3 leading-7 text-ink/72">{text}</p>
              </div>
            </Reveal>
          ))}
        </Container>
      </section>
    </>
  );
}
