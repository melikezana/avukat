import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminSessionCookieName,
  getConfiguredSessionSecret,
  verifyAdminSessionToken
} from "@/lib/admin/session";

export async function requireAdminRequest() {
  const token = cookies().get(adminSessionCookieName)?.value;
  const session = await verifyAdminSessionToken(token, getConfiguredSessionSecret());

  return Boolean(session);
}

export function adminUnauthorizedResponse() {
  return NextResponse.json(
    {
      ok: false,
      message: "Bu işlem için yönetici oturumu gerekir."
    },
    { status: 401 }
  );
}
