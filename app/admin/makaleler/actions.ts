"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isArticleCategorySlug, type ArticleCategorySlug } from "@/lib/article-categories";
import { slugifyTurkish } from "@/lib/categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ArticleStatus = "draft" | "published";

export type ArticleFormFields = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: ArticleStatus;
  cover_image_url: string;
};

export type ArticleFormState = {
  message: string;
  errors?: Partial<Record<keyof ArticleFormFields, string[]>>;
  fields?: Partial<ArticleFormFields>;
};

export type ArticleActionResult = {
  ok: boolean;
  message: string;
};

type ArticleInsertPayload = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: ArticleCategorySlug;
  cover_image_url: string | null;
  status: ArticleStatus;
  published_at: string | null;
};

type ArticleUpdatePayload = ArticleInsertPayload & {
  updated_at: string;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const coverImagePattern = /^(https?:\/\/.+|\/images\/articles\/[a-z0-9/_-]+\.(svg|jpg|jpeg|png|webp))$/i;

const articleFormSchema = z.object({
  title: z.string().trim().min(3, "Başlık en az 3 karakter olmalıdır.").max(160, "Başlık çok uzun."),
  slug: z.string().trim().max(140, "Adres çok uzun.").optional(),
  excerpt: z.string().trim().max(420, "Özet çok uzun.").optional(),
  content: z.string().trim().min(30, "İçerik en az 30 karakter olmalıdır."),
  category: z
    .string()
    .trim()
    .refine(isArticleCategorySlug, "Kategori seçilmelidir.")
    .transform((value) => value as ArticleCategorySlug),
  status: z.string().refine((value): value is ArticleStatus => value === "draft" || value === "published", {
    message: "Durum seçilmelidir."
  }),
  cover_image_url: z
    .string()
    .trim()
    .max(500, "Kapak görseli adresi çok uzun.")
    .optional()
    .refine((value) => !value || (coverImagePattern.test(value) && !value.includes("..")), {
      message: "Kapak görseli geçerli bir URL olmalıdır."
    })
});

function getStringField(formData: FormData, field: keyof ArticleFormFields) {
  return String(formData.get(field) ?? "");
}

function getFields(formData: FormData): ArticleFormFields {
  const rawStatus = getStringField(formData, "status");

  return {
    title: getStringField(formData, "title"),
    slug: getStringField(formData, "slug"),
    excerpt: getStringField(formData, "excerpt"),
    content: getStringField(formData, "content"),
    category: getStringField(formData, "category"),
    status: rawStatus === "published" ? "published" : "draft",
    cover_image_url: getStringField(formData, "cover_image_url")
  };
}

function getPublishedAt(status: ArticleStatus) {
  return status === "published" ? new Date().toISOString() : null;
}

function getCoverImageUrl(value?: string) {
  return value?.trim() || null;
}

function getSupabaseErrorLog(error: { code?: string; message?: string; details?: string; hint?: string }) {
  return {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  };
}

async function getAuthenticatedSupabase() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, authenticated: false };
  }

  return { supabase, authenticated: true };
}

function getSlugErrorState(fields: ArticleFormFields): ArticleFormState {
  return {
    message: "Lütfen formdaki alanları kontrol edin.",
    errors: {
      slug: ["Geçerli bir makale adresi oluşturulamadı."]
    },
    fields
  };
}

function getWriteErrorMessage(code?: string) {
  if (code === "23505") {
    return "Bu adresle kayıtlı bir makale zaten var.";
  }

  if (code === "42501" || code === "PGRST301") {
    return "Bu işlem için gerekli yönetici yetkisi doğrulanamadı. Lütfen oturumunuzu yenileyip tekrar deneyin.";
  }

  return "Makale şu anda kaydedilemiyor. Lütfen daha sonra tekrar deneyin.";
}

function revalidateArticleAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/makaleler");
}

