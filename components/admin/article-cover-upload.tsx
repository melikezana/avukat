"use client";

import Image from "next/image";
import { Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useId, useRef, useState } from "react";
import {
  adminImageAllowedTypes as allowedImageTypes,
  adminImageMaxUploadSizeBytes as maxUploadSizeBytes,
  formatUploadBytes,
  isAllowedAdminImageFile
} from "@/components/admin/image-upload-rules";
import { getUploadErrorMessage, getUploadResponse } from "@/components/admin/upload-response";
import { cn } from "@/lib/utils";

type ArticleCoverUploadProps = {
  value: string;
  title: string;
  onChange: (value: string) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
};

function isRemoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

function formatBytes(bytes: number) {
  return formatUploadBytes(bytes);
}

export function ArticleCoverUpload({ value, title, onChange, onUploadStateChange }: ArticleCoverUploadProps) {
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
    if (!isAllowedAdminImageFile(file)) {
      return "Sadece JPG, PNG veya WebP görsel yükleyebilirsiniz.";
    }

    if (file.size > maxUploadSizeBytes) {
      return `Kapak görseli en fazla ${formatBytes(maxUploadSizeBytes)} olabilir. Seçilen dosya: ${formatBytes(file.size)} (${file.size} byte).`;
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
    formData.append("folder", "article-covers");

    if (title.trim()) {
      formData.append("title", title.trim());
    }

    const request = new XMLHttpRequest();

    setUploadingState(true);
    setProgress(0);
    setError("");
    setMessage("Görsel yükleniyor...");

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
        setMessage("Kapak görseli yüklendi.");
        setError("");
        onChange(response.file.href);
      } else {
        setMessage("");
        setError(getUploadErrorMessage(response) || "Görsel yüklenemedi. Lütfen tekrar deneyin.");
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
      setError("Görsel yükleme iptal edildi.");
      setUploadingState(false);
      resetFileInput();
    };

    request.open("POST", "/api/admin/upload");
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
    setMessage("Kapak görseli kaldırıldı. Kaydettiğinizde makaleden silinir.");
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
      <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] border border-[#eadcc5] bg-[#f8efe0]">
          {value ? (
            <Image
              src={value}
              alt="Kapak görseli önizlemesi"
              width={300}
              height={188}
              sizes="150px"
              unoptimized={isRemoteImage(value)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0A1628] via-[#7A1F2B] to-[#B8965A] text-[#FAF7F1]">
              <ImageIcon className="h-9 w-9" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={allowedImageTypes.join(",")}
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
              {value ? "Görseli değiştir" : "Görsel yükle"}
            </label>

            {value ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Kaldır
              </button>
            ) : null}
          </div>

          <p className="mt-3 text-sm leading-6 text-[#6c6254]">
            JPG, PNG veya WebP yükleyin ya da dosyayı bu alana bırakın. Dosya boyutu en fazla 5 MB olabilir.
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
