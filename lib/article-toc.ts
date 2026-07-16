import { slugifyTurkish } from "@/lib/categories";

export type ArticleHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

type HeadingIdState = {
  counts: Map<string, number>;
};

function createHeadingIdState(): HeadingIdState {
  return {
    counts: new Map()
  };
}

function getPlainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMarkdownInline(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export function getUniqueHeadingId(text: string, state: HeadingIdState) {
  const baseId = slugifyTurkish(text) || "bolum";
  const nextCount = (state.counts.get(baseId) ?? 0) + 1;
  state.counts.set(baseId, nextCount);

  return nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
}

export function enhanceHtmlHeadings(html: string) {
  const state = createHeadingIdState();
  const headings: ArticleHeading[] = [];
  const content = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, levelValue, attributes, innerHtml) => {
    const text = getPlainText(innerHtml);

    if (!text) {
      return match;
    }

    const level = Number(levelValue) as 2 | 3;
    const id = getUniqueHeadingId(text, state);
    const cleanedAttributes = String(attributes).replace(/\s+id=(?:"[^"]*"|'[^']*'|[^\s>]+)/i, "");
    headings.push({ id, text, level });

    return `<h${level}${cleanedAttributes} id="${id}">${innerHtml}</h${level}>`;
  });

  return {
    content,
    headings
  };
}

export function extractMdxHeadings(source: string) {
  const state = createHeadingIdState();
  const headings: ArticleHeading[] = [];
  let inCodeFence = false;

  for (const line of source.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line.trim());

    if (!match) {
      continue;
    }

    const text = stripMarkdownInline(match[2]);

    if (!text) {
      continue;
    }

    headings.push({
      id: getUniqueHeadingId(text, state),
      text,
      level: match[1].length as 2 | 3
    });
  }

  return headings;
}
