import { JsonValue } from "@prisma/client/runtime/library";

// Helper function to check if value is a Record<string, string>
function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.entries(value).every(
    ([k, v]) => typeof k === "string" && typeof v === "string",
  );
}

export function safeParseJsonValue(value: JsonValue): Record<string, string> {
  try {
    if (typeof value === "string") {
      const parsed = JSON.parse(value);
      return isStringRecord(parsed) ? parsed : {};
    }
    return isStringRecord(value) ? value : {};
  } catch {
    return {};
  }
}

export function decryptEnvValues(
  content: JsonValue | null | undefined,
  userId: string,
): Record<string, string> {
  if (!content) return {};

  const parsedContent = safeParseJsonValue(content);

  // Your existing decryption logic here
  // For now, just return the parsed content
  return parsedContent;
}

export * from "@nvii/env-helpers";
