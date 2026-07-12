import type { Metadata } from "next";
import Link from "next/link";
import { Instagram, Mail, MapPin, MessageCircle, Phone, Twitter } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/ui/page-header";
import { contactInfo, socialLinks } from "@/lib/site-profile";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Av. İdris Dağkesen ile iletişime geçmek için form, telefon, e-posta ve hızlı iletişim alanı."
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="İletişim"
        title="Sorunuzu açıkça yazın, ilk adımı birlikte netleştirelim."
        description="Form üzerinden iletilen mesajlar ön değerlendirme amacı taşır. Somut durumunuza uygun hukuki değerlendirme için ayrıca randevu planlanması önerilir."
      />

      <section className="bg-white py-16 md:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <ContactForm />

          <div className="space-y-5">
            <div className="rounded-[8px] border border-primary/10 bg-background p-6">
              <div className="flex gap-4">
                <Phone className="h-6 w-6 text-accent-1" aria-hidden />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-primary">Telefon</h2>
                  <a href={contactInfo.phoneHref} className="mt-2 inline-flex text-muted transition hover:text-accent-1">
                    {contactInfo.phoneLabel}
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-[8px] border border-primary/10 bg-background p-6">
              <div className="flex gap-4">
                <Mail className="h-6 w-6 text-accent-1" aria-hidden />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-primary">E-posta</h2>
                  <a href={contactInfo.emailHref} className="mt-2 inline-flex break-all text-muted transition hover:text-accent-1">
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-[8px] border border-primary/10 bg-background p-6">
              <div className="flex gap-4">
                <MapPin className="h-6 w-6 text-accent-1" aria-hidden />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-primary">Randevu</h2>
                  <p className="mt-2 leading-7 text-muted">{contactInfo.appointmentText}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[8px] border border-primary/10 bg-background p-6">
              <h2 className="font-serif text-2xl font-bold text-primary">Sosyal medya</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {socialLinks.map((link) => {
                  const Icon = link.label === "Instagram" ? Instagram : Twitter;

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-[6px] border border-primary/10 bg-white px-3 py-2 text-sm font-semibold text-primary transition hover:border-accent-2 hover:text-accent-1"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {link.handle}
                    </Link>
                  );
                })}
              </div>
            </div>
            <Link
              href={contactInfo.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-accent-1 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-accent-2 hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp ile Yazın
            </Link>

            <div className="overflow-hidden rounded-[8px] border border-primary/10 bg-background">
              <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(135deg,#FAF7F1_0%,#EFE6D8_45%,#7A1F2B_45%,#0A1628_100%)] p-8 text-center">
                <div className="max-w-xs bg-white/90 p-5 shadow-soft">
                  <p className="font-serif text-2xl font-bold text-primary">Görüşme bilgisi</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {contactInfo.locationText}
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
