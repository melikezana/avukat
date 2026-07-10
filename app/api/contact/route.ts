import { NextResponse } from "next/server";

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
  const contactTo = process.env.CONTACT_TO_EMAIL ?? "info@idrisdagkesen.av.tr";
  const contactFrom = process.env.CONTACT_FROM_EMAIL ?? "web@idrisdagkesen.av.tr";

  // API anahtarı yoksa form yerel geliştirmede başarılı döner ve mesajı loglar.
  if (!resendApiKey) {
    console.info("İletişim formu placeholder modu:", {
      name,
      email,
      subject,
      message
    });

    return NextResponse.json({
      ok: true,
      preview: true,
      message: "Mesaj alındı. E-posta entegrasyonu için Resend API anahtarı bekleniyor."
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
      to: contactTo,
      reply_to: email,
      subject: `Web sitesi iletişim: ${subject}`,
      text: `Ad Soyad: ${name}\nE-posta: ${email}\nKonu: ${subject}\n\n${message}`
    })
  });

  if (!resendResponse.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "E-posta gönderimi sırasında bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Mesajınız gönderildi. En kısa sürede dönüş yapılacaktır."
  });
}
