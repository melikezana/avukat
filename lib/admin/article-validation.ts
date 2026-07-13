import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const articlePayloadSchema = z.object({
  title: z.string().trim().min(3, "Başlık en az 3 karakter olmalıdır.").max(160),
  slug: z.string().trim().regex(slugPattern, "Adres yalnızca küçük harf, rakam ve tire içerebilir.").optional(),
  date: z.string().trim().regex(datePattern, "Tarih YYYY-AA-GG biçiminde olmalıdır."),
  summary: z.string().trim().min(20, "Özet en az 20 karakter olmalıdır.").max(360),
  excerpt: z.string().trim().max(420).optional(),
  category: z.string().trim().min(3, "Kategori zorunludur.").max(80),
  coverImage: z
    .string()
    .trim()
    .refine(
      (value) =>
        !value ||
        /^https?:\/\//.test(value) ||
        (/^\/images\/articles\/[a-z0-9/_-]+\.(svg|jpg|jpeg|png|webp)$/i.test(value) && !value.includes("..")),
      "Kapak görseli geçerli bir URL veya public makale görsel yolu olmalıdır."
    )
    .optional(),
  content: z.string().trim().min(30, "Makale içeriği en az 30 karakter olmalıdır."),
  metaTitle: z.string().trim().max(160).optional(),
  metaDescription: z.string().trim().max(180).optional()
});

export const articlePatchSchema = articlePayloadSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "Güncellenecek en az bir alan gönderilmelidir."
});
