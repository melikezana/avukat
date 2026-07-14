import { slugifyTurkish } from "@/lib/categories";

export const ARTICLE_CATEGORY_OPTIONS = [
  { value: "kira", label: "Kira Hukuku" },
  { value: "is", label: "İş Hukuku" },
  { value: "aile", label: "Aile Hukuku" },
  { value: "ceza", label: "Ceza Hukuku" },
  { value: "ticaret", label: "Ticaret Hukuku" },
  { value: "gayrimenkul", label: "Gayrimenkul Hukuku" }
] as const;

export type ArticleCategorySlug = (typeof ARTICLE_CATEGORY_OPTIONS)[number]["value"];

const articleCategorySlugs = new Set<string>(ARTICLE_CATEGORY_OPTIONS.map((option) => option.value));
const articleCategoryLabelsBySlug = new Map<ArticleCategorySlug, string>(
  ARTICLE_CATEGORY_OPTIONS.map((option) => [option.value, option.label])
);
const articleCategorySlugsByNormalizedLabel = new Map<string, ArticleCategorySlug>(
  ARTICLE_CATEGORY_OPTIONS.map((option) => [slugifyTurkish(option.label), option.value])
);

export function isArticleCategorySlug(value: string): value is ArticleCategorySlug {
  return articleCategorySlugs.has(value);
}

export function normalizeArticleCategory(value?: string | null) {
  const category = value?.trim() ?? "";

  if (isArticleCategorySlug(category)) {
    return category;
  }

  return articleCategorySlugsByNormalizedLabel.get(slugifyTurkish(category)) ?? "";
}

export function getArticleCategoryLabel(value?: string | null) {
  const category = normalizeArticleCategory(value);

  if (category) {
    return articleCategoryLabelsBySlug.get(category) ?? category;
  }

  return value?.trim() ?? "";
}
