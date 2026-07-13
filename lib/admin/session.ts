export const adminSessionCookieName = "admin_session";
export const adminSessionMaxAgeSeconds = 60 * 60 * 8;

type AdminSessionPayload = {
  sub: "admin";
  iat: number;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlEncodeString(value: string) {
  return base64UrlEncode(encoder.encode(value));
}

function base64UrlDecodeToString(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return decoder.decode(bytes);
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return base64UrlEncode(new Uint8Array(signature));
}

export function getConfiguredSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

export async function createAdminSessionToken(secret: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    sub: "admin",
    iat: now,
    exp: now + adminSessionMaxAgeSeconds
  };
  const body = base64UrlEncodeString(JSON.stringify(payload));
  const signature = await sign(body, secret);

  return `${body}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined, secret: string | null) {
  if (!token || !secret) {
    return null;
  }

  const [body, signature, extra] = token.split(".");

  if (!body || !signature || extra) {
    return null;
  }

  const expectedSignature = await sign(body, secret);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecodeToString(body)) as AdminSessionPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.sub !== "admin" || payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
