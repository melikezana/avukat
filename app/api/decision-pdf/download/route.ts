import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const maxDownloadSizeBytes = 20 * 1024 * 1024;

function isPrivateIpAddress(address: string) {
  const normalizedAddress = address.toLocaleLowerCase("en-US");

  if (normalizedAddress.startsWith("::ffff:")) {
    return isPrivateIpAddress(normalizedAddress.replace("::ffff:", ""));
  }

  if (normalizedAddress === "::1") {
    return true;
  }

  if (normalizedAddress.startsWith("fc") || normalizedAddress.startsWith("fd") || normalizedAddress.startsWith("fe80:")) {
    return true;
  }

  const parts = normalizedAddress.split(".").map((part) => Number.parseInt(part, 10));

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}

async function isSafeHttpsUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" || url.username || url.password) {
    return false;
  }

  const hostname = url.hostname.toLocaleLowerCase("en-US");

  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    return false;
  }

  if (isIP(hostname)) {
    return !isPrivateIpAddress(hostname);
  }

  try {
    const addresses = await lookup(hostname, { all: true });
    return addresses.length > 0 && addresses.every((address) => !isPrivateIpAddress(address.address));
  } catch {
    return false;
  }
}

function normalizeFilename(value: string) {
  const normalized = value
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return `${normalized || "karar-pdf"}.pdf`;
}

function getDownloadFilename(request: NextRequest, sourceUrl: string) {
  const requestedFilename = request.nextUrl.searchParams.get("filename")?.trim();

  if (requestedFilename) {
    return normalizeFilename(requestedFilename);
  }

  try {
    const pathname = new URL(sourceUrl).pathname;
    const sourceFilename = decodeURIComponent(pathname.split("/").filter(Boolean).pop() ?? "");
    return normalizeFilename(sourceFilename);
  } catch {
    return "karar-pdf.pdf";
  }
}

function getErrorResponse(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET(request: NextRequest) {
  const sourceUrl = request.nextUrl.searchParams.get("url")?.trim();

  if (!sourceUrl || !(await isSafeHttpsUrl(sourceUrl))) {
    return getErrorResponse("PDF adresi geçerli bir https URL olmalıdır.", 400);
  }

  const url = new URL(sourceUrl);
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      accept: "application/pdf"
    },
    signal: AbortSignal.timeout(15_000)
  });

  if (!response.ok || !response.body) {
    return getErrorResponse("PDF indirilemedi.", 502);
  }

  const contentLength = response.headers.get("content-length");
  const parsedContentLength = contentLength ? Number.parseInt(contentLength, 10) : 0;

  if (parsedContentLength > maxDownloadSizeBytes) {
    return getErrorResponse("PDF dosyası çok büyük.", 413);
  }

  const contentType = response.headers.get("content-type")?.toLocaleLowerCase("en-US") ?? "";

  if (!contentType.includes("application/pdf") && !url.pathname.toLocaleLowerCase("en-US").endsWith(".pdf")) {
    return getErrorResponse("Adres bir PDF dosyasına ait değil.", 415);
  }

  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "Content-Disposition": `attachment; filename="${getDownloadFilename(request, sourceUrl)}"`,
    "Content-Type": "application/pdf"
  });

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new Response(response.body, {
    headers
  });
}
