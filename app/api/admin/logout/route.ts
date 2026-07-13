import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api/responses";
import { adminSessionCookieName } from "@/lib/admin/session";

export async function POST() {
  try {
    const response = NextResponse.json({ ok: true, message: "Oturum kapatıldı." });
    response.cookies.set(adminSessionCookieName, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return response;
  } catch (error) {
    return routeErrorResponse(error, "admin.logout");
  }
}
