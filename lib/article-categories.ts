import { slugifyTurkish } from "@/lib/categories";

export const ARTICLE_CATEGORY_OPTIONS = [
  { value: "yargitay-kararlari", label: "Yargıtay Kararları" },
  { value: "usul-hukuku", label: "Usul Hukuku" },
  { value: "is-hukuku", label: "İş Hukuku", aliases: ["is"] },
  { value: "ceza-hukuku", label: "Ceza Hukuku", aliases: ["ceza"] },
  { value: "aile-hukuku", label: "Aile Hukuku", aliases: ["aile"] },
  { value: "icra-iflas-hukuku", label: "İcra ve İflas Hukuku" },
  { value: "kira-hukuku", label: "Kira Hukuku", aliases: ["kira"] },
  { value: "ticaret-hukuku", label: "Ticaret Hukuku", aliases: ["ticaret"] },
  { value: "sigorta-hukuku", label: "Sigorta Hukuku" },
  { value: "vergi-hukuku", label: "Vergi Hukuku" },
  { value: "anayasa-mahkemesi-kararlari", label: "Anayasa Mahkemesi Kararları" },
  { value: "danistay-kararlari", label: "Danıştay Kararları" },
  { value: "gayrimenkul-hukuku", label: "Gayrimenkul Hukuku", aliases: ["gayrimenkul"] },
  { value: "miras-hukuku", label: "Miras Hukuku", aliases: ["miras"] }
] as const;

export type ArticleCategorySlug = (typeof ARTICLE_CATEGORY_OPTIONS)[number]["value"];

const articleCategorySlugs = new Set<string>(ARTICLE_CATEGORY_OPTIONS.map((option) => option.value));
const articleCategoryOptionsBySlug = new Map<ArticleCategorySlug, (typeof ARTICLE_CATEGORY_OPTIONS)[number]>(
  ARTICLE_CATEGORY_OPTIONS.map((option) => [option.value, option])
);
const articleCategoryLabelsBySlug = new Map<ArticleCategorySlug, string>(
  ARTICLE_CATEGORY_OPTIONS.map((option) => [option.value, option.label])
);
const articleCategorySlugsByNormalizedInput = new Map<string, ArticleCategorySlug>();

function getArticleCategoryAliases(option: (typeof ARTICLE_CATEGORY_OPTIONS)[number]) {
  return "aliases" in option ? option.aliases : [];
}

for (const option of ARTICLE_CATEGORY_OPTIONS) {
  articleCategorySlugsByNormalizedInput.set(option.value, option.value);
  articleCategorySlugsByNormalizedInput.set(slugifyTurkish(option.label), option.value);

  for (const alias of getArticleCategoryAliases(option)) {
    articleCategorySlugsByNormalizedInput.set(alias, option.value);
    articleCategorySlugsByNormalizedInput.set(slugifyTurkish(alias), option.value);
  }
}

export function isArticleCategorySlug(value: string): value is ArticleCategorySlug {
  return articleCategorySlugs.has(value);
}

export function normalizeArticleCategory(value?: string | null) {
  const category = value?.trim() ?? "";

  if (isArticleCategorySlug(category)) {
    return category;
  }

  return articleCategorySlugsByNormalizedInput.get(slugifyTurkish(category)) ?? "";
}

export function getArticleCategoryLabel(value?: string | null) {
  const category = normalizeArticleCategory(value);

  if (category) {
    return articleCategoryLabelsBySlug.get(category) ?? category;
  }

  return value?.trim() ?? "";
}

export function getArticleCategoryFilterValues(value?: string | null) {
  const category = normalizeArticleCategory(value);

  if (!category) {
    return [];
  }

  const option = articleCategoryOptionsBySlug.get(category);

  if (!option) {
    return [category];
  }

  return Array.from(new Set([option.value, option.label, slugifyTurkish(option.label), ...getArticleCategoryAliases(option)]));
}

export function getArticleCategoryFilterParam(value: string) {
  return normalizeArticleCategory(value) || slugifyTurkish(value);
}

export function getArticleCategoryFilterHref(value: string) {
  return `/makaleler?kategori=${getArticleCategoryFilterParam(value)}`;
}

export function getOrderedArticleCategoryLabels(categories: Array<string | null | undefined> = []) {
  const seen = new Set<ArticleCategorySlug | string>();
  const orderedCategories: string[] = [];

  for (const option of ARTICLE_CATEGORY_OPTIONS) {
    seen.add(option.value);
    orderedCategories.push(option.label);
  }

  const additionalCategories = categories
    .map((category) => getArticleCategoryLabel(category))
    .filter((category): category is string => Boolean(category));

  for (const category of additionalCategories) {
    const key = normalizeArticleCategory(category) || slugifyTurkish(category);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    orderedCategories.push(category);
  }

  return orderedCategories;
}
