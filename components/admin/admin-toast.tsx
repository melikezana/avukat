"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

type AdminToastProps = {
  message?: string;
};

export function AdminToast({ message }: AdminToastProps) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    setVisible(Boolean(message));

    if (!message) {
      return;
    }

    const timeout = window.setTimeout(() => setVisible(false), 4800);
    return () => window.clearTimeout(timeout);
  }, [message]);

  if (!message || !visible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-[8px] border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-[0_18px_54px_rgba(10,22,40,0.18)]"
    >
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        aria-label="Bildirimi kapat"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
