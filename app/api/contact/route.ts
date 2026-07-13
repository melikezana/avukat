import { NextResponse } from "next/server";
import { contactInfo } from "@/lib/site-profile";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ContactPayload;
  const { name, email, subject, message } = payload;

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { ok: false, message: "Lütfen tüm alanları doldurun." },
      { status: 400 }
    );
  }

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
}
