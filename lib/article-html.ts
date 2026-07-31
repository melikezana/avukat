import sanitizeHtml from "sanitize-html";
import { estimateReadingMinutesFromText } from "@/lib/article-reading-time";

const allowedTextAlignments = [/^left$/, /^center$/, /^right$/];
const cssLengthValue = "(?:0|auto|\\d+(?:\\.\\d+)?(?:px|%|rem|em|vw|vh))";
const allowedImageCssValues = [
  new RegExp(`^${cssLengthValue}(?:\\s+${cssLengthValue}){0,3}$`, "i"),
  /^calc\([0-9+\-*/.\s%pxrememvwvh]+\)$/i
];
const alignedBlockAttributes = ["style", "class"];
const contentClassAttributes = ["class"];
const articleImageClassNames = new Set(["article-image", "image-align-left", "image-align-center", "image-align-right", "image-full-width"]);
const imageAlignmentClassNames = new Set(["image-align-left", "image-align-center", "image-align-right", "image-full-width"]);

function getSafeArticleImageClassName(value?: string) {
  const classes = (value ?? "").split(/\s+/).filter((className) => articleImageClassNames.has(className));
  const hasAlignment = classes.some((className) => imageAlignmentClassNames.has(className));
  const safeClasses = new Set(["article-image", ...classes]);

  if (!hasAlignment) {
    safeClasses.add("image-align-center");
  }

  return Array.from(safeClasses).join(" ");
}

function getSafeDataWidth(value?: string) {
  const match = value?.trim().match(/^(\d+(?:\.\d+)?)%?$/);

  if (!match) {
    return undefined;
  }

  const width = Number(match[1]);

  if (!Number.isFinite(width) || width <= 0 || width > 100) {
    return undefined;
  }

  return String(Math.round(width));
}

function getSafeDataAlign(value?: string) {
  return value === "left" || value === "center" || value === "right" || value === "full" ? value : "center";
}

function getSafeStoragePath(value?: string) {
  const trimmed = value?.trim();

  if (!trimmed || trimmed.includes("..")) {
    return undefined;
  }

  return /^article-content\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed) ? trimmed : undefined;
}

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
      "figure",
      "figcaption",
      "pre",
      "code"
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title", "class"],
      img: ["src", "alt", "title", "width", "height", "loading", "class", "style", "data-storage-path"],
      figure: ["class", "style", "data-width", "data-align", "data-storage-path"],
      figcaption: ["class"],
      p: alignedBlockAttributes,
      h2: alignedBlockAttributes,
      h3: alignedBlockAttributes,
      ul: contentClassAttributes,
      ol: contentClassAttributes,
      li: contentClassAttributes,
      blockquote: contentClassAttributes,
      hr: contentClassAttributes,
      pre: contentClassAttributes,
      code: contentClassAttributes,
      br: contentClassAttributes
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
      },
      img: {
        display: [/^block$/, /^inline-block$/, /^inline$/],
        width: allowedImageCssValues,
        "max-width": allowedImageCssValues,
        height: allowedImageCssValues,
        margin: allowedImageCssValues,
        "margin-top": allowedImageCssValues,
        "margin-right": allowedImageCssValues,
        "margin-bottom": allowedImageCssValues,
        "margin-left": allowedImageCssValues,
        "border-radius": allowedImageCssValues
      },
      figure: {
        width: allowedImageCssValues,
        "max-width": allowedImageCssValues,
        margin: allowedImageCssValues,
        "margin-top": allowedImageCssValues,
        "margin-right": allowedImageCssValues,
        "margin-bottom": allowedImageCssValues,
        "margin-left": allowedImageCssValues
      }
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"]
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const target = attribs.target === "_self" ? "_self" : "_blank";
        const nextAttribs: Record<string, string> = {
          ...attribs,
          target
        };

        if (target === "_blank") {
          nextAttribs.rel = "noopener noreferrer";
        } else {
          delete nextAttribs.rel;
        }

        return {
          tagName,
          attribs: nextAttribs
        };
      },
      img: (tagName, attribs) => {
        const nextAttribs: Record<string, string> = {
          ...attribs,
          loading: attribs.loading || "lazy",
          alt: attribs.alt?.trim() || ""
        };
        const storagePath = getSafeStoragePath(attribs["data-storage-path"]);

        if (storagePath) {
          nextAttribs["data-storage-path"] = storagePath;
        } else {
          delete nextAttribs["data-storage-path"];
        }

        return {
          tagName,
          attribs: nextAttribs
        };
      },
      figure: (tagName, attribs) => {
        const nextAttribs: Record<string, string> = {
          ...attribs,
          class: getSafeArticleImageClassName(attribs.class),
          "data-align": getSafeDataAlign(attribs["data-align"])
        };
        const dataWidth = getSafeDataWidth(attribs["data-width"]);
        const storagePath = getSafeStoragePath(attribs["data-storage-path"]);

        if (dataWidth) {
          nextAttribs["data-width"] = dataWidth;
        } else {
          delete nextAttribs["data-width"];
        }

        if (storagePath) {
          nextAttribs["data-storage-path"] = storagePath;
        } else {
          delete nextAttribs["data-storage-path"];
        }

        return {
          tagName,
          attribs: nextAttribs
        };
      }
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
