import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { validationErrorResponse } from "@/lib/api/responses";
import { adminUnauthorizedResponse } from "@/lib/admin/request";
import { consumeRateLimit, isSameOriginRequest } from "@/lib/admin/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const legalDocumentsBucket = "legal-documents";
const courtDecisionsFolder = "court-decisions";
const maxPdfUploadSizeBytes = 15 * 1024 * 1024;

type StorageUploadError = {
  error?: string;
  message?: string;
  status?: number;
  statusCode?: number | string;
};

const uploadSchema = z.object({
  file: z
    .custom<File>((value) => value instanceof File, "PDF dosyası zorunludur.")
    .refine((file) => file.size > 0, "Boş dosya yüklenemez.")
    .refine((file) => file.size <= maxPdfUploadSizeBytes, "PDF en fazla 15 MB olabilir.")
    .refine((file) => file.type === "application/pdf", "Sadece application/pdf dosyası yüklenebilir.")
    .refine((file) => file.name.toLocaleLowerCase("tr-TR").endsWith(".pdf"), "Dosya uzantısı .pdf olmalıdır.")
});

function createStoragePath() {
  return `${courtDecisionsFolder}/${Date.now()}-${randomUUID()}.pdf`;
}

function getStorageErrorStatus(error: StorageUploadError) {
  const parsedStatus = Number(error.statusCode ?? error.status);
  return Number.isInteger(parsedStatus) && parsedStatus >= 400 && parsedStatus < 600 ? parsedStatus : 500;
}

function getStorageErrorMessage(error: StorageUploadError, fallbackMessage = "Supabase Storage hatası alındı.") {
  return error.message || error.error || fallbackMessage;
}

function logStorageError(scope: string, error: StorageUploadError, extra?: Record<string, unknown>) {
  console.error(`[admin.decisionPdf.storage.${scope}]`, {
    ...extra,
    status: error.status,
    statusCode: error.statusCode,
    error: error.error,
    message: error.message
  });
}

async function ensureLegalDocumentsBucket(storageSupabase: ReturnType<typeof createSupabaseAdminClient>) {
  const { data: bucket, error } = await storageSupabase.storage.getBucket(legalDocumentsBucket);

  if (error) {
    logStorageError("bucket", error, { bucket: legalDocumentsBucket });

    return NextResponse.json(
      {
        ok: false,
        message: getStorageErrorMessage(error, `${legalDocumentsBucket} bucket erişimi doğrulanamadı.`)
      },
      { status: getStorageErrorStatus(error) }
    );
  }

  if (!bucket) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "legal-documents bucket bulunamadı. Supabase Storage içinde public legal-documents bucket oluşturup tekrar deneyin."
      },
      { status: 404 }
    );
  }

  if (!bucket.public) {
    return NextResponse.json(
      {
        ok: false,
        message: "legal-documents bucket public değil. PDF public URL kullanımı için bucket public olmalıdır."
      },
      { status: 500 }
    );
  }

  return null;
}

function getUnexpectedUploadErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "PDF yükleme sırasında bilinmeyen hata oluştu.";
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request.headers)) {
      return NextResponse.json(
        {
          ok: false,
          message: "PDF şu anda yüklenemiyor. Lütfen sayfayı yenileyip tekrar deneyin."
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

    if (!consumeRateLimit(`decision-pdf-upload:${user.id}`, { limit: 12, windowMs: 60_000 })) {
      return NextResponse.json(
        {
          ok: false,
          message: "Çok kısa sürede çok fazla PDF yükleme denemesi yapıldı. Lütfen biraz sonra tekrar deneyin."
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const parsed = uploadSchema.safeParse({
      file: formData.get("file")
    });

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const storageSupabase = createSupabaseAdminClient();
    const bucketErrorResponse = await ensureLegalDocumentsBucket(storageSupabase);

    if (bucketErrorResponse) {
      return bucketErrorResponse;
    }

    const storagePath = createStoragePath();
    const fileBuffer = Buffer.from(await parsed.data.file.arrayBuffer());
    const { error: uploadError } = await storageSupabase.storage.from(legalDocumentsBucket).upload(storagePath, fileBuffer, {
      cacheControl: "31536000",
      contentType: "application/pdf",
      upsert: false
    });

    if (uploadError) {
      logStorageError("upload", uploadError, {
        bucket: legalDocumentsBucket,
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
    } = storageSupabase.storage.from(legalDocumentsBucket).getPublicUrl(storagePath);

    return NextResponse.json(
      {
        ok: true,
        file: {
          name: storagePath.split("/").pop() ?? "decision.pdf",
          path: storagePath,
          href: publicUrl,
          size: parsed.data.file.size,
          type: "application/pdf"
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[admin.decisionPdf.unexpected]", error);

    return NextResponse.json(
      {
        ok: false,
        message: getUnexpectedUploadErrorMessage(error)
      },
      { status: 500 }
    );
  }
}
