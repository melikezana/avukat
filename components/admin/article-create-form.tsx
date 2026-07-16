"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Eye, RotateCcw, Save, Send, X } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createArticleAction,
  updateArticleAction,
  type ArticleFormFields,
  type ArticleFormState,
  type ArticleStatus
} from "@/app/admin/makaleler/actions";
import { ArticleCoverUpload } from "@/components/admin/article-cover-upload";
import { ArticlePdfUpload } from "@/components/admin/article-pdf-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ARTICLE_CATEGORY_OPTIONS, getArticleCategoryLabel, normalizeArticleCategory } from "@/lib/article-categories";
import { defaultArticleAuthor } from "@/lib/article-defaults";
import { slugifyTurkish } from "@/lib/categories";
import { cn } from "@/lib/utils";

const emptyFields: ArticleFormFields = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  status: "draft",
  cover_image_url: "",
  seo_title: "",
  seo_description: "",
  canonical_url: "",
  og_image_url: "",
  focus_keyword: "",
  author_name: defaultArticleAuthor,
  decision_pdf_url: "",
  decision_pdf_title: "",
  decision_court: "",
  decision_case_no: "",
  decision_number: "",
  decision_date: ""
};

const inputClassName =
  "mt-2 min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] transition focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]";

const labelClassName = "text-sm font-semibold text-[var(--color-navy)]";

type ArticleCreateFormProps =
  | {
      mode?: "create";
      articleId?: never;
      initialFields?: Partial<ArticleFormFields>;
    }
  | {
      mode: "edit";
      articleId: string;
      initialFields: ArticleFormFields;
    };

type SubmitButtonProps = {
  intent: ArticleStatus;
  disabled?: boolean;
  mode: "create" | "edit";
};

type FieldErrorProps = {
  id: string;
  message?: string;
};

type CharacterCounterProps = {
  value: string;
  limit: number;
};

function getFieldError(state: ArticleFormState, field: keyof ArticleFormFields) {
  return state.errors?.[field]?.[0];
}

function getInitialFields(initialFields?: Partial<ArticleFormFields>): ArticleFormFields {
  return {
    ...emptyFields,
    ...initialFields,
    category: normalizeArticleCategory(initialFields?.category ?? emptyFields.category),
    author_name: initialFields?.author_name?.trim() || defaultArticleAuthor
  };
}

function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-sm font-semibold text-red-700">
      {message}
    </p>
  );
}

function CharacterCounter({ value, limit }: CharacterCounterProps) {
  const isOverLimit = value.length > limit;

  return (
    <p className={cn("mt-2 text-xs font-semibold", isOverLimit ? "text-red-700" : "text-[#6c6254]")}>
      {value.length}/{limit}
    </p>
  );
}

function SubmitButton({ intent, disabled, mode }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;
  const Icon = intent === "published" ? Send : Save;
  const label =
    intent === "published"
      ? pending
        ? "Yayınlanıyor"
        : mode === "edit"
          ? "Güncelle ve Yayınla"
          : "Yayınla"
      : pending
        ? "Kaydediliyor"
        : "Taslak Kaydet";

  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      disabled={isDisabled}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]",
        intent === "published"
          ? "bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-deep)]"
          : "border border-[#d8c7a8] bg-white text-[var(--color-navy)] hover:border-[#c8a45d] hover:text-[var(--color-gold)]"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {disabled ? "Yükleme sürüyor" : label}
    </button>
  );
}

