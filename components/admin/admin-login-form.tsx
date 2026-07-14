"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AdminLoginFormProps = {
  nextPath?: string;
};

type LoginState = "idle" | "loading" | "error";

const loginErrorMessage = "E-posta veya şifre hatalı.";

function getSafeAdminTarget(nextPath?: string) {
  if (
    nextPath === "/admin" ||
    nextPath?.startsWith("/admin/") ||
    nextPath?.startsWith("/admin?")
  ) {
    return nextPath;
  }

  return "/admin";
}

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter();
  const [state, setState] = useState<LoginState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setFeedback("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setState("error");
        setFeedback(payload?.message || loginErrorMessage);
        return;
      }
    } catch {
      setState("error");
      setFeedback(loginErrorMessage);
      return;
    }

    router.replace(getSafeAdminTarget(nextPath));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <div>
        <label htmlFor="admin-email" className="text-sm font-semibold text-slate-800">
          E-posta
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
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
