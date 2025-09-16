"use server";

import { decryptEnvValues } from "@nvii/env-helpers";

export async function decryptEnv(
  content: Record<string, string>,
  userId: string,
) {
  return decryptEnvValues(content, userId);
}
