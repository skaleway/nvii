import { existsSync, promises as fs, readFileSync } from "fs";
import os from "os";
import path from "path";
import pc from "picocolors";

export const FILENAME = process.env.FILENAME || ".envincible";

import { ConfigData } from "../types";

export async function readConfigFile(): Promise<ConfigData | null> {
  try {
    const homeDir = os.homedir();
    const filePath = path.join(homeDir, FILENAME);
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    console.error(
      pc.red("Oups! you're not yet logged-in. run npm install -g @envi/cli"),
    );
    return null;
  }
}

export function getVersion() {
  const packageJson = readFileSync(
    path.join(__dirname, "../..", "package.json"),
    "utf-8",
  );
  const { version } = JSON.parse(packageJson);
  return version;
}

export function isLogedIn() {
  const filePath = path.join(os.homedir(), FILENAME);
  return existsSync(filePath);
}

/**
 * Converts a parsed `.env` JSON object back to its original string format.
 * @param envObject - The parsed environment variables as a JSON object.
 * @returns A string representation in `.env` format.
 */
export function convertEnvJsonToString(
  envObject: Record<string, string>,
): string {
  return Object.entries(envObject)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}
