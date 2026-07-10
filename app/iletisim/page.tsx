import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Av. İdris Dağkesen ile iletişime geçmek için form, telefon, adres, harita ve WhatsApp hızlı iletişim alanı."
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="İletişim"
        title="Sorunuzu açıkça yazın, hukuki süreci birlikte netleştirelim."
        description="Form üzerinden iletilen mesajlar ön değerlendirme amacı taşır. Detaylı hukuki görüş için randevu planlanması önerilir."
      />

      <section className="bg-white py-16 md:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <ContactForm />

          <div className="space-y-5">
            <div className="rounded-[8px] border border-navy-900/10 bg-cream-50 p-6">
              <div className="flex gap-4">
                <Phone className="h-6 w-6 text-gold-600" aria-hidden />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-900">Telefon</h2>
                  <p className="mt-2 text-ink/72">+90 212 000 00 00</p>
                </div>
              </div>
            </div>
            <div className="rounded-[8px] border border-navy-900/10 bg-cream-50 p-6">
              <div className="flex gap-4">
                <MapPin className="h-6 w-6 text-gold-600" aria-hidden />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-900">Adres</h2>
                  <p className="mt-2 leading-7 text-ink/72">
                    Levent Mah. Hukuk Plaza No: 12 Kat: 5, Beşiktaş / İstanbul
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="https://wa.me/902120000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp ile hızlı iletişim
            </Link>

            <div className="overflow-hidden rounded-[8px] border border-navy-900/10 bg-cream-50">
              <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(135deg,#FAF7F2_0%,#F1E8DA_45%,#0B1F3A_45%,#0B1F3A_100%)] p-8 text-center">
                <div className="max-w-xs bg-white/92 p-5 shadow-soft">
                  <p className="font-serif text-2xl font-bold text-navy-900">Harita alanı</p>
                  <p className="mt-2 text-sm leading-6 text-ink/70">
                    Google Maps embed kodu bu alana eklenebilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
