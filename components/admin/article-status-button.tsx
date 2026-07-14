"use client";

import { useState, useTransition } from "react";
import { FileText, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { setArticleStatusAction, type ArticleStatus } from "@/app/admin/makaleler/actions";

type ArticleStatusButtonProps = {
  articleId: string;
  status: ArticleStatus;
};

export function ArticleStatusButton({ articleId, status }: ArticleStatusButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const nextStatus: ArticleStatus = status === "published" ? "draft" : "published";
  const Icon = nextStatus === "published" ? Send : FileText;

  function handleClick() {
    setError("");
    setMessage("");
    startTransition(() => {
      void setArticleStatusAction(articleId, nextStatus).then((result) => {
        if (!result.ok) {
          setError(result.message);
          return;
        }

        setMessage(result.message);
        router.refresh();
      });
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] hover:text-[var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
      >
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {isPending ? "İşleniyor" : nextStatus === "published" ? "Yayınla" : "Taslağa al"}
      </button>
      {message ? <span className="max-w-[180px] text-xs font-semibold leading-5 text-emerald-700">{message}</span> : null}
      {error ? <span className="max-w-[180px] text-xs font-semibold leading-5 text-red-700">{error}</span> : null}
    </div>
  );
}
