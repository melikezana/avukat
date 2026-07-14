export default function EditArticleLoading() {
  return (
    <section>
      <div className="mb-6 h-24 animate-pulse rounded-[8px] bg-[#efe6d8]" />
      <div className="rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-5">
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-[6px] bg-[#eadcc5]" />
          ))}
        </div>
        <div className="mt-5 h-28 animate-pulse rounded-[6px] bg-[#eadcc5]" />
        <div className="mt-5 h-[450px] animate-pulse rounded-[8px] bg-[#eadcc5]" />
      </div>
    </section>
  );
}
