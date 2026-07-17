import { Download, ExternalLink, FileText, Scale } from "lucide-react";
import { formatDate } from "@/lib/format";

export type DecisionPdfArticle = {
  decisionPdfUrl?: string | null;
  decisionPdfTitle?: string | null;
  decisionCourt?: string | null;
  decisionCaseNo?: string | null;
  decisionNumber?: string | null;
  decisionDate?: string | null;
};

type DecisionRow = {
  label: string;
  value: string;
};

function formatDecisionDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return formatDate(value);
}

export function getDecisionRows(article: DecisionPdfArticle): DecisionRow[] {
  return [
    { label: "Mahkeme", value: article.decisionCourt ?? "" },
    { label: "Esas No", value: article.decisionCaseNo ?? "" },
    { label: "Karar No", value: article.decisionNumber ?? "" },
    { label: "Karar Tarihi", value: formatDecisionDate(article.decisionDate) }
  ].filter((row) => row.value);
}

export function hasDecisionInfo(article: DecisionPdfArticle) {
  return getDecisionRows(article).length > 0;
}

export function isValidPdfUrl(value?: string | null) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function getDownloadHref(pdfUrl: string, title?: string | null) {
  const params = new URLSearchParams({
    url: pdfUrl
  });
  const filename = title?.trim();

  if (filename) {
    params.set("filename", filename);
  }

  return `/api/decision-pdf/download?${params.toString()}`;
}

export function ArticleDecisionSummary({ article }: { article: DecisionPdfArticle }) {
  const rows = getDecisionRows(article);

  if (!rows.length) {
    return null;
  }

  return (
    <section
      lang="tr"
      style={{ hyphens: "none" }}
      className="not-prose my-8 rounded-[8px] border border-primary/10 bg-background p-5 break-normal [-webkit-hyphens:none] [hyphens:none] [overflow-wrap:normal]"
      aria-labelledby="decision-summary-title"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-primary text-white">
          <Scale className="h-5 w-5" aria-hidden />
        </span>
        <h2 id="decision-summary-title" className="break-normal font-serif text-2xl font-bold text-primary [-webkit-hyphens:none] [hyphens:none] [overflow-wrap:normal] [text-wrap:wrap]">
          Karar Künyesi
        </h2>
      </div>
      <dl className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 min-[1200px]:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="rounded-[6px] border border-primary/10 bg-white p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-accent-1">{row.label}</dt>
            <dd className="mt-1 break-normal whitespace-normal text-sm font-semibold text-primary [-webkit-hyphens:none] [hyphens:none] [overflow-wrap:normal] [text-wrap:wrap]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function DecisionPdfCard({ article }: { article: DecisionPdfArticle }) {
  const pdfUrl = article.decisionPdfUrl?.trim() ?? "";

  if (!isValidPdfUrl(pdfUrl)) {
    return null;
  }

  const title = article.decisionPdfTitle?.trim();
  const rows = getDecisionRows(article);

  return (
    <section
      lang="tr"
      style={{ hyphens: "none" }}
      className="not-prose mt-10 w-full rounded-2xl border border-primary/10 bg-white p-5 shadow-soft break-normal [-webkit-hyphens:none] [hyphens:none] [overflow-wrap:normal] sm:p-6 lg:p-8 min-[1200px]:relative min-[1200px]:left-1/2 min-[1200px]:w-[min(56rem,calc(100vw-4rem))] min-[1200px]:-translate-x-1/2"
      aria-labelledby="decision-full-text-title"
    >
      <div className="grid grid-cols-1 gap-6 min-[1200px]:grid-cols-[minmax(0,1fr)_auto] min-[1200px]:items-start">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-cream-50 text-primary sm:h-11 sm:w-11">
            <FileText className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="decision-full-text-title"
              className="!m-0 break-normal whitespace-normal !font-serif !text-2xl !font-bold !leading-tight !text-primary [-webkit-hyphens:none] [hyphens:none] [overflow-wrap:normal] [text-wrap:wrap] sm:!text-3xl md:!text-4xl"
            >
              Kararın Tam Metni
            </h2>
            {title ? (
              <p className="!mb-0 !mt-3 max-w-2xl break-normal whitespace-normal text-sm leading-6 text-muted [-webkit-hyphens:none] [hyphens:none] [overflow-wrap:normal] [text-wrap:wrap] md:text-base md:leading-7">
                {title}
              </p>
            ) : null}
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 min-[1200px]:ml-6 min-[1200px]:flex min-[1200px]:w-auto min-[1200px]:shrink-0">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={title ? `${title} PDF dosyasını yeni sekmede görüntüle` : "Kararın tam metni PDF dosyasını yeni sekmede görüntüle"}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-primary px-5 py-2.5 text-sm !font-semibold !text-white !no-underline transition hover:bg-navy-800 hover:!text-white hover:!no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:min-w-[180px] min-[1200px]:w-auto min-[1200px]:min-w-fit"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            <span>PDF’yi Görüntüle</span>
          </a>
          <a
            href={getDownloadHref(pdfUrl, title)}
            target="_blank"
            rel="noreferrer"
            download
            aria-label={title ? `${title} PDF dosyasını indir` : "Kararın tam metni PDF dosyasını indir"}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border border-primary bg-white px-5 py-2.5 text-sm !font-semibold !text-primary !no-underline transition hover:border-navy-800 hover:bg-cream-50 hover:!text-primary hover:!no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:min-w-[180px] min-[1200px]:w-auto min-[1200px]:min-w-fit"
          >
            <Download className="h-4 w-4" aria-hidden />
            <span>PDF’yi İndir</span>
          </a>
        </div>
      </div>

      {rows.length ? (
        <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-primary/10 bg-primary/10 md:grid-cols-2 min-[1200px]:grid-cols-4">
          {rows.map((row) => (
            <div key={row.label} className="min-w-0 bg-white px-4 py-3.5 sm:px-5 sm:py-4">
              <dt className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">{row.label}</dt>
              <dd className="mt-1.5 break-normal whitespace-normal text-sm font-semibold leading-6 text-primary [-webkit-hyphens:none] [hyphens:none] [overflow-wrap:normal] [text-wrap:wrap]">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

export function ArticleDecisionFullText({ article }: { article: DecisionPdfArticle }) {
  return <DecisionPdfCard article={article} />;
}
