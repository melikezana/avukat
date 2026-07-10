import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const articlesDirectory = path.join(process.cwd(), "content", "articles");

type ArticleFrontmatter = {
  title: string;
  date: string;
  summary: string;
  category: string;
  coverImage: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type ArticleMeta = ArticleFrontmatter & {
  slug: string;
  readingTime: number;
};

export type Article = ArticleMeta & {
  content: string;
};

function estimateReadingTime(content: string) {
  return Math.max(1, Math.ceil(readingTime(content).minutes));
}

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(articlesDirectory)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, "");
      const fullPath = path.join(articlesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const frontmatter = data as ArticleFrontmatter;

      return {
        ...frontmatter,
        slug,
        readingTime: estimateReadingTime(content)
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticleBySlug(slug: string): Article | null {
  const fullPath = path.join(articlesDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontmatter = data as ArticleFrontmatter;

  return {
    ...frontmatter,
    slug,
    content,
    readingTime: estimateReadingTime(content)
  };
}

export function getArticleCategories(articles = getAllArticles()) {
  return Array.from(new Set(articles.map((article) => article.category))).sort((a, b) =>
    a.localeCompare(b, "tr")
  );
}
