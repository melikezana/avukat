import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequestResponse, routeErrorResponse, validationErrorResponse } from "@/lib/api/responses";
import { adminUnauthorizedResponse, requireAdminRequest } from "@/lib/admin/request";
import { slugifyTurkish } from "@/lib/categories";

export const runtime = "nodejs";

const maxUploadSizeBytes = 5 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

const uploadSchema = z.object({
  file: z
    .custom<File>((value) => value instanceof File, "Görsel dosyası zorunludur.")
    .refine((file) => file.size > 0, "Boş dosya yüklenemez.")
    .refine((file) => file.size <= maxUploadSizeBytes, "Görsel en fazla 5 MB olabilir.")
    .refine((file) => Object.prototype.hasOwnProperty.call(allowedTypes, file.type), "Sadece jpg, png veya webp yüklenebilir."),
  title: z.string().trim().max(120).optional()
});

const uploadDirectory = path.join(process.cwd(), "public", "images", "articles", "uploads");

function sanitizeBaseName(fileName: string, title?: string) {
  const baseName = title || path.parse(fileName).name;
  const slug = slugifyTurkish(baseName).slice(0, 80);

  return slug || "makale-gorseli";
}

function assertInsideUploadDirectory(targetPath: string) {
  const relative = path.relative(uploadDirectory, targetPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Upload path traversal blocked.");
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdminRequest())) {
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

    const extension = allowedTypes[parsed.data.file.type];

    if (!extension) {
      return badRequestResponse("Sadece jpg, png veya webp yüklenebilir.");
    }

    const safeBaseName = sanitizeBaseName(parsed.data.file.name, parsed.data.title);
    const fileName = `${safeBaseName}-${randomUUID().slice(0, 8)}${extension}`;
    const targetPath = path.join(uploadDirectory, fileName);
    assertInsideUploadDirectory(targetPath);

    await fs.mkdir(uploadDirectory, { recursive: true });
    await fs.writeFile(targetPath, Buffer.from(await parsed.data.file.arrayBuffer()));

    return NextResponse.json(
      {
        ok: true,
        file: {
          name: fileName,
          href: `/images/articles/uploads/${fileName}`,
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
