"use client";

import { useState } from "react";
import { Copy, FileImage, Trash2 } from "lucide-react";

export type MediaItem = {
  name: string;
  path: string;
  folder: string;
  publicUrl: string;
  size: number | null;
  createdAt: string | null;
};

type MediaLibraryProps = {
  items: MediaItem[];
};

function formatBytes(value: number | null) {
  if (value == null) {
    return "Bilinmiyor";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "unit",
    unit: "byte",
    unitDisplay: "short"
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export function MediaLibrary({ items }: MediaLibraryProps) {
  const [mediaItems, setMediaItems] = useState(items);
  const [pendingDelete, setPendingDelete] = useState<MediaItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteMedia(item: MediaItem, force = false) {
    setDeleting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          path: item.path,
          force
        })
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string; used?: boolean } | null;

      if (!response.ok || !payload?.ok) {
        if (response.status === 409 && payload?.used) {
          setFeedback({ type: "error", message: payload.message || "Bu görsel bir makalede kullanılıyor; varsayılan olarak silinmedi." });
          return;
        }

        throw new Error(payload?.message || "Görsel silinemedi.");
      }

      setMediaItems((current) => current.filter((media) => media.path !== item.path));
      setPendingDelete(null);
      setFeedback({ type: "success", message: payload.message || "Görsel silindi." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Görsel silinemedi."
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {feedback ? (
        <div
          role="status"
          className={`mb-5 rounded-[8px] border px-4 py-3 text-sm font-semibold ${
            feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {mediaItems.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mediaItems.map((item) => (
            <article key={item.path} className="overflow-hidden rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] shadow-[0_16px_50px_rgba(10,22,40,0.07)]">
              <div className="aspect-[16/10] bg-[#0A1628]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.publicUrl} alt={`${item.name} önizleme`} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <FileImage className="mt-1 h-5 w-5 shrink-0 text-[#8B6A2F]" aria-hidden />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[var(--color-navy)]">{item.name}</h3>
                    <p className="mt-1 text-xs text-[#6c6254]">{item.folder}</p>
                  </div>
                </div>
                <dl className="mt-4 grid gap-2 text-xs text-[#6c6254]">
                  <div className="flex justify-between gap-3">
                    <dt>Boyut</dt>
                    <dd>{formatBytes(item.size)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Oluşturulma</dt>
                    <dd>{formatDate(item.createdAt)}</dd>
                  </div>
                </dl>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => copyText(item.publicUrl).then(() => setFeedback({ type: "success", message: "URL kopyalandı." }))}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d]"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    URL Kopyala
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(`<img src="${item.publicUrl}" alt="" />`).then(() =>
                        setFeedback({ type: "success", message: "Makalede kullanmak için HTML kopyalandı." })
                      )
                    }
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d]"
                  >
                    Makalede Kullan
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(item)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:border-red-300 sm:col-span-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Güvenli Sil
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-8 text-center text-sm text-[#6c6254]">
          Bu filtrelerle eşleşen medya bulunamadı.
        </div>
      )}

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,22,40,0.55)] p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="media-delete-title" className="w-full max-w-lg rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_24px_80px_rgba(10,22,40,0.28)]">
            <h3 id="media-delete-title" className="text-xl font-bold text-[var(--color-navy)]">Görsel silinsin mi?</h3>
            <p className="mt-3 break-words text-sm leading-6 text-[#6c6254]">
              {pendingDelete.path} için önce makale kullanım kontrolü yapılacak. Kullanımdaysa silme işlemi varsayılan olarak engellenir.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="inline-flex min-h-10 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-navy)]"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => deleteMedia(pendingDelete)}
                className="inline-flex min-h-10 items-center justify-center rounded-[6px] bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleting ? "Kontrol ediliyor" : "Kontrol Et ve Sil"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
