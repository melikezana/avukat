"use client";

import { Check, Link as LinkIcon, Linkedin, MessageCircle, Printer, Twitter } from "lucide-react";
import { useState } from "react";

type ArticleShareActionsProps = {
  url: string;
  title: string;
};

const buttonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-primary/10 bg-white px-3 py-2 text-sm font-semibold text-primary transition hover:border-accent-2 hover:text-accent-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1";

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
    <section className="article-share-actions not-prose mt-10 rounded-[8px] border border-primary/10 bg-background p-5" aria-labelledby="article-share-title">
      <p id="article-share-title" className="text-sm font-semibold text-primary">
        Paylaş
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`https://wa.me/?text=${encodedText}`}
          target="_blank"
          rel="noreferrer"
          className={buttonClassName}
          aria-label="WhatsApp ile paylaş"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          className={buttonClassName}
          aria-label="LinkedIn üzerinde paylaş"
        >
          <Linkedin className="h-4 w-4" aria-hidden />
          LinkedIn
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          className={buttonClassName}
          aria-label="X üzerinde paylaş"
        >
          <Twitter className="h-4 w-4" aria-hidden />X
        </a>
        <button type="button" onClick={copyLink} className={buttonClassName}>
          {message === "Bağlantı kopyalandı." ? <Check className="h-4 w-4" aria-hidden /> : <LinkIcon className="h-4 w-4" aria-hidden />}
          Bağlantıyı Kopyala
        </button>
        <button type="button" onClick={printArticle} className={buttonClassName}>
          <Printer className="h-4 w-4" aria-hidden />
          Yazdır
        </button>
      </div>
      <p className="mt-3 min-h-5 text-sm font-semibold text-emerald-700" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
