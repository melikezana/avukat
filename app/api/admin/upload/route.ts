import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { adminUnauthorizedResponse } from "@/lib/admin/request";
import { consumeRateLimit, isSameOriginRequest } from "@/lib/admin/security";
import {
  articleContentFolder,
  articleCoverFolder,
  articleImageBucket,
  getUploadReceivedFields,
  getUploadTextField,
  uploadFieldsSchema,
  validateArticleImageFile,
  type ArticleImageFileValidationResult
} from "@/lib/admin/upload-validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type StorageUploadError = {
  error?: string;
  message?: string;
  status?: number;
  statusCode?: number | string;
};

function createStoragePath(extension: string, folder: string, scopeId?: string) {
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

function logUploadValidationError(scope: string, details: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[admin.upload.validation.${scope}]`, details);
  }
}

function validationIssues(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
}

function uploadValidationErrorResponse(validationError: ZodError, formData: FormData) {
  const details = validationError.flatten?.() ?? String(validationError);
  const receivedFields = getUploadReceivedFields(formData);

  logUploadValidationError("fields", {
    receivedFields,
    details
  });

  return NextResponse.json(
    {
      ok: false,
      error: "Geçersiz yükleme isteği",
      message: "Geçersiz yükleme isteği",
      details,
      issues: validationIssues(validationError)
    },
    { status: 400 }
  );
}

function missingFileResponse(formData: FormData) {
  const details = {
    receivedFields: getUploadReceivedFields(formData)
  };

  logUploadValidationError("file.missing", details);

  return NextResponse.json(
    {
      ok: false,
      error: "Dosya alanı bulunamadı.",
      message: "Dosya alanı bulunamadı.",
      details
    },
    { status: 400 }
  );
}

function fileValidationErrorResponse(result: Extract<ArticleImageFileValidationResult, { ok: false }>, formData: FormData) {
  const details = {
    fieldErrors: result.fieldErrors,
    formErrors: [],
    receivedFields: getUploadReceivedFields(formData),
    file: result.file
  };

  logUploadValidationError("file", details);

  return NextResponse.json(
    {
      ok: false,
      error: "Geçersiz yükleme isteği",
      message: "Geçersiz yükleme isteği",
      details,
      issues: [
        {
          path: "file",
          message: result.message
        }
      ]
    },
    { status: 400 }
  );
}

async function ensureArticleImageBucket(storageSupabase: ReturnType<typeof createSupabaseAdminClient>) {
  const { data: bucket, error } = await storageSupabase.storage.getBucket(articleImageBucket);

  if (error) {
    logStorageError("bucket", error, { bucket: articleImageBucket });
    const message = getStorageErrorMessage(error, `${articleImageBucket} bucket erişimi doğrulanamadı.`);

    return NextResponse.json(
      {
        ok: false,
        error: message,
        message
      },
      { status: getStorageErrorStatus(error) }
    );
  }

  if (!bucket) {
    const message = `${articleImageBucket} bucket bulunamadı.`;
    console.error("[admin.upload.storage.bucket]", { bucket: articleImageBucket, message });

    return NextResponse.json({ ok: false, error: message, message }, { status: 404 });
  }

  if (!bucket.public) {
    const message = `${articleImageBucket} bucket public değil. Public URL kullanımı için bucket public olmalı.`;
    console.error("[admin.upload.storage.bucket]", {
      bucket: articleImageBucket,
      public: bucket.public,
      message
    });

    return NextResponse.json({ ok: false, error: message, message }, { status: 500 });
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
      const message = "Görsel şu anda yüklenemiyor. Lütfen sayfayı yenileyip tekrar deneyin.";

      return NextResponse.json(
        {
          ok: false,
          error: message,
          message
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
      const message = "Çok kısa sürede çok fazla görsel yükleme denemesi yapıldı. Lütfen biraz sonra tekrar deneyin.";

      return NextResponse.json(
        {
          ok: false,
          error: message,
          message
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return missingFileResponse(formData);
    }

    const parsed = uploadFieldsSchema.safeParse({
      title: getUploadTextField(formData, "title"),
      folder: getUploadTextField(formData, "folder") ?? articleCoverFolder,
      alt: getUploadTextField(formData, "alt"),
      scopeId: getUploadTextField(formData, "scopeId")
    });

    if (!parsed.success) {
      return uploadValidationErrorResponse(parsed.error, formData);
    }

    const fileMetadataValidation = validateArticleImageFile(file);

    if (!fileMetadataValidation.ok) {
      return fileValidationErrorResponse(fileMetadataValidation, formData);
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileContentValidation = validateArticleImageFile(file, fileBuffer);

    if (!fileContentValidation.ok) {
      return fileValidationErrorResponse(fileContentValidation, formData);
    }

    const storageSupabase = createSupabaseAdminClient();
    const bucketErrorResponse = await ensureArticleImageBucket(storageSupabase);

    if (bucketErrorResponse) {
      return bucketErrorResponse;
    }

    const storagePath = createStoragePath(fileContentValidation.extension, parsed.data.folder, parsed.data.scopeId);
    const storageFileName = storagePath.split("/").pop() ?? storagePath;
    const { error: uploadError } = await storageSupabase.storage.from(articleImageBucket).upload(storagePath, fileBuffer, {
      cacheControl: "31536000",
      contentType: fileContentValidation.mimeType,
      upsert: false
    });

    if (uploadError) {
      logStorageError("upload", uploadError, {
        bucket: articleImageBucket,
        path: storagePath,
        contentType: fileContentValidation.mimeType,
        size: file.size
      });

      const message = getStorageErrorMessage(uploadError);

      return NextResponse.json(
        {
          ok: false,
          error: message,
          message
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
          size: file.size,
          type: fileContentValidation.mimeType
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[admin.upload.unexpected]", error);
    const message = getUnexpectedUploadErrorMessage(error);

    return NextResponse.json(
      {
        ok: false,
        error: message,
        message
      },
      { status: 500 }
    );
  }
}
