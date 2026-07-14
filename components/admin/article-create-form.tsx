"use client";

import { Save } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createArticleAction,
  type ArticleFormFields,
  type ArticleFormState
} from "@/app/admin/makaleler/yeni/actions";

const initialState: ArticleFormState = {
  message: "",
  fields: {
    status: "draft"
  }
};

function getFieldError(state: ArticleFormState, field: keyof ArticleFormFields) {
  return state.errors?.[field]?.[0];
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-[var(--color-navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-deep)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
    >
      <Save className="h-4 w-4" aria-hidden />
      {pending ? "Kaydediliyor" : "Kaydet"}
    </button>
  );
}

type FieldErrorProps = {
  id: string;
  message?: string;
};

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

const inputClassName =
  "mt-2 min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] transition focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]";

const labelClassName = "text-sm font-semibold text-[var(--color-navy)]";

export function ArticleCreateForm() {
  const [state, formAction] = useFormState(createArticleAction, initialState);

  const titleError = getFieldError(state, "title");
  const slugError = getFieldError(state, "slug");
  const excerptError = getFieldError(state, "excerpt");
  const contentError = getFieldError(state, "content");
  const categoryError = getFieldError(state, "category");
  const statusError = getFieldError(state, "status");
  const coverImageError = getFieldError(state, "cover_image_url");

  return (
    <form
      action={formAction}
      className="rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_16px_50px_rgba(10,22,40,0.07)]"
    >
      {state.message ? (
        <div className="mb-5 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {state.message}
        </div>
      ) : null}

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
            defaultValue={state.fields?.title ?? ""}
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
          <input
            id="article-slug"
            name="slug"
            type="text"
            defaultValue={state.fields?.slug ?? ""}
            aria-invalid={Boolean(slugError)}
            aria-describedby={slugError ? "article-slug-error" : undefined}
            className={inputClassName}
          />
          <FieldError id="article-slug-error" message={slugError} />
        </div>

        <div>
          <label htmlFor="article-category" className={labelClassName}>
            Kategori
          </label>
          <input
            id="article-category"
            name="category"
            type="text"
            required
            defaultValue={state.fields?.category ?? ""}
            aria-invalid={Boolean(categoryError)}
            aria-describedby={categoryError ? "article-category-error" : undefined}
            className={inputClassName}
          />
          <FieldError id="article-category-error" message={categoryError} />
        </div>

        <div>
          <label htmlFor="article-status" className={labelClassName}>
            Durum
          </label>
          <select
            id="article-status"
            name="status"
            defaultValue={state.fields?.status ?? "draft"}
            aria-invalid={Boolean(statusError)}
            aria-describedby={statusError ? "article-status-error" : undefined}
            className={inputClassName}
          >
            <option value="draft">Taslak</option>
            <option value="published">Yayımlanmış</option>
          </select>
          <FieldError id="article-status-error" message={statusError} />
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
          defaultValue={state.fields?.excerpt ?? ""}
          aria-invalid={Boolean(excerptError)}
          aria-describedby={excerptError ? "article-excerpt-error" : undefined}
          className={inputClassName}
        />
        <FieldError id="article-excerpt-error" message={excerptError} />
      </div>

      <div className="mt-5">
        <label htmlFor="article-cover-image" className={labelClassName}>
          Kapak Görseli URL
        </label>
        <input
          id="article-cover-image"
          name="cover_image_url"
          type="text"
          defaultValue={state.fields?.cover_image_url ?? ""}
          aria-invalid={Boolean(coverImageError)}
          aria-describedby={coverImageError ? "article-cover-image-error" : undefined}
          className={inputClassName}
        />
        <FieldError id="article-cover-image-error" message={coverImageError} />
      </div>

      <div className="mt-5">
        <label htmlFor="article-content" className={labelClassName}>
          İçerik
        </label>
        <textarea
          id="article-content"
          name="content"
          rows={12}
          required
          defaultValue={state.fields?.content ?? ""}
          aria-invalid={Boolean(contentError)}
          aria-describedby={contentError ? "article-content-error" : undefined}
          className={inputClassName}
        />
        <FieldError id="article-content-error" message={contentError} />
      </div>

      <div className="mt-6 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
