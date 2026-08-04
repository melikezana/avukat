import { z } from "zod";

export const articleImageBucket = "article-images";
export const articleCoverFolder = "article-covers";
export const articleContentFolder = "article-content";
export const maxArticleImageUploadSizeBytes = 5 * 1024 * 1024;

export const articleImageAllowedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export type ArticleImageMimeType = (typeof articleImageAllowedMimeTypes)[number];

const mimeTypeToExtension: Record<ArticleImageMimeType, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

const extensionToMimeType: Record<string, ArticleImageMimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp"
};

export const contentImageScopeIdSchema = z
  .string()
  .trim()
  .min(1, "İçerik görseli kapsamı zorunludur.")
  .max(120, "İçerik görseli kapsamı çok uzun.")
  .regex(/^[a-zA-Z0-9_-]+$/, "İçerik görseli kapsamı geçersiz.");

export const uploadFieldsSchema = z
  .object({
    title: z.string().trim().max(120, "Başlık en fazla 120 karakter olabilir.").optional(),
    folder: z.enum([articleCoverFolder, articleContentFolder]).default(articleCoverFolder),
    alt: z.string().trim().max(160, "Alt metin en fazla 160 karakter olabilir.").optional(),
    scopeId: contentImageScopeIdSchema.optional()
  })
  .refine((value) => value.folder !== articleContentFolder || Boolean(value.scopeId), {
    message: "İçerik görseli kapsamı zorunludur.",
    path: ["scopeId"]
  });

export type UploadFields = z.infer<typeof uploadFieldsSchema>;

export type ArticleImageFileValidationResult =
  | {
      ok: true;
      mimeType: ArticleImageMimeType;
      extension: "jpg" | "png" | "webp";
    }
  | {
      ok: false;
      message: string;
      fieldErrors: {
        file: string[];
      };
      file: {
        name: string;
        size: number;
        type: string;
        extension: string | null;
      };
    };

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createFileValidationError(file: File, message: string): ArticleImageFileValidationResult {
  return {
    ok: false,
    message,
    fieldErrors: {
      file: [message]
    },
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: getFileExtension(file.name)
    }
  };
}

function isAllowedMimeType(value: string): value is ArticleImageMimeType {
  return articleImageAllowedMimeTypes.includes(value as ArticleImageMimeType);
}

function getFileExtension(fileName: string) {
  const extension = fileName.trim().toLocaleLowerCase("tr-TR").match(/\.([a-z0-9]+)$/)?.[1];
  return extension ?? null;
}

function getAllowedMimeTypeFromExtension(fileName: string) {
  const extension = getFileExtension(fileName);
  return extension ? extensionToMimeType[extension] ?? null : null;
}

function getNormalizedMimeType(file: File) {
  return file.type.trim().toLocaleLowerCase("tr-TR");
}

function isUnknownMimeType(mimeType: string) {
  return mimeType === "" || mimeType === "application/octet-stream";
}

export function getUploadTextField(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue || undefined;
}

export function getUploadReceivedFields(formData: FormData) {
  return Array.from(new Set(Array.from(formData.keys())));
}

export function detectArticleImageMimeType(bytes: Uint8Array): ArticleImageMimeType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export function validateArticleImageFile(file: File, bytes?: Uint8Array): ArticleImageFileValidationResult {
  if (file.size === 0) {
    return createFileValidationError(file, "Boş dosya yüklenemez.");
  }

  if (file.size > maxArticleImageUploadSizeBytes) {
    return createFileValidationError(
      file,
      `Görsel en fazla ${formatBytes(maxArticleImageUploadSizeBytes)} olabilir. Gönderilen dosya: ${formatBytes(file.size)} (${file.size} byte).`
    );
  }

  const suppliedMimeType = getNormalizedMimeType(file);
  const extensionMimeType = getAllowedMimeTypeFromExtension(file.name);
  const extension = getFileExtension(file.name);

  if (suppliedMimeType && !isUnknownMimeType(suppliedMimeType) && !isAllowedMimeType(suppliedMimeType)) {
    return createFileValidationError(
      file,
      `Sadece JPG, PNG veya WebP yüklenebilir. Gönderilen MIME type: ${suppliedMimeType || "boş"}.`
    );
  }

  if (extension && !extensionMimeType) {
    return createFileValidationError(file, `Sadece .jpg, .jpeg, .png veya .webp uzantılı görseller yüklenebilir. Gönderilen uzantı: .${extension}.`);
  }

  if (bytes) {
    const detectedMimeType = detectArticleImageMimeType(bytes);

    if (!detectedMimeType) {
      return createFileValidationError(file, "Dosya içeriği JPG, PNG veya WebP olarak doğrulanamadı.");
    }

    if (!isUnknownMimeType(suppliedMimeType) && suppliedMimeType !== detectedMimeType) {
      return createFileValidationError(
        file,
        `Dosyanın MIME type değeri (${suppliedMimeType}) dosya içeriğiyle (${detectedMimeType}) eşleşmiyor.`
      );
    }

    if (extensionMimeType && extensionMimeType !== detectedMimeType) {
      return createFileValidationError(
        file,
        `Dosya uzantısı (.${extension}) dosya içeriğiyle (${detectedMimeType}) eşleşmiyor.`
      );
    }

    return {
      ok: true,
      mimeType: detectedMimeType,
      extension: mimeTypeToExtension[detectedMimeType]
    };
  }

  const resolvedMimeType = isAllowedMimeType(suppliedMimeType) ? suppliedMimeType : extensionMimeType;

  if (!resolvedMimeType) {
    return createFileValidationError(file, "Sadece JPG, PNG veya WebP yüklenebilir.");
  }

  if (extensionMimeType && isAllowedMimeType(suppliedMimeType) && extensionMimeType !== suppliedMimeType) {
    return createFileValidationError(
      file,
      `Dosya uzantısı (.${extension}) MIME type değeriyle (${suppliedMimeType}) eşleşmiyor.`
    );
  }

  return {
    ok: true,
    mimeType: resolvedMimeType,
    extension: mimeTypeToExtension[resolvedMimeType]
  };
}