function PreviewModal({
  fields,
  onClose
}: {
  fields: ArticleFormFields;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-preview-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#07111f]/70 p-4"
    >
      <div className="mx-auto my-6 max-w-5xl rounded-[8px] border border-[#d8c7a8] bg-white shadow-[0_28px_90px_rgba(0,0,0,0.26)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eadcc5] bg-[#fffaf0] px-4 py-3">
          <h3 id="article-preview-title" className="font-display text-xl font-bold text-[var(--color-navy)]">
            Önizleme
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white text-[var(--color-navy)] transition hover:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            aria-label="Önizlemeyi kapat"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <article className="bg-background">
          <div className="mx-auto max-w-4xl px-5 py-10">
            <p className="mb-4 inline-flex border border-accent-1/25 bg-white px-3 py-2 text-sm font-semibold text-accent-1">
              {getArticleCategoryLabel(fields.category) || "Kategori"}
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-primary md:text-5xl">
              {fields.title || "Başlıksız makale"}
            </h1>
            {fields.excerpt ? <p className="mt-6 text-lg leading-8 text-muted">{fields.excerpt}</p> : null}
            <div className="mt-8 overflow-hidden rounded-[8px] border border-primary/10 bg-white">
              {fields.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fields.cover_image_url}
                  alt={`${fields.title || "Makale"} kapak görseli`}
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-[#0A1628] px-5 text-center text-white">
                  Kapak görseli yok
                </div>
              )}
            </div>
          </div>
          <section className="bg-white py-12">
            <div className="article-prose mx-auto w-full max-w-3xl px-5" dangerouslySetInnerHTML={{ __html: fields.content }} />
          </section>
        </article>
      </div>
    </div>
  );
}

