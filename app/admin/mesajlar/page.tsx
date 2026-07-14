import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "İletişim Mesajları"
};

export const dynamic = "force-dynamic";

type ContactMessageRow = {
  id: string | number;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  status: string | null;
  created_at: string | null;
};

type MessagesResult =
  | {
      messages: ContactMessageRow[];
      loadError: false;
    }
  | {
      messages: null;
      loadError: true;
    };

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatStatus(status: string | null) {
  if (status === "new") {
    return "Yeni";
  }

  if (status === "read") {
    return "Okundu";
  }

  if (status === "answered") {
    return "Yanıtlandı";
  }

  if (status === "archived") {
    return "Arşiv";
  }

  return status?.trim() || "Yeni";
}

function getStatusClass(status: string | null) {
  if (status === "read") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  if (status === "answered") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "archived") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

async function getMessages(): Promise<MessagesResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/yonetim-giris?next=/admin/mesajlar");
  }

  const { data, error } = await supabase
    .schema("public")
    .from("contact_messages")
    .select("id,name,email,subject,message,status,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin.contact-messages.list]", {
      code: error.code,
      message: error.message
    });

    return {
      messages: null,
      loadError: true
    };
  }

  return {
    messages: (data ?? []) as ContactMessageRow[],
    loadError: false
  };
}

export default async function AdminMessagesPage() {
  const { messages, loadError } = await getMessages();

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-normal text-[var(--color-navy)]">
          İletişim Mesajları
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5a52]">
          İletişim formundan gelen mesajlar en yeniden eskiye sıralanır.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
          Mesajlar yüklenemedi.
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((item) => (
            <article
              key={item.id}
              className="rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_16px_50px_rgba(10,22,40,0.07)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-normal text-[var(--color-navy)]">
                    {item.subject || "Konu belirtilmemiş"}
                  </h3>
                  <p className="mt-1 text-sm text-[#6c6254]">
                    {item.name || "İsimsiz"} {item.email ? <span>({item.email})</span> : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClass(item.status)}`}>
                    {formatStatus(item.status)}
                  </span>
                  <span className="inline-flex rounded-full border border-[#d8c7a8] bg-white px-2.5 py-1 text-xs font-bold text-[#6c6254]">
                    {formatDateTime(item.created_at)}
                  </span>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#5f5a52]">{item.message || "-"}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-8 text-center shadow-[0_16px_50px_rgba(10,22,40,0.07)]">
          <h3 className="text-lg font-bold tracking-normal text-[var(--color-navy)]">Henüz mesaj yok</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6c6254]">
            İletişim formundan yeni bir kayıt geldiğinde burada görünecek.
          </p>
        </div>
      )}
    </section>
  );
}
