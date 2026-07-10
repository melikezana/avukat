"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setFeedback("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState("error");
      setFeedback(data.message ?? "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
      return;
    }

    event.currentTarget.reset();
    setState("success");
    setFeedback(data.message ?? "Mesajınız alındı.");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[8px] border border-navy-900/10 bg-cream-50 p-6 shadow-soft md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-navy-900">İsim Soyisim</span>
          <input
            required
            name="name"
            type="text"
            className="mt-2 h-12 w-full rounded-[6px] border border-navy-900/12 bg-white px-4 text-sm outline-none transition focus:border-gold-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-900">E-posta</span>
          <input
            required
            name="email"
            type="email"
            className="mt-2 h-12 w-full rounded-[6px] border border-navy-900/12 bg-white px-4 text-sm outline-none transition focus:border-gold-500"
          />
        </label>
      </div>
      <label className="mt-5 block">
        <span className="text-sm font-semibold text-navy-900">Konu</span>
        <input
          required
          name="subject"
          type="text"
          className="mt-2 h-12 w-full rounded-[6px] border border-navy-900/12 bg-white px-4 text-sm outline-none transition focus:border-gold-500"
        />
      </label>
      <label className="mt-5 block">
        <span className="text-sm font-semibold text-navy-900">Mesaj</span>
        <textarea
          required
          name="message"
          rows={7}
          className="mt-2 w-full resize-y rounded-[6px] border border-navy-900/12 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-gold-500"
        />
      </label>

      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <Send className="h-4 w-4" aria-hidden />
        {state === "loading" ? "Gönderiliyor" : "Mesajı Gönder"}
      </button>

      {feedback ? (
        <p className={`mt-4 text-sm font-medium ${state === "error" ? "text-red-700" : "text-navy-900"}`}>
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
