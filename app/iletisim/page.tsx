import type { Metadata } from "next";
import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { getActionButtonClassName, whatsappIconClassName } from "@/components/ui/action-button-variants";
import { BrandIconWhatsApp, BrandIconX } from "@/components/ui/brand-icons";
import { PageHeader } from "@/components/ui/page-header";
import { contactInfo, socialLinks } from "@/lib/config";
import { getGoogleMapsEmbedUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Av. İdris Dağkesen ile iletişime geçmek için form, telefon, e-posta ve hızlı iletişim alanı."
};

export default function ContactPage() {
  const mapsEmbedUrl = getGoogleMapsEmbedUrl();

  return (
    <>
      <PageHeader
        eyebrow="İletişim"
        title="Sorunuzu açıkça yazın, ilk adımı birlikte netleştirelim."
        description="Form üzerinden iletilen mesajlar ön değerlendirme amacı taşır. Somut durumunuza uygun hukuki değerlendirme için ayrıca randevu planlanması önerilir."
      />

      <section className="bg-white py-16 md:py-20">
        <Container>
          <Breadcrumbs
            className="mb-10"
            items={[
              { name: "Ana Sayfa", href: "/" },
              { name: "İletişim", href: "/iletisim" }
            ]}
          />
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
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
                  const Icon = link.label === "Instagram" ? Instagram : BrandIconX;

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-[6px] border border-primary/10 bg-white px-3 py-2 text-sm font-semibold text-primary transition hover:border-[#B8965A] hover:text-[#B8965A] hover:underline hover:underline-offset-4"
                      aria-label={`${link.label} profilini aç`}
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
              className={getActionButtonClassName("whatsapp")}
              aria-label="WhatsApp ile Yazın"
            >
              <BrandIconWhatsApp className={whatsappIconClassName} />
              WhatsApp ile Yazın
            </Link>

            <div className="overflow-hidden rounded-[8px] border border-primary/10 bg-background">
              {mapsEmbedUrl ? (
                <div className="relative aspect-[16/10] bg-cream-100">
                  <iframe
                    title="Av. İdris Dağkesen ofis konumu"
                    src={mapsEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    className="h-full w-full border-0"
                  />
                  <p className="sr-only">{contactInfo.locationText}</p>
                </div>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(135deg,#FAF7F1_0%,#EFE6D8_45%,#8B6A2F_45%,#0A1628_100%)] p-8 text-center">
                  <div className="max-w-xs bg-white/90 p-5 shadow-soft">
                    <p className="font-serif text-2xl font-bold text-primary">Görüşme bilgisi</p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {contactInfo.locationText}
                    </p>
                  </div>
                </div>
              )}
              <p className="border-t border-primary/10 px-5 py-4 text-sm leading-6 text-muted">
                Harita yüklenmezse randevu yeri ve görüşme ayrıntıları iletişim sonrasında ayrıca paylaşılır.
              </p>
            </div>
          </div>
          </div>
        </Container>
      </section>
    </>
  );
}
