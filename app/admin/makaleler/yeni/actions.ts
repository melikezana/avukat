"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { slugifyTurkish } from "@/lib/categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ArticleFormFields = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  cover_image_url: string;
};

export type ArticleFormState = {
  message: string;
  errors?: Partial<Record<keyof ArticleFormFields, string[]>>;
  fields?: Partial<ArticleFormFields>;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const coverImagePattern = /^(https?:\/\/.+|\/images\/articles\/[a-z0-9/_-]+\.(svg|jpg|jpeg|png|webp))$/i;

const articleCreateSchema = z.object({
  title: z.string().trim().min(3, "Başlık en az 3 karakter olmalıdır.").max(160, "Başlık çok uzun."),
  slug: z.string().trim().max(140, "Adres çok uzun.").optional(),
  excerpt: z.string().trim().max(420, "Özet çok uzun.").optional(),
  content: z.string().trim().min(30, "İçerik en az 30 karakter olmalıdır."),
  category: z.string().trim().min(2, "Kategori zorunludur.").max(80, "Kategori çok uzun."),
  status: z.string().refine((value) => value === "draft" || value === "published", "Durum seçilmelidir."),
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
  return {
    title: getStringField(formData, "title"),
    slug: getStringField(formData, "slug"),
    excerpt: getStringField(formData, "excerpt"),
    content: getStringField(formData, "content"),
    category: getStringField(formData, "category"),
    status: getStringField(formData, "status") || "draft",
    cover_image_url: getStringField(formData, "cover_image_url")
  };
}

export async function createArticleAction(_previousState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const fields = getFields(formData);
  const parsed = articleCreateSchema.safeParse(fields);

  if (!parsed.success) {
    return {
      message: "Lütfen formdaki alanları kontrol edin.",
      errors: parsed.error.flatten().fieldErrors,
      fields
    };
  }

  const slug = slugifyTurkish(parsed.data.slug || parsed.data.title);

  if (!slugPattern.test(slug)) {
    return {
      message: "Lütfen formdaki alanları kontrol edin.",
      errors: {
        slug: ["Geçerli bir makale adresi oluşturulamadı."]
      },
      fields
    };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      message: "Bu işlem için yönetici oturumu gerekir.",
      fields
    };
  }

  const { error } = await supabase.from("articles").insert({
    title: parsed.data.title,
    slug,
    excerpt: parsed.data.excerpt || null,
    content: parsed.data.content,
    category: parsed.data.category,
    status: parsed.data.status,
    cover_image_url: parsed.data.cover_image_url || null
  });

  if (error) {
    console.error("[admin.articles.create]", {
      code: error.code,
      message: error.message
    });

    if (error.code === "23505") {
      return {
        message: "Bu adresle kayıtlı bir makale zaten var.",
        errors: {
          slug: ["Farklı bir makale adresi yazın."]
        },
        fields
      };
    }

    return {
      message: "Makale şu anda kaydedilemiyor. Lütfen daha sonra tekrar deneyin.",
      fields
    };
  }

  revalidatePath("/admin/makaleler");
  redirect("/admin/makaleler?created=1");
}
