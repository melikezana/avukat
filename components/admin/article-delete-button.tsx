"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteArticleAction } from "@/app/admin/makaleler/actions";

type ArticleDeleteButtonProps = {
  articleId: string;
  articleTitle: string;
};

export function ArticleDeleteButton({ articleId, articleTitle }: ArticleDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  function handleDelete() {
    setError("");
    startTransition(() => {
      void deleteArticleAction(articleId).then((result) => {
        if (!result.ok) {
          setError(result.message);
          return;
        }

        setIsOpen(false);
        router.push("/admin/makaleler?deleted=1");
        router.refresh();
      });
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Sil
      </button>

      {isOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby={`delete-article-${articleId}`} className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/65 p-4">
          <div className="w-full max-w-md rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id={`delete-article-${articleId}`} className="font-display text-xl font-bold text-[var(--color-navy)]">
                  Makaleyi sil
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5f5a52]">
                  “{articleTitle || "Başlıksız makale"}” kaydı silinecek. Kapak görseli Storage üzerinden otomatik silinmez.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white text-[var(--color-navy)] transition hover:border-[#c8a45d] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                aria-label="Silme penceresini kapat"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {error ? <p className="mt-4 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="inline-flex min-h-10 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white px-4 py-2 text-sm font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {isPending ? "Siliniyor" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
