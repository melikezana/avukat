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
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxUploadSizeBytes = 5 * 1024 * 1024;

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

type RichTextEditorProps = {
  id: string;
  value: string;
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

export function RichTextEditor({ id, value, onChange, onUploadStateChange, error }: RichTextEditorProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingImageInsertPositionRef = useRef<ImageInsertPosition | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [modalError, setModalError] = useState("");
  const [message, setMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  function setUploadingState(nextState: boolean) {
    setIsUploading(nextState);
    onUploadStateChange?.(nextState);
  }

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

  function openImageAltForm(file: File) {
    const validationMessage = validateImageFile(file);

    if (validationMessage) {
      setUploadError(validationMessage);
      setMessage("");
      pendingImageInsertPositionRef.current = null;
      resetImageInput();
      return;
    }

    setPendingImage(file);
    setAltText("");
    setModalError("");
    setUploadError("");
    setMessage("");
  }

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
      ImageExtension.configure({
        allowBase64: false,
        inline: false
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"]
      })
    ],
    []
  );

  const editor = useEditor({
    extensions: editorExtensions,
    content: value || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": "Makale içeriği",
        class:
          "article-prose min-h-[450px] w-full max-w-none px-4 py-4 focus-visible:outline-none [&_img]:mx-auto [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[8px] [&_img]:border [&_img]:border-primary/10"
      },
      transformPastedHTML: sanitizePastedHtml,
      handleDrop: (view, event, _slice, moved) => {
        if (moved) {
          return false;
        }

        const file = event.dataTransfer?.files?.[0];

        if (!file || !file.type.startsWith("image/")) {
          return false;
        }

        event.preventDefault();
        const dropPosition = view.posAtCoords({ left: event.clientX, top: event.clientY });
        pendingImageInsertPositionRef.current = dropPosition ? dropPosition.pos : getSelectionInsertPosition(view.state.selection);
        openImageAltForm(file);
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

  function uploadPendingImage() {
    if (!pendingImage || !editor) {
      return;
    }

    const trimmedAltText = altText.trim();

    if (!trimmedAltText) {
      setModalError("İçerik görseli için alt metin zorunludur.");
      return;
    }

    const formData = new FormData();
    formData.append("file", pendingImage);
    formData.append("folder", "article-content");
    formData.append("alt", trimmedAltText);

    const request = new XMLHttpRequest();

    setUploadingState(true);
    setProgress(0);
    setModalError("");
    setUploadError("");
    setMessage("Görsel yükleniyor...");

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        setProgress((currentProgress) => (currentProgress < 15 ? 15 : currentProgress));
        return;
      }

      setProgress(Math.min(95, Math.round((event.loaded / event.total) * 90)));
    };

    request.onload = () => {
      const response = getUploadResponse(request.responseText);

      if (request.status >= 200 && request.status < 300 && response?.ok) {
        const imageAttributes = {
          src: response.file.href,
          alt: trimmedAltText,
          title: trimmedAltText
        };
        const insertPosition = pendingImageInsertPositionRef.current;

        if (insertPosition !== null) {
          editor.chain().focus().insertContentAt(insertPosition, { type: "image", attrs: imageAttributes }).run();
        } else {
          editor.chain().focus().setImage(imageAttributes).run();
        }

        setProgress(100);
        setMessage("Görsel yüklendi ve içeriğe eklendi.");
        setPendingImage(null);
        setAltText("");
        pendingImageInsertPositionRef.current = null;
        resetImageInput();
      } else {
        setMessage("");
        setModalError(getUploadErrorMessage(response) || "Görsel yüklenemedi. Lütfen tekrar deneyin.");
      }

      setUploadingState(false);
    };

    request.onerror = () => {
      setMessage("");
      setModalError("Bağlantı sırasında hata oluştu. Lütfen tekrar deneyin.");
      setUploadingState(false);
    };

    request.onabort = () => {
      setMessage("");
      setModalError("Görsel yükleme iptal edildi.");
      setUploadingState(false);
    };

    request.open("POST", "/api/admin/upload");
    request.withCredentials = true;
    request.send(formData);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      openImageAltForm(file);
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

    if (!file || !file.type.startsWith("image/")) {
      setIsDragging(false);
      return;
    }

    event.preventDefault();
    setIsDragging(false);
    if (editor) {
      pendingImageInsertPositionRef.current = getImageInsertPosition(editor);
    }
    openImageAltForm(file);
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
            label="İçerik içi görsel ekle"
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
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>

      <div className="mt-2 min-h-6" aria-live="polite">
        {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
        {uploadError ? <p className="text-sm font-semibold text-red-700">{uploadError}</p> : null}
        {isUploading ? <p className="text-sm font-semibold text-[var(--color-navy)]">%{progress} yüklendi</p> : null}
      </div>

      {pendingImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="content-image-alt-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/65 p-4"
        >
          <div className="w-full max-w-md rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
            <h3 id="content-image-alt-title" className="font-display text-xl font-bold text-[var(--color-navy)]">
              Görsel alt metni
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#5f5a52]">
              İçerik görselleri erişilebilirlik ve SEO için açıklayıcı alt metinle eklenir.
            </p>
            <label htmlFor="content-image-alt" className="mt-4 block text-sm font-semibold text-[var(--color-navy)]">
              Alt metin
            </label>
            <input
              id="content-image-alt"
              value={altText}
              onChange={(event) => {
                setAltText(event.target.value);
                setModalError("");
              }}
              disabled={isUploading}
              className="mt-2 min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            />
            {modalError ? <p className="mt-2 text-sm font-semibold text-red-700">{modalError}</p> : null}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => {
                  setPendingImage(null);
                  setAltText("");
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
                disabled={isUploading}
                onClick={uploadPendingImage}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] bg-[var(--color-navy)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-navy-deep)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
                Görseli ekle
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
