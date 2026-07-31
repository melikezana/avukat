"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  type LucideIcon,
  Underline as UnderlineIcon,
  Undo2,
  Unlink
} from "lucide-react";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArticleContentImageExtension,
  contentImageAllowedTypes as allowedImageTypes,
  contentImageMaxAltTextLength as maxAltTextLength,
  contentImageMaxUploadSizeBytes as maxUploadSizeBytes,
  type UploadedContentImage
} from "@/components/admin/article-content-image-extension";
import { cn } from "@/lib/utils";

const contentImageFolder = "article-content";

type UploadResponse =
  | {
      ok: true;
      file: {
        name?: string;
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

type RichTextEditorProps = {
  id: string;
  value: string;
  contentImageScopeId: string;
  onChange: (value: string) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  error?: string;
};

type ToolbarButtonProps = {
  label: string;
  title?: string;
  icon: LucideIcon;
  onAction: () => void;
  active?: boolean;
  disabled?: boolean;
};

type ImageInsertPosition = number | { from: number; to: number };

type PendingContentImageStatus = "ready" | "uploading" | "success" | "error";

type PendingContentImage = {
  id: string;
  file: File;
  fingerprint: string;
  alt: string;
  status: PendingContentImageStatus;
  progress: number;
  error?: string;
  publicUrl?: string;
  path?: string;
};

type ToolbarState = {
  canUndo: boolean;
  canRedo: boolean;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  paragraph: boolean;
  heading2: boolean;
  heading3: boolean;
  bulletList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  link: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
  codeBlock: boolean;
};

const emptyToolbarState: ToolbarState = {
  canUndo: false,
  canRedo: false,
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  paragraph: false,
  heading2: false,
  heading3: false,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  link: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  codeBlock: false
};

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createClientId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getFileFingerprint(file: File) {
  return [file.name, file.type, file.size, file.lastModified].join(":");
}

function sanitizeAltText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f<>`{}[\]\\|^~]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxAltTextLength);
}

function createAltTextFromFileName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const readableName = withoutExtension.replace(/[_-]+/g, " ");

  return sanitizeAltText(readableName) || "Makale içi görsel";
}

function getUploadAltText(image: PendingContentImage) {
  return sanitizeAltText(image.alt) || createAltTextFromFileName(image.file.name);
}

function getRejectedImagesMessage(messages: string[]) {
  if (messages.length <= 3) {
    return messages.join(" ");
  }

  return `${messages.slice(0, 3).join(" ")} ${messages.length - 3} dosya daha reddedildi.`;
}

function getImageStatusText(image: PendingContentImage) {
  if (image.status === "uploading") {
    return `%${image.progress} yüklendi`;
  }

  if (image.status === "success") {
    return "Yüklendi";
  }

  if (image.status === "error") {
    return image.error || "Yüklenemedi";
  }

  return "Yüklemeye hazır";
}

function getImageStatusClassName(status: PendingContentImageStatus) {
  if (status === "success") {
    return "text-emerald-700";
  }

  if (status === "error") {
    return "text-red-700";
  }

  return "text-[var(--color-navy)]";
}

function getSafeImageStyle(value: string) {
  const allowedProperties = new Set([
    "display",
    "width",
    "max-width",
    "height",
    "margin",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "border-radius"
  ]);
  const cssLengthValue = "(?:0|auto|\\d+(?:\\.\\d+)?(?:px|%|rem|em|vw|vh))";
  const cssLengthListPattern = new RegExp(`^${cssLengthValue}(?:\\s+${cssLengthValue}){0,3}$`, "i");
  const cssCalcPattern = /^calc\([0-9+\-*/.\s%pxrememvwvh]+\)$/i;
  const safeRules = value
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .map((rule) => {
      const separatorIndex = rule.indexOf(":");

      if (separatorIndex === -1) {
        return "";
      }

      const property = rule.slice(0, separatorIndex).trim().toLowerCase();
      const propertyValue = rule.slice(separatorIndex + 1).trim();

      if (!allowedProperties.has(property) || /url\s*\(|expression\s*\(/i.test(propertyValue)) {
        return "";
      }

      if (property === "display" && !/^(block|inline-block|inline)$/i.test(propertyValue)) {
        return "";
      }

      if (property !== "display" && !cssLengthListPattern.test(propertyValue) && !cssCalcPattern.test(propertyValue)) {
        return "";
      }

      return `${property}: ${propertyValue}`;
    })
    .filter(Boolean);

  return safeRules.join("; ");
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

function isSafeEditorUrl(value: string) {
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function sanitizePastedHtml(html: string) {
  if (typeof window === "undefined") {
    return html;
  }

  const documentFragment = new DOMParser().parseFromString(html, "text/html");
  documentFragment.querySelectorAll("script, iframe, object, embed, form, input, button, style").forEach((node) => {
    node.remove();
  });

  documentFragment.body.querySelectorAll<HTMLElement>("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();

      if (name.startsWith("on")) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (name === "style") {
        if (element.tagName.toLowerCase() === "img") {
          const safeImageStyle = getSafeImageStyle(value);

          if (safeImageStyle) {
            element.setAttribute("style", safeImageStyle);
          } else {
            element.removeAttribute(attribute.name);
          }

          return;
        }

        const textAlign = value.match(/text-align\s*:\s*(left|center|right)/i)?.[1]?.toLowerCase();

        if (textAlign) {
          element.setAttribute("style", `text-align: ${textAlign}`);
        } else {
          element.removeAttribute(attribute.name);
        }

        return;
      }

      if ((name === "href" || name === "src") && !isSafeEditorUrl(value)) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName.toLowerCase() === "a" && element.getAttribute("href")) {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }
  });

  return documentFragment.body.innerHTML;
}

function validateImageFile(file: File) {
  if (!allowedImageTypes.includes(file.type)) {
    return "Sadece JPG, PNG veya WebP görsel yükleyebilirsiniz.";
  }

  if (file.size > maxUploadSizeBytes) {
    return `Görsel en fazla ${formatBytes(maxUploadSizeBytes)} olabilir.`;
  }

  if (file.size === 0) {
    return "Boş dosya yüklenemez.";
  }

  return "";
}

function ToolbarButton({ label, title, icon: Icon, onAction, active, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
        onAction();
      }}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
          : "border-[#d8c7a8] bg-white text-[var(--color-navy)] hover:border-[#c8a45d] hover:text-[var(--color-gold)]"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-7 w-px shrink-0 bg-[#d8c7a8]" aria-hidden />;
}

function run(editor: Editor | null, callback: (editor: Editor) => void) {
  if (editor) {
    callback(editor);
  }
}

export function RichTextEditor({
  id,
  value,
  contentImageScopeId,
  onChange,
  onUploadStateChange,
  error
}: RichTextEditorProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingImageInsertPositionRef = useRef<ImageInsertPosition | null>(null);
  const [pendingImages, setPendingImages] = useState<PendingContentImage[]>([]);
  const [modalError, setModalError] = useState("");
  const [message, setMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const pendingUploadCount = pendingImages.filter((image) => image.status === "ready" || image.status === "error").length;
  const aggregateProgress = pendingImages.length
    ? Math.round(pendingImages.reduce((total, image) => total + image.progress, 0) / pendingImages.length)
    : 0;

  const setUploadingState = useCallback((nextState: boolean) => {
    setIsUploading(nextState);
    onUploadStateChange?.(nextState);
  }, [onUploadStateChange]);

  function resetImageInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function getSelectionInsertPosition(selection: { from: number; to: number }): ImageInsertPosition {
    return selection.from === selection.to ? selection.from : { from: selection.from, to: selection.to };
  }

  function getImageInsertPosition(currentEditor: Editor): ImageInsertPosition {
    return getSelectionInsertPosition(currentEditor.state.selection);
  }

  function updatePendingImage(id: string, updater: (image: PendingContentImage) => PendingContentImage) {
    setPendingImages((currentImages) => currentImages.map((image) => (image.id === id ? updater(image) : image)));
  }

  function updatePendingImageAlt(id: string, alt: string) {
    updatePendingImage(id, (image) => ({
      ...image,
      alt: alt.slice(0, maxAltTextLength),
      error: undefined,
      status: image.status === "error" ? "ready" : image.status
    }));
    setModalError("");
  }

  function openImageAltForm(files: File[]) {
    const seenFingerprints = new Set<string>();
    const rejectedMessages: string[] = [];
    const validImages: PendingContentImage[] = [];

    for (const file of files) {
      const fingerprint = getFileFingerprint(file);

      if (seenFingerprints.has(fingerprint)) {
        rejectedMessages.push(`${file.name}: Bu seçimde aynı görsel tekrarlandı.`);
        continue;
      }

      seenFingerprints.add(fingerprint);

      const validationMessage = validateImageFile(file);

      if (validationMessage) {
        rejectedMessages.push(`${file.name}: ${validationMessage}`);
        continue;
      }

      validImages.push({
        id: createClientId("content-image"),
        file,
        fingerprint,
        alt: createAltTextFromFileName(file.name),
        status: "ready",
        progress: 0
      });
    }

    setPendingImages(validImages);
    setModalError("");
    setUploadError(rejectedMessages.length ? getRejectedImagesMessage(rejectedMessages) : "");
    setMessage("");

    if (validImages.length === 0) {
      pendingImageInsertPositionRef.current = null;
    }
  }

  const uploadContentImageFile = useCallback(
    (file: File, alt: string, onProgress?: (progress: number) => void) =>
      new Promise<UploadedContentImage>((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", contentImageFolder);
        formData.append("scopeId", contentImageScopeId);
        formData.append("alt", alt);

        const request = new XMLHttpRequest();

        request.upload.onprogress = (event) => {
          if (!event.lengthComputable) {
            onProgress?.(15);
            return;
          }

          onProgress?.(Math.min(95, Math.round((event.loaded / event.total) * 90)));
        };

        request.onload = () => {
          const response = getUploadResponse(request.responseText);

          if (request.status >= 200 && request.status < 300 && response?.ok) {
            resolve({
              publicUrl: response.file.href,
              alt,
              path: response.file.path
            });
            return;
          }

          reject(new Error(getUploadErrorMessage(response) || "Görsel yüklenemedi. Lütfen tekrar deneyin."));
        };

        request.onerror = () => {
          reject(new Error("Bağlantı sırasında hata oluştu. Lütfen tekrar deneyin."));
        };

        request.onabort = () => {
          reject(new Error("Görsel yükleme iptal edildi."));
        };

        request.open("POST", "/api/admin/upload");
        request.withCredentials = true;
        request.send(formData);
      }),
    [contentImageScopeId]
  );

  const uploadEditorImageFile = useCallback(
    async (file: File, alt: string, context: "replace" | "crop") => {
      const safeAlt = sanitizeAltText(alt) || createAltTextFromFileName(file.name);

      setUploadingState(true);
      setUploadError("");
      setMessage(context === "crop" ? "Görsel kırpılıyor ve yükleniyor..." : "Görsel güncelleniyor...");

      try {
        return await uploadContentImageFile(file, safeAlt);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Görsel yüklenemedi");
        throw error;
      } finally {
        setUploadingState(false);
      }
    },
    [setUploadingState, uploadContentImageFile]
  );

  const editorExtensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        },
        link: false,
        underline: false
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        protocols: ["http", "https", "mailto", "tel"],
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank"
        }
      }),
      ArticleContentImageExtension.configure({
        allowBase64: false,
        inline: false,
        HTMLAttributes: {
          loading: "lazy"
        },
        uploadImage: uploadEditorImageFile,
        onMessage: setMessage,
        onError: setUploadError
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"]
      })
    ],
    [uploadEditorImageFile]
  );

  const editor = useEditor({
    extensions: editorExtensions,
    content: value || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": "Makale içeriği",
        class: "article-prose min-h-[450px] w-full max-w-none px-4 py-4 focus-visible:outline-none"
      },
      transformPastedHTML: sanitizePastedHtml,
      handleDrop: (view, event, _slice, moved) => {
        if (moved) {
          return false;
        }

        const files = Array.from(event.dataTransfer?.files ?? []);

        if (!files.some((file) => file.type.startsWith("image/"))) {
          return false;
        }

        event.preventDefault();
        const dropPosition = view.posAtCoords({ left: event.clientX, top: event.clientY });
        pendingImageInsertPositionRef.current = dropPosition ? dropPosition.pos : getSelectionInsertPosition(view.state.selection);
        openImageAltForm(files);
        return true;
      }
    },
    onUpdate({ editor: updatedEditor }) {
      onChange(updatedEditor.getHTML());
    }
  });

  const toolbarState =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => {
        if (!currentEditor) {
          return emptyToolbarState;
        }

        return {
          canUndo: currentEditor.can().undo(),
          canRedo: currentEditor.can().redo(),
          bold: currentEditor.isActive("bold"),
          italic: currentEditor.isActive("italic"),
          underline: currentEditor.isActive("underline"),
          strike: currentEditor.isActive("strike"),
          paragraph: currentEditor.isActive("paragraph"),
          heading2: currentEditor.isActive("heading", { level: 2 }),
          heading3: currentEditor.isActive("heading", { level: 3 }),
          bulletList: currentEditor.isActive("bulletList"),
          orderedList: currentEditor.isActive("orderedList"),
          blockquote: currentEditor.isActive("blockquote"),
          link: currentEditor.isActive("link"),
          alignLeft: currentEditor.isActive({ textAlign: "left" }),
          alignCenter: currentEditor.isActive({ textAlign: "center" }),
          alignRight: currentEditor.isActive({ textAlign: "right" }),
          codeBlock: currentEditor.isActive("codeBlock")
        };
      }
    }) ?? emptyToolbarState;

  useEffect(() => {
    if (!editor || editor.getHTML() === value) {
      return;
    }

    editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
  }, [editor, value]);

  function setLink() {
    run(editor, (currentEditor) => {
      const previousUrl = currentEditor.getAttributes("link").href as string | undefined;
      const promptValue = window.prompt("Bağlantı URL'si", previousUrl ?? "");

      if (promptValue === null) {
        return;
      }

      const nextUrl = normalizeUrl(promptValue);

      if (!nextUrl) {
        return;
      }

      if (!isSafeEditorUrl(nextUrl)) {
        setUploadError("Bağlantı için yalnızca güvenli http, https, mailto veya tel adresleri kullanılabilir.");
        return;
      }

      currentEditor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: nextUrl, target: "_blank", rel: "noopener noreferrer" })
        .run();
    });
  }

  function uploadContentImage(image: PendingContentImage) {
    const alt = getUploadAltText(image);

    return uploadContentImageFile(image.file, alt, (progress) => {
      updatePendingImage(image.id, (currentImage) => ({
        ...currentImage,
        progress: currentImage.progress < progress ? progress : currentImage.progress
      }));
    });
  }

  function insertUploadedImages(uploadedImages: UploadedContentImage[]) {
    if (!editor || uploadedImages.length === 0) {
      return;
    }

    const content = uploadedImages.flatMap((image) => [
      {
        type: "image",
        attrs: {
          src: image.publicUrl,
          alt: image.alt,
          title: image.alt,
          loading: "lazy",
          width: "85%",
          alignment: "center",
          storagePath: image.path
        }
      },
      {
        type: "paragraph"
      }
    ]);
    const insertPosition = pendingImageInsertPositionRef.current;

    if (insertPosition !== null) {
      editor.chain().focus().insertContentAt(insertPosition, content).run();
    } else {
      editor.chain().focus().insertContent(content).run();
    }
  }

  async function uploadPendingImages() {
    if (!editor || isUploading) {
      return;
    }

    const imagesToUpload = pendingImages.filter((image) => image.status === "ready" || image.status === "error");

    if (imagesToUpload.length === 0) {
      return;
    }

    const finalImages = [...pendingImages];
    const uploadedImages: UploadedContentImage[] = [];

    setUploadingState(true);
    setModalError("");
    setUploadError("");
    setMessage(`${imagesToUpload.length} görsel yükleniyor...`);

    for (const image of imagesToUpload) {
      updatePendingImage(image.id, (currentImage) => ({
        ...currentImage,
        status: "uploading",
        progress: 0,
        error: undefined
      }));

      try {
        const uploadedImage = await uploadContentImage(image);
        uploadedImages.push(uploadedImage);
        const finalImageIndex = finalImages.findIndex((item) => item.id === image.id);

        if (finalImageIndex >= 0) {
          finalImages[finalImageIndex] = {
            ...finalImages[finalImageIndex],
            status: "success",
            progress: 100,
            publicUrl: uploadedImage.publicUrl,
            path: uploadedImage.path
          };
        }

        updatePendingImage(image.id, (currentImage) => ({
          ...currentImage,
          status: "success",
          progress: 100,
          publicUrl: uploadedImage.publicUrl,
          path: uploadedImage.path
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Görsel yüklenemedi. Lütfen tekrar deneyin.";
        const finalImageIndex = finalImages.findIndex((item) => item.id === image.id);

        if (finalImageIndex >= 0) {
          finalImages[finalImageIndex] = {
            ...finalImages[finalImageIndex],
            status: "error",
            progress: 0,
            error: errorMessage
          };
        }

        updatePendingImage(image.id, (currentImage) => ({
          ...currentImage,
          status: "error",
          progress: 0,
          error: errorMessage
        }));
      }
    }

    const failedImages = finalImages.filter((image) => image.status === "error");
    const successCount = uploadedImages.length;
    const failureCount = failedImages.length;

    if (successCount > 0) {
      insertUploadedImages(uploadedImages);
      pendingImageInsertPositionRef.current = null;
    }

    if (failureCount > 0) {
      setPendingImages(failedImages);
      setModalError(`${failureCount} görsel yüklenemedi. Başarısız dosyaları yeniden deneyebilir veya pencereyi kapatabilirsiniz.`);
    } else {
      setPendingImages([]);
      setModalError("");
    }

    if (successCount > 0 && failureCount > 0) {
      setMessage(`${successCount} görsel içeriğe eklendi, ${failureCount} görsel yüklenemedi.`);
    } else if (successCount > 0) {
      setMessage(`${successCount} görsel içeriğe eklendi.`);
    } else {
      setMessage("Görseller yüklenemedi. Lütfen listedeki hataları kontrol edin.");
    }

    setUploadingState(false);
    resetImageInput();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      openImageAltForm(files);
    }

    resetImageInput();
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (event.dataTransfer.types.includes("Files")) {
      event.preventDefault();
      setIsDragging(true);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    const files = Array.from(event.dataTransfer.files ?? []);

    if (!files.some((file) => file.type.startsWith("image/"))) {
      setIsDragging(false);
      return;
    }

    event.preventDefault();
    setIsDragging(false);
    if (editor) {
      pendingImageInsertPositionRef.current = getImageInsertPosition(editor);
    }
    openImageAltForm(files);
  }

  if (!editor) {
    return null;
  }

  return (
    <div>
      <div
        className={cn(
          "mt-2 overflow-hidden rounded-[8px] border bg-white shadow-[0_10px_28px_rgba(10,22,40,0.04)]",
          error ? "border-red-300" : "border-[#d8c7a8]",
          isDragging && "border-[var(--color-gold)] ring-2 ring-[var(--color-gold)]/30"
        )}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-[#eadcc5] bg-[#fffaf0] p-2">
          <ToolbarButton
            label="Geri al"
            icon={Undo2}
            disabled={!toolbarState.canUndo}
            onAction={() => run(editor, (item) => item.chain().focus().undo().run())}
          />
          <ToolbarButton
            label="İleri al"
            icon={Redo2}
            disabled={!toolbarState.canRedo}
            onAction={() => run(editor, (item) => item.chain().focus().redo().run())}
          />
          <ToolbarDivider />
          <ToolbarButton
            label="Kalın"
            icon={Bold}
            active={toolbarState.bold}
            onAction={() => run(editor, (item) => item.chain().focus().toggleBold().run())}
          />
          <ToolbarButton
            label="İtalik"
            icon={Italic}
            active={toolbarState.italic}
            onAction={() => run(editor, (item) => item.chain().focus().toggleItalic().run())}
          />
          <ToolbarButton
            label="Altı çizili"
            icon={UnderlineIcon}
            active={toolbarState.underline}
            onAction={() => run(editor, (item) => item.chain().focus().toggleUnderline().run())}
          />
          <ToolbarButton
            label="Üstü çizili"
            icon={Strikethrough}
            active={toolbarState.strike}
            onAction={() => run(editor, (item) => item.chain().focus().toggleStrike().run())}
          />
          <ToolbarDivider />
          <ToolbarButton
            label="Normal paragraf"
            icon={Pilcrow}
            active={toolbarState.paragraph}
            onAction={() => run(editor, (item) => item.chain().focus().setParagraph().run())}
          />
          <ToolbarButton
            label="H2"
            icon={Heading2}
            active={toolbarState.heading2}
            onAction={() => run(editor, (item) => item.chain().focus().toggleHeading({ level: 2 }).run())}
          />
          <ToolbarButton
            label="H3"
            icon={Heading3}
            active={toolbarState.heading3}
            onAction={() => run(editor, (item) => item.chain().focus().toggleHeading({ level: 3 }).run())}
          />
          <ToolbarDivider />
          <ToolbarButton
            label="Madde işaretli liste"
            icon={List}
            active={toolbarState.bulletList}
            onAction={() => run(editor, (item) => item.chain().focus().toggleBulletList().run())}
          />
          <ToolbarButton
            label="Numaralı liste"
            icon={ListOrdered}
            active={toolbarState.orderedList}
            onAction={() => run(editor, (item) => item.chain().focus().toggleOrderedList().run())}
          />
          <ToolbarButton
            label="Alıntı"
            icon={Quote}
            active={toolbarState.blockquote}
            onAction={() => run(editor, (item) => item.chain().focus().toggleBlockquote().run())}
          />
          <ToolbarButton
            label="Yatay çizgi"
            icon={Minus}
            onAction={() => run(editor, (item) => item.chain().focus().setHorizontalRule().run())}
          />
          <ToolbarDivider />
          <ToolbarButton label="Bağlantı ekle" icon={Link2} active={toolbarState.link} onAction={setLink} />
          <ToolbarButton
            label="Bağlantıyı kaldır"
            icon={Unlink}
            onAction={() => run(editor, (item) => item.chain().focus().extendMarkRange("link").unsetLink().run())}
          />
          <ToolbarButton
            label="Sola hizala"
            icon={AlignLeft}
            active={toolbarState.alignLeft}
            onAction={() => run(editor, (item) => item.chain().focus().setTextAlign("left").run())}
          />
          <ToolbarButton
            label="Ortala"
            icon={AlignCenter}
            active={toolbarState.alignCenter}
            onAction={() => run(editor, (item) => item.chain().focus().setTextAlign("center").run())}
          />
          <ToolbarButton
            label="Sağa hizala"
            icon={AlignRight}
            active={toolbarState.alignRight}
            onAction={() => run(editor, (item) => item.chain().focus().setTextAlign("right").run())}
          />
          <ToolbarDivider />
          <ToolbarButton
            label="Kod bloğu"
            icon={Code2}
            active={toolbarState.codeBlock}
            onAction={() => run(editor, (item) => item.chain().focus().toggleCodeBlock().run())}
          />
          <ToolbarButton
            label="İçeriğe görsel ekle"
            title="İçeriğe görsel ekle"
            icon={ImagePlus}
            disabled={isUploading}
            onAction={() => {
              pendingImageInsertPositionRef.current = getImageInsertPosition(editor);
              inputRef.current?.click();
            }}
          />
          <ToolbarButton
            label="Tüm biçimlendirmeyi temizle"
            icon={Eraser}
            onAction={() => run(editor, (item) => item.chain().focus().unsetAllMarks().clearNodes().run())}
          />
        </div>

        <EditorContent id={id} editor={editor} />

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={allowedImageTypes.join(",")}
          multiple
          hidden
          onChange={handleFileChange}
        />
      </div>

      <div className="mt-2 min-h-6" aria-live="polite">
        {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
        {uploadError ? <p className="text-sm font-semibold text-red-700">{uploadError}</p> : null}
        {isUploading ? <p className="text-sm font-semibold text-[var(--color-navy)]">%{aggregateProgress} yüklendi</p> : null}
      </div>

      {pendingImages.length > 0 ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="content-image-alt-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07111f]/65 p-4"
        >
          <div className="my-6 w-full max-w-2xl rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
            <h3 id="content-image-alt-title" className="font-display text-xl font-bold text-[var(--color-navy)]">
              İçerik görselleri
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#5f5a52]">
              {pendingImages.length} görsel seçildi. Alt metinleri düzenleyebilir veya boş bırakırsanız dosya adından güvenli
              metin üretilebilir.
            </p>

            <div className="mt-4 max-h-[55vh] space-y-3 overflow-y-auto pr-1">
              {pendingImages.map((image, index) => {
                const altInputId = `${inputId}-${image.id}-alt`;

                return (
                  <div key={image.id} className="rounded-[8px] border border-[#eadcc5] bg-white p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-[var(--color-navy)]">
                          {index + 1}. {image.file.name}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#6c6254]">
                          {formatBytes(image.file.size)} · {image.file.type}
                        </p>
                      </div>
                      <p className={cn("text-xs font-bold", getImageStatusClassName(image.status))}>
                        {getImageStatusText(image)}
                      </p>
                    </div>

                    <label htmlFor={altInputId} className="mt-3 block text-sm font-semibold text-[var(--color-navy)]">
                      Alt metin
                    </label>
                    <input
                      id={altInputId}
                      value={image.alt}
                      maxLength={maxAltTextLength}
                      onChange={(event) => updatePendingImageAlt(image.id, event.target.value)}
                      disabled={isUploading || image.status === "success"}
                      className="mt-2 min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                    />

                    {image.status === "uploading" ? (
                      <div
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={image.progress}
                        aria-label={`${image.file.name} yükleme ilerlemesi`}
                        className="mt-3 h-2 overflow-hidden rounded-full bg-[#eadcc5]"
                      >
                        <div className="h-full rounded-full bg-[var(--color-gold)] transition-all" style={{ width: `${image.progress}%` }} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {modalError ? <p className="mt-2 text-sm font-semibold text-red-700">{modalError}</p> : null}
            <p className="mt-3 text-xs leading-5 text-[#6c6254]">
              İçerikten sildiğiniz görseller storage’dan otomatik kaldırılmaz; riskli orphan cleanup için medya kütüphanesindeki
              kullanım kontrolünü kullanın.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => {
                  setPendingImages([]);
                  setModalError("");
                  pendingImageInsertPositionRef.current = null;
                  resetImageInput();
                }}
                className="inline-flex min-h-10 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white px-4 py-2 text-sm font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isUploading || pendingUploadCount === 0}
                onClick={uploadPendingImages}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] bg-[var(--color-navy)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-navy-deep)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
                {pendingUploadCount > 1 ? `${pendingUploadCount} görseli ekle` : "Görseli ekle"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

