"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

type ContactResponse = {
  message?: string;
  issues?: {
    message: string;
  }[];
};

function getErrorMessage(data: ContactResponse) {
  const issueMessages = data.issues?.map((issue) => issue.message).filter(Boolean);

  if (issueMessages?.length) {
    return issueMessages.join(" ");
  }

  return data.message ?? "Mesaj gönderilemedi. Lütfen tekrar deneyin.";
}

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    setState("loading");
    setFeedback("");

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ContactResponse;

      if (!response.ok) {
        setState("error");
        setFeedback(getErrorMessage(data));
        return;
      }

      form.reset();

      setState("success");
      setFeedback(
        data.message ?? "Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçilecektir."
      );
    } catch (error) {
      console.error(error);

      setState("error");
      setFeedback("Mesaj gönderilemedi. Lütfen bağlantınızı kontrol edip tekrar deneyin.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[8px] border border-primary/10 bg-background p-6 shadow-soft md:p-8"
    >
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-company">Şirket</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm font-semibold text-primary">
            Ad Soyad
          </label>
          <input
            id="contact-name"
            required
            name="name"
            type="text"
            autoComplete="name"
            className="mt-2 h-12 w-full rounded-[6px] border border-primary/10 bg-white px-4 text-sm transition focus:border-accent-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="text-sm font-semibold text-primary">
            E-posta
          </label>
          <input
            id="contact-email"
            required
            name="email"
            type="email"
            autoComplete="email"
            className="mt-2 h-12 w-full rounded-[6px] border border-primary/10 bg-white px-4 text-sm transition focus:border-accent-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1"
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="contact-subject" className="text-sm font-semibold text-primary">
          Konu
        </label>
        <input
          id="contact-subject"
          required
          name="subject"
          type="text"
          className="mt-2 h-12 w-full rounded-[6px] border border-primary/10 bg-white px-4 text-sm transition focus:border-accent-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1"
        />
      </div>

      <div className="mt-5">
        <label htmlFor="contact-message" className="text-sm font-semibold text-primary">
          Mesaj
        </label>
        <textarea
          id="contact-message"
          required
          name="message"
          rows={7}
          className="mt-2 w-full resize-y rounded-[6px] border border-primary/10 bg-white px-4 py-3 text-sm leading-7 transition focus:border-accent-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1"
        />
      </div>

      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-accent-1 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-accent-2 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <Send className="h-4 w-4" aria-hidden />
        {state === "loading" ? "Gönderiliyor..." : "Mesaj Gönder"}
      </button>

      {feedback && (
        <p
          className={`mt-4 text-sm font-medium ${
            state === "success"
              ? "text-green-700"
              : state === "error"
              ? "text-red-700"
              : "text-primary"
          }`}
        >
          {feedback}
        </p>
      )}

      <p className="mt-4 text-xs leading-6 text-muted">
        Bu form üzerinden paylaştığınız kişisel veriler yalnızca talebinizi
        değerlendirmek ve sizinle iletişime geçmek amacıyla işlenir.
      </p>
    </form>
  );
}