export function ArticleCreateForm({ mode = "create", articleId, initialFields }: ArticleCreateFormProps) {
  const initialState = useMemo<ArticleFormState>(
    () => ({
      message: "",
      fields: getInitialFields(initialFields)
    }),
    [initialFields]
  );
  const action = useMemo(
    () => (mode === "edit" && articleId ? updateArticleAction.bind(null, articleId) : createArticleAction),
    [articleId, mode]
  );
  const [state, formAction] = useFormState(action, initialState);
  const [fields, setFields] = useState<ArticleFormFields>(getInitialFields(initialFields));
  const [slugEdited, setSlugEdited] = useState(mode === "edit" || Boolean(initialFields?.slug));
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isContentUploading, setIsContentUploading] = useState(false);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isUploading = isCoverUploading || isContentUploading || isPdfUploading;

  useEffect(() => {
    if (state.fields) {
      setFields(getInitialFields(state.fields));
    }
  }, [state.fields]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function updateField<Field extends keyof ArticleFormFields>(field: Field, value: ArticleFormFields[Field]) {
    setFields((currentFields) => ({
      ...currentFields,
      [field]: value
    }));
    setIsDirty(true);
  }

  function handleTitleChange(value: string) {
    setFields((currentFields) => ({
      ...currentFields,
      title: value,
      slug: slugEdited ? currentFields.slug : slugifyTurkish(value)
    }));
    setIsDirty(true);
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    updateField("slug", slugifyTurkish(value));
  }

  function regenerateSlug() {
    setSlugEdited(false);
    updateField("slug", slugifyTurkish(fields.title));
  }

  const titleError = getFieldError(state, "title");
  const slugError = getFieldError(state, "slug");
  const excerptError = getFieldError(state, "excerpt");
  const contentError = getFieldError(state, "content");
  const categoryError = getFieldError(state, "category");
  const coverImageError = getFieldError(state, "cover_image_url");
  const seoTitleError = getFieldError(state, "seo_title");
  const seoDescriptionError = getFieldError(state, "seo_description");
  const canonicalUrlError = getFieldError(state, "canonical_url");
  const ogImageUrlError = getFieldError(state, "og_image_url");
  const focusKeywordError = getFieldError(state, "focus_keyword");
  const authorNameError = getFieldError(state, "author_name");
  const decisionPdfUrlError = getFieldError(state, "decision_pdf_url");
  const decisionPdfTitleError = getFieldError(state, "decision_pdf_title");
  const decisionCourtError = getFieldError(state, "decision_court");
  const decisionCaseNoError = getFieldError(state, "decision_case_no");
  const decisionNumberError = getFieldError(state, "decision_number");
  const decisionDateError = getFieldError(state, "decision_date");

  return (
    <>
      <form
        action={formAction}
        onChange={() => setIsDirty(true)}
        className="rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_16px_50px_rgba(10,22,40,0.07)]"
      >
        {state.message ? (
          <div className="mb-5 flex items-start gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {state.message}
          </div>
        ) : null}

        <input type="hidden" name="status" value={fields.status} />
        <textarea name="content" value={fields.content} readOnly className="sr-only" tabIndex={-1} aria-hidden />

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="article-title" className={labelClassName}>
              Başlık
            </label>
            <input
              id="article-title"
              name="title"
              type="text"
              required
              value={fields.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "article-title-error" : undefined}
              className={inputClassName}
            />
            <FieldError id="article-title-error" message={titleError} />
          </div>

          <div>
            <label htmlFor="article-slug" className={labelClassName}>
              Slug
            </label>
            <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input
                id="article-slug"
                name="slug"
                type="text"
                value={fields.slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                aria-invalid={Boolean(slugError)}
                aria-describedby={slugError ? "article-slug-error" : undefined}
                className="min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] transition focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              />
              <button
                type="button"
                onClick={regenerateSlug}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm font-bold text-[var(--color-navy)] transition hover:border-[#c8a45d] hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Başlıktan yeniden oluştur
              </button>
            </div>
            <FieldError id="article-slug-error" message={slugError} />
          </div>

          <div>
            <label htmlFor="article-category" className={labelClassName}>
              Kategori
            </label>
            <select
              id="article-category"
              name="category"
              required
              value={fields.category}
              onChange={(event) => updateField("category", event.target.value)}
              aria-invalid={Boolean(categoryError)}
              aria-describedby={categoryError ? "article-category-error" : undefined}
              className={inputClassName}
            >
              <option value="" disabled>
                Kategori seçin
              </option>
              {ARTICLE_CATEGORY_OPTIONS.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <FieldError id="article-category-error" message={categoryError} />
          </div>

          <div>
            <label htmlFor="article-author" className={labelClassName}>
              Yazar adı
            </label>
            <input
              id="article-author"
              name="author_name"
              type="text"
              value={fields.author_name}
              onChange={(event) => updateField("author_name", event.target.value)}
              aria-invalid={Boolean(authorNameError)}
              aria-describedby={authorNameError ? "article-author-error" : undefined}
              className={inputClassName}
            />
            <FieldError id="article-author-error" message={authorNameError} />
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="article-excerpt" className={labelClassName}>
            Özet
          </label>
          <textarea
            id="article-excerpt"
            name="excerpt"
            rows={3}
            value={fields.excerpt}
            onChange={(event) => updateField("excerpt", event.target.value)}
            aria-invalid={Boolean(excerptError)}
            aria-describedby={excerptError ? "article-excerpt-error" : undefined}
            className={inputClassName}
          />
          <FieldError id="article-excerpt-error" message={excerptError} />
        </div>

        <div className="mt-5">
          <p className={labelClassName}>Kapak görseli yükle</p>
          <ArticleCoverUpload
            value={fields.cover_image_url}
            title={fields.title}
            onChange={(value) => updateField("cover_image_url", value)}
            onUploadStateChange={setIsCoverUploading}
          />
        </div>

        <div className="mt-5">
          <label htmlFor="article-cover-image" className={labelClassName}>
            Kapak görseli URL
          </label>
          <input
            id="article-cover-image"
            name="cover_image_url"
            type="text"
            value={fields.cover_image_url}
            onChange={(event) => updateField("cover_image_url", event.target.value)}
            aria-invalid={Boolean(coverImageError)}
            aria-describedby={coverImageError ? "article-cover-image-error" : undefined}
            className={inputClassName}
          />
          <FieldError id="article-cover-image-error" message={coverImageError} />
        </div>

        <div className="mt-5">
          <label htmlFor="article-content-editor" className={labelClassName}>
            İçerik
          </label>
          <RichTextEditor
            id="article-content-editor"
            value={fields.content}
            onChange={(value) => updateField("content", value)}
            onUploadStateChange={setIsContentUploading}
            error={contentError}
          />
          <FieldError id="article-content-error" message={contentError} />
        </div>

        <details className="mt-8 rounded-[8px] border border-[#d8c7a8] bg-white" open>
          <summary className="cursor-pointer px-4 py-3 font-display text-lg font-bold text-[var(--color-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]">
            Karar Bilgileri
          </summary>
          <div className="grid gap-5 border-t border-[#eadcc5] p-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label htmlFor="article-decision-court" className={labelClassName}>
                Mahkeme
              </label>
              <input
                id="article-decision-court"
                name="decision_court"
                type="text"
                value={fields.decision_court}
                onChange={(event) => updateField("decision_court", event.target.value)}
                aria-invalid={Boolean(decisionCourtError)}
                aria-describedby={decisionCourtError ? "article-decision-court-error" : undefined}
                className={inputClassName}
              />
              <FieldError id="article-decision-court-error" message={decisionCourtError} />
            </div>

            <div>
              <label htmlFor="article-decision-case-no" className={labelClassName}>
                Esas no
              </label>
              <input
                id="article-decision-case-no"
                name="decision_case_no"
                type="text"
                value={fields.decision_case_no}
                onChange={(event) => updateField("decision_case_no", event.target.value)}
                aria-invalid={Boolean(decisionCaseNoError)}
                aria-describedby={decisionCaseNoError ? "article-decision-case-no-error" : undefined}
                className={inputClassName}
              />
              <FieldError id="article-decision-case-no-error" message={decisionCaseNoError} />
            </div>

            <div>
              <label htmlFor="article-decision-number" className={labelClassName}>
                Karar no
              </label>
              <input
                id="article-decision-number"
                name="decision_number"
                type="text"
                value={fields.decision_number}
                onChange={(event) => updateField("decision_number", event.target.value)}
                aria-invalid={Boolean(decisionNumberError)}
                aria-describedby={decisionNumberError ? "article-decision-number-error" : undefined}
                className={inputClassName}
              />
              <FieldError id="article-decision-number-error" message={decisionNumberError} />
            </div>

            <div>
              <label htmlFor="article-decision-date" className={labelClassName}>
                Karar tarihi
              </label>
              <input
                id="article-decision-date"
                name="decision_date"
                type="date"
                value={fields.decision_date}
                onChange={(event) => updateField("decision_date", event.target.value)}
                aria-invalid={Boolean(decisionDateError)}
                aria-describedby={decisionDateError ? "article-decision-date-error" : undefined}
                className={inputClassName}
              />
              <FieldError id="article-decision-date-error" message={decisionDateError} />
            </div>
          </div>
        </details>

        <details className="mt-5 rounded-[8px] border border-[#d8c7a8] bg-white">
          <summary className="cursor-pointer px-4 py-3 font-display text-lg font-bold text-[var(--color-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]">
            Karar PDF’i
          </summary>
          <div className="space-y-5 border-t border-[#eadcc5] p-4">
            <div>
              <label htmlFor="article-decision-pdf-title" className={labelClassName}>
                PDF başlığı
              </label>
              <input
                id="article-decision-pdf-title"
                name="decision_pdf_title"
                type="text"
                value={fields.decision_pdf_title}
                onChange={(event) => updateField("decision_pdf_title", event.target.value)}
                aria-invalid={Boolean(decisionPdfTitleError)}
                aria-describedby={decisionPdfTitleError ? "article-decision-pdf-title-error" : undefined}
                className={inputClassName}
              />
              <FieldError id="article-decision-pdf-title-error" message={decisionPdfTitleError} />
            </div>

            <div>
              <label htmlFor="article-decision-pdf-url" className={labelClassName}>
                PDF URL
              </label>
              <input
                id="article-decision-pdf-url"
                name="decision_pdf_url"
                type="url"
                value={fields.decision_pdf_url}
                onChange={(event) => updateField("decision_pdf_url", event.target.value)}
                aria-invalid={Boolean(decisionPdfUrlError)}
                aria-describedby={decisionPdfUrlError ? "article-decision-pdf-url-error" : undefined}
                className={inputClassName}
              />
              <FieldError id="article-decision-pdf-url-error" message={decisionPdfUrlError} />
            </div>

            <div>
              <p className={labelClassName}>PDF dosyası yükleme</p>
              <ArticlePdfUpload
                value={fields.decision_pdf_url}
                onChange={(value) => updateField("decision_pdf_url", value)}
                onUploadStateChange={setIsPdfUploading}
              />
            </div>
          </div>
        </details>

        <section className="mt-8 border-t border-[#d8c7a8] pt-6" aria-labelledby="seo-settings-title">
          <h3 id="seo-settings-title" className="font-display text-xl font-bold text-[var(--color-navy)]">
            SEO Ayarları
          </h3>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <label htmlFor="article-seo-title" className={labelClassName}>
                SEO başlığı
              </label>
              <input
                id="article-seo-title"
                name="seo_title"
                type="text"
                value={fields.seo_title}
                onChange={(event) => updateField("seo_title", event.target.value)}
                aria-invalid={Boolean(seoTitleError)}
                aria-describedby={seoTitleError ? "article-seo-title-error" : undefined}
                className={inputClassName}
              />
              <CharacterCounter value={fields.seo_title} limit={60} />
              <FieldError id="article-seo-title-error" message={seoTitleError} />
            </div>

            <div>
              <label htmlFor="article-focus-keyword" className={labelClassName}>
                Odak anahtar kelime
              </label>
              <input
                id="article-focus-keyword"
                name="focus_keyword"
                type="text"
                value={fields.focus_keyword}
                onChange={(event) => updateField("focus_keyword", event.target.value)}
                aria-invalid={Boolean(focusKeywordError)}
                aria-describedby={focusKeywordError ? "article-focus-keyword-error" : undefined}
                className={inputClassName}
              />
              <FieldError id="article-focus-keyword-error" message={focusKeywordError} />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="article-seo-description" className={labelClassName}>
                Meta açıklaması
              </label>
              <textarea
                id="article-seo-description"
                name="seo_description"
                rows={3}
                value={fields.seo_description}
                onChange={(event) => updateField("seo_description", event.target.value)}
                aria-invalid={Boolean(seoDescriptionError)}
                aria-describedby={seoDescriptionError ? "article-seo-description-error" : undefined}
                className={inputClassName}
              />
              <CharacterCounter value={fields.seo_description} limit={160} />
              <FieldError id="article-seo-description-error" message={seoDescriptionError} />
            </div>

            <div>
              <label htmlFor="article-canonical-url" className={labelClassName}>
                Canonical URL
              </label>
              <input
                id="article-canonical-url"
                name="canonical_url"
                type="url"
                value={fields.canonical_url}
                onChange={(event) => updateField("canonical_url", event.target.value)}
                aria-invalid={Boolean(canonicalUrlError)}
                aria-describedby={canonicalUrlError ? "article-canonical-url-error" : undefined}
                className={inputClassName}
              />
              <FieldError id="article-canonical-url-error" message={canonicalUrlError} />
            </div>

            <div>
              <label htmlFor="article-og-image" className={labelClassName}>
                Open Graph görsel URL
              </label>
              <input
                id="article-og-image"
                name="og_image_url"
                type="url"
                value={fields.og_image_url}
                onChange={(event) => updateField("og_image_url", event.target.value)}
                aria-invalid={Boolean(ogImageUrlError)}
                aria-describedby={ogImageUrlError ? "article-og-image-error" : undefined}
                className={inputClassName}
              />
              <FieldError id="article-og-image-error" message={ogImageUrlError} />
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border border-[#d8c7a8] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[#c8a45d] hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          >
            <Eye className="h-4 w-4" aria-hidden />
            Önizle
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SubmitButton intent="draft" mode={mode} disabled={isUploading} />
            <SubmitButton intent="published" mode={mode} disabled={isUploading} />
          </div>
        </div>
      </form>

      {isPreviewOpen ? <PreviewModal fields={fields} onClose={() => setIsPreviewOpen(false)} /> : null}
    </>
  );
}
