import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getBreadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo";
import { cn } from "@/lib/utils";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const jsonLd = getBreadcrumbJsonLd(items);

  return (
    <>
      <nav aria-label="İçerik yolu" className={cn("text-sm font-semibold text-muted", className)}>
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={`${item.href}-${item.name}`} className="inline-flex min-w-0 items-center gap-2">
                {index > 0 ? <ChevronRight className="h-4 w-4 shrink-0 text-accent-1" aria-hidden /> : null}
                {isLast ? (
                  <span className="truncate text-primary" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="transition hover:text-accent-1">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd)
        }}
      />
    </>
  );
}
