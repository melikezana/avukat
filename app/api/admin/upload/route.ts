import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { validationErrorResponse } from "@/lib/api/responses";
import { adminUnauthorizedResponse } from "@/lib/admin/request";
import { consumeRateLimit, isSameOriginRequest } from "@/lib/admin/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const articleImageBucket = "article-images";
const articleCoverFolder = "article-covers";
const articleContentFolder = "article-content";
const maxUploadSizeBytes = 5 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};
const contentImageScopeIdSchema = z
  .string()
  .trim()
  .min(1, "İçerik görseli kapsamı zorunludur.")
  .max(120, "İçerik görseli kapsamı çok uzun.")
  .regex(/^[a-zA-Z0-9_-]+$/, "İçerik görseli kapsamı geçersiz.");

const uploadSchema = z.object({
  file: z
    .custom<File>((value) => value instanceof File, "Görsel dosyası zorunludur.")
    .refine((file) => file.size > 0, "Boş dosya yüklenemez.")
    .refine((file) => file.size <= maxUploadSizeBytes, "Görsel en fazla 5 MB olabilir.")
    .refine(
      (file) => Object.prototype.hasOwnProperty.call(allowedTypes, file.type),
      "Sadece jpg, png veya webp yüklenebilir."
    ),
  title: z.string().trim().max(120).optional(),
  folder: z.enum([articleCoverFolder, articleContentFolder]).default(articleCoverFolder),
  alt: z.string().trim().max(160).optional(),
  scopeId: contentImageScopeIdSchema.optional()
}).refine((value) => value.folder !== articleContentFolder || Boolean(value.scopeId), {
  message: "İçerik görseli kapsamı zorunludur.",
  path: ["scopeId"]
});

type StorageUploadError = {
  error?: string;
  message?: string;
  status?: number;
  statusCode?: number | string;
};

function createStoragePath(fileType: string, folder: string, scopeId?: string) {
  const extension = allowedTypes[fileType];

  if (folder === articleContentFolder) {
    return `${folder}/${scopeId}/${Date.now()}-${randomUUID()}.${extension}`;
  }

  return `${folder}/${Date.now()}-${randomUUID()}.${extension}`;
}

function getStorageErrorStatus(error: StorageUploadError) {
  const parsedStatus = Number(error.statusCode ?? error.status);
  return Number.isInteger(parsedStatus) && parsedStatus >= 400 && parsedStatus < 600 ? parsedStatus : 500;
}

function getStorageErrorMessage(error: StorageUploadError, fallbackMessage = "Supabase Storage hatası alındı.") {
  return error.message || error.error || fallbackMessage;
}

function logStorageError(scope: string, error: StorageUploadError, extra?: Record<string, unknown>) {
  console.error(`[admin.upload.storage.${scope}]`, {
    ...extra,
    status: error.status,
    statusCode: error.statusCode,
    error: error.error,
    message: error.message
  });
}

async function ensureArticleImageBucket(storageSupabase: ReturnType<typeof createSupabaseAdminClient>) {
  const { data: bucket, error } = await storageSupabase.storage.getBucket(articleImageBucket);

  if (error) {
    logStorageError("bucket", error, { bucket: articleImageBucket });

    return NextResponse.json(
      {
        ok: false,
        message: getStorageErrorMessage(error, `${articleImageBucket} bucket erişimi doğrulanamadı.`)
      },
      { status: getStorageErrorStatus(error) }
    );
  }

  if (!bucket) {
    const message = `${articleImageBucket} bucket bulunamadı.`;
    console.error("[admin.upload.storage.bucket]", { bucket: articleImageBucket, message });

    return NextResponse.json({ ok: false, message }, { status: 404 });
  }

  if (!bucket.public) {
    const message = `${articleImageBucket} bucket public değil. Public URL kullanımı için bucket public olmalı.`;
    console.error("[admin.upload.storage.bucket]", {
      bucket: articleImageBucket,
      public: bucket.public,
      message
    });

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }

  return null;
}

function getUnexpectedUploadErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Upload sırasında bilinmeyen hata oluştu.";
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request.headers)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Görsel şu anda yüklenemiyor. Lütfen sayfayı yenileyip tekrar deneyin."
        },
        { status: 403 }
      );
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return adminUnauthorizedResponse();
    }

    if (!consumeRateLimit(`article-upload:${user.id}`, { limit: 20, windowMs: 60_000 })) {
      return NextResponse.json(
        {
          ok: false,
          message: "Çok kısa sürede çok fazla görsel yükleme denemesi yapıldı. Lütfen biraz sonra tekrar deneyin."
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const parsed = uploadSchema.safeParse({
      file: formData.get("file"),
      title: formData.get("title") || undefined,
      folder: formData.get("folder") || articleCoverFolder,
      alt: formData.get("alt") || undefined,
      scopeId: formData.get("scopeId") || undefined
    });

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const storageSupabase = createSupabaseAdminClient();
    const bucketErrorResponse = await ensureArticleImageBucket(storageSupabase);

    if (bucketErrorResponse) {
      return bucketErrorResponse;
    }

    const storagePath = createStoragePath(parsed.data.file.type, parsed.data.folder, parsed.data.scopeId);
    const storageFileName = storagePath.split("/").pop() ?? storagePath;
    const fileBuffer = Buffer.from(await parsed.data.file.arrayBuffer());
    const { error: uploadError } = await storageSupabase.storage.from(articleImageBucket).upload(storagePath, fileBuffer, {
      cacheControl: "31536000",
      contentType: parsed.data.file.type,
      upsert: false
    });

    if (uploadError) {
      logStorageError("upload", uploadError, {
        bucket: articleImageBucket,
        path: storagePath,
        contentType: parsed.data.file.type,
        size: parsed.data.file.size
      });

      return NextResponse.json(
        {
          ok: false,
          message: getStorageErrorMessage(uploadError)
        },
        { status: getStorageErrorStatus(uploadError) }
      );
    }

    const {
      data: { publicUrl }
    } = storageSupabase.storage.from(articleImageBucket).getPublicUrl(storagePath);

    return NextResponse.json(
      {
        ok: true,
        file: {
          name: storageFileName,
          path: storagePath,
          href: publicUrl,
          size: parsed.data.file.size,
          type: parsed.data.file.type
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[admin.upload.unexpected]", error);

    return NextResponse.json(
      {
        ok: false,
        message: getUnexpectedUploadErrorMessage(error)
      },
      { status: 500 }
    );
  }
}
