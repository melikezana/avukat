import { NextResponse } from "next/server";
import { z } from "zod";
import { routeErrorResponse } from "@/lib/api/responses";
import { adminUnauthorizedResponse, requireAdminRequest } from "@/lib/admin/request";
import { consumeRateLimit, createRateLimitKey } from "@/lib/admin/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const deleteSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !value.includes("..") && /^(article-covers|article-content)\//.test(value), "Geçersiz dosya yolu."),
  force: z.boolean().optional()
});

async function getUsage(path: string, publicUrl: string) {
  const supabase = createSupabaseServerClient();
  const [coverResult, contentPathResult, contentUrlResult] = await Promise.all([
    supabase.from("articles").select("id,title").eq("cover_image_url", publicUrl).limit(5),
    supabase.from("articles").select("id,title").ilike("content", `%${path}%`).limit(5),
    supabase.from("articles").select("id,title").ilike("content", `%${publicUrl}%`).limit(5)
  ]);

  for (const result of [coverResult, contentPathResult, contentUrlResult]) {
    if (result.error) {
      console.error("[admin.media.usage]", {
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint
      });
    }
  }

  const usedRows = [...(coverResult.data ?? []), ...(contentPathResult.data ?? []), ...(contentUrlResult.data ?? [])];
  const uniqueIds = new Set(usedRows.map((row) => String(row.id)));

  return uniqueIds.size;
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdminRequest(request))) {
      return adminUnauthorizedResponse();
    }

    const body = await request.json().catch(() => null);
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Dosya yolu geçersiz." }, { status: 400 });
    }

    if (!consumeRateLimit(createRateLimitKey("admin-media-delete", request.headers, parsed.data.path), { limit: 10, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, message: "Çok kısa sürede çok fazla silme denemesi yapıldı." }, { status: 429 });
    }

    const adminSupabase = createSupabaseAdminClient();
    const {
      data: { publicUrl }
    } = adminSupabase.storage.from("article-images").getPublicUrl(parsed.data.path);
    const usageCount = await getUsage(parsed.data.path, publicUrl);

    if (usageCount > 0 && !parsed.data.force) {
      return NextResponse.json(
        {
          ok: false,
          used: true,
          message: `Bu görsel ${usageCount} makalede kullanılıyor. Varsayılan olarak silinmedi.`
        },
        { status: 409 }
      );
    }

    const { error } = await adminSupabase.storage.from("article-images").remove([parsed.data.path]);

    if (error) {
      console.error("[admin.media.delete]", {
        status: error.status,
        statusCode: error.statusCode,
        message: error.message
      });

      return NextResponse.json({ ok: false, message: "Görsel şu anda silinemiyor." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Görsel silindi." });
  } catch (error) {
    return routeErrorResponse(error, "admin.media.delete");
  }
}
