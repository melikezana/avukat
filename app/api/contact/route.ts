import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequestResponse, routeErrorResponse, validationErrorResponse } from "@/lib/api/responses";
import { contactInfo } from "@/lib/config";

const contactPayloadSchema = z.object({
  name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalıdır.").max(120),
  email: z.string().trim().email("Geçerli bir e-posta adresi yazın.").max(160),
  subject: z.string().trim().min(3, "Konu en az 3 karakter olmalıdır.").max(160),
  message: z.string().trim().min(10, "Mesaj en az 10 karakter olmalıdır.").max(4000)
});

export async function POST(request: Request) {
  try {
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
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL ?? process.env.CONTACT_TO_EMAIL ?? contactInfo.email;
    const contactFrom = process.env.CONTACT_FROM_EMAIL ?? contactEmail;

    if (!resendApiKey) {
      return NextResponse.json({
        ok: true,
        preview: true,
        message: "Mesajınız alındı. En kısa sürede dönüş yapılacaktır."
      });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: contactFrom,
        to: contactEmail,
        reply_to: email,
        subject: `Web sitesi iletişim: ${subject}`,
        text: `Ad Soyad: ${name}\nE-posta: ${email}\nKonu: ${subject}\n\n${message}`
      })
    });

    if (!resendResponse.ok) {
      const providerBody = await resendResponse.text().catch(() => "");
      console.error("[contact.resend]", {
        status: resendResponse.status,
        body: providerBody
      });

      return NextResponse.json(
        {
          ok: false,
          message: "Mesaj gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Mesajınız gönderildi. En kısa sürede dönüş yapılacaktır."
    });
  } catch (error) {
    return routeErrorResponse(error, "contact.submit");
  }
}
