"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  RotateCcw,
  Reply,
  Search,
  Send,
  Trash2,
  X
} from "lucide-react";

export type AdminMessage = {
  id: string;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  status: string | null;
  created_at: string | null;
};

type MessageStatus = "new" | "read" | "answered" | "archived";
type MessageFilter = "all" | MessageStatus;
type SortOrder = "newest" | "oldest";

type AdminMessagesManagerProps = {
  initialMessages: AdminMessage[];
};

const pageSize = 20;

const filters: Array<{ label: string; value: MessageFilter }> = [
  { label: "Tümü", value: "all" },
  { label: "Yeni", value: "new" },
  { label: "Okundu", value: "read" },
  { label: "Yanıtlandı", value: "answered" },
  { label: "Arşiv", value: "archived" }
];

function normalizeStatus(status: string | null): MessageStatus {
  if (status === "read" || status === "answered" || status === "archived") {
    return status;
  }

  return "new";
}

function formatStatus(status: string | null) {
  const normalized = normalizeStatus(status);

  if (normalized === "read") {
    return "Okundu";
  }

  if (normalized === "answered") {
    return "Yanıtlandı";
  }

  if (normalized === "archived") {
    return "Arşiv";
  }

  return "Yeni";
}

function getStatusClass(status: string | null) {
  const normalized = normalizeStatus(status);

  if (normalized === "read") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  if (normalized === "answered") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (normalized === "archived") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }

  return "border-[#d6aa42] bg-[#fff6dc] text-[#7a5a14]";
}

function getFilterClass(isActive: boolean) {
  return [
    "inline-flex min-h-10 items-center rounded-[6px] border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]",
    isActive
      ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
      : "border-[#d8c7a8] bg-[#fffaf0] text-[#5f5a52] hover:border-[#c8a45d] hover:text-[var(--color-navy)]"
  ].join(" ");
}

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

