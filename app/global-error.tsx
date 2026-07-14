"use client";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-[#FAF7F1] px-5 py-12 text-[#0A1628]">
          <section className="w-full max-w-2xl rounded-[8px] border border-[#d8c7a8] bg-white p-6 shadow-[0_24px_80px_rgba(10,22,40,0.14)]">
            <p className="text-sm font-bold text-[#8B6A2F]">Hata</p>
            <h1 className="mt-3 font-serif text-4xl font-bold">Beklenmeyen bir sorun oluştu.</h1>
            <p className="mt-4 leading-7 text-[#5C5854]">
              Teknik ayrıntılar kullanıcıya gösterilmez. Sayfayı yeniden denemeyi veya ana sayfaya dönmeyi tercih edebilirsiniz.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center justify-center rounded-[6px] bg-[#0A1628] px-5 py-3 text-sm font-semibold text-white"
              >
                Tekrar Dene
              </button>
              <a
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white px-5 py-3 text-sm font-semibold text-[#0A1628]"
              >
                Ana Sayfa
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
