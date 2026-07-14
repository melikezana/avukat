import Image from "next/image";
import { CategoryVisual } from "@/components/site/CategoryVisual";
import { cn } from "@/lib/utils";

type ArticleCoverProps = {
  src?: string;
  title: string;
  category: string;
  width?: number;
  height?: number;
  sizes: string;
  className?: string;
  imageClassName?: string;
};

function isRemoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

function isSupabaseArticleImage(src: string) {
  try {
    const url = new URL(src);
    return url.pathname.startsWith("/storage/v1/object/public/article-images/");
  } catch {
    return false;
  }
}

export function ArticleCover({
  src,
  title,
  category,
  width = 800,
  height = 450,
  sizes,
  className,
  imageClassName
}: ArticleCoverProps) {
  const baseClassName = cn("aspect-[16/9] w-full", className);

  if (src) {
    return (
      <Image
        src={src}
        alt={`${title} kapak görseli`}
        width={width}
        height={height}
        sizes={sizes}
        unoptimized={isRemoteImage(src) && !isSupabaseArticleImage(src)}
        className={cn(baseClassName, "object-cover", imageClassName)}
      />
    );
  }

  return (
    <CategoryVisual
      category={category}
      title={title}
      className={cn(baseClassName, "rounded-none transition duration-500", imageClassName)}
    />
  );
}
