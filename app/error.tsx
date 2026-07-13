"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Home } from "lucide-react";
import { Container } from "@/components/layout/container";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error: _error, reset }: ErrorPageProps) {
  return (
    <section className="min-h-[68vh] border-b border-primary/10 bg-background">
      <Container className="grid items-center gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 border-l-2 border-accent-1 pl-3 text-sm font-semibold text-accent-1">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Hata
          </p>
          <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-primary md:text-6xl">
            Beklenmeyen bir sorun oluştu.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Sayfa yüklenirken bir aksaklık yaşandı. Yeniden deneyebilir, ana sayfaya dönebilir veya hukuk yazılarına devam edebilirsiniz.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-primary px-5 py-3 text-sm font-semibold text-white shadow-gold transition duration-300 hover:bg-accent-1"
            >
              Tekrar Dene
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-accent-2/50 bg-white px-5 py-3 text-sm font-semibold text-primary transition duration-300 hover:border-primary"
            >
              <Home className="h-4 w-4" aria-hidden />
              Ana Sayfa
            </Link>
            <Link
              href="/makaleler"
              className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-accent-2/50 bg-white px-5 py-3 text-sm font-semibold text-primary transition duration-300 hover:border-primary"
            >
              Makaleler
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
        <div className="rounded-[8px] border border-accent-2/40 bg-white p-8 shadow-soft">
          <p className="font-serif text-3xl font-bold text-primary">Bilgilendirme</p>
          <p className="mt-4 leading-8 text-muted">
            Teknik ayrıntılar kullanıcıya gösterilmez; hata bilgisi sunucu tarafında kaydedilir.
          </p>
        </div>
      </Container>
    </section>
  );
}
