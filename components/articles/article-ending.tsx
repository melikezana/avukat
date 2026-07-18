import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActionButtonClassName, whatsappIconClassName } from "@/components/ui/action-button-variants";
import { BrandIconWhatsApp } from "@/components/ui/brand-icons";
import { contactInfo, lawyerProfile, portraitBlurDataUrl } from "@/lib/site-profile";

export function ArticleContactCta() {
  return (
    <section
      className="article-cta not-prose mt-10 rounded-[8px] border border-primary/20 bg-white p-6 text-primary shadow-[0_18px_50px_rgba(10,22,40,0.08)]"
      aria-labelledby="article-cta-title"
    >
      <span className="mb-4 block h-1 w-12 rounded-full bg-gold-500" aria-hidden />
      <h2 id="article-cta-title" className="whitespace-normal break-normal font-serif text-2xl font-bold text-primary [hyphens:none] [overflow-wrap:normal]">
        Somut durumunuz için hukuki değerlendirme alın
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-muted">
        Her uyuşmazlık kendi olayları ve belgeleriyle değerlendirilmelidir. Genel bilgilendirme niteliğindeki bu yazı,
        hukuki danışmanlık yerine geçmez.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href={contactInfo.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className={getActionButtonClassName("whatsapp", "sm:w-auto")}
          aria-label="WhatsApp ile Yazın"
        >
          <BrandIconWhatsApp className={whatsappIconClassName} />
          WhatsApp ile Yazın
        </a>
        <Link
          href="/iletisim"
          className={getActionButtonClassName("secondary", "sm:w-auto")}
        >
          İletişime Geç
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
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
