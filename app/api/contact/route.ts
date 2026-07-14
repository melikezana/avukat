import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequestResponse, routeErrorResponse, validationErrorResponse } from "@/lib/api/responses";
import { consumeRateLimit, createRateLimitKey, isSameOriginRequest } from "@/lib/admin/security";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const contactPayloadSchema = z.object({
  name: z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z
      .string()
      .trim()
      .min(1, "Ad soyad zorunludur.")
      .min(2, "Ad soyad en az 2 karakter olmalıdır.")
      .max(120, "Ad soyad en fazla 120 karakter olabilir.")
  ),
  email: z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z
      .string()
      .trim()
      .min(1, "E-posta zorunludur.")
      .email("Geçerli bir e-posta adresi yazın.")
      .max(160, "E-posta en fazla 160 karakter olabilir.")
  ),
  subject: z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z
      .string()
      .trim()
      .min(1, "Konu zorunludur.")
      .min(3, "Konu en az 3 karakter olmalıdır.")
      .max(160, "Konu en fazla 160 karakter olabilir.")
  ),
  message: z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z
      .string()
      .trim()
      .min(1, "Mesaj zorunludur.")
      .min(10, "Mesaj en az 10 karakter olmalıdır.")
      .max(4000, "Mesaj en fazla 4000 karakter olabilir.")
  ),
  company: z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().trim().max(0, "Form gönderimi doğrulanamadı. Lütfen tekrar deneyin.")
  )
});

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request.headers)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Mesaj şu anda gönderilemiyor. Lütfen sayfayı yenileyip tekrar deneyin."
        },
        { status: 403 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return badRequestResponse("Geçerli bir JSON gövdesi gönderilmelidir.");
    }

    const parsed = contactPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const { name, email, subject, message } = parsed.data;

    if (!consumeRateLimit(createRateLimitKey("contact", request.headers, email), { limit: 5, windowMs: 10 * 60_000 })) {
      return NextResponse.json(
        {
          ok: false,
          message: "Çok kısa sürede çok fazla mesaj gönderildi. Lütfen biraz sonra tekrar deneyin."
        },
        { status: 429 }
      );
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject,
      message
    });

    if (error) {
      console.error("[contact.supabase.insert]", {
        code: error.code,
        message: error.message
      });

      return NextResponse.json(
        {
          ok: false,
          message: "Mesajınız şu anda alınamıyor. Lütfen daha sonra tekrar deneyin."
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Mesajınız alındı. En kısa sürede dönüş yapılacaktır."
    });
  } catch (error) {
    return routeErrorResponse(error, "contact.submit");
  }
}
