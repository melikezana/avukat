import { createHash, pbkdf2Sync, timingSafeEqual } from "node:crypto";

function timingSafeHexCompare(actualHex: string, expectedHex: string) {
  const actual = Buffer.from(actualHex, "hex");
  const expected = Buffer.from(expectedHex, "hex");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function verifyAdminPassword(password: string, storedHash: string | undefined) {
  if (!storedHash) {
    return false;
  }

  try {
    if (storedHash.startsWith("pbkdf2-sha256$")) {
      const [, iterationsValue, saltValue, hashValue] = storedHash.split("$");
      const iterations = Number.parseInt(iterationsValue, 10);
      const salt = Buffer.from(saltValue, "base64");
      const expected = Buffer.from(hashValue, "base64");

      if (!Number.isFinite(iterations) || iterations < 100000 || !salt.length || !expected.length) {
        return false;
      }

      const actual = pbkdf2Sync(password, salt, iterations, expected.length, "sha256");
      return actual.length === expected.length && timingSafeEqual(actual, expected);
    }

    const expectedHex = storedHash.startsWith("sha256:") ? storedHash.slice("sha256:".length) : storedHash;
    const actualHex = createHash("sha256").update(password, "utf8").digest("hex");

    return /^[a-f0-9]{64}$/i.test(expectedHex) && timingSafeHexCompare(actualHex, expectedHex);
  } catch {
    return false;
  }
}
