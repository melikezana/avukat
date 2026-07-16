import type { ArticleHeading } from "@/lib/article-toc";
import { cn } from "@/lib/utils";

type ArticleTableOfContentsProps = {
  headings: ArticleHeading[];
  mobile?: boolean;
  className?: string;
};

function HeadingLinks({ headings }: { headings: ArticleHeading[] }) {
  return (
    <ol className="space-y-2 text-sm">
      {headings.map((heading) => (
        <li key={heading.id} className={cn(heading.level === 3 && "pl-4")}>
          <a
            href={`#${heading.id}`}
            className="block rounded-[6px] px-2 py-1.5 leading-5 text-muted transition hover:bg-white hover:text-accent-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-1"
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function ArticleTableOfContents({ headings, mobile = false, className }: ArticleTableOfContentsProps) {
  if (headings.length < 3) {
    return null;
  }

  if (mobile) {
    return (
      <nav className={className} aria-label="İçindekiler">
        <details className="rounded-[8px] border border-primary/10 bg-background p-4">
          <summary className="cursor-pointer text-sm font-bold text-primary">İçindekiler</summary>
          <div className="mt-3 border-t border-primary/10 pt-3">
            <HeadingLinks headings={headings} />
          </div>
        </details>
      </nav>
    );
  }

  return (
    <nav className={cn("rounded-[8px] border border-primary/10 bg-background p-5", className)} aria-label="İçindekiler">
      <p className="text-sm font-semibold text-primary">İçindekiler</p>
      <div className="mt-4">
        <HeadingLinks headings={headings} />
      </div>
    </nav>
  );
}
