"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AdminLoginFormProps = {
  nextPath?: string;
};

type LoginState = "idle" | "loading" | "error";

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter();
  const [state, setState] = useState<LoginState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setFeedback("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState("error");
      setFeedback(data.message ?? "Giriş yapılamadı.");
      return;
    }

    const target = nextPath?.startsWith("/admin") ? nextPath : "/admin";
    router.replace(target);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <div>
        <label htmlFor="admin-username" className="text-sm font-semibold text-slate-800">
          Kullanıcı adı
        </label>
        <input
          id="admin-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="mt-2 h-12 w-full rounded-[6px] border border-slate-300 px-4 text-sm transition focus:border-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        />
      </div>
      <div className="mt-5">
        <label htmlFor="admin-password" className="text-sm font-semibold text-slate-800">
          Şifre
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 h-12 w-full rounded-[6px] border border-slate-300 px-4 text-sm transition focus:border-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        />
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        {state === "loading" ? "Kontrol ediliyor" : "Yönetim Paneline Gir"}
      </button>
      {feedback ? <p className="mt-4 text-sm font-semibold text-red-700">{feedback}</p> : null}
    </form>
  );
}
