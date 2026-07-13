import { getAllArticles } from "@/lib/articles";

export default function AdminArticlesPage() {
  const articles = getAllArticles();

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-normal">Makaleler</h2>
        <p className="mt-2 text-sm text-slate-600">Kayıtlı makale sayısı: {articles.length}</p>
      </div>
      <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white">
        <div className="grid grid-cols-[1fr_150px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500">
          <span>Başlık</span>
          <span>Kategori</span>
          <span>Tarih</span>
        </div>
        {articles.map((article) => (
          <div key={article.slug} className="grid grid-cols-[1fr_150px_150px] gap-4 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0">
            <span className="font-semibold text-slate-900">{article.title}</span>
            <span className="text-slate-600">{article.category}</span>
            <span className="text-slate-600">{article.date}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
