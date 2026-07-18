"use client";

import { Check, Link as LinkIcon, Linkedin, Printer } from "lucide-react";
import { useState } from "react";
import { getActionButtonClassName, whatsappIconClassName } from "@/components/ui/action-button-variants";
import { BrandIconWhatsApp, BrandIconX } from "@/components/ui/brand-icons";

type ArticleShareActionsProps = {
  url: string;
  title: string;
};

const secondaryButtonClassName = getActionButtonClassName("secondary");

export function ArticleShareActions({ url, title }: ArticleShareActionsProps) {
  const [message, setMessage] = useState("");
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title} ${url}`);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Bağlantı kopyalandı.");
    } catch {
      setMessage("Bağlantı kopyalanamadı.");
    }
  }

  function printArticle() {
    window.print();
  }

  return (
    <section
      className="article-share-actions not-prose mt-10 rounded-[8px] border border-primary/10 bg-cream-50/80 p-5 shadow-[0_14px_38px_rgba(10,22,40,0.06)]"
      aria-labelledby="article-share-title"
    >
      <p id="article-share-title" className="text-sm font-semibold text-primary">
        Paylaşım
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <a
          href={`https://wa.me/?text=${encodedText}`}
          target="_blank"
          rel="noreferrer"
          className={getActionButtonClassName("whatsapp")}
          aria-label="WhatsApp ile paylaş"
        >
          <BrandIconWhatsApp className={whatsappIconClassName} />
          WhatsApp
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          className={secondaryButtonClassName}
          aria-label="LinkedIn üzerinde paylaş"
        >
          <Linkedin className="h-4 w-4 shrink-0" aria-hidden />
          LinkedIn
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          className={secondaryButtonClassName}
          aria-label="X'te paylaş"
        >
          <BrandIconX className="h-4 w-4 shrink-0" />X
        </a>
        <button type="button" onClick={copyLink} className={secondaryButtonClassName}>
          {message === "Bağlantı kopyalandı." ? (
            <Check className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <LinkIcon className="h-4 w-4 shrink-0" aria-hidden />
          )}
          Bağlantıyı Kopyala
        </button>
        <button type="button" onClick={printArticle} className={secondaryButtonClassName}>
          <Printer className="h-4 w-4 shrink-0" aria-hidden />
          Yazdır
        </button>
      </div>
      <p className="mt-3 min-h-5 text-sm font-semibold text-emerald-700" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
