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
    <section className="not-prose my-8 rounded-[8px] border border-primary/10 bg-background p-5" aria-labelledby="decision-summary-title">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-primary text-white">
          <Scale className="h-5 w-5" aria-hidden />
        </span>
        <h2 id="decision-summary-title" className="font-serif text-2xl font-bold text-primary">
          Karar Künyesi
        </h2>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-[6px] border border-primary/10 bg-white p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-accent-1">{row.label}</dt>
            <dd className="mt-1 text-sm font-semibold text-primary">{row.value}</dd>
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
    <section className="not-prose mt-10 rounded-[8px] border border-primary/10 bg-background p-5" aria-labelledby="decision-full-text-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-primary text-white">
            <FileText className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 id="decision-full-text-title" className="font-serif text-2xl font-bold text-primary">
              Kararın Tam Metni
            </h2>
            {title ? <p className="mt-1 text-sm leading-6 text-muted">{title}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            PDF’yi Görüntüle
          </a>
          <a
            href={getDownloadHref(pdfUrl, title)}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-primary/10 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-accent-2 hover:text-accent-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1"
          >
            <Download className="h-4 w-4" aria-hidden />
            PDF’yi İndir
          </a>
        </div>
      </div>

      {rows.length ? (
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((row) => (
            <div key={row.label} className="rounded-[6px] border border-primary/10 bg-white p-3">
              <dt className="text-xs font-bold uppercase tracking-[0.08em] text-accent-1">{row.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-primary">{row.value}</dd>
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
