"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
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

  function handleDelete() {
    const confirmed = window.confirm(`"${articleTitle || "Başlıksız makale"}" makalesi silinsin mi?`);

    if (!confirmed) {
      return;
    }

    setError("");
    startTransition(() => {
      void deleteArticleAction(articleId).then((result) => {
        if (!result.ok) {
          setError(result.message);
          return;
        }

        router.refresh();
      });
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        {isPending ? "Siliniyor" : "Sil"}
      </button>
      {error ? <span className="max-w-[180px] text-xs font-semibold leading-5 text-red-700">{error}</span> : null}
    </div>
  );
}
