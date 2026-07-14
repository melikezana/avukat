import { NextResponse } from "next/server";
import { z } from "zod";
import { routeErrorResponse } from "@/lib/api/responses";
import { consumeRateLimit, createRateLimitKey } from "@/lib/admin/security";
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getReplySubject(subject?: string | null) {
  const trimmed = subject?.trim() || "İletişim mesajınız";
  return /^re:/i.test(trimmed) ? trimmed : `Re: ${trimmed}`;
}

function getEmailHtml(body: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #0A1628; line-height: 1.7;">
      <p>Merhaba,</p>
      <div>${escapeHtml(body).replace(/\n/g, "<br />")}</div>
      <p style="margin-top: 24px;">Saygılarımla,<br />Av. İdris Dağkesen</p>
    </div>
  `;
}

async function sendResendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.CONTACT_FROM_EMAIL || process.env.CONTACT_EMAIL;
  const replyTo = process.env.CONTACT_EMAIL;

  if (!apiKey || !from || !replyTo) {
    return {
      ok: false,
      message: "E-posta gönderim ayarları eksik. Lütfen RESEND_API_KEY, EMAIL_FROM ve CONTACT_EMAIL değerlerini kontrol edin."
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
      reply_to: replyTo,
      subject,
      text,
      html: getEmailHtml(text)
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
    if (!(await requireAdminRequest(request))) {
      return adminUnauthorizedResponse();
    }

    if (!consumeRateLimit(createRateLimitKey("admin-message-reply", request.headers, params.id), { limit: 10, windowMs: 60_000 })) {
      return jsonError("Çok kısa sürede çok fazla yanıt gönderme denemesi yapıldı. Lütfen biraz sonra tekrar deneyin.", 429);
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

    const emailSubject = getReplySubject(message.subject || parsed.data.subject);
    const emailResult = await sendResendEmail(recipient, emailSubject, parsed.data.body);

    if (!emailResult.ok) {
      return jsonError(emailResult.message);
    }

    const replyDate = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("contact_messages")
      .update({
        status: "answered",
        replied_at: replyDate,
        reply_body: parsed.data.body
      })
      .eq("id", params.id);

    if (updateError) {
      console.error("[admin.contact-messages.reply.status]", {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });

      const { error: fallbackError } = await supabase
        .from("contact_messages")
        .update({ status: "answered" })
        .eq("id", params.id);

      if (fallbackError) {
        console.error("[admin.contact-messages.reply.statusFallback]", {
          code: fallbackError.code,
          message: fallbackError.message,
          details: fallbackError.details,
          hint: fallbackError.hint
        });

        return jsonError("Yanıt gönderildi, ancak mesaj durumu güncellenemedi.");
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Yanıt gönderildi.",
      item: {
        id: message.id,
        status: "answered",
        replied_at: replyDate,
        reply_body: parsed.data.body
      }
    });
  } catch (error) {
    return routeErrorResponse(error, "admin.contact-messages.reply");
  }
}
