import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, Phone, Scale, Twitter } from "lucide-react";
import { Container } from "@/components/layout/container";
import { contactInfo, lawyerProfile, portraitBlurDataUrl, socialLinks } from "@/lib/config";

const footerLinks = [
  { href: "/hakkimda", label: "Hakkımda" },
  { href: "/uzmanlik-alanlari", label: "Uzmanlık Alanları" },
  { href: "/makaleler", label: "Makaleler" },
  { href: "/iletisim", label: "İletişim" }
];

const legalLinks = [
  { href: "/gizlilik", label: "Gizlilik" },
  { href: "/kvkk-aydinlatma", label: "KVKK Aydınlatma" },
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" }
];

export function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-primary text-white">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.2fr_0.7fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-accent-2/50 bg-white/10">
              <Image
                src={lawyerProfile.portraitSrc}
                alt={lawyerProfile.portraitAlt}
                width={96}
                height={96}
                sizes="48px"
                placeholder="blur"
                blurDataURL={portraitBlurDataUrl}
                className="h-full w-full object-cover"
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-1 text-white ring-2 ring-primary">
                <Scale className="h-3 w-3" aria-hidden />
              </span>
            </span>
            <div>
              <p className="font-serif text-xl font-bold">{lawyerProfile.name}</p>
              <p className="text-sm text-white/60">{lawyerProfile.title}</p>
            </div>
          </div>
          <p className="mt-5 max-w-md leading-7 text-white/70">
            Bu sitedeki yazılar genel bilgilendirme içindir. Kendi durumunuzla ilgili net yol haritası
            için hukuki danışmanlık almanız önerilir.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            {socialLinks.map((link) => {
              const Icon = link.label === "Instagram" ? Instagram : Twitter;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-white/10 px-3 py-2 text-sm font-semibold text-white/70 transition hover:border-[#B8965A] hover:text-[#B8965A] hover:underline hover:underline-offset-4"
                  aria-label={`${link.label} profilini aç`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{link.handle}</span>
                </a>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-accent-2">Menü</p>
          <div className="space-y-3">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-white/70 transition hover:text-accent-2">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-accent-2">Yasal</p>
          <div className="space-y-3">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-white/70 transition hover:text-accent-2">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-accent-2">İletişim</p>
          <div className="space-y-3 text-sm text-white/70">
            <a
              href={contactInfo.phoneHref}
              className="flex items-center gap-2 transition hover:text-accent-2"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {contactInfo.phoneLabel}
            </a>
            <a
              href={contactInfo.emailHref}
              className="flex items-center gap-2 break-all transition hover:text-accent-2"
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              {contactInfo.email}
            </a>
            <p className="leading-7">{contactInfo.locationText}</p>
          </div>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col justify-between gap-3 py-5 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} {lawyerProfile.name}. Tüm hakları saklıdır.</p>
          <p>Anlaşılır hukuk yazıları ve danışmanlık bilgileri.</p>
        </Container>
      </div>
    </footer>
  );
}
