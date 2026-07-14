import { NextResponse } from "next/server";
import { z } from "zod";
import { routeErrorResponse } from "@/lib/api/responses";
import { adminUnauthorizedResponse, requireAdminRequest } from "@/lib/admin/request";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type MessageReplyRouteParams = {
  params: {
    id: string;
  };
};

type ContactMessageRecipient = {
  id: string | number;
  name: string | null;
  email: string | null;
  subject: string | null;
};

const replySchema = z.object({
  subject: z.string().trim().min(3, "Konu zorunludur.").max(180, "Konu çok uzun."),
  body: z.string().trim().min(10, "Yanıt en az 10 karakter olmalıdır.").max(5000, "Yanıt çok uzun.")
});

function jsonError(message: string, status = 500) {
  return NextResponse.json({ ok: false, message }, { status });
}

async function sendResendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL || process.env.CONTACT_EMAIL;

  if (!apiKey || !from) {
    return {
      ok: false,
      message: "E-posta gönderim ayarları eksik. Lütfen Resend ayarlarını kontrol edin."
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text
    })
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");

    console.error("[admin.contact-messages.reply.resend]", {
      status: response.status,
      body: responseText.slice(0, 500)
    });

    return {
      ok: false,
      message: "E-posta şu anda gönderilemiyor. Lütfen daha sonra tekrar deneyin."
    };
  }

  return {
    ok: true,
    message: "Yanıt gönderildi."
  };
}

export async function POST(request: Request, { params }: MessageReplyRouteParams) {
  try {
    if (!(await requireAdminRequest())) {
      return adminUnauthorizedResponse();
    }

    const body = await request.json().catch(() => null);
    const parsed = replySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Yanıt bilgileri geçersiz.", 400);
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id,name,email,subject")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("[admin.contact-messages.reply.load]", {
        code: error.code,
        message: error.message
      });

      return jsonError("Mesaj bilgileri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.");
    }

    const message = data as ContactMessageRecipient;
    const recipient = message.email?.trim();

    if (!recipient) {
      return jsonError("Bu mesaj için geçerli bir alıcı e-postası bulunamadı.", 400);
    }

    const emailResult = await sendResendEmail(recipient, parsed.data.subject, parsed.data.body);

    if (!emailResult.ok) {
      return jsonError(emailResult.message);
    }

    const { error: updateError } = await supabase.from("contact_messages").update({ status: "answered" }).eq("id", params.id);

    if (updateError) {
      console.error("[admin.contact-messages.reply.status]", {
        code: updateError.code,
        message: updateError.message
      });

      return jsonError("Yanıt gönderildi, ancak mesaj durumu güncellenemedi.");
    }

    return NextResponse.json({
      ok: true,
      message: "Yanıt gönderildi.",
      item: {
        id: message.id,
        status: "answered"
      }
    });
  } catch (error) {
    return routeErrorResponse(error, "admin.contact-messages.reply");
  }
}
