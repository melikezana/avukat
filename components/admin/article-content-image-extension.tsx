"use client";

import { mergeAttributes } from "@tiptap/core";
import ImageExtension, { type ImageOptions } from "@tiptap/extension-image";
import { NodeSelection } from "@tiptap/pm/state";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Captions,
  Check,
  Crop,
  ImagePlus,
  Link2,
  Loader2,
  Maximize2,
  Minimize2,
  Ruler,
  RotateCw,
  Trash2,
  Unlink,
  X
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Area, MediaSize, Point } from "react-easy-crop";
import { cn } from "@/lib/utils";

export const contentImageAllowedTypes = ["image/jpeg", "image/png", "image/webp"];
export const contentImageMaxUploadSizeBytes = 5 * 1024 * 1024;
export const contentImageMaxAltTextLength = 160;

const maxCaptionLength = 240;
const maxImageTitleLength = 160;
const maxImageUrlLength = 500;
const minResizeWidthPx = 120;
const maxCropOutputBytes = contentImageMaxUploadSizeBytes;
const Cropper = dynamic(() => import("react-easy-crop"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] items-center justify-center bg-[#07111f] px-4 text-center text-sm font-semibold text-white">
      Kırpma aracı yükleniyor...
    </div>
  )
});

type ImageAlignment = "left" | "center" | "right" | "full";
type CropAspectKey = "free" | "1:1" | "4:3" | "16:9" | "3:2";
type ImageUploadContext = "replace" | "crop";

export type UploadedContentImage = {
  publicUrl: string;
  alt: string;
  path: string;
};

type ArticleContentImageOptions = ImageOptions & {
  uploadImage: (file: File, alt: string, context: ImageUploadContext) => Promise<UploadedContentImage>;
  onMessage?: (message: string) => void;
  onError?: (message: string) => void;
};

type ArticleImageAttrs = {
  src?: string | null;
  alt?: string | null;
  title?: string | null;
  width?: string | null;
  height?: string | null;
  loading?: string | null;
  alignment?: ImageAlignment | null;
  caption?: string | null;
  href?: string | null;
  target?: string | null;
  rel?: string | null;
  storagePath?: string | null;
};

type ImageToolButtonProps = {
  label: string;
  icon: typeof AlignLeft;
  onAction: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
};

type ImageDetailsModalProps = {
  attrs: ArticleImageAttrs;
  onClose: () => void;
  onSave: (attrs: Partial<ArticleImageAttrs>) => void;
};

type ImageCropModalProps = {
  src: string;
  alt: string;
  onClose: () => void;
  onApply: (file: File) => Promise<void>;
};

const widthPresets = [
  { label: "Küçük boyut", width: "35%", icon: Minimize2 },
  { label: "Orta boyut", width: "60%", icon: Ruler },
  { label: "Büyük boyut", width: "85%", icon: Maximize2 },
  { label: "Tam genişlik", width: "100%", icon: Maximize2 }
] as const;

const cropAspectOptions: Array<{ key: CropAspectKey; label: string; value?: number }> = [
  { key: "free", label: "Serbest" },
  { key: "1:1", label: "1:1", value: 1 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "16:9", label: "16:9", value: 16 / 9 },
  { key: "3:2", label: "3:2", value: 3 / 2 }
];

function noopUploadImage(): Promise<UploadedContentImage> {
  return Promise.reject(new Error("Görsel yükleme işlevi hazırlanamadı."));
}

