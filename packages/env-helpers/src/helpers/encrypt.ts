import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // bytes
const IV_LENGTH = 12; // bytes; 12 is standard for GCM

/**
 * Generates a random encryption key.
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString("hex"); // 64 hex chars
}

/**
 * Validates that the provided key is valid (hex string, correct length).
 */
export function validateEncryptionKey(key: string): boolean {
  return typeof key === "string" && key.length === KEY_LENGTH * 2;
}

/**
 * Encrypts environment variables under a key derived from userId.
 */
export function encryptEnvValues(
  values: Record<string, string>,
  userId: string,
): { iv: string; content: string; authTag: string } {
  // Derive a 32‑byte key from the userId
  const key = crypto.createHash("sha256").update(userId).digest();

  // Generate a 12‑byte IV for GCM
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create AES‑GCM cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the JSON payload
  const plaintext = JSON.stringify(values);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  // Grab the authentication tag
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypts the environment variables with the same userId‑derived key.
 */
export function decryptEnvValues(
  encrypted: { iv: string; content: string; authTag: string },
  userId: string,
): Record<string, string> {
  const key = crypto.createHash("sha256").update(userId).digest();
  const iv = Buffer.from(encrypted.iv, "hex");
  const authTag = Buffer.from(encrypted.authTag, "hex");
  const ciphertext = Buffer.from(encrypted.content, "hex");

  // Create decipher and set the auth tag
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");

  // Parse back to object
  return JSON.parse(decrypted);
}
