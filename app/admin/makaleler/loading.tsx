export default function AdminArticlesLoading() {
  return (
    <section>
      <div className="mb-6 h-20 animate-pulse rounded-[8px] bg-[#efe6d8]" />
      <div className="mb-5 h-24 animate-pulse rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0]" />
      <div className="overflow-hidden rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0]">
        <div className="h-12 animate-pulse border-b border-[#d8c7a8] bg-[#efe6d8]/70" />
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[96px_1fr_140px_140px] gap-4 border-b border-[#eadcc5] p-4">
            <div className="h-14 animate-pulse rounded-[6px] bg-[#eadcc5]" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#eadcc5]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-[#eadcc5]" />
            </div>
            <div className="h-8 animate-pulse rounded-full bg-[#eadcc5]" />
            <div className="h-8 animate-pulse rounded-[6px] bg-[#eadcc5]" />
          </div>
        ))}
      </div>
    </section>
  );
}
