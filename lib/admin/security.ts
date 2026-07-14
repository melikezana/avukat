import "server-only";

import { headers } from "next/headers";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type HeadersLike = {
  get(name: string): string | null;
};

const buckets = new Map<string, RateLimitEntry>();

function getHeaderValue(headersList: HeadersLike, name: string) {
  return headersList.get(name) || headersList.get(name.toLowerCase());
}

function getSiteOrigin() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    return null;
  }

  try {
    return new URL(siteUrl).origin;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(headersList = headers()) {
  const origin = getHeaderValue(headersList, "origin");

  if (!origin) {
    return true;
  }

  const host = getHeaderValue(headersList, "x-forwarded-host") || getHeaderValue(headersList, "host");
  const protocol = getHeaderValue(headersList, "x-forwarded-proto") || "https";
  const allowedOrigins = new Set<string>();

  if (host) {
    allowedOrigins.add(`${protocol}://${host}`);
  }

  const siteOrigin = getSiteOrigin();

  if (siteOrigin) {
    allowedOrigins.add(siteOrigin);
  }

  return allowedOrigins.has(origin);
}

export function consumeRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs
    });

    return true;
  }

  if (current.count >= options.limit) {
    return false;
  }

  current.count += 1;
  buckets.set(key, current);

  return true;
}