function getArticleImageOptions(props: ReactNodeViewProps) {
  return props.extension.options as ArticleContentImageOptions;
}

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sanitizeImageText(value: string, maxLength: number) {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f<>`{}[\]\\|^~]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function getTextContent(element: Element | null, maxLength: number) {
  return sanitizeImageText(element?.textContent ?? "", maxLength);
}

function getImageElement(element: HTMLElement) {
  if (element.tagName.toLowerCase() === "img") {
    return element as HTMLImageElement;
  }

  return element.querySelector<HTMLImageElement>("img[src]");
}

function getLinkElement(element: HTMLElement) {
  if (element.tagName.toLowerCase() === "a") {
    return element as HTMLAnchorElement;
  }

  if (element.tagName.toLowerCase() === "img") {
    return element.closest("a[href]") as HTMLAnchorElement | null;
  }

  return element.querySelector<HTMLAnchorElement>("a[href]");
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeImageWidth(value?: string | number | null) {
  if (value === null || value === undefined) {
    return null;
  }

  const rawValue = String(value).trim();
  const match = rawValue.match(/^(\d+(?:\.\d+)?)(%)?$/);

  if (!match) {
    return null;
  }

  const numericValue = Number(match[1]);

  if (!Number.isFinite(numericValue) || numericValue <= 0 || numericValue > 100) {
    return null;
  }

  return `${Math.round(numericValue)}%`;
}

function getWidthPercent(width?: string | null) {
  const normalizedWidth = normalizeImageWidth(width);

  if (!normalizedWidth) {
    return null;
  }

  return Number(normalizedWidth.replace("%", ""));
}

function getFigureWidthStyle(width?: string | null) {
  const normalizedWidth = normalizeImageWidth(width);
  return normalizedWidth ? `width: ${normalizedWidth}` : undefined;
}

function getWidthFromStyle(styleValue?: string | null) {
  return styleValue?.match(/(?:^|;)\s*width\s*:\s*(\d+(?:\.\d+)?%)/i)?.[1] ?? null;
}

function getParsedWidth(element: HTMLElement) {
  const image = getImageElement(element);
  return (
    normalizeImageWidth(element.getAttribute("data-width")) ||
    normalizeImageWidth(getWidthFromStyle(element.getAttribute("style"))) ||
    normalizeImageWidth(getWidthFromStyle(image?.getAttribute("style"))) ||
    normalizeImageWidth(image?.getAttribute("width"))
  );
}

function normalizeAlignment(value?: string | null): ImageAlignment {
  if (value === "left" || value === "center" || value === "right" || value === "full") {
    return value;
  }

  return "center";
}

function getAlignmentFromClasses(className?: string | null) {
  const classes = new Set((className ?? "").split(/\s+/).filter(Boolean));

  if (classes.has("image-full-width")) {
    return "full";
  }

  if (classes.has("image-align-left")) {
    return "left";
  }

  if (classes.has("image-align-right")) {
    return "right";
  }

  if (classes.has("image-align-center")) {
    return "center";
  }

  return null;
}

function getParsedAlignment(element: HTMLElement) {
  return normalizeAlignment(
    element.getAttribute("data-align") ||
      getAlignmentFromClasses(element.getAttribute("class")) ||
      getAlignmentFromClasses(getImageElement(element)?.getAttribute("class")) ||
      undefined
  );
}

function getAlignmentClassName(alignment?: ImageAlignment | null) {
  const safeAlignment = normalizeAlignment(alignment);

  if (safeAlignment === "full") {
    return "image-full-width";
  }

  return `image-align-${safeAlignment}`;
}

function getFigureClassName(alignment?: ImageAlignment | null) {
  return cn("article-image", getAlignmentClassName(alignment));
}

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim().slice(0, maxImageUrlLength);

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getSafeTarget(value?: string | null) {
  return value === "_blank" ? "_blank" : "_self";
}

function validateImageFile(file: File) {
  if (!contentImageAllowedTypes.includes(file.type)) {
    return "Sadece JPG, PNG veya WebP görsel yükleyebilirsiniz.";
  }

  if (file.size > contentImageMaxUploadSizeBytes) {
    return `Görsel en fazla ${formatBytes(contentImageMaxUploadSizeBytes)} olabilir.`;
  }

  if (file.size === 0) {
    return "Boş dosya yüklenemez.";
  }

  return "";
}

function createCroppedFileName(src: string) {
  const fallbackName = `kirpilmis-gorsel-${Date.now()}.webp`;

  try {
    const pathName = new URL(src, window.location.origin).pathname;
    const fileName = pathName.split("/").filter(Boolean).pop()?.replace(/\.[^/.]+$/, "");
    return `${fileName || fallbackName.replace(/\.webp$/, "")}-kirpilmis-${Date.now()}.webp`;
  } catch {
    return fallbackName;
  }
}

function getRadianAngle(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  };
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Görsel kırpma için yüklenemedi."));
    image.src = src;
  });
}

async function getCanvasSource(src: string) {
  let objectUrl: string | null = null;

  try {
    const response = await fetch(src, { credentials: "omit", mode: "cors" });

    if (response.ok) {
      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);
      return {
        src: objectUrl,
        revoke: () => {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
        }
      };
    }
  } catch {
    // The image element path below still works for same-origin and CORS-enabled images.
  }

  return {
    src,
    revoke: () => undefined
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Kırpılan görsel üretilemedi."));
      },
      type,
      quality
    );
  });
}

async function getCompressedWebpBlob(canvas: HTMLCanvasElement) {
  const qualities = [0.92, 0.86, 0.8, 0.74];
  let latestBlob: Blob | null = null;

  for (const quality of qualities) {
    latestBlob = await canvasToBlob(canvas, "image/webp", quality);

    if (latestBlob.size <= maxCropOutputBytes) {
      return latestBlob;
    }
  }

  throw new Error(
    latestBlob
      ? `Kırpılan görsel ${formatBytes(maxCropOutputBytes)} sınırını aşıyor. Daha küçük bir alan deneyin.`
      : "Kırpılan görsel üretilemedi."
  );
}

async function createCroppedImageFile(src: string, pixelCrop: Area, rotation: number) {
  const canvasSource = await getCanvasSource(src);

  try {
    const image = await loadImageElement(canvasSource.src);
    const rotRad = getRadianAngle(rotation);
    const naturalWidth = image.naturalWidth || image.width;
    const naturalHeight = image.naturalHeight || image.height;
    const { width: boxWidth, height: boxHeight } = rotateSize(naturalWidth, naturalHeight, rotation);
    const rotatedCanvas = document.createElement("canvas");
    const rotatedContext = rotatedCanvas.getContext("2d");

    if (!rotatedContext) {
      throw new Error("Kırpma alanı hazırlanamadı.");
    }

    rotatedCanvas.width = boxWidth;
    rotatedCanvas.height = boxHeight;
    rotatedContext.translate(boxWidth / 2, boxHeight / 2);
    rotatedContext.rotate(rotRad);
    rotatedContext.translate(-naturalWidth / 2, -naturalHeight / 2);
    rotatedContext.drawImage(image, 0, 0, naturalWidth, naturalHeight);

    const outputCanvas = document.createElement("canvas");
    const outputContext = outputCanvas.getContext("2d");

    if (!outputContext) {
      throw new Error("Kırpılan görsel hazırlanamadı.");
    }

    outputCanvas.width = Math.max(1, Math.round(pixelCrop.width));
    outputCanvas.height = Math.max(1, Math.round(pixelCrop.height));
    outputContext.drawImage(
      rotatedCanvas,
      Math.max(0, Math.round(pixelCrop.x)),
      Math.max(0, Math.round(pixelCrop.y)),
      outputCanvas.width,
      outputCanvas.height,
      0,
      0,
      outputCanvas.width,
      outputCanvas.height
    );

    const blob = await getCompressedWebpBlob(outputCanvas);
    return new File([blob], createCroppedFileName(src), { type: "image/webp" });
  } finally {
    canvasSource.revoke();
  }
}

function getReducedRatio(width: number, height: number) {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const divisor = gcd(safeWidth, safeHeight);

  return {
    width: clampNumber(Math.round(safeWidth / divisor), 1, 99),
    height: clampNumber(Math.round(safeHeight / divisor), 1, 99)
  };
}

function getImageWidthForStyle(width?: string | null) {
  return normalizeImageWidth(width) ?? undefined;
}

function ImageToolButton({ label, icon: Icon, onAction, active, danger, disabled }: ImageToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!disabled) {
          onAction();
        }
      }}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-45",
        active
          ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
          : "border-[#d8c7a8] bg-white text-[var(--color-navy)] hover:border-[#c8a45d] hover:text-[var(--color-gold)]",
        danger && !active && "text-red-700 hover:border-red-300 hover:text-red-800"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}

function ImageDetailsModal({ attrs, onClose, onSave }: ImageDetailsModalProps) {
  const [alt, setAlt] = useState(attrs.alt ?? "");
  const [title, setTitle] = useState(attrs.title ?? "");
  const [caption, setCaption] = useState(attrs.caption ?? "");
  const [href, setHref] = useState(attrs.href ?? "");
  const [targetBlank, setTargetBlank] = useState(getSafeTarget(attrs.target) === "_blank");
  const [error, setError] = useState("");
  const altWarning = !alt.trim() ? "Alt metin boş bırakıldı. Erişilebilirlik ve SEO için kısa bir açıklama önerilir." : "";

  function handleSave() {
    const nextHref = normalizeHttpUrl(href);

    if (nextHref && !isSafeHttpUrl(nextHref)) {
      setError("Bağlantı için yalnızca güvenli http veya https adresleri kullanılabilir.");
      return;
    }

    onSave({
      alt: sanitizeImageText(alt, contentImageMaxAltTextLength),
      title: sanitizeImageText(title, maxImageTitleLength),
      caption: sanitizeImageText(caption, maxCaptionLength),
      href: nextHref || null,
      target: nextHref ? (targetBlank ? "_blank" : "_self") : null,
      rel: nextHref && targetBlank ? "noopener noreferrer" : null
    });
  }

  return (
    <div
      data-image-modal="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-image-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07111f]/65 p-4"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div className="my-6 w-full max-w-xl rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <h3 id="article-image-details-title" className="font-display text-xl font-bold text-[var(--color-navy)]">
            Görsel bilgileri
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white text-[var(--color-navy)] transition hover:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            aria-label="Pencereyi kapat"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block text-sm font-semibold text-[var(--color-navy)]">
            Alt metin
            <input
              value={alt}
              maxLength={contentImageMaxAltTextLength}
              onChange={(event) => setAlt(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            />
          </label>
          {altWarning ? <p className="text-sm font-semibold text-amber-800">{altWarning}</p> : null}

          <label className="block text-sm font-semibold text-[var(--color-navy)]">
            Başlık
            <input
              value={title}
              maxLength={maxImageTitleLength}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            />
          </label>

          <label className="block text-sm font-semibold text-[var(--color-navy)]">
            Caption
            <textarea
              value={caption}
              maxLength={maxCaptionLength}
              rows={3}
              onChange={(event) => setCaption(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            />
          </label>

          <label className="block text-sm font-semibold text-[var(--color-navy)]">
            Görsel bağlantısı
            <input
              value={href}
              maxLength={maxImageUrlLength}
              onChange={(event) => setHref(event.target.value)}
              placeholder="https://..."
              className="mt-2 min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            />
          </label>

          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--color-navy)]">
            <input
              type="checkbox"
              checked={targetBlank}
              onChange={(event) => setTargetBlank(event.target.checked)}
              className="h-5 w-5 rounded border-[#d8c7a8] text-[var(--color-navy)] focus:ring-[var(--color-gold)]"
            />
            Yeni sekmede aç
          </label>
        </div>

        {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white px-4 py-2 text-sm font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] bg-[var(--color-navy)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-navy-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          >
            <Check className="h-4 w-4" aria-hidden />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageCropModal({ src, alt, onClose, onApply }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectKey, setAspectKey] = useState<CropAspectKey>("free");
  const [freeRatio, setFreeRatio] = useState({ width: 4, height: 3 });
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");
  const selectedAspect = cropAspectOptions.find((option) => option.key === aspectKey);
  const aspect = selectedAspect?.value ?? freeRatio.width / freeRatio.height;

  function handleMediaLoaded(mediaSize: MediaSize) {
    const ratio = getReducedRatio(mediaSize.naturalWidth, mediaSize.naturalHeight);
    setFreeRatio(ratio);
  }

  async function handleApply() {
    if (!pixelCrop) {
      setError("Kırpma alanı henüz hazır değil.");
      return;
    }

    setIsApplying(true);
    setError("");

    try {
      const file = await createCroppedImageFile(src, pixelCrop, rotation);
      await onApply(file);
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Görsel kırpılamadı.");
      setIsApplying(false);
    }
  }

  return (
    <div
      data-image-modal="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-image-crop-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07111f]/70 p-4"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div className="my-6 grid w-full max-w-4xl gap-4 rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <h3 id="article-image-crop-title" className="font-display text-xl font-bold text-[var(--color-navy)]">
            Görseli kırp
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white text-[var(--color-navy)] transition hover:border-[#c8a45d] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            aria-label="Pencereyi kapat"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="relative h-[58vh] min-h-[320px] overflow-hidden rounded-[8px] bg-[#07111f]">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            minZoom={1}
            maxZoom={4}
            objectFit="contain"
            cropShape="rect"
            showGrid
            zoomSpeed={1}
            restrictPosition
            style={{}}
            classes={{}}
            cropperProps={{}}
            keyboardStep={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, croppedAreaPixels) => setPixelCrop(croppedAreaPixels)}
            onMediaLoaded={handleMediaLoaded}
            mediaProps={{ alt }}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Kırpma oranı">
              {cropAspectOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setAspectKey(option.key)}
                  disabled={isApplying}
                  className={cn(
                    "inline-flex min-h-10 items-center justify-center rounded-[6px] border px-3 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] disabled:opacity-60",
                    aspectKey === option.key
                      ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
                      : "border-[#d8c7a8] bg-white text-[var(--color-navy)] hover:border-[#c8a45d]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {aspectKey === "free" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-[var(--color-navy)]">
                  Genişlik oranı
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={freeRatio.width}
                    onChange={(event) =>
                      setFreeRatio((current) => ({
                        ...current,
                        width: clampNumber(Number(event.target.value) || 1, 1, 99)
                      }))
                    }
                    disabled={isApplying}
                    className="mt-2 min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                  />
                </label>
                <label className="block text-sm font-semibold text-[var(--color-navy)]">
                  Yükseklik oranı
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={freeRatio.height}
                    onChange={(event) =>
                      setFreeRatio((current) => ({
                        ...current,
                        height: clampNumber(Number(event.target.value) || 1, 1, 99)
                      }))
                    }
                    disabled={isApplying}
                    className="mt-2 min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                  />
                </label>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[var(--color-navy)]">
              Yakınlaştırma
              <input
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                disabled={isApplying}
                className="mt-3 w-full accent-[var(--color-gold)]"
              />
            </label>
            <button
              type="button"
              onClick={() => setRotation((current) => (current + 90) % 360)}
              disabled={isApplying}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            >
              <RotateCw className="h-4 w-4" aria-hidden />
              90° döndür
            </button>
          </div>
        </div>

        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="inline-flex min-h-10 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white px-4 py-2 text-sm font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] bg-[var(--color-navy)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-navy-deep)] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-gold)]"
          >
            {isApplying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Crop className="h-4 w-4" aria-hidden />}
            Kırp ve kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticleContentImageView(props: ReactNodeViewProps) {
  const { node, selected, updateAttributes, deleteNode, editor, getPos } = props;
  const attrs = node.attrs as ArticleImageAttrs;
  const options = getArticleImageOptions(props);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [liveWidth, setLiveWidth] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const alignment = normalizeAlignment(attrs.alignment);
  const normalizedWidth = getImageWidthForStyle(liveWidth ?? attrs.width ?? (alignment === "full" ? "100%" : null));
  const widthPercent = getWidthPercent(normalizedWidth);
  const hasLink = Boolean(attrs.href);

  useEffect(() => {
    setLiveWidth(null);
  }, [attrs.width]);

  function selectImageNode() {
    const position = typeof getPos === "function" ? getPos() : undefined;

    if (typeof position === "number") {
      editor.chain().focus().setNodeSelection(position).run();
    }
  }

  function updateImageAttributes(nextAttrs: Partial<ArticleImageAttrs>) {
    updateAttributes(nextAttrs);
    options.onMessage?.("Görsel güncellendi");
  }

  function setImageAlignment(nextAlignment: ImageAlignment) {
    updateImageAttributes({
      alignment: nextAlignment,
      width: nextAlignment === "full" ? "100%" : normalizeImageWidth(attrs.width) ?? "60%"
    });
  }

  function setImageWidth(width: string) {
    updateImageAttributes({
      width,
      alignment: width === "100%" ? "full" : alignment === "full" ? "center" : alignment
    });
  }

  function setCustomWidth() {
    const currentValue = String(widthPercent ?? 60);
    const response = window.prompt("Özel genişlik yüzdesi (10-100)", currentValue);

    if (response === null) {
      return;
    }

    const parsedValue = clampNumber(Number(response.replace("%", "")), 10, 100);

    if (!Number.isFinite(parsedValue)) {
      options.onError?.("Genişlik değeri geçersiz.");
      return;
    }

    setImageWidth(`${Math.round(parsedValue)}%`);
  }

  async function replaceImage(file: File, context: ImageUploadContext) {
    const validationMessage = validateImageFile(file);

    if (validationMessage) {
      options.onError?.(validationMessage);
      return;
    }

    setIsReplacing(context === "replace");
    setIsCropping(context === "crop");

    try {
      const uploadedImage = await options.uploadImage(file, attrs.alt ?? "", context);
      updateAttributes({
        src: uploadedImage.publicUrl,
        alt: attrs.alt || uploadedImage.alt,
        title: attrs.title || uploadedImage.alt,
        storagePath: uploadedImage.path
      });
      options.onMessage?.(context === "crop" ? "Görsel kırpıldı ve kaydedildi" : "Görsel güncellendi");
      setCropOpen(false);
    } catch (error) {
      options.onError?.(error instanceof Error ? error.message : "Görsel yüklenemedi");
    } finally {
      setIsReplacing(false);
      setIsCropping(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      void replaceImage(file, "replace");
    }
  }

  function removeImage() {
    const confirmed = window.confirm("Görsel yalnızca içerikten kaldırılsın mı? Storage'dan otomatik silinmez.");

    if (!confirmed) {
      return;
    }

    deleteNode();
    options.onMessage?.("Görsel içerikten kaldırıldı");
  }

  function startResize(event: React.PointerEvent<HTMLButtonElement>, direction: "left" | "right") {
    event.preventDefault();
    event.stopPropagation();
    selectImageNode();

    const wrapper = wrapperRef.current;
    const editorElement = wrapper?.closest(".ProseMirror") as HTMLElement | null;

    if (!wrapper || !editorElement) {
      return;
    }

    const editorWidth = editorElement.clientWidth;
    const startX = event.clientX;
    const startWidthPx = wrapper.getBoundingClientRect().width;
    const pointerId = event.pointerId;
    event.currentTarget.setPointerCapture(pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const directionFactor = direction === "left" ? -1 : 1;
      const nextWidthPx = clampNumber(startWidthPx + (moveEvent.clientX - startX) * directionFactor, minResizeWidthPx, editorWidth);
      const nextWidthPercent = clampNumber(Math.round((nextWidthPx / editorWidth) * 100), 10, 100);
      setLiveWidth(`${nextWidthPercent}%`);
    };

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);

      setLiveWidth((currentWidth) => {
        if (currentWidth) {
          updateAttributes({
            width: currentWidth,
            alignment: currentWidth === "100%" ? "full" : alignment === "full" ? "center" : alignment
          });
          options.onMessage?.("Görsel güncellendi");
        }

        return currentWidth;
      });
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
  }

  return (
    <NodeViewWrapper
      as="figure"
      ref={wrapperRef}
      contentEditable={false}
      data-width={widthPercent ?? undefined}
      data-align={alignment}
      data-storage-path={attrs.storagePath ?? undefined}
      className={cn(
        getFigureClassName(alignment),
        "group relative max-w-full rounded-[8px]",
        selected && "outline outline-2 outline-offset-4 outline-[var(--color-gold)]"
      )}
      style={{
        width: normalizedWidth
      }}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        selectImageNode();
      }}
    >
      <div className="relative">
        {attrs.href ? (
          <a href={attrs.href} target={getSafeTarget(attrs.target)} rel={attrs.target === "_blank" ? "noopener noreferrer" : undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attrs.src ?? ""}
              alt={attrs.alt ?? ""}
              title={attrs.title ?? undefined}
              loading={attrs.loading === "eager" ? "eager" : "lazy"}
              draggable={false}
              className={cn("!m-0 block h-auto max-w-full rounded-[12px] border border-primary/10", normalizedWidth ? "w-full" : "w-auto")}
            />
          </a>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attrs.src ?? ""}
            alt={attrs.alt ?? ""}
            title={attrs.title ?? undefined}
            loading={attrs.loading === "eager" ? "eager" : "lazy"}
            draggable={false}
            className={cn("!m-0 block h-auto max-w-full rounded-[12px] border border-primary/10", normalizedWidth ? "w-full" : "w-auto")}
          />
        )}

        {selected ? (
          <>
            {(["left", "right"] as const).flatMap((direction) =>
              (["top", "bottom"] as const).map((verticalPosition) => (
                <button
                  key={`${direction}-${verticalPosition}`}
                  type="button"
                  data-resize-handle="true"
                  aria-label="Görseli yeniden boyutlandır"
                  title="Görseli yeniden boyutlandır"
                  onPointerDown={(event) => startResize(event, direction)}
                  className={cn(
                    "absolute z-20 h-5 w-5 rounded-full border-2 border-white bg-[var(--color-gold)] shadow-[0_8px_18px_rgba(10,22,40,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-navy)]",
                    direction === "left" ? "-left-3 cursor-nwse-resize" : "-right-3 cursor-nesw-resize",
                    verticalPosition === "top" ? "-top-3" : "-bottom-3"
                  )}
                />
              ))
            )}
          </>
        ) : null}
      </div>

      {attrs.caption ? <figcaption>{attrs.caption}</figcaption> : null}

      {selected ? (
        <div
          data-image-controls="true"
          className="absolute left-1/2 top-2 z-30 flex max-w-[min(92vw,760px)] -translate-x-1/2 gap-1 overflow-x-auto rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-1.5 shadow-[0_16px_40px_rgba(10,22,40,0.18)]"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <ImageToolButton label="Görseli değiştir" icon={ImagePlus} disabled={isReplacing || isCropping} onAction={() => fileInputRef.current?.click()} />
          <ImageToolButton label="Kırp" icon={Crop} disabled={isReplacing || isCropping || !attrs.src} onAction={() => setCropOpen(true)} />
          <ImageToolButton label="Sola hizala" icon={AlignLeft} active={alignment === "left"} onAction={() => setImageAlignment("left")} />
          <ImageToolButton label="Ortala" icon={AlignCenter} active={alignment === "center"} onAction={() => setImageAlignment("center")} />
          <ImageToolButton label="Sağa hizala" icon={AlignRight} active={alignment === "right"} onAction={() => setImageAlignment("right")} />
          {widthPresets.map((preset) => (
            <ImageToolButton
              key={preset.label}
              label={preset.label}
              icon={preset.icon}
              active={normalizeImageWidth(attrs.width) === preset.width}
              onAction={() => setImageWidth(preset.width)}
            />
          ))}
          <ImageToolButton label="Özel genişlik" icon={Ruler} onAction={setCustomWidth} />
          <ImageToolButton label="Alt metin, caption ve bağlantı" icon={Captions} onAction={() => setDetailsOpen(true)} />
          <ImageToolButton label="Bağlantı ekle" icon={Link2} active={hasLink} onAction={() => setDetailsOpen(true)} />
          <ImageToolButton label="Bağlantıyı kaldır" icon={Unlink} disabled={!hasLink} onAction={() => updateImageAttributes({ href: null, target: null, rel: null })} />
          <ImageToolButton label="Görseli sil" icon={Trash2} danger onAction={removeImage} />
          {(isReplacing || isCropping) && (
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-[var(--color-navy)]" aria-label="Görsel yükleniyor">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            </span>
          )}
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept={contentImageAllowedTypes.join(",")}
        hidden
        onChange={handleFileChange}
      />

      {detailsOpen ? (
        <ImageDetailsModal
          attrs={attrs}
          onClose={() => setDetailsOpen(false)}
          onSave={(nextAttrs) => {
            updateAttributes(nextAttrs);
            setDetailsOpen(false);
            options.onMessage?.(nextAttrs.alt !== attrs.alt ? "Alt metin güncellendi" : "Görsel güncellendi");
          }}
        />
      ) : null}

      {cropOpen && attrs.src ? (
        <ImageCropModal
          src={attrs.src}
          alt={attrs.alt ?? ""}
          onClose={() => setCropOpen(false)}
          onApply={(file) => replaceImage(file, "crop")}
        />
      ) : null}
    </NodeViewWrapper>
  );
}

export const ArticleContentImageExtension = ImageExtension.extend<ArticleContentImageOptions>({
  addOptions() {
    const parentOptions = this.parent?.();

    return {
      inline: parentOptions?.inline ?? false,
      allowBase64: parentOptions?.allowBase64 ?? false,
      HTMLAttributes: parentOptions?.HTMLAttributes ?? {},
      resize: parentOptions?.resize ?? false,
      uploadImage: noopUploadImage,
      onMessage: undefined,
      onError: undefined
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => getImageElement(element as HTMLElement)?.getAttribute("src"),
        renderHTML: (attributes) => (attributes.src ? { src: attributes.src } : {})
      },
      alt: {
        default: "",
        parseHTML: (element) => getImageElement(element as HTMLElement)?.getAttribute("alt") ?? "",
        renderHTML: (attributes) => ({ alt: attributes.alt ?? "" })
      },
      title: {
        default: null,
        parseHTML: (element) => getImageElement(element as HTMLElement)?.getAttribute("title"),
        renderHTML: (attributes) => (attributes.title ? { title: attributes.title } : {})
      },
      width: {
        default: null,
        parseHTML: (element) => getParsedWidth(element as HTMLElement),
        renderHTML: () => ({})
      },
      height: {
        default: null,
        parseHTML: (element) => getImageElement(element as HTMLElement)?.getAttribute("height"),
        renderHTML: () => ({})
      },
      loading: {
        default: "lazy",
        parseHTML: (element) => getImageElement(element as HTMLElement)?.getAttribute("loading") || "lazy",
        renderHTML: (attributes) => ({
          loading: attributes.loading === "eager" ? "eager" : "lazy"
        })
      },
      alignment: {
        default: "center",
        parseHTML: (element) => getParsedAlignment(element as HTMLElement),
        renderHTML: () => ({})
      },
      caption: {
        default: null,
        parseHTML: (element) => getTextContent((element as HTMLElement).querySelector("figcaption"), maxCaptionLength),
        renderHTML: () => ({})
      },
      href: {
        default: null,
        parseHTML: (element) => getLinkElement(element as HTMLElement)?.getAttribute("href"),
        renderHTML: () => ({})
      },
      target: {
        default: null,
        parseHTML: (element) => getLinkElement(element as HTMLElement)?.getAttribute("target"),
        renderHTML: () => ({})
      },
      rel: {
        default: null,
        parseHTML: (element) => getLinkElement(element as HTMLElement)?.getAttribute("rel"),
        renderHTML: () => ({})
      },
      storagePath: {
        default: null,
        parseHTML: (element) =>
          (element as HTMLElement).getAttribute("data-storage-path") ||
          getImageElement(element as HTMLElement)?.getAttribute("data-storage-path"),
        renderHTML: () => ({})
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.article-image"
      },
      {
        tag: this.options.allowBase64 ? "img[src]" : 'img[src]:not([src^="data:"])'
      }
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as ArticleImageAttrs;
    const alignment = normalizeAlignment(attrs.alignment);
    const width = normalizeImageWidth(attrs.width);
    const figureStyle = getFigureWidthStyle(width);
    const figureAttributes = mergeAttributes(
      {
        class: getFigureClassName(alignment),
        "data-align": alignment,
        "data-width": getWidthPercent(width) ?? undefined,
        "data-storage-path": attrs.storagePath ?? undefined,
        style: figureStyle
      },
      {}
    );
    const imageAttributes = mergeAttributes(HTMLAttributes, {
      title: attrs.title || undefined,
      loading: attrs.loading === "eager" ? "eager" : "lazy",
      "data-storage-path": attrs.storagePath ?? undefined
    });
    const imageNode = attrs.href
      ? [
          "a",
          {
            href: attrs.href,
            target: getSafeTarget(attrs.target),
            rel: attrs.target === "_blank" ? "noopener noreferrer" : undefined
          },
          ["img", imageAttributes]
        ]
      : ["img", imageAttributes];

    if (attrs.caption) {
      return ["figure", figureAttributes, imageNode, ["figcaption", attrs.caption]];
    }

    return ["figure", figureAttributes, imageNode];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ArticleContentImageView, {
      stopEvent: ({ event }) => {
        const target = event.target as HTMLElement | null;

        return Boolean(
          target?.closest('[data-image-controls="true"]') ||
            target?.closest('[data-image-modal="true"]') ||
            target?.closest('[data-resize-handle="true"]') ||
            ["BUTTON", "INPUT", "TEXTAREA", "SELECT", "LABEL"].includes(target?.tagName ?? "")
        );
      }
    });
  },

  addKeyboardShortcuts() {
    const deleteSelectedImage = () => {
      const { selection } = this.editor.state;

      if (selection instanceof NodeSelection && selection.node.type.name === this.name) {
        return this.editor.commands.deleteSelection();
      }

      return false;
    };

    return {
      Delete: deleteSelectedImage,
      Backspace: deleteSelectedImage
    };
  }
});
