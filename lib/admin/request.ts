import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdminRequest() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return Boolean(user);
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

export function adminWriteDisabledResponse() {
  return NextResponse.json(
    {
      ok: false,
      message: "Makale yazma işlemleri geçici olarak devre dışı."
    },
    { status: 501 }
  );
}
