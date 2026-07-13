import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      ok: false,
      message: "Gönderilen bilgiler geçersiz.",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    },
    { status: 400 }
  );
}

export function routeErrorResponse(error: unknown, context: string) {
  console.error(`[${context}]`, error);

  return NextResponse.json(
    {
      ok: false,
      message: "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin."
    },
    { status: 500 }
  );
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}
