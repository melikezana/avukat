import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminMessagesManager, type AdminMessage } from "@/components/admin/messages-manager";
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
  replied_at: string | null;
  reply_body: string | null;
};

type MessagesResult =
  | {
      messages: AdminMessage[];
      loadError: false;
    }
  | {
      messages: null;
      loadError: true;
    };

async function getMessages(): Promise<MessagesResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/yonetim-giris?next=/admin/mesajlar");
  }

  const extendedResponse = await supabase
    .schema("public")
    .from("contact_messages")
    .select("id,name,email,subject,message,status,created_at,replied_at,reply_body")
    .order("created_at", { ascending: false });
  let data = extendedResponse.data as ContactMessageRow[] | null;
  let error = extendedResponse.error;

  if (extendedResponse.error) {
    console.error("[admin.contact-messages.list.extended]", {
      code: extendedResponse.error.code,
      message: extendedResponse.error.message,
      details: extendedResponse.error.details,
      hint: extendedResponse.error.hint
    });

    const fallbackResponse = await supabase
      .schema("public")
      .from("contact_messages")
      .select("id,name,email,subject,message,status,created_at")
      .order("created_at", { ascending: false });

    data = fallbackResponse.data as ContactMessageRow[] | null;
    error = fallbackResponse.error;
  }

  if (error) {
    console.error("[admin.contact-messages.list]", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });

    return {
      messages: null,
      loadError: true
    };
  }

  return {
    messages: ((data ?? []) as ContactMessageRow[]).map((message) => ({
      ...message,
      id: String(message.id)
    })),
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
          İletişim formundan gelen kayıtları yanıtlayın, durumlandırın ve arşivleyin.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
          Mesajlar şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.
        </div>
      ) : (
        <AdminMessagesManager initialMessages={messages} />
      )}
    </section>
  );
}
