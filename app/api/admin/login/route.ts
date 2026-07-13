import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validationErrorResponse, routeErrorResponse } from "@/lib/api/responses";
import { verifyAdminPassword } from "@/lib/admin/password";
import {
  adminSessionCookieName,
  adminSessionMaxAgeSeconds,
  createAdminSessionToken,
  getConfiguredSessionSecret
} from "@/lib/admin/session";

export const runtime = "nodejs";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Kullanıcı adı zorunludur.").max(80),
  password: z.string().min(1, "Şifre zorunludur.").max(200)
});

const failedAttempts = new Map<string, { count: number; lockedUntil: number; firstAttemptAt: number }>();
const maxFailedAttempts = 5;
const attemptWindowMs = 10 * 60 * 1000;
const lockMs = 5 * 60 * 1000;
const genericLoginError = "Kullanıcı adı veya şifre hatalı.";

function getClientKey(request: NextRequest, username: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown";

  return `${ip}:${username.toLocaleLowerCase("tr-TR")}`;
}

function getAttemptRecord(key: string) {
  const now = Date.now();
  const current = failedAttempts.get(key);

  if (!current || now - current.firstAttemptAt > attemptWindowMs) {
    return { count: 0, lockedUntil: 0, firstAttemptAt: now };
  }

  return current;
}

function registerFailedAttempt(key: string) {
  const record = getAttemptRecord(key);
  const nextCount = record.count + 1;

  failedAttempts.set(key, {
    count: nextCount,
    firstAttemptAt: record.firstAttemptAt,
    lockedUntil: nextCount >= maxFailedAttempts ? Date.now() + lockMs : record.lockedUntil
  });
}

export async function POST(request: NextRequest) {
  try {
    const parsed = loginSchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const configuredUsername = process.env.ADMIN_USERNAME?.trim() || "admin";
    const attemptKey = getClientKey(request, parsed.data.username);
    const attemptRecord = getAttemptRecord(attemptKey);

    if (attemptRecord.lockedUntil > Date.now()) {
      return NextResponse.json(
        {
          ok: false,
          message: "Çok fazla başarısız deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin."
        },
        { status: 429 }
      );
    }

    const usernameMatches = parsed.data.username === configuredUsername;
    const passwordMatches = verifyAdminPassword(parsed.data.password, process.env.ADMIN_PASSWORD_HASH);
    const sessionSecret = getConfiguredSessionSecret();

    if (!usernameMatches || !passwordMatches || !sessionSecret) {
      registerFailedAttempt(attemptKey);

      return NextResponse.json({ ok: false, message: genericLoginError }, { status: 401 });
    }

    failedAttempts.delete(attemptKey);

    const token = await createAdminSessionToken(sessionSecret);
    const response = NextResponse.json({ ok: true, message: "Giriş başarılı." });
    response.cookies.set(adminSessionCookieName, token, {
      httpOnly: true,
      maxAge: adminSessionMaxAgeSeconds,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return response;
  } catch (error) {
    return routeErrorResponse(error, "admin.login");
  }
}
