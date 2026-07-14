import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Home, Mail, Scale } from "lucide-react";
import { Container } from "@/components/layout/container";
import { lawyerProfile } from "@/lib/site-profile";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı",
  robots: {
    index: false,
    follow: false
  }
};

export default function NotFound() {
  return (
    <section className="min-h-[68vh] border-b border-primary/10 bg-background">
      <Container className="grid items-center gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 border-l-2 border-accent-1 pl-3 text-sm font-semibold text-accent-1">
            <Scale className="h-4 w-4" aria-hidden />
            404
          </p>
          <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-primary md:text-6xl">
            Aradığınız sayfa bulunamadı.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Sayfa kaldırılmış, adres değişmiş veya bağlantı hatalı yazılmış olabilir. Ana sayfadan devam edebilir ya da iletişim bölümünden destek alabilirsiniz.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-primary px-5 py-3 text-sm font-semibold text-white shadow-gold transition duration-300 hover:bg-accent-1"
            >
              <Home className="h-4 w-4" aria-hidden />
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/makaleler"
              className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-accent-2/50 bg-white px-5 py-3 text-sm font-semibold text-primary transition duration-300 hover:border-primary"
            >
              Makaleleri İncele
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-accent-2/50 bg-white px-5 py-3 text-sm font-semibold text-primary transition duration-300 hover:border-primary"
            >
              <Mail className="h-4 w-4" aria-hidden />
              İletişime Geç
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
        <div className="rounded-[8px] border border-accent-2/40 bg-white p-8 shadow-soft">
          <p className="font-serif text-3xl font-bold text-primary">{lawyerProfile.name}</p>
          <p className="mt-4 leading-8 text-muted">
            Hukuki yazılar, uzmanlık alanları ve iletişim bilgileri için üst menüden ilgili bölümlere ulaşabilirsiniz.
          </p>
        </div>
      </Container>
    </section>
  );
}
