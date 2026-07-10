import Link from "next/link";
import { Scale } from "lucide-react";
import { Container } from "@/components/layout/container";

const footerLinks = [
  { href: "/hakkimda", label: "Hakkımda" },
  { href: "/uzmanlik-alanlari", label: "Uzmanlık Alanları" },
  { href: "/makaleler", label: "Makaleler" },
  { href: "/iletisim", label: "İletişim" }
];

export function Footer() {
  return (
    <footer className="border-t border-navy-900/10 bg-navy-900 text-white">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-gold-500 text-navy-900">
              <Scale className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-serif text-xl font-bold">Av. İdris Dağkesen</p>
              <p className="text-sm text-white/62">Kurumsal Avukat & Hukuk Yazarı</p>
            </div>
          </div>
          <p className="mt-5 max-w-md leading-7 text-white/68">
            Bu web sitesindeki içerikler genel bilgilendirme amaçlıdır; somut uyuşmazlıklar için
            hukuki danışmanlık alınması önerilir.
          </p>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-gold-500">Menü</p>
          <div className="space-y-3">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-white/72 transition hover:text-gold-500">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-gold-500">İletişim</p>
          <p className="text-sm leading-7 text-white/72">
            Levent Mah. Hukuk Plaza No: 12 Kat: 5
            <br />
            Beşiktaş / İstanbul
            <br />
            +90 212 000 00 00
          </p>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col justify-between gap-3 py-5 text-xs text-white/54 md:flex-row">
          <p>© {new Date().getFullYear()} Av. İdris Dağkesen. Tüm hakları saklıdır.</p>
          <p>Hukuki yayın platformu ve dijital kartvizit.</p>
        </Container>
      </div>
    </footer>
  );
}
