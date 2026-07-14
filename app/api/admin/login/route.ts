import { NextResponse } from "next/server";
import { z } from "zod";
import { routeErrorResponse } from "@/lib/api/responses";
import { consumeRateLimit, createRateLimitKey, isSameOriginRequest } from "@/lib/admin/security";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request.headers)) {
      return NextResponse.json({ ok: false, message: "Giriş şu anda doğrulanamıyor." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "E-posta veya şifre hatalı." }, { status: 400 });
    }

    if (
      !consumeRateLimit(createRateLimitKey("admin-login", request.headers, parsed.data.email), {
        limit: 8,
        windowMs: 10 * 60_000
      })
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Çok kısa sürede çok fazla giriş denemesi yapıldı. Lütfen biraz sonra tekrar deneyin."
        },
        { status: 429 }
      );
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      console.error("[admin.login]", {
        code: error.code,
        message: error.message
      });

      return NextResponse.json({ ok: false, message: "E-posta veya şifre hatalı." }, { status: 401 });
    }

    return NextResponse.json({ ok: true, message: "Giriş başarılı." });
  } catch (error) {
    return routeErrorResponse(error, "admin.login");
  }
}
