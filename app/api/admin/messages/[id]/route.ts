import { NextResponse } from "next/server";
import { z } from "zod";
import { routeErrorResponse } from "@/lib/api/responses";
import { consumeRateLimit, createRateLimitKey } from "@/lib/admin/security";
import { adminUnauthorizedResponse, requireAdminRequest } from "@/lib/admin/request";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type MessageRouteParams = {
  params: {
    id: string;
  };
};

const statusSchema = z.object({
  status: z.enum(["new", "read", "answered", "archived"])
});

function adminMessageErrorResponse(action: "update" | "delete", code?: string) {
  const message =
    code === "42501" || code === "PGRST301"
      ? "Bu işlem için gerekli yönetici yetkisi doğrulanamadı. Lütfen oturumunuzu yenileyip tekrar deneyin."
      : action === "delete"
        ? "Mesaj şu anda silinemiyor. Lütfen daha sonra tekrar deneyin."
        : "Mesaj şu anda güncellenemiyor. Lütfen daha sonra tekrar deneyin.";

  return NextResponse.json({ ok: false, message }, { status: 500 });
}

export async function PATCH(request: Request, { params }: MessageRouteParams) {
  try {
    if (!(await requireAdminRequest(request))) {
      return adminUnauthorizedResponse();
    }

    if (!consumeRateLimit(createRateLimitKey("admin-message-update", request.headers, params.id), { limit: 30, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, message: "Çok kısa sürede çok fazla işlem yapıldı." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Mesaj durumu geçersiz." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .update({ status: parsed.data.status })
      .eq("id", params.id)
      .select("id,status")
      .single();

    if (error) {
      console.error("[admin.contact-messages.update]", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      return adminMessageErrorResponse("update", error.code);
    }

    return NextResponse.json({
      ok: true,
      message: "Mesaj güncellendi.",
      item: data
    });
  } catch (error) {
    return routeErrorResponse(error, "admin.contact-messages.update");
  }
}

export async function DELETE(_request: Request, { params }: MessageRouteParams) {
  try {
    if (!(await requireAdminRequest(_request))) {
      return adminUnauthorizedResponse();
    }

    if (!consumeRateLimit(createRateLimitKey("admin-message-delete", _request.headers, params.id), { limit: 12, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, message: "Çok kısa sürede çok fazla silme denemesi yapıldı." }, { status: 429 });
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", params.id);

    if (error) {
      console.error("[admin.contact-messages.delete]", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      return adminMessageErrorResponse("delete", error.code);
    }

    return NextResponse.json({
      ok: true,
      message: "Mesaj silindi."
    });
  } catch (error) {
    return routeErrorResponse(error, "admin.contact-messages.delete");
  }
}
