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

/**
 * Reads and parses the root `.env` file into a JSON object.
 * @returns A parsed object containing key-value pairs from the `.env` file.
 */
export async function readEnvFile(): Promise<Record<string, string>> {
  try {
    const envPath = path.join(process.cwd(), ".env");
    const envContent = await fs.readFile(envPath, "utf-8");

    return envContent
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#")) // Ignore empty lines and comments
      .reduce(
        (acc, line) => {
          const [key, value] = line.split("=");
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        },
        {} as Record<string, string>,
      );
  } catch (error) {
    console.error(pc.yellow("⚠️ No .env file found or unable to read it."));
    return {}; // Return an empty object if the file doesn't exist
  }
}
