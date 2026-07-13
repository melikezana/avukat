export default function AdminUploadsPage() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-normal">Yüklemeler</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Görsel yükleme endpointi `/api/admin/upload` üzerinden çalışır ve yalnızca doğrulanmış yönetici oturumunu kabul eder.
        </p>
      </div>
      <div className="rounded-[8px] border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
        FormData alanı `file` olarak gönderildiğinde sunucu dosya türünü, boyutunu ve dosya adını kontrol eder.
      </div>
    </section>
  );
}
