import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { slugifyTurkish } from "@/lib/categories";

const articlesDirectory = path.join(process.cwd(), "content", "articles");
const publicDirectory = path.join(process.cwd(), "public");
const uploadPublicPrefix = "/images/articles/uploads/";
const uploadDirectory = path.join(publicDirectory, "images", "articles", "uploads");

export type ArticleAdminInput = {
  title: string;
  slug?: string;
  date: string;
  summary: string;
  excerpt?: string;
  category: string;
  coverImage?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
};

export class ArticleStoreError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

function assertInsideDirectory(baseDirectory: string, targetPath: string) {
  const relative = path.relative(baseDirectory, targetPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new ArticleStoreError("Geçersiz dosya yolu.", 400);
  }
}

function normalizeSlug(value: string) {
  const slug = slugifyTurkish(value);

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new ArticleStoreError("Geçerli bir makale adresi üretilemedi.", 400);
  }

  return slug;
}

async function listArticleFiles() {
  try {
    const files = await fs.readdir(articlesDirectory);
    return files.filter((fileName) => fileName.endsWith(".mdx"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function findArticleSource(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const files = await listArticleFiles();

  for (const fileName of files) {
    const filePath = path.join(articlesDirectory, fileName);
    assertInsideDirectory(articlesDirectory, filePath);

    const sourceSlug = fileName.replace(/\.mdx$/, "");
    const fileContents = await fs.readFile(filePath, "utf8");
    const parsed = matter(fileContents);
    const frontmatterSlug = typeof parsed.data.slug === "string" ? parsed.data.slug : sourceSlug;

    if (frontmatterSlug === normalizedSlug || sourceSlug === normalizedSlug) {
      return {
        fileName,
        filePath,
        sourceSlug,
        data: parsed.data as Record<string, unknown>,
        content: parsed.content
      };
    }
  }

  return null;
}

function buildMdx(input: ArticleAdminInput, slug: string) {
  const frontmatter = {
    title: input.title,
    slug,
    date: input.date,
    summary: input.summary,
    ...(input.excerpt ? { excerpt: input.excerpt } : {}),
    category: input.category,
    ...(input.coverImage ? { coverImage: input.coverImage } : {}),
    ...(input.metaTitle ? { metaTitle: input.metaTitle } : {}),
    ...(input.metaDescription ? { metaDescription: input.metaDescription } : {})
  };

  return matter.stringify(input.content.trim() + "\n", frontmatter);
}

export async function createArticleFile(input: ArticleAdminInput) {
  const slug = normalizeSlug(input.slug ?? input.title);
  const filePath = path.join(articlesDirectory, `${slug}.mdx`);
  assertInsideDirectory(articlesDirectory, filePath);

  if (await findArticleSource(slug)) {
    throw new ArticleStoreError("Bu adresle kayıtlı bir makale zaten var.", 409);
  }

  await fs.mkdir(articlesDirectory, { recursive: true });
  await fs.writeFile(filePath, buildMdx(input, slug), "utf8");

  return { slug };
}

export async function updateArticleFile(existingSlug: string, input: Partial<ArticleAdminInput>) {
  const source = await findArticleSource(existingSlug);

  if (!source) {
    throw new ArticleStoreError("Makale bulunamadı.", 404);
  }

  const mergedInput: ArticleAdminInput = {
    title: (input.title ?? source.data.title) as string,
    slug: input.slug ?? ((source.data.slug as string | undefined) || source.sourceSlug),
    date: (input.date ?? source.data.date) as string,
    summary: (input.summary ?? source.data.summary ?? source.data.excerpt ?? "") as string,
    excerpt: (input.excerpt ?? source.data.excerpt) as string | undefined,
    category: (input.category ?? source.data.category) as string,
    coverImage: (input.coverImage ?? source.data.coverImage) as string | undefined,
    content: input.content ?? source.content,
    metaTitle: (input.metaTitle ?? source.data.metaTitle) as string | undefined,
    metaDescription: (input.metaDescription ?? source.data.metaDescription) as string | undefined
  };
  const nextSlug = normalizeSlug(mergedInput.slug ?? mergedInput.title);
  const nextPath = path.join(articlesDirectory, `${nextSlug}.mdx`);
  assertInsideDirectory(articlesDirectory, nextPath);

  if (nextSlug !== source.sourceSlug && (await findArticleSource(nextSlug))) {
    throw new ArticleStoreError("Bu adresle kayıtlı başka bir makale var.", 409);
  }

  await fs.writeFile(source.filePath, buildMdx(mergedInput, nextSlug), "utf8");

  if (nextPath !== source.filePath) {
    await fs.rename(source.filePath, nextPath);
  }

  return { slug: nextSlug };
}

export async function deleteArticleFile(slug: string) {
  const source = await findArticleSource(slug);

  if (!source) {
    throw new ArticleStoreError("Makale bulunamadı.", 404);
  }

  const coverImage = typeof source.data.coverImage === "string" ? source.data.coverImage : undefined;
  await fs.unlink(source.filePath);
  await deleteUploadedCover(coverImage);

  return { slug: source.sourceSlug };
}

async function deleteUploadedCover(coverImage?: string) {
  if (!coverImage?.startsWith(uploadPublicPrefix)) {
    return;
  }

  const targetPath = path.join(publicDirectory, ...coverImage.split("/").filter(Boolean));
  assertInsideDirectory(uploadDirectory, targetPath);

  try {
    await fs.unlink(targetPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[admin.article.deleteCover]", error);
    }
  }
}
