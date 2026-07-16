import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { contactInfo, lawyerProfile, portraitBlurDataUrl } from "@/lib/site-profile";

export function ArticleContactCta() {
  return (
    <section className="article-cta not-prose mt-10 rounded-[8px] border border-primary/10 bg-primary p-6 text-white" aria-labelledby="article-cta-title">
      <h2 id="article-cta-title" className="font-serif text-2xl font-bold">
        Somut durumunuz için hukuki değerlendirme alın
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-white/75">
        Her uyuşmazlık kendi olayları ve belgeleriyle değerlendirilmelidir. Genel bilgilendirme niteliğindeki bu yazı,
        hukuki danışmanlık yerine geçmez.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/iletisim"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-accent-2 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          İletişime Geç
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <a
          href={contactInfo.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent-2 hover:text-accent-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp ile Yazın
        </a>
      </div>
    </section>
  );
}

export function ArticleAuthorBox() {
  return (
    <section className="not-prose mt-10 rounded-[8px] border border-primary/10 bg-background p-6" aria-labelledby="article-author-title">
      <div className="grid gap-5 sm:grid-cols-[96px_minmax(0,1fr)]">
        <Image
          src={lawyerProfile.portraitSrc}
          alt={lawyerProfile.portraitAlt}
          width={160}
          height={160}
          loading="lazy"
          placeholder="blur"
          blurDataURL={portraitBlurDataUrl}
          sizes="96px"
          className="h-24 w-24 rounded-full border border-accent-2/40 object-cover object-top"
        />
        <div>
          <p className="text-sm font-semibold text-accent-1">Yazar</p>
          <h2 id="article-author-title" className="font-serif text-2xl font-bold text-primary">
            {lawyerProfile.name}
          </h2>
          <p className="mt-1 text-sm font-semibold text-muted">{lawyerProfile.title}</p>
          <p className="mt-4 leading-7 text-muted">{lawyerProfile.articleBio}</p>
          <p className="mt-3 leading-7 text-muted">
            Yazılarında hukuku sade ve anlaşılır biçimde anlatma yaklaşımını öne çıkarır.
          </p>
          <Link
            href="/hakkimda"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-1 transition hover:text-accent-2"
          >
            Hakkımda sayfası
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
