export default function AdminLoading() {
  return (
    <section aria-label="Yönetim paneli yükleniyor">
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-[#d8c7a8]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0]" />
        ))}
      </div>
    </section>
  );
}