function getTimestamp(value: string | null) {
  if (!value) {
    return 0;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getReplySubject(subject: string | null) {
  const fallback = "İletişim mesajı";
  const trimmed = subject?.trim() || fallback;

  return /^re:/i.test(trimmed) ? trimmed : `RE: ${trimmed}`;
}

function getSearchText(message: AdminMessage) {
  return [message.name, message.email, message.subject, message.message].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");
}

async function readJson(response: Response) {
  return (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
}

export function AdminMessagesManager({ initialMessages }: AdminMessagesManagerProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [activeFilter, setActiveFilter] = useState<MessageFilter>("all");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [replyTarget, setReplyTarget] = useState<AdminMessage | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replySending, setReplySending] = useState(false);

  const filteredMessages = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr-TR");

    return messages
      .filter((message) => activeFilter === "all" || normalizeStatus(message.status) === activeFilter)
      .filter((message) => !needle || getSearchText(message).includes(needle))
      .sort((first, second) => {
        const diff = getTimestamp(second.created_at) - getTimestamp(first.created_at);

        return sortOrder === "newest" ? diff : -diff;
      });
  }, [activeFilter, messages, query, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const visibleMessages = filteredMessages.slice(pageStart, pageStart + pageSize);
  const visibleEnd = Math.min(pageStart + visibleMessages.length, filteredMessages.length);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, query, sortOrder]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  async function updateMessageStatus(messageId: string, status: MessageStatus) {
    setBusyId(messageId);
    setFeedback(null);
    setOpenMenuId(null);

    try {
      const response = await fetch(`/api/admin/messages/${encodeURIComponent(messageId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      const payload = await readJson(response);

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message || "Mesaj güncellenemedi.");
      }

      setMessages((current) =>
        current.map((message) => (message.id === messageId ? { ...message, status } : message))
      );
      setFeedback({ type: "success", message: payload.message || "Mesaj güncellendi." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Mesaj güncellenemedi."
      });
    } finally {
      setBusyId(null);
    }
  }

  async function deleteMessage(message: AdminMessage) {
    const confirmed = window.confirm(`"${message.subject || "Konu belirtilmemiş"}" mesajı silinsin mi?`);

    if (!confirmed) {
      return;
    }

    setBusyId(message.id);
    setFeedback(null);
    setOpenMenuId(null);

    try {
      const response = await fetch(`/api/admin/messages/${encodeURIComponent(message.id)}`, {
        method: "DELETE"
      });
      const payload = await readJson(response);

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message || "Mesaj silinemedi.");
      }

      setMessages((current) => current.filter((item) => item.id !== message.id));
      setFeedback({ type: "success", message: payload.message || "Mesaj silindi." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Mesaj silinemedi."
      });
    } finally {
      setBusyId(null);
    }
  }

  function openReply(message: AdminMessage) {
    setReplyTarget(message);
    setReplySubject(getReplySubject(message.subject));
    setReplyBody("");
    setOpenMenuId(null);
  }

  async function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!replyTarget) {
      return;
    }

    setReplySending(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/messages/${encodeURIComponent(replyTarget.id)}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subject: replySubject,
          body: replyBody
        })
      });
      const payload = await readJson(response);

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message || "Yanıt gönderilemedi.");
      }

      setMessages((current) =>
        current.map((message) => (message.id === replyTarget.id ? { ...message, status: "answered" } : message))
      );
      setFeedback({ type: "success", message: payload.message || "Yanıt gönderildi." });
      setReplyTarget(null);
      setReplyBody("");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Yanıt gönderilemedi."
      });
    } finally {
      setReplySending(false);
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-wrap gap-2" aria-label="Mesaj durum filtreleri">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={getFilterClass(activeFilter === filter.value)}
              aria-pressed={activeFilter === filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_170px] xl:min-w-[520px]">
          <label className="relative block">
            <span className="sr-only">Mesajlarda ara</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b7f6d]" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="İsim, email, konu, içerik"
              className="min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white py-2 pl-9 pr-3 text-sm text-[var(--color-navy)] transition placeholder:text-[#8b7f6d] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            />
          </label>

          <label className="block">
            <span className="sr-only">Tarihe göre sırala</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
              className="min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-navy)] transition focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            >
              <option value="newest">En yeni</option>
              <option value="oldest">En eski</option>
            </select>
          </label>
        </div>
      </div>

      {feedback ? (
        <div
          className={`mb-5 rounded-[8px] border px-4 py-3 text-sm font-semibold ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {visibleMessages.length > 0 ? (
        <>
          <div className="space-y-4">
            {visibleMessages.map((item) => {
              const isExpanded = expandedId === item.id;
              const isBusy = busyId === item.id;
              const sender = item.name || "İsimsiz";

              return (
                <article
                  key={item.id}
                  className="rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-4 shadow-[0_16px_50px_rgba(10,22,40,0.07)] sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-gold)]"
                    >
                      <h3 className="text-lg font-bold tracking-normal text-[var(--color-navy)]">
                        {item.subject || "Konu belirtilmemiş"}
                      </h3>
                      <p className="mt-1 break-words text-sm text-[#6c6254]">
                        {sender} {item.email ? <span>({item.email})</span> : null}
                      </p>
                    </button>

                    <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClass(item.status)}`}
                      >
                        {formatStatus(item.status)}
                      </span>
                      <span className="inline-flex rounded-full border border-[#d8c7a8] bg-white px-2.5 py-1 text-xs font-bold text-[#6c6254]">
                        {formatDateTime(item.created_at)}
                      </span>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white text-[var(--color-navy)] transition hover:border-[#c8a45d] hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                          aria-label="Mesaj işlemleri"
                          aria-expanded={openMenuId === item.id}
                        >
                          <MoreHorizontal className="h-4 w-4" aria-hidden />
                        </button>

                        {openMenuId === item.id ? (
                          <div className="absolute right-0 z-20 mt-2 w-60 rounded-[8px] border border-[#d8c7a8] bg-white p-2 shadow-[0_18px_50px_rgba(10,22,40,0.18)]">
                            <MenuButton
                              icon={Eye}
                              label="Oku"
                              onClick={() => {
                                setExpandedId(item.id);
                                setOpenMenuId(null);
                              }}
                            />
                            <MenuButton icon={Reply} label="Yanıtla" onClick={() => openReply(item)} disabled={!item.email} />
                            <MenuButton
                              icon={CheckCircle2}
                              label="Okundu olarak işaretle"
                              onClick={() => updateMessageStatus(item.id, "read")}
                              disabled={isBusy}
                            />
                            <MenuButton
                              icon={RotateCcw}
                              label="Yeni olarak işaretle"
                              onClick={() => updateMessageStatus(item.id, "new")}
                              disabled={isBusy}
                            />
                            <MenuButton
                              icon={Archive}
                              label="Arşivle"
                              onClick={() => updateMessageStatus(item.id, "archived")}
                              disabled={isBusy}
                            />
                            <MenuButton
                              icon={Trash2}
                              label="Sil"
                              onClick={() => deleteMessage(item)}
                              disabled={isBusy}
                              danger
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <p className={`mt-4 whitespace-pre-wrap text-sm leading-7 text-[#5f5a52] ${isExpanded ? "" : "line-clamp-3"}`}>
                    {item.message || "-"}
                  </p>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => openReply(item)}
                      disabled={!item.email || isBusy}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-deep)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                    >
                      <Reply className="h-4 w-4" aria-hidden />
                      Yanıtla
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMessage(item)}
                      disabled={isBusy}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Sil
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#6c6254] sm:flex-row sm:items-center sm:justify-between">
            <span>
              {pageStart + 1}-{visibleEnd} / {filteredMessages.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white text-[var(--color-navy)] transition hover:border-[#c8a45d] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                aria-label="Önceki sayfa"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white text-[var(--color-navy)] transition hover:border-[#c8a45d] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                aria-label="Sonraki sayfa"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-8 text-center shadow-[0_16px_50px_rgba(10,22,40,0.07)]">
          <h3 className="text-lg font-bold tracking-normal text-[var(--color-navy)]">Mesaj bulunamadı</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6c6254]">
            Seçili filtre veya arama ölçütlerine uygun kayıt yok.
          </p>
        </div>
      )}

      {replyTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,22,40,0.55)] p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reply-modal-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5 shadow-[0_24px_80px_rgba(10,22,40,0.28)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="reply-modal-title" className="text-xl font-bold tracking-normal text-[var(--color-navy)]">
                  Yanıtla
                </h3>
                <p className="mt-1 break-words text-sm text-[#6c6254]">{replyTarget.email || "Alıcı e-postası yok"}</p>
              </div>
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white text-[var(--color-navy)] transition hover:border-[#c8a45d] hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <form onSubmit={submitReply} className="mt-5 space-y-4">
              <div>
                <label htmlFor="reply-recipient" className="text-sm font-semibold text-[var(--color-navy)]">
                  Alıcı
                </label>
                <input
                  id="reply-recipient"
                  type="email"
                  value={replyTarget.email ?? ""}
                  readOnly
                  className="mt-2 min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)]"
                />
              </div>

              <div>
                <label htmlFor="reply-subject" className="text-sm font-semibold text-[var(--color-navy)]">
                  Konu
                </label>
                <input
                  id="reply-subject"
                  type="text"
                  value={replySubject}
                  onChange={(event) => setReplySubject(event.target.value)}
                  required
                  className="mt-2 min-h-11 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] transition focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                />
              </div>

              <div>
                <label htmlFor="reply-body" className="text-sm font-semibold text-[var(--color-navy)]">
                  Yanıt
                </label>
                <textarea
                  id="reply-body"
                  value={replyBody}
                  onChange={(event) => setReplyBody(event.target.value)}
                  rows={8}
                  required
                  className="mt-2 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm leading-7 text-[var(--color-navy)] transition focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="inline-flex min-h-11 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={replySending || !replyTarget.email}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-[var(--color-navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-deep)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  {replySending ? "Gönderiliyor" : "Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

type MenuButtonProps = {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
};

function MenuButton({ icon: Icon, label, onClick, disabled, danger }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-10 w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger ? "text-red-700 hover:bg-red-50" : "text-[var(--color-navy)] hover:bg-[#fff6dc]"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
