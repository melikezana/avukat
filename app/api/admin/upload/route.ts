import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { routeErrorResponse, validationErrorResponse } from "@/lib/api/responses";
import { adminUnauthorizedResponse } from "@/lib/admin/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const articleImageBucket = "article-images";
const articleCoverFolder = "article-covers";
const maxUploadSizeBytes = 5 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

const uploadSchema = z.object({
  file: z
    .custom<File>((value) => value instanceof File, "Görsel dosyası zorunludur.")
    .refine((file) => file.size > 0, "Boş dosya yüklenemez.")
    .refine((file) => file.size <= maxUploadSizeBytes, "Görsel en fazla 5 MB olabilir.")
    .refine(
      (file) => Object.prototype.hasOwnProperty.call(allowedTypes, file.type),
      "Sadece jpg, png veya webp yüklenebilir."
    ),
  title: z.string().trim().max(120).optional()
});

type StorageUploadError = {
  message?: string;
  status?: number;
  statusCode?: string;
};

function createStoragePath(fileType: string) {
  const extension = allowedTypes[fileType];
  return `${articleCoverFolder}/${Date.now()}-${randomUUID()}.${extension}`;
}

function getStorageErrorStatus(error: StorageUploadError) {
  const parsedStatus = Number(error.statusCode ?? error.status);
  return Number.isInteger(parsedStatus) && parsedStatus >= 400 && parsedStatus < 500 ? parsedStatus : 500;
}

function getStorageErrorMessage(error: StorageUploadError) {
  const status = getStorageErrorStatus(error);
  const message = error.message?.toLocaleLowerCase("tr-TR") ?? "";

  if (status === 401 || status === 403 || message.includes("policy") || message.includes("unauthorized")) {
    return "Görsel yükleme yetkisi doğrulanamadı. Lütfen oturumunuzu yenileyip tekrar deneyin.";
  }

  if (status === 404) {
    return "article-images depolama alanı bulunamadı. Lütfen Supabase Storage ayarlarını kontrol edin.";
  }

  if (status === 409) {
    return "Bu görsel adı zaten kullanılıyor. Lütfen tekrar deneyin.";
  }

  return "Görsel şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.";
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return adminUnauthorizedResponse();
    }

    const formData = await request.formData();
    const parsed = uploadSchema.safeParse({
      file: formData.get("file"),
      title: formData.get("title") || undefined
    });

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const storageSupabase = createSupabaseAdminClient();
    const storagePath = createStoragePath(parsed.data.file.type);
    const storageFileName = storagePath.split("/").pop() ?? storagePath;
    const fileBuffer = Buffer.from(await parsed.data.file.arrayBuffer());
    const { error: uploadError } = await storageSupabase.storage.from(articleImageBucket).upload(storagePath, fileBuffer, {
      cacheControl: "31536000",
      contentType: parsed.data.file.type,
      upsert: false
    });

    if (uploadError) {
      console.error("[admin.upload.storage]", {
        status: uploadError.status,
        statusCode: uploadError.statusCode,
        message: uploadError.message
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
    return routeErrorResponse(error, "admin.upload");
  }
}
