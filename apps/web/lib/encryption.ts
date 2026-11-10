import { decryptEnvValues as decryptEnvValuesReal } from "@nvii/env-helpers";

/**
 * Decrypts all values in an environment object.
 *
 * Stored project content is a record of `{ variable: "iv:ciphertext" }` pairs
 * (see spec 0001 and `packages/cli/src/commands/new.ts`, which writes through
 * the `@nvii/env-helpers` barrel), so it is decrypted with the per value
 * AES-256-CBC implementation from `@nvii/env-helpers`.
 *
 * The local declaration wins over the `export * from "@nvii/env-helpers"`
 * re-export below, so callers importing from "@/lib/encryption" get real
 * AES decryption instead of the JSON parsing stub that used to shadow it.
 *
 * A single malformed value cannot break the whole list: a failure falls back
 * to an empty record, matching the stub's previous fail-safe behaviour.
 */
export function decryptEnvValues(
  content: Record<string, string> | null | undefined,
  userId: string,
): Record<string, string> {
  if (!content) return {};

  try {
    return decryptEnvValuesReal(content, userId);
  } catch {
    return {};
  }
}

export * from "@nvii/env-helpers";
