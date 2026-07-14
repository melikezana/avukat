import Link from "next/link";
import { FileClock, FileText, Images, Mail, MailCheck, MailOpen, PencilLine } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CountCard = {
  title: string;
  value: number | null;
  text: string;
  href: string;
  icon: typeof FileText;
};

type RecentMessage = {
  id: string | number;
  name: string | null;
  subject: string | null;
  status: string | null;
  created_at: string | null;
};

type RecentArticle = {
  id: string | number;
  title: string | null;
  status: string | null;
  updated_at: string | null;
};

function logDashboardError(scope: string, error: { code?: string; message?: string; details?: string; hint?: string }) {
  console.error(`[admin.dashboard.${scope}]`, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  });
}

function formatNumber(value: number | null) {
  return value == null ? "—" : new Intl.NumberFormat("tr-TR").format(value);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Tarih yok";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tarih yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

async function getDashboardData() {
  const supabase = createSupabaseServerClient();

  async function countArticles(status?: "published" | "draft") {
    let query = supabase.from("articles").select("id", { count: "exact", head: true });

    if (status) {
      query = query.eq("status", status);
    }

    const { count, error } = await query;

    if (error) {
      logDashboardError(`articles.${status || "total"}`, error);
      return null;
    }

    return count ?? 0;
  }

  async function countMessages(status: "new" | "read" | "answered") {
    const { count, error } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", status);

    if (error) {
      logDashboardError(`messages.${status}`, error);
      return null;
    }

    return count ?? 0;
  }

  async function getRecentMessages() {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id,name,subject,status,created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      logDashboardError("messages.recent", error);
      return [];
    }

    return (data ?? []) as RecentMessage[];
  }

  async function getRecentArticles() {
    const { data, error } = await supabase
      .from("articles")
      .select("id,title,status,updated_at")
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(5);

    if (error) {
      logDashboardError("articles.recent", error);
      return [];
    }

    return (data ?? []) as RecentArticle[];
  }

  async function countStorageFiles() {
    try {
      const adminSupabase = createSupabaseAdminClient();
      const folders = ["article-covers", "article-content"];
      const results = await Promise.all(
        folders.map((folder) => adminSupabase.storage.from("article-images").list(folder, { limit: 1000 }))
      );

      return results.reduce((total, result) => {
        if (result.error) {
          logDashboardError("storage.count", result.error);
          return total;
        }

        return total + (result.data ?? []).filter((item) => item.name && !item.id?.endsWith("/")).length;
      }, 0);
    } catch (error) {
      console.error("[admin.dashboard.storage.count]", error);
      return null;
    }
  }

  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    newMessages,
    readMessages,
    answeredMessages,
    storageFiles,
    recentMessages,
    recentArticles
  ] = await Promise.all([
    countArticles(),
    countArticles("published"),
    countArticles("draft"),
    countMessages("new"),
    countMessages("read"),
    countMessages("answered"),
    countStorageFiles(),
    getRecentMessages(),
    getRecentArticles()
  ]);

  return {
    cards: [
      {
        title: "Toplam makale",
        value: totalArticles,
        text: "Tüm CMS kayıtları",
        href: "/admin/makaleler",
        icon: FileText
      },
      {
        title: "Yayındaki makale",
        value: publishedArticles,
        text: "Public sitede görünenler",
        href: "/admin/makaleler?status=published",
        icon: FileText
      },
      {
        title: "Taslak makale",
        value: draftArticles,
        text: "Henüz yayında olmayanlar",
        href: "/admin/makaleler?status=draft",
        icon: FileClock
      },
      {
        title: "Yeni mesaj",
        value: newMessages,
        text: "İşlem bekleyenler",
        href: "/admin/mesajlar",
        icon: Mail
      },
      {
        title: "Okunmuş mesaj",
        value: readMessages,
        text: "Okundu olarak işaretlenenler",
        href: "/admin/mesajlar",
        icon: MailOpen
      },
      {
        title: "Yanıtlanmış mesaj",
        value: answeredMessages,
        text: "Cevaplanan talepler",
        href: "/admin/mesajlar",
        icon: MailCheck
      },
      {
        title: "Yüklenen görsel",
        value: storageFiles,
        text: "article-images bucket",
        href: "/admin/yuklemeler",
        icon: Images
      },
      {
        title: "Yeni makale",
        value: null,
        text: "İçerik oluştur",
        href: "/admin/makaleler/yeni",
        icon: PencilLine
      }
    ] satisfies CountCard[],
    recentMessages,
    recentArticles
  };
}

export default async function AdminDashboardPage() {
  const { cards, recentMessages, recentArticles } = await getDashboardData();

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-normal text-[var(--color-navy)]">Genel Durum</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5a52]">
          Yönetim paneli Supabase oturumu ile korunur. Kartlar gerçek Supabase kayıtlarından hesaplanır.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group block cursor-pointer rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_16px_50px_rgba(10,22,40,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-[#c8a45d] hover:shadow-[0_20px_60px_rgba(10,22,40,0.11)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-gold)]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-[#c8a45d]/40 bg-[var(--color-navy)] text-[#f3d28b]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-3xl font-bold tracking-normal text-[var(--color-navy)]">{formatNumber(card.value)}</p>
              <h3 className="mt-2 text-base font-bold tracking-normal text-[var(--color-navy)] transition group-hover:text-[var(--color-gold)]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#6c6254]">{card.text}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <section className="rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_16px_50px_rgba(10,22,40,0.07)]">
          <h3 className="text-lg font-bold tracking-normal text-[var(--color-navy)]">Son 5 mesaj</h3>
          <div className="mt-4 space-y-3">
            {recentMessages.length ? (
              recentMessages.map((message) => (
                <Link key={message.id} href="/admin/mesajlar" className="block rounded-[6px] border border-[#eadcc5] bg-white p-3 transition hover:border-[#c8a45d]">
                  <p className="font-semibold text-[var(--color-navy)]">{message.subject || "Konu belirtilmemiş"}</p>
                  <p className="mt-1 text-sm text-[#6c6254]">
                    {message.name || "İsimsiz"} · {message.status || "new"} · {formatDateTime(message.created_at)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm leading-6 text-[#6c6254]">Mesaj bulunamadı veya sorgu şu anda tamamlanamadı.</p>
            )}
          </div>
        </section>

        <section className="rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_16px_50px_rgba(10,22,40,0.07)]">
          <h3 className="text-lg font-bold tracking-normal text-[var(--color-navy)]">Son 5 makale</h3>
          <div className="mt-4 space-y-3">
            {recentArticles.length ? (
              recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/makaleler/${article.id}/duzenle`}
                  className="block rounded-[6px] border border-[#eadcc5] bg-white p-3 transition hover:border-[#c8a45d]"
                >
                  <p className="font-semibold text-[var(--color-navy)]">{article.title || "Başlıksız makale"}</p>
                  <p className="mt-1 text-sm text-[#6c6254]">
                    {article.status || "draft"} · {formatDateTime(article.updated_at)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm leading-6 text-[#6c6254]">Makale bulunamadı veya sorgu şu anda tamamlanamadı.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
