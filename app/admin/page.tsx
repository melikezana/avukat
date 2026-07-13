import { FileText, ShieldCheck, UploadCloud } from "lucide-react";

const cards = [
  {
    title: "Oturum kontrolü",
    text: "Bu bölümdeki tüm sayfalar imzalı yönetici oturumu gerektirir.",
    icon: ShieldCheck
  },
  {
    title: "Makale API",
    text: "Makale ekleme, güncelleme ve silme işlemleri Zod doğrulamasıyla korunur.",
    icon: FileText
  },
  {
    title: "Görsel yükleme",
    text: "Yüklemeler jpg, png ve webp ile sınırlıdır; dosya adı sunucuda temizlenir.",
    icon: UploadCloud
  }
];

export default function AdminDashboardPage() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-normal">Genel Durum</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Yönetim yüzeyi sade tutuldu ve ziyaretçi tarafındaki vitrin bileşenlerinden ayrıldı.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.title} className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
              <Icon className="h-6 w-6 text-slate-700" aria-hidden />
              <h3 className="mt-4 text-lg font-bold tracking-normal">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
