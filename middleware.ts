import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  adminSessionCookieName,
  getConfiguredSessionSecret,
  verifyAdminSessionToken
} from "@/lib/admin/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(adminSessionCookieName)?.value;
  const session = await verifyAdminSessionToken(token, getConfiguredSessionSecret());

  if (!session) {
    const loginUrl = new URL("/yonetim-giris", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
