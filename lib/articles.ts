import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const articlesDirectory = path.join(process.cwd(), "content", "articles");

type RawArticleFrontmatter = {
  title: string;
  slug?: string;
  date: string;
  summary?: string;
  excerpt?: string;
  category: string;
  coverImage?: string;
  readingTime?: number | string;
  author?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type ArticleMeta = {
  title: string;
  slug: string;
  date: string;
  summary: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  coverImageExists: boolean;
  readingTime: number;
  author: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type Article = ArticleMeta & {
  content: string;
};

type ArticleRecord = Article & {
  sourceSlug: string;
};

const defaultAuthor = "Av. İdris Dağkesen";
const priorityFilterCategories = ["Kira Hukuku", "İş Hukuku", "Aile Hukuku"];

function estimateReadingTime(content: string) {
  return Math.max(1, Math.ceil(readingTime(content).minutes));
}

function listArticleFiles() {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  return fs.readdirSync(articlesDirectory).filter((fileName) => fileName.endsWith(".mdx"));
}

function parseReadingTime(value: RawArticleFrontmatter["readingTime"], content: string) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.ceil(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return estimateReadingTime(content);
}

function publicAssetExists(src?: string) {
  if (!src) {
    return false;
  }

  if (/^https?:\/\//.test(src)) {
    return true;
  }

  if (!src.startsWith("/") || src.startsWith("//")) {
    return false;
  }

  const publicPath = path.join(process.cwd(), "public", ...src.split("/").filter(Boolean));
  return fs.existsSync(publicPath);
}

function readArticleRecord(fileName: string): ArticleRecord {
  const sourceSlug = fileName.replace(/\.mdx$/, "");
  const fullPath = path.join(articlesDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontmatter = data as RawArticleFrontmatter;
  const slug = frontmatter.slug?.trim() || sourceSlug;
  const summary = frontmatter.summary?.trim() || frontmatter.excerpt?.trim() || "";
  const excerpt = frontmatter.excerpt?.trim() || summary;
  const coverImage = frontmatter.coverImage?.trim() || undefined;

  return {
    title: frontmatter.title,
    slug,
    sourceSlug,
    date: frontmatter.date,
    summary,
    excerpt,
    category: frontmatter.category,
    coverImage,
    coverImageExists: publicAssetExists(coverImage),
    readingTime: parseReadingTime(frontmatter.readingTime, content),
    author: frontmatter.author?.trim() || defaultAuthor,
    metaTitle: frontmatter.metaTitle,
    metaDescription: frontmatter.metaDescription ?? excerpt,
    content
  };
}

function toArticleMeta(article: ArticleRecord): ArticleMeta {
  const { content: _content, sourceSlug: _sourceSlug, ...meta } = article;
  return meta;
}

export function getAllArticles(): ArticleMeta[] {
  return listArticleFiles()
    .map(readArticleRecord)
    .map(toArticleMeta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticleBySlug(slug: string): Article | null {
  const article = listArticleFiles()
    .map(readArticleRecord)
    .find((record) => record.slug === slug || record.sourceSlug === slug);

  if (!article) {
    return null;
  }

  const { sourceSlug: _sourceSlug, ...publicArticle } = article;
  return publicArticle;
}

export function getArticleCategories(articles = getAllArticles()) {
  return Array.from(new Set([...priorityFilterCategories, ...articles.map((article) => article.category)])).sort(
    (a, b) => a.localeCompare(b, "tr")
  );
}
