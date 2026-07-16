"use client";

import { ExternalLink, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const allowedPdfType = "application/pdf";
const maxUploadSizeBytes = 15 * 1024 * 1024;

type UploadResponse =
  | {
      ok: true;
      file: {
        href: string;
        path: string;
        size: number;
        type: string;
      };
    }
  | {
      ok: false;
      message?: string;
      issues?: Array<{
        message?: string;
      }>;
    };

type ArticlePdfUploadProps = {
  value: string;
  onChange: (value: string) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
};

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getUploadResponse(responseText: string): UploadResponse | null {
  try {
    return JSON.parse(responseText) as UploadResponse;
  } catch {
    return null;
  }
}

function getUploadErrorMessage(response: UploadResponse | null) {
  if (response?.ok === false) {
    return response.message || response.issues?.find((issue) => issue.message)?.message;
  }

  return undefined;
}

export function ArticlePdfUpload({ value, onChange, onUploadStateChange }: ArticlePdfUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function setUploadingState(nextState: boolean) {
    setIsUploading(nextState);
    onUploadStateChange?.(nextState);
  }

  function resetFileInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function validateFile(file: File) {
    if (file.type !== allowedPdfType || !file.name.toLocaleLowerCase("tr-TR").endsWith(".pdf")) {
      return "Sadece PDF dosyası yükleyebilirsiniz.";
    }

    if (file.size > maxUploadSizeBytes) {
      return `PDF en fazla ${formatBytes(maxUploadSizeBytes)} olabilir.`;
    }

    if (file.size === 0) {
      return "Boş dosya yüklenemez.";
    }

    return "";
  }

  function uploadFile(file: File) {
    const validationMessage = validateFile(file);

    if (validationMessage) {
      setError(validationMessage);
      setMessage("");
      resetFileInput();
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const request = new XMLHttpRequest();

    setUploadingState(true);
    setProgress(0);
    setError("");
    setMessage("PDF yükleniyor...");

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        setProgress((currentProgress) => (currentProgress < 15 ? 15 : currentProgress));
        return;
      }

      const nextProgress = Math.min(95, Math.round((event.loaded / event.total) * 90));
      setProgress(nextProgress);
    };

    request.onload = () => {
      const response = getUploadResponse(request.responseText);

      if (request.status >= 200 && request.status < 300 && response?.ok) {
        setProgress(100);
        setMessage("PDF yüklendi. Kaydettiğinizde makaleye bağlanır.");
        setError("");
        onChange(response.file.href);
      } else {
        setMessage("");
        setError(getUploadErrorMessage(response) || "PDF yüklenemedi. Lütfen tekrar deneyin.");
      }

      setUploadingState(false);
      resetFileInput();
    };

    request.onerror = () => {
      setMessage("");
      setError("Bağlantı sırasında hata oluştu. Lütfen tekrar deneyin.");
      setUploadingState(false);
      resetFileInput();
    };

    request.onabort = () => {
      setMessage("");
      setError("PDF yükleme iptal edildi.");
      setUploadingState(false);
      resetFileInput();
    };

    request.open("POST", "/api/admin/decision-pdf");
    request.withCredentials = true;
    request.send(formData);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      uploadFile(file);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (event.dataTransfer.types.includes("Files")) {
      event.preventDefault();
      setIsDragging(true);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    const file = event.dataTransfer.files?.[0];

    if (!file) {
      setIsDragging(false);
      return;
    }

    event.preventDefault();
    setIsDragging(false);
    uploadFile(file);
  }

  function handleRemove() {
    onChange("");
    setMessage("PDF bağlantısı kaldırıldı. Storage dosyası otomatik silinmez.");
    setError("");
    setProgress(0);
    resetFileInput();
  }

  return (
    <div
      className={cn(
        "mt-2 rounded-[8px] border bg-white p-4 transition",
        isDragging ? "border-[var(--color-gold)] ring-2 ring-[var(--color-gold)]/30" : "border-[#d8c7a8]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="grid gap-4 sm:grid-cols-[88px_minmax(0,1fr)]">
        <div className="flex aspect-square items-center justify-center rounded-[6px] border border-[#eadcc5] bg-[#f8efe0] text-[var(--color-navy)]">
          <FileText className="h-9 w-9" aria-hidden />
        </div>

        <div className="min-w-0">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={allowedPdfType}
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
          />

          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className={cn(
                "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-[#d8c7a8] bg-[#fffaf0] px-3 py-2 text-sm font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] hover:text-[var(--color-gold)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-gold)]",
                isUploading && "pointer-events-none opacity-60"
              )}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UploadCloud className="h-4 w-4" aria-hidden />}
              {value ? "PDF'i değiştir" : "PDF yükle"}
            </label>

            {value ? (
              <>
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Önizle
                </a>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Kaldır
                </button>
              </>
            ) : null}
          </div>

          <p className="mt-3 text-sm leading-6 text-[#6c6254]">
            Sadece PDF dosyası yükleyin ya da dosyayı bu alana bırakın. Dosya boyutu en fazla 15 MB olabilir.
          </p>

          {isUploading ? (
            <div className="mt-3" aria-live="polite">
              <div className="h-2 overflow-hidden rounded-full bg-[#eadcc5]">
                <div
                  className="h-full rounded-full bg-[var(--color-gold)] transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-[var(--color-navy)]">%{progress} yüklendi</p>
            </div>
          ) : null}

          {message && !isUploading ? <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
