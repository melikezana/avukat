import Link from "next/link";
import { FileClock, FileText, Mail, PencilLine } from "lucide-react";

const cards = [
  {
    title: "Makaleler",
    text: "Yayındaki hukuk yazıları",
    href: "/admin/makaleler",
    icon: FileText
  },
  {
    title: "Taslaklar",
    text: "Hazırlık aşamasındaki içerikler",
    href: "/admin/makaleler?status=draft",
    icon: FileClock
  },
  {
    title: "İletişim Mesajları",
    text: "Form üzerinden gelen bildirimler",
    href: "/admin/mesajlar",
    icon: Mail
  },
  {
    title: "Yeni Makale",
    text: "Yeni içerik oluşturma alanı",
    href: "/admin/makaleler/yeni",
    icon: PencilLine
  }
];

export default function AdminDashboardPage() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-normal text-[var(--color-navy)]">Genel Durum</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5a52]">
          Yönetim paneli Supabase oturumu ile korunur.
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
              <h3 className="mt-4 text-lg font-bold tracking-normal text-[var(--color-navy)] transition group-hover:text-[var(--color-gold)]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#6c6254]">{card.text}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