export async function createArticleAction(
  _previousState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const fields = getFields(formData);
  const parsed = articleFormSchema.safeParse(fields);

  if (!parsed.success) {
    return {
      message: "Lütfen formdaki alanları kontrol edin.",
      errors: parsed.error.flatten().fieldErrors,
      fields
    };
  }

  const slug = slugifyTurkish(parsed.data.slug || parsed.data.title);

  if (!slugPattern.test(slug)) {
    return getSlugErrorState(fields);
  }

  const { supabase, authenticated } = await getAuthenticatedSupabase();

  if (!authenticated) {
    return {
      message: "Bu işlem için yönetici oturumu gerekir.",
      fields
    };
  }

  const insertPayload = {
    title: parsed.data.title,
    slug,
    excerpt: parsed.data.excerpt ?? "",
    content: parsed.data.content,
    category: parsed.data.category,
    cover_image_url: getCoverImageUrl(parsed.data.cover_image_url),
    status: parsed.data.status,
    published_at: getPublishedAt(parsed.data.status)
  } satisfies ArticleInsertPayload;

  const { error } = await supabase.from("articles").insert(insertPayload);

  if (error) {
    console.error("[admin.articles.create]", getSupabaseErrorLog(error));

    return {
      message: getWriteErrorMessage(error.code),
      errors:
        error.code === "23505"
          ? {
              slug: ["Farklı bir makale adresi yazın."]
            }
          : undefined,
      fields: {
        ...fields,
        slug
      }
    };
  }

  revalidateArticleAdminPaths();
  redirect("/admin/makaleler?created=1");
}

export async function updateArticleAction(
  articleId: string,
  _previousState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const fields = getFields(formData);
  const parsed = articleFormSchema.safeParse(fields);

  if (!parsed.success) {
    return {
      message: "Lütfen formdaki alanları kontrol edin.",
      errors: parsed.error.flatten().fieldErrors,
      fields
    };
  }

  const slug = slugifyTurkish(parsed.data.slug || parsed.data.title);

  if (!slugPattern.test(slug)) {
    return getSlugErrorState(fields);
  }

  const { supabase, authenticated } = await getAuthenticatedSupabase();

  if (!authenticated) {
    return {
      message: "Bu işlem için yönetici oturumu gerekir.",
      fields
    };
  }

  const now = new Date().toISOString();
  const updatePayload = {
    title: parsed.data.title,
    slug,
    excerpt: parsed.data.excerpt ?? "",
    content: parsed.data.content,
    category: parsed.data.category,
    cover_image_url: getCoverImageUrl(parsed.data.cover_image_url),
    status: parsed.data.status,
    published_at: getPublishedAt(parsed.data.status),
    updated_at: now
  } satisfies ArticleUpdatePayload;

  const { error } = await supabase
    .from("articles")
    .update(updatePayload)
    .eq("id", articleId)
    .select("id")
    .single();

  if (error) {
    console.error("[admin.articles.update]", getSupabaseErrorLog(error));

    return {
      message: getWriteErrorMessage(error.code),
      errors:
        error.code === "23505"
          ? {
              slug: ["Farklı bir makale adresi yazın."]
            }
          : undefined,
      fields: {
        ...fields,
        slug
      }
    };
  }

  revalidateArticleAdminPaths();
  redirect("/admin/makaleler?updated=1");
}

export async function deleteArticleAction(articleId: string): Promise<ArticleActionResult> {
  const { supabase, authenticated } = await getAuthenticatedSupabase();

  if (!authenticated) {
    return {
      ok: false,
      message: "Bu işlem için yönetici oturumu gerekir."
    };
  }

  const { error } = await supabase.from("articles").delete().eq("id", articleId);

  if (error) {
    console.error("[admin.articles.delete]", {
      code: error.code,
      message: error.message
    });

    return {
      ok: false,
      message:
        error.code === "42501" || error.code === "PGRST301"
          ? "Bu işlem için gerekli yönetici yetkisi doğrulanamadı. Lütfen oturumunuzu yenileyip tekrar deneyin."
          : "Makale şu anda silinemiyor. Lütfen daha sonra tekrar deneyin."
    };
  }

  revalidateArticleAdminPaths();

  return {
    ok: true,
    message: "Makale silindi."
  };
}
