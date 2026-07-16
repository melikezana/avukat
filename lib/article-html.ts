import sanitizeHtml from "sanitize-html";
import { estimateReadingMinutesFromText } from "@/lib/article-reading-time";

const allowedTextAlignments = [/^left$/, /^center$/, /^right$/];

export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "hr",
      "a",
      "img",
      "pre",
      "code"
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"]
    },
    allowedStyles: {
      p: {
        "text-align": allowedTextAlignments
      },
      h2: {
        "text-align": allowedTextAlignments
      },
      h3: {
        "text-align": allowedTextAlignments
      }
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"]
    },
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer"
      }),
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          loading: attribs.loading || "lazy",
          alt: attribs.alt?.trim() || ""
        }
      })
    },
    disallowedTagsMode: "discard"
  }).trim();
}

export function getPlainTextFromHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {}
  })
    .replace(/\s+/g, " ")
    .trim();
}

export function estimateHtmlReadingTime(html: string) {
  const text = getPlainTextFromHtml(html);
  return estimateReadingMinutesFromText(text);
}
