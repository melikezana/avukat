"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isArticleCategorySlug, type ArticleCategorySlug } from "@/lib/article-categories";
import { defaultArticleAuthor } from "@/lib/article-defaults";
import { getPlainTextFromHtml, sanitizeArticleHtml } from "@/lib/article-html";
import { consumeRateLimit, isSameOriginRequest } from "@/lib/admin/security";
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
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  og_image_url: string;
  focus_keyword: string;
  author_name: string;
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
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  focus_keyword: string | null;
  author_name: string;
};

type ArticleUpdatePayload = ArticleInsertPayload & {
  updated_at: string;
};

type ExistingArticleForUpdate = {
  slug: string | null;
  status: string | null;
  published_at: string | null;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const publicImagePathPattern = /^\/images\/articles\/[a-z0-9/_-]+\.(svg|jpg|jpeg|png|webp)$/i;
const articleFormRateLimit = {
  limit: 12,
  windowMs: 60_000
};

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeImageUrl(value?: string) {
  if (!value) {
    return true;
  }

  if (value.includes("..")) {
    return false;
  }

  return isHttpUrl(value) || publicImagePathPattern.test(value);
}

function isOptionalHttpUrl(value?: string) {
  return !value || isHttpUrl(value);
}

const articleFormSchema = z.object({
  title: z.string().trim().min(3, "Başlık en az 3 karakter olmalıdır.").max(160, "Başlık çok uzun."),
  slug: z.string().trim().max(140, "Adres çok uzun.").optional(),
  excerpt: z.string().trim().max(420, "Özet çok uzun.").optional(),
  content: z.string().trim().min(1, "İçerik zorunludur."),
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
    .refine(isSafeImageUrl, {
      message: "Kapak görseli geçerli bir URL olmalıdır."
    }),
  seo_title: z.string().trim().max(60, "SEO başlığı en fazla 60 karakter olabilir.").optional(),
  seo_description: z.string().trim().max(160, "Meta açıklaması en fazla 160 karakter olabilir.").optional(),
  canonical_url: z
    .string()
    .trim()
    .max(500, "Canonical URL çok uzun.")
    .optional()
    .refine(isOptionalHttpUrl, "Canonical URL geçerli bir http/https URL olmalıdır."),
  og_image_url: z
    .string()
    .trim()
    .max(500, "Open Graph görsel URL'si çok uzun.")
    .optional()
    .refine(isOptionalHttpUrl, "Open Graph görsel URL'si geçerli bir http/https URL olmalıdır."),
  focus_keyword: z.string().trim().max(100, "Odak anahtar kelime en fazla 100 karakter olabilir.").optional(),
  author_name: z.string().trim().min(1, "Yazar adı zorunludur.").max(120, "Yazar adı çok uzun.")
});

function getStringField(formData: FormData, field: keyof ArticleFormFields) {
  return String(formData.get(field) ?? "");
}

function getIntentStatus(formData: FormData): ArticleStatus {
  const intent = String(formData.get("intent") ?? formData.get("status") ?? "");
  return intent === "published" ? "published" : "draft";
}

function getFields(formData: FormData): ArticleFormFields {
  return {
    title: getStringField(formData, "title"),
    slug: getStringField(formData, "slug"),
    excerpt: getStringField(formData, "excerpt"),
    content: getStringField(formData, "content"),
    category: getStringField(formData, "category"),
    status: getIntentStatus(formData),
    cover_image_url: getStringField(formData, "cover_image_url"),
    seo_title: getStringField(formData, "seo_title"),
    seo_description: getStringField(formData, "seo_description"),
    canonical_url: getStringField(formData, "canonical_url"),
    og_image_url: getStringField(formData, "og_image_url"),
    focus_keyword: getStringField(formData, "focus_keyword"),
    author_name: getStringField(formData, "author_name") || defaultArticleAuthor
  };
}

function getNullableString(value?: string) {
  const trimmed = value?.trim();
  return trimmed || null;
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
    return { supabase, authenticated: false as const, user: null };
  }

  return { supabase, authenticated: true as const, user };
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

function getContentErrorState(fields: ArticleFormFields): ArticleFormState {
  return {
    message: "Lütfen formdaki alanları kontrol edin.",
    errors: {
      content: ["Makale içeriği en az 30 karakter olmalıdır."]
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

function revalidateArticlePaths(slug?: string | null, previousSlug?: string | null) {
  revalidatePath("/admin");
  revalidatePath("/admin/makaleler");
  revalidatePath("/makaleler");

  if (slug) {
    revalidatePath(`/makaleler/${slug}`);
  }

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/makaleler/${previousSlug}`);
  }
}

async function ensureUniqueSlug(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  slug: string,
  currentArticleId?: string
) {
  let query = supabase.from("articles").select("id").eq("slug", slug).limit(1);

  if (currentArticleId) {
    query = query.neq("id", currentArticleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[admin.articles.slugCheck]", getSupabaseErrorLog(error));
    return {
      ok: false,
      conflict: false
    };
  }

  return {
    ok: true,
    conflict: Boolean(data?.length)
  };
}

function getPublishedAt(status: ArticleStatus, previousPublishedAt?: string | null) {
  if (status === "draft") {
    return null;
  }

  return previousPublishedAt || new Date().toISOString();
}

function buildPayload(
  parsedData: z.infer<typeof articleFormSchema>,
  slug: string,
  content: string,
  previousPublishedAt?: string | null
): ArticleInsertPayload {
  return {
    title: parsedData.title,
    slug,
    excerpt: parsedData.excerpt ?? "",
    content,
    category: parsedData.category,
    cover_image_url: getNullableString(parsedData.cover_image_url),
    status: parsedData.status,
    published_at: getPublishedAt(parsedData.status, previousPublishedAt),
    seo_title: getNullableString(parsedData.seo_title),
    seo_description: getNullableString(parsedData.seo_description),
    canonical_url: getNullableString(parsedData.canonical_url),
    og_image_url: getNullableString(parsedData.og_image_url),
    focus_keyword: getNullableString(parsedData.focus_keyword),
    author_name: parsedData.author_name || defaultArticleAuthor
  };
}

function getStatusRedirectParam(status: ArticleStatus) {
  return status === "published" ? "published=1" : "draft=1";
}

function getSameOriginErrorState(fields: ArticleFormFields): ArticleFormState {
  return {
    message: "Makale şu anda kaydedilemiyor. Lütfen sayfayı yenileyip tekrar deneyin.",
    fields
  };
}

function getRateLimitErrorState(fields: ArticleFormFields): ArticleFormState {
  return {
    message: "Çok kısa sürede çok fazla kayıt denemesi yapıldı. Lütfen biraz sonra tekrar deneyin.",
    fields
  };
}

export async function createArticleAction(
  _previousState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const fields = getFields(formData);

  if (!isSameOriginRequest()) {
    return getSameOriginErrorState(fields);
  }

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

  const content = sanitizeArticleHtml(parsed.data.content);

  if (getPlainTextFromHtml(content).length < 30) {
    return getContentErrorState({
      ...fields,
      content
    });
  }

  const { supabase, authenticated, user } = await getAuthenticatedSupabase();

  if (!authenticated) {
    return {
      message: "Bu işlem için yönetici oturumu gerekir.",
      fields
    };
  }

  if (!consumeRateLimit(`article-create:${user.id}`, articleFormRateLimit)) {
    return getRateLimitErrorState(fields);
  }

  const slugCheck = await ensureUniqueSlug(supabase, slug);

  if (!slugCheck.ok) {
    return {
      message: "Slug benzersizliği şu anda kontrol edilemiyor. Lütfen tekrar deneyin.",
      fields
    };
  }

  if (slugCheck.conflict) {
    return {
      message: "Bu adresle kayıtlı bir makale zaten var.",
      errors: {
        slug: ["Farklı bir makale adresi yazın."]
      },
      fields: {
        ...fields,
        slug
      }
    };
  }

  const insertPayload = buildPayload(parsed.data, slug, content);
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

  revalidateArticlePaths(slug);
  redirect(`/admin/makaleler?created=1&${getStatusRedirectParam(parsed.data.status)}`);
}

export async function updateArticleAction(
  articleId: string,
  _previousState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const fields = getFields(formData);

  if (!isSameOriginRequest()) {
    return getSameOriginErrorState(fields);
  }

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

  const content = sanitizeArticleHtml(parsed.data.content);

  if (getPlainTextFromHtml(content).length < 30) {
    return getContentErrorState({
      ...fields,
      content
    });
  }

  const { supabase, authenticated, user } = await getAuthenticatedSupabase();

  if (!authenticated) {
    return {
      message: "Bu işlem için yönetici oturumu gerekir.",
      fields
    };
  }

  if (!consumeRateLimit(`article-update:${user.id}:${articleId}`, articleFormRateLimit)) {
    return getRateLimitErrorState(fields);
  }

  const { data: existingArticle, error: existingError } = await supabase
    .from("articles")
    .select("slug,status,published_at")
    .eq("id", articleId)
    .maybeSingle();

  if (existingError) {
    console.error("[admin.articles.update.load]", getSupabaseErrorLog(existingError));

    return {
      message: getWriteErrorMessage(existingError.code),
      fields
    };
  }

  if (!existingArticle) {
    return {
      message: "Makale bulunamadı.",
      fields
    };
  }

  const typedExistingArticle = existingArticle as ExistingArticleForUpdate;
  const slugCheck = await ensureUniqueSlug(supabase, slug, articleId);

  if (!slugCheck.ok) {
    return {
      message: "Slug benzersizliği şu anda kontrol edilemiyor. Lütfen tekrar deneyin.",
      fields
    };
  }

  if (slugCheck.conflict) {
    return {
      message: "Bu adresle kayıtlı bir makale zaten var.",
      errors: {
        slug: ["Farklı bir makale adresi yazın."]
      },
      fields: {
        ...fields,
        slug
      }
    };
  }

  const now = new Date().toISOString();
  const updatePayload = {
    ...buildPayload(parsed.data, slug, content, typedExistingArticle.published_at),
    updated_at: now
  } satisfies ArticleUpdatePayload;

  const { error } = await supabase.from("articles").update(updatePayload).eq("id", articleId).select("id").single();

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

  revalidateArticlePaths(slug, typedExistingArticle.slug);
  redirect(`/admin/makaleler?updated=1&${getStatusRedirectParam(parsed.data.status)}`);
}

export async function deleteArticleAction(articleId: string): Promise<ArticleActionResult> {
  if (!isSameOriginRequest()) {
    return {
      ok: false,
      message: "Makale şu anda silinemiyor. Lütfen sayfayı yenileyip tekrar deneyin."
    };
  }

  const { supabase, authenticated, user } = await getAuthenticatedSupabase();

  if (!authenticated) {
    return {
      ok: false,
      message: "Bu işlem için yönetici oturumu gerekir."
    };
  }

  if (!consumeRateLimit(`article-delete:${user.id}:${articleId}`, { limit: 8, windowMs: 60_000 })) {
    return {
      ok: false,
      message: "Çok kısa sürede çok fazla silme denemesi yapıldı. Lütfen biraz sonra tekrar deneyin."
    };
  }

  const { data: existingArticle, error: loadError } = await supabase
    .from("articles")
    .select("slug")
    .eq("id", articleId)
    .maybeSingle();

  if (loadError) {
    console.error("[admin.articles.delete.load]", getSupabaseErrorLog(loadError));
  }

  const { error } = await supabase.from("articles").delete().eq("id", articleId);

  if (error) {
    console.error("[admin.articles.delete]", getSupabaseErrorLog(error));

    return {
      ok: false,
      message:
        error.code === "42501" || error.code === "PGRST301"
          ? "Bu işlem için gerekli yönetici yetkisi doğrulanamadı. Lütfen oturumunuzu yenileyip tekrar deneyin."
          : "Makale şu anda silinemiyor. Lütfen daha sonra tekrar deneyin."
    };
  }

  revalidateArticlePaths(null, (existingArticle as { slug?: string | null } | null)?.slug);

  return {
    ok: true,
    message: "Makale silindi."
  };
}

export async function setArticleStatusAction(articleId: string, status: ArticleStatus): Promise<ArticleActionResult> {
  if (!isSameOriginRequest()) {
    return {
      ok: false,
      message: "Makale durumu şu anda değiştirilemiyor. Lütfen sayfayı yenileyip tekrar deneyin."
    };
  }

  if (status !== "draft" && status !== "published") {
    return {
      ok: false,
      message: "Geçersiz makale durumu."
    };
  }

  const { supabase, authenticated, user } = await getAuthenticatedSupabase();

  if (!authenticated) {
    return {
      ok: false,
      message: "Bu işlem için yönetici oturumu gerekir."
    };
  }

  if (!consumeRateLimit(`article-status:${user.id}:${articleId}`, { limit: 12, windowMs: 60_000 })) {
    return {
      ok: false,
      message: "Çok kısa sürede çok fazla işlem yapıldı. Lütfen biraz sonra tekrar deneyin."
    };
  }

  const { data: existingArticle, error: loadError } = await supabase
    .from("articles")
    .select("slug,published_at")
    .eq("id", articleId)
    .maybeSingle();

  if (loadError) {
    console.error("[admin.articles.status.load]", getSupabaseErrorLog(loadError));

    return {
      ok: false,
      message: "Makale durumu şu anda değiştirilemiyor."
    };
  }

  if (!existingArticle) {
    return {
      ok: false,
      message: "Makale bulunamadı."
    };
  }

  const typedExistingArticle = existingArticle as ExistingArticleForUpdate;
  const { error } = await supabase
    .from("articles")
    .update({
      status,
      published_at: getPublishedAt(status, typedExistingArticle.published_at),
      updated_at: new Date().toISOString()
    })
    .eq("id", articleId);

  if (error) {
    console.error("[admin.articles.status]", getSupabaseErrorLog(error));

    return {
      ok: false,
      message: "Makale durumu şu anda değiştirilemiyor."
    };
  }

  revalidateArticlePaths(typedExistingArticle.slug);

  return {
    ok: true,
    message: status === "published" ? "Makale yayımlandı." : "Makale taslağa alındı."
  };
}